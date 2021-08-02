// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.9.0;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFT_Transfer is ERC721URIStorage{
    // The NFT struct
    struct Nft {
      uint id;
      string name;
      string minted_url;
      uint price;
      bool onSale;
      bool onAuction;
    }
    
    // An array of Nft storing Nft objects sequentially
    Nft[] public NftCatalogue;
    
    function getNFTCount() public view returns(uint){
        return NftCatalogue.length;
    }
    
    function getNFTPrice(uint _nftId) public view returns(uint){
        return NftCatalogue[_nftId].price;
    }

    // mapping of NFT ID to NFT object
    mapping(uint => address) public NftOwnership;
    // stores the balance of each user
    mapping(address => uint) public tokenBalance;
    
    constructor() ERC721("NFT-Marketplace", "Depocalypse") {}
    
    // This event is emitted when a new property is put up for sale
    event MintNftEvent (
      uint indexed nftId
    );

    // This event is emitted when someone buy the nft
    event ConsensusNftEvent (
      uint indexed nftId
    );
  
    // function to create erc721 token aka mint NFT
    function mintNFT(string memory _name, string memory _url, uint _price, bool _onSale, bool _onAuction) public returns(uint) {
      uint id = NftCatalogue.length;
      NftCatalogue.push(Nft(id, _name,_url,_price,_onSale,_onAuction));
      _safeMint(msg.sender,id);
      _setTokenURI(id, _url);
      tokenBalance[msg.sender] += 1;
      NftOwnership[id] = msg.sender;

      if(_onAuction) {
          uint auctionId = createAuction(id, 1000000000000000000, 100);
          NftAuction[id] = auctionId;
      }

      emit MintNftEvent(id);
      return id;
    }

    // will be used for marketplace
    function getOnSaleTokens() public view returns(uint[] memory) {
        uint catalog_length = NftCatalogue.length;
        uint[] memory onSaleTokenIds = new uint[](catalog_length + 1);
        uint j = 0;
        for (uint i = 0; i < catalog_length; i++) {
            if (NftCatalogue[i].onSale == true) {
                j = j + 1;
                onSaleTokenIds[j] = NftCatalogue[i].id;
            }
            // first positon will give the size of sale token
            onSaleTokenIds[0] = j;
        }
        
        return onSaleTokenIds;
    }
    
    // will be used for my gallery
    function getUserNfts() public view returns (uint[] memory) {
        address owner = msg.sender;
        uint catalog_length = tokenBalance[owner];
        uint[] memory userNfts = new uint[](catalog_length); 
      
        uint j = 0;
        for(uint i = 0; i < NftCatalogue.length; i++) {
            if(NftOwnership[i] == owner) {
                userNfts[j] = i;
                j = j + 1;
            }
        }
        return userNfts;
    }
    
    // function to buy NFT which are on sale
    function consensusNft(uint _nftId) public payable {
        // check if the function caller is not an zero account address
        require(msg.sender != address(0), "incorrect address");
        // check if the token id of the token being bought exists or not
        require(_exists(_nftId), "this token doesn't exist");
        // get the token's owner
        address tokenOwner = ownerOf(_nftId);
        // token's owner should not be an zero address account
        require(tokenOwner != address(0));
        // the one who wants to buy the token should not be the token's owner
        require(tokenOwner != msg.sender, "you cannot buy your own token");
        Nft memory nft = NftCatalogue[_nftId];
        require(nft.onSale,
        "Selected NFT not on sale");
        require(msg.value >= nft.price, 
        "Incorrect amount of funds transfered");
         _sendFunds(NftOwnership[_nftId], msg.value);
        transferFrom(NftOwnership[_nftId], msg.sender, _nftId);
        emit ConsensusNftEvent(_nftId);
    }
    
    function transferFrom(address _from, address _to, uint256 _tokenId) public override
    {
      NftOwnership[_tokenId] = _to;
      tokenBalance[_from]--;
      tokenBalance[_to]++;
      NftCatalogue[_tokenId].onSale = false;
      _transfer(_from, _to, _tokenId);
    }

    function _sendFunds (address beneficiary, uint value) internal{
        address payable addr = payable(beneficiary);
        addr.transfer(value);
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

  Auction[] public auctions;

  // mapping of NFT ID to Auction ID
  mapping(uint => uint) public NftAuction;


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
    external view returns (uint256)
  {
    Auction storage auction = auctions[_auctionId];
    return auction.fundsByBidder[bidder];
  }

  // @dev Return highest bid for given auction ID
  function getHighestBid(uint256 _auctionId)
    external view returns (uint256)
  {
    Auction storage auction = auctions[_auctionId];
    return auction.highestBid;
  }


  // @dev Creates and begins a new auction.
  // @_duration is in seconds and is converted to block count.
  function createAuction(
    uint _nft,
    uint256 _bidIncrement,
    uint256 _duration
  )
    private returns (uint256)
  {
    // Require msg.sender to own nft
    require(NftOwnership[_nft] == msg.sender);

    // Require duration to be at least a minute and calculate block count
    require(_duration >= 60);

    totalAuctions++;

    Auction storage _auction = auctions.push();
    _auction.nft = _nft;
    _auction.seller = msg.sender;
    _auction.bidIncrement = uint128(_bidIncrement);
    _auction.duration = _duration;
    _auction.startedAt = block.timestamp;
    _auction.startBlock = block.number;
    _auction.highestBid = 0;
    _auction.highestBidder = address(0);
    _auction.cancelled = false;

    emit AuctionCreated(totalAuctions-1, _nft);
    
    return totalAuctions-1;
  }


  function bid(uint256 _auctionId)
    external
    payable
    statusIs(AuctionStatus.Active, _auctionId)
    returns (bool success)
  {
    require(msg.value > 0);

    Auction storage auction = auctions[_auctionId];
    uint nftPrice = getNFTPrice(auction.nft);

    // Require newBid be greater than or equal to highestBid + bidIncrement
    uint256 newBid = auction.fundsByBidder[msg.sender] + msg.value;
    require(newBid > nftPrice);
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

    emit AuctionCancelled(_auctionId, auction.nft);
  }


  function _getAuctionStatus(uint256 _auctionId)
    internal view returns (AuctionStatus)
  {
    Auction storage auction = auctions[_auctionId];

    if (auction.cancelled) {
      return AuctionStatus.Cancelled;
    }
    else if (auction.startedAt + auction.duration < block.timestamp) {
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

  function getOnAuctionTokens() public view returns(uint[] memory) {
    uint catalog_length = NftCatalogue.length;
    uint[] memory onAuctionTokenIds = new uint[](catalog_length + 1);
    uint j = 0;
    for (uint i = 0; i < catalog_length; i++) {
        if (NftCatalogue[i].onAuction == true) {
            j = j + 1;
            onAuctionTokenIds[j] = NftCatalogue[i].id;
        }
        // first positon will give the size of sale token
        onAuctionTokenIds[0] = j;
    }
    
    return onAuctionTokenIds;
  }

    
}
