// SPDX-License-Identifier: MIT

pragma solidity >=0.5.0 <0.9.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFT_Transfer is ERC721{
    // The NFT struct
    struct Nft {
      string name;
      string minted_url;
      uint price;
      bool onSale;
    }

    // An array of Nft storing Nft objects sequentially
    Nft[] private NftCatalogue;
    
    // mapping of NFT ID to NFT object
    mapping(uint => address) private NftOwnership;
    // stores the balance of each user
    mapping(address => uint) private tokenBalance;

    constructor() ERC721("NFT-Marketplace", "Depocalypse") {}
    // This event is emitted when a new property is put up for sale
    event MintNftEvent (
      uint indexed nftId
    );

    // This event is emitted when a NewBooking is made
    event ConsensusNftEvent (
      uint indexed propertyId,
      uint indexed bookingId
    );
  
    function _mint(address to, uint256 nftId) internal override {
        require(to != address(0), "ERC721: mint to the zero address");
        require(!_exists(nftId), "ERC721: token already minted");
        tokenBalance[to] += 1;
        NftOwnership[nftId] = to;
    }

    function mintNFT(string memory _name, string memory _url, uint _price, bool _onSale) public returns(uint) {
      NftCatalogue.push(Nft(_name,_url,_price,_onSale));
      uint id = NftCatalogue.length - 1;
      _mint(msg.sender,id);
      // emit an event to notify the clients
      NftOwnership[id] = msg.sender;
      emit MintNftEvent(id);
      return id;
    }

    function transferFrom(address _from, address _to, uint256 _tokenId) public override
    {
      NftOwnership[_tokenId] = _to;
      tokenBalance[_from]--;
      tokenBalance[_to]++;
      NftCatalogue[_tokenId].onSale = false;
      emit Transfer(_from, _to, _tokenId);
    }

    function consensusNft(uint _nftId) public payable {
      Nft memory nft = NftCatalogue[_nftId];
      require(nft.onSale,
        "Selected NFT not on sale");
      require(msg.value == nft.price, 
        "Incorrect amount of funds transfered");
      transferFrom(NftOwnership[_nftId], msg.sender, _nftId);
      _sendFunds(NftOwnership[_nftId], msg.value);
    }

    function _sendFunds (address beneficiary, uint value) internal {
      payable(address(uint160(beneficiary))).transfer(value);
    }

    function getUserNfts () public view returns (string[] memory) {
      address owner = msg.sender;
      uint catalog_length = NftCatalogue.length;
      string[] memory userNfts = new string[](catalog_length); 
      uint j = 0;
      for(uint i = 0; i < catalog_length; i++) {
        if(NftOwnership[i] == owner) {
          userNfts[j] = NftCatalogue[i].minted_url;
          j = j + 1;
          // userNfts.push(NftCatalogue[i].minted_url);
        }
      }
      return userNfts;
    }



  // Auction contract starts here
  /// @title Auction
  /// @notice Create/Cancel Auction and Bid/Tranfer NFT

  enum AuctionStatus { Active, Cancelled, Completed }

  struct Auction {
    // static
    uint nft; // NFT ID
    address seller; // Current owner of NFT
    uint128 bidIncrement; // Minimum bid increment (in Wei)
    uint256 duration; // Block count for when the auction ends
    uint256 startBlock; // Block number when auction started
    uint256 startedAt; // Approximate time for when the auction was started

    // state
    mapping (address => uint256) fundsByBidder; // Mapping of addresses to funds
    uint256 highestBid; // Current highest bid
    address highestBidder; // Address of current highest bidder
    bool cancelled; // Flag for cancelled auctions
  }

  uint totalAuctions;

  mapping (address => mapping(uint256 => uint256)) nftToTokenIdToAuctionId;
  Auction[] public auctions;


  event AuctionCreated(uint id, uint nftId);
  event AuctionSuccessful(uint256 id, uint nftId);
  event AuctionCancelled(uint256 id, uint nftId);
  event BidCreated(
    uint256 id, uint nftId, address bidder, uint256 bid
  );
  event AuctionNFTWithdrawal(
    uint256 id, uint nftId, address withdrawer
  );
  event AuctionFundWithdrawal(
    uint256 id, uint nftId, address withdrawer, uint256 amount
  );

  function getAuctionsCount() public view returns (uint256) {
    return auctions.length;
  }


  function getAuction(uint256 _auctionId)
    external view returns (
    uint256 id,
    uint nft,
    address seller,
    uint256 bidIncrement,
    uint256 duration,
    uint256 startedAt,
    uint256 startBlock,
    AuctionStatus status,
    uint256 highestBid,
    address highestBidder
  ) {
    Auction storage _auction = auctions[_auctionId];
    AuctionStatus _status = _getAuctionStatus(_auctionId);
    return (
      _auctionId,
      _auction.nft,
      _auction.seller,
      _auction.bidIncrement,
      _auction.duration,
      _auction.startedAt,
      _auction.startBlock,
      _status,
      _auction.highestBid,
      _auction.highestBidder
    );
  }


  // @dev Return bid for given auction ID and bidder
  function getBid(uint256 _auctionId, address bidder)
    external view returns (uint256 bid)
  {
    Auction storage auction = auctions[_auctionId];
    return auction.fundsByBidder[bidder];
  }


  // @dev Creates and begins a new auction.
  // @_duration is in seconds and is converted to block count.
  function createAuction(
    uint _nft,
    uint256 _bidIncrement,
    uint256 _duration
  )
    external
  {
    // Require msg.sender to own nft
    require(NftOwnership[_nft] == msg.sender);

    // Require duration to be at least a minute and calculate block count
    require(_duration >= 60);

    uint256 durationBlockCount = _duration / uint256(14);

    totalAuctions++;

    Auction storage _auction = auctions.push();
    _auction.nft = _nft;
    _auction.seller = msg.sender;
    _auction.bidIncrement = uint128(_bidIncrement);
    _auction.duration = durationBlockCount;
    _auction.startedAt = block.timestamp;
    _auction.startBlock = block.number;
    _auction.highestBid = 0;
    _auction.highestBidder = address(0);
    _auction.cancelled = false;

    emit AuctionCreated(totalAuctions, _nft);
  }


  function bid(uint256 _auctionId)
    external
    payable
    statusIs(AuctionStatus.Active, _auctionId)
    returns (bool success)
  {
    require(msg.value > 0);

    Auction storage auction = auctions[_auctionId];

    // Require newBid be greater than or equal to highestBid + bidIncrement
    uint256 newBid = auction.fundsByBidder[msg.sender] + msg.value;
    require(newBid >= auction.highestBid + auction.bidIncrement);

    // Update fundsByBidder mapping
    auction.highestBid = newBid;
    auction.highestBidder = msg.sender;
    auction.fundsByBidder[auction.highestBidder] = newBid;

    // Emit BidCreated event
    emit BidCreated(_auctionId, auction.nft, msg.sender, newBid);
    return true;
  }


  // @dev Allow people to withdraw their balances or the NFT
  function withdrawBalance(uint256 _auctionId) external returns (bool success) {
    AuctionStatus _status = _getAuctionStatus(_auctionId);

    Auction storage auction = auctions[_auctionId];
    address fundsFrom;
    uint withdrawalAmount;

    // The seller gets receives highest bid when the auction is completed.
    if (msg.sender == auction.seller) {
      require(_status == AuctionStatus.Completed);
      fundsFrom = auction.highestBidder;
      withdrawalAmount = auction.highestBid;

    }
    // Highest bidder can only withdraw the NFT when the auction is completed.
    // When the auction is cancelled, the highestBidder is set to address(0).
    else if (msg.sender == auction.highestBidder) {
      require(_status == AuctionStatus.Completed);
      transferFrom(auction.seller, auction.highestBidder, auction.nft);
      emit AuctionNFTWithdrawal(_auctionId, auction.nft, msg.sender);
      return true;
    }
    // Anyone else gets what they bid
    else {
      fundsFrom = msg.sender;
      withdrawalAmount = auction.fundsByBidder[fundsFrom];
    }

    require(withdrawalAmount > 0);
    auction.fundsByBidder[fundsFrom] - withdrawalAmount;
    _sendFunds(msg.sender, withdrawalAmount);

    emit AuctionFundWithdrawal(
      _auctionId,
      auction.nft,
      msg.sender,
      withdrawalAmount
    );

    return true;
  }


  function cancelAuction(uint256 _auctionId) external {
    _cancelAuction(_auctionId);
  }


  // @dev Cancels an auction unconditionally.
  function _cancelAuction(uint256 _auctionId)
    internal
    statusIs(AuctionStatus.Active, _auctionId)
    onlySeller(_auctionId)
  {
    Auction storage auction = auctions[_auctionId];
    auction.cancelled = true;
    auction.highestBidder = address(0);

    // TODO: emit event
    emit AuctionCancelled(_auctionId, auction.nft);
  }


  function _getAuctionStatus(uint256 _auctionId)
    internal view returns (AuctionStatus)
  {
    Auction storage auction = auctions[_auctionId];

    if (auction.cancelled) {
      return AuctionStatus.Cancelled;
    }
    else if (auction.startBlock + auction.duration < block.number) {
      return AuctionStatus.Completed;
    }
    else {
      return AuctionStatus.Active;
    }
  }


  modifier statusIs(AuctionStatus expectedStatus, uint256 _auctionId) {
    require(expectedStatus == _getAuctionStatus(_auctionId));
    _;
  }

  modifier onlySeller(uint256 _auctionId) {
    Auction storage auction = auctions[_auctionId];
    require(msg.sender == auction.seller);
    _;
  }

}