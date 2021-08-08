// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.9.0;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFT_Transfer is ERC721URIStorage { 
    // The NFT struct
    struct Nft {
        uint id;
        string name;
        string minted_url;
        uint price;
        bool onSale;
        bool onAuction;
        bool onCharity;
    }

    // An array of Nft storing Nft objects sequentially
    Nft[] public NftCatalogue;

    function getNFTCount() public view returns(uint) {
        return NftCatalogue.length;
    }

    function getNFTPrice(uint _nftId) public view returns(uint) {
        return NftCatalogue[_nftId].price;
    }

    // mapping of NFT ID to NFT object
    mapping(uint => address) public NftOwnership;
    // stores the balance of each user
    mapping(address => uint) public tokenBalance;

    constructor() ERC721("NFT-Marketplace", "Depocalypse") {}

    // This event is emitted when a new property is put up for sale
    event MintNftEvent(uint indexed nftId);

    // This event is emitted when someone buy the nft
    event ConsensusNftEvent(uint indexed nftId);

    // function to create erc721 token aka mint NFT
    function mintNFT (
        string memory _name, 
        string memory _url, 
        uint _price, 
        bool _onSale, 
        bool _onAuction,
        bool _onCharity,
        uint _auctionType,
        uint256 _duration,
        uint256 _bidIncrement,
        uint256 _endingPrice,
        uint256 _decrementPrice
    )
    public returns(uint) {
        uint id = NftCatalogue.length;
        NftCatalogue.push(Nft(id, _name, _url, _price, _onSale, _onAuction, _onCharity));
        _safeMint(msg.sender, id);
        _setTokenURI(id, _url);
        tokenBalance[msg.sender] += 1;
        NftOwnership[id] = msg.sender;
        if (_onAuction) {
            if (_auctionType == 0) {
                uint auctionId = createAuction(id, _bidIncrement, _duration);
                NftAuction[id] = auctionId;
            } 
            else if (_auctionType == 1) {
                uint auctionId = createDutchAuction(id, _duration, _endingPrice, _decrementPrice);
                NftAuction[id] = auctionId;
            } 
            else if (_auctionType == 2) {
                uint auctionId = createBlindAuction(id, _duration);
                NftAuction[id] = auctionId;
            } 
        }

        emit MintNftEvent(id);
        return id;
    }

    // will be used for marketplace
    function getOnSaleTokens() public view returns(uint[] memory) {
        uint catalog_length = NftCatalogue.length;
        uint[] memory onSaleTokenIds = new uint[](catalog_length + 1);
        uint j = 0;
        for (uint i = 0; i < catalog_length; i ++) {
            if (NftCatalogue[i].onSale == true) {
                j = j + 1;
                onSaleTokenIds[j] = NftCatalogue[i].id;
            }
            // first positon will give the size of sale token
            onSaleTokenIds[0] = j;
        }

        return onSaleTokenIds;
    }
    
    // will send charity tokens
    function getOnCharityTokens() public view returns(uint[] memory) {
        uint catalog_length = NftCatalogue.length;
        uint[] memory onCharityTokenIds = new uint[](catalog_length + 1);
        uint j = 0;
        for (uint i = 0; i < catalog_length; i ++) {
            if (NftCatalogue[i].onCharity == true) {
                j = j + 1;
                onCharityTokenIds[j] = NftCatalogue[i].id;
            }
            // first positon will give the size of sale token
            onCharityTokenIds[0] = j;
        }

        return onCharityTokenIds;
    }
    
    

    // will be used for my gallery
    function getUserNfts() public view returns(uint[] memory) {
        address owner = msg.sender;
        uint catalog_length = tokenBalance[owner];
        uint[] memory userNfts = new uint[](catalog_length);

        uint j = 0;
        for (uint i = 0; i < NftCatalogue.length; i ++) {
            if (NftOwnership[i] == owner) {
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
        require(nft.onSale, "Selected NFT not on sale");
        require(msg.value >= nft.price, "Incorrect amount of funds transfered");
        _sendFunds(NftOwnership[_nftId], msg.value);
        transferFrom(NftOwnership[_nftId], msg.sender, _nftId);
        emit ConsensusNftEvent(_nftId);
    }

    function transferFrom(address _from, address _to, uint256 _tokenId) public override {
        NftOwnership[_tokenId] = _to;
        tokenBalance[_from]--;
        tokenBalance[_to]++;
        NftCatalogue[_tokenId].onSale = false;
        // NftCatalogue[_tokenId].onAuction = false;
        _transfer(_from, _to, _tokenId);
    }

    function _sendFunds(address beneficiary, uint value) internal {
        address payable addr = payable(beneficiary);
        addr.transfer(value);
    }


    //#################################################################
    //# Auction Contract
    //#################################################################

    // / @title Auction
    // / @notice Create/Cancel Auction and Bid/Tranfer NFT

    enum AuctionStatus {
        Active,
        Cancelled,
        Completed
    }
    enum AuctionType {
        English,
        Dutch, 
        Blind
    }

    struct Auction {
        uint nft; // NFT ID
        address seller; // Current owner of NFT
        uint256 duration; // Block count for when the auction ends
        uint256 startBlock; // Block number when auction started
        uint256 startedAt; // Approximate time for when the auction was started
        AuctionType auctionType; // Type of Auction
        uint auctionTypeId; // Id of the given auction type
        bool cancelled; // Flag for cancelled auctions
    }

    struct EnglishAuction {
        mapping(address => uint256)fundsByBidder; // Mapping of addresses to funds
        uint256 highestBid; // Current highest bid
        address highestBidder; // Address of current highest bidder
        uint256 bidIncrement; // Minimum bid increment (in Wei)
    }

    struct DutchAuction {
        uint256 endingPrice; // Least Price of Auction
        uint256 decrementPrice; // Decrement Price (for each minute)
        bool completed; // Is Auction completed
    }
    
    struct BlindAuction {
        mapping(address => uint256)fundsByBidder; // Mapping of addresses to funds
        uint256 highestBid; // Current highest bid
        address highestBidder; // Address of current highest bidder
    }

    uint totalAuctions;
    Auction[] public auctions;

    uint totalEnglishAuctions;
    EnglishAuction[] public englishAuctions;

    uint totalDutchAuctions;
    DutchAuction[] public dutchAuctions;

    uint totalBlindAuctions;
    BlindAuction[] private blindAuctions;

    // mapping of NFT ID to Auction ID
    mapping(uint => uint) public NftAuction;


    event AuctionCreated(uint id, uint nftId);
    event AuctionSuccessful(uint256 id, uint nftId);
    event AuctionCancelled(uint256 id, uint nftId);
    event BidCreated(uint256 id, uint nftId, address bidder, uint256 bid);
    event AuctionNFTWithdrawal(uint256 id, uint nftId, address withdrawer);
    event AuctionFundWithdrawal(uint256 id, uint nftId, address withdrawer, uint256 amount);

    //#################################################################
    //# Utility functions
    //#################################################################

    function getOnAuctionTokens() public view returns(uint[] memory) {
        uint catalog_length = NftCatalogue.length;
        uint[] memory onAuctionTokenIds = new uint[](catalog_length + 1);
        uint j = 0;
        for (uint i = 0; i < catalog_length; i ++) {
            if (NftCatalogue[i].onAuction == true) {
                j = j + 1;
                onAuctionTokenIds[j] = NftCatalogue[i].id;
            }
            // first positon will give the size of sale token
            onAuctionTokenIds[0] = j;
        }

        return onAuctionTokenIds;
    }

    function getAuctionsCount() public view returns(uint256) {
        return auctions.length;
    }

    // @dev Return type of auction for given auction ID
    function getAuctionType(uint256 _auctionId)
    external view returns(AuctionType) {
        Auction storage auction = auctions[_auctionId];
        return auction.auctionType;
    }

    //#################################################################
    //# English Auction Implementations
    //#################################################################

    function getAuction(uint256 _auctionId)
    external view returns(
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
        EnglishAuction storage _englishAuction = englishAuctions[_auction.auctionTypeId];

        return(_auctionId, _auction.nft, _auction.seller, _englishAuction.bidIncrement, _auction.duration, _auction.startedAt, _auction.startBlock, _status, _englishAuction.highestBid, _englishAuction.highestBidder);
    }

    // @dev Return bid for given auction ID and bidder
    function getBid(uint256 _auctionId, address bidder)
    external view returns(uint256) {
        Auction storage auction = auctions[_auctionId];
        EnglishAuction storage _englishAuction = englishAuctions[auction.auctionTypeId];
        return _englishAuction.fundsByBidder[bidder];
    }

    // @dev Return highest bid for given auction ID
    function getHighestBid(uint256 _auctionId)
    external view returns(uint256) {
        Auction storage auction = auctions[_auctionId];
        EnglishAuction storage _englishAuction = englishAuctions[auction.auctionTypeId];
        return _englishAuction.highestBid;
    }

    // @dev Creates and begins a new auction.
    // @_duration is in seconds and is converted to block count.
    function createAuction(uint _nft, uint256 _bidIncrement, uint256 _duration)
    private returns(uint256) { 
        // Require msg.sender to own nft
        require(NftOwnership[_nft] == msg.sender);

        // Require duration to be at least a minute and calculate block count
        require(_duration >= 60);

        totalAuctions ++;

        Auction storage _auction = auctions.push();
        _auction.nft = _nft;
        _auction.seller = msg.sender;
        _auction.duration = _duration;
        _auction.startedAt = block.timestamp;
        _auction.startBlock = block.number;
        _auction.cancelled = false;

        _auction.auctionType = AuctionType.English;
        _auction.auctionTypeId = totalEnglishAuctions;
        totalEnglishAuctions ++;
        EnglishAuction storage _englishAuction = englishAuctions.push();
        _englishAuction.bidIncrement = _bidIncrement;
        _englishAuction.highestBid = 0;
        _englishAuction.highestBidder = address(0);

        emit AuctionCreated(totalAuctions - 1, _nft);

        return totalAuctions - 1;
    }


    function bid(uint256 _auctionId)
    external payable statusIs(AuctionStatus.Active, _auctionId)
    returns(bool success) {
        require(msg.value > 0);

        Auction storage auction = auctions[_auctionId];
        EnglishAuction storage _englishAuction = englishAuctions[auction.auctionTypeId];
        uint nftPrice = getNFTPrice(auction.nft);

        // Require newBid be greater than or equal to highestBid + bidIncrement
        uint256 newBid = _englishAuction.fundsByBidder[msg.sender] + msg.value;
        require(newBid >= nftPrice);
        require(newBid >= _englishAuction.highestBid + _englishAuction.bidIncrement);

        // Update fundsByBidder mapping
        _englishAuction.highestBid = newBid;
        _englishAuction.highestBidder = msg.sender;
        _englishAuction.fundsByBidder[_englishAuction.highestBidder] = newBid;

        // Emit BidCreated event
        emit BidCreated(_auctionId, auction.nft, msg.sender, newBid);
        return true;
    }


    // @dev Allow people to withdraw their balances or the NFT
    function withdrawBalance(uint256 _auctionId) external returns(bool success) {
        AuctionStatus _status = _getAuctionStatus(_auctionId);

        Auction storage auction = auctions[_auctionId];
        EnglishAuction storage _englishAuction = englishAuctions[auction.auctionTypeId];
        address fundsFrom;
        uint withdrawalAmount;

        // The seller gets receives highest bid when the auction is completed.
        if (msg.sender == auction.seller) {
            require(_status == AuctionStatus.Completed, "Please wait for the auction to complete");
            fundsFrom = _englishAuction.highestBidder;
            withdrawalAmount = _englishAuction.highestBid;
        }
        // Highest bidder can only withdraw the NFT when the auction is completed.
        // When the auction is cancelled, the highestBidder is set to address(0). 
        else if (msg.sender == _englishAuction.highestBidder) {
            require(_status == AuctionStatus.Completed, "You are the highest bidder and cannot withdraw your amount");
            transferFrom(auction.seller, _englishAuction.highestBidder, auction.nft);
            emit AuctionNFTWithdrawal(_auctionId, auction.nft, msg.sender);
            return true;
        }
        // Anyone else gets what they bid 
        else {
            fundsFrom = msg.sender;
            withdrawalAmount = _englishAuction.fundsByBidder[fundsFrom];
        }

        require(withdrawalAmount > 0);
        _englishAuction.fundsByBidder[fundsFrom] -= withdrawalAmount;
        _sendFunds(msg.sender, withdrawalAmount);

        emit AuctionFundWithdrawal(_auctionId, auction.nft, msg.sender, withdrawalAmount);

        return true;
    }


    //#################################################################
    //# Dutch Auction Implementations
    //#################################################################

    // @dev Creates and begins a new auction.
    // @_duration is in seconds and is converted to block count.
    function createDutchAuction(uint _nft, uint256 _duration, uint256 _endingPrice, uint256 _decrementPrice)
    private returns(uint256) { 
        // Require msg.sender to own nft
        require(NftOwnership[_nft] == msg.sender);

        // Require duration to be at least a minute and calculate block count
        require(_duration >= 60);

        totalAuctions++;

        Auction storage _auction = auctions.push();
        _auction.nft = _nft;
        _auction.seller = msg.sender;
        _auction.duration = _duration;
        _auction.startedAt = block.timestamp;
        _auction.startBlock = block.number;
        _auction.cancelled = false;

        _auction.auctionType = AuctionType.Dutch;
        _auction.auctionTypeId = totalDutchAuctions;
        totalDutchAuctions++;
        DutchAuction storage _dutchAuction = dutchAuctions.push();
        _dutchAuction.endingPrice = _endingPrice;
        _dutchAuction.decrementPrice = _decrementPrice;
        _dutchAuction.completed = false;

        emit AuctionCreated(totalAuctions-1, _nft);

        return totalAuctions-1;
    }

    function consensusDutchAuction(uint _auctionId) public payable {

        Auction storage auction = auctions[_auctionId];
        require(auction.auctionType == AuctionType.Dutch, "This is not a dutch type of auction");
        DutchAuction storage _dutchAuction = dutchAuctions[auction.auctionTypeId];

        uint _nftId = auction.nft;

        require(msg.sender != address(0), "incorrect address");
        require(_exists(_nftId), "this token doesn't exist");
        address tokenOwner = ownerOf(_nftId);
        require(tokenOwner != address(0));
        require(tokenOwner != msg.sender, "you cannot buy your own token");
        Nft memory nft = NftCatalogue[_nftId];
        require(nft.onAuction, "Selected NFT not on auction");
        _sendFunds(NftOwnership[_nftId], msg.value);
        transferFrom(NftOwnership[_nftId], msg.sender, _nftId);
        
        _dutchAuction.completed = true;
        nft.price = msg.value;
        
        emit ConsensusNftEvent(_nftId);
    }
    
    function getDutchAuction(uint256 _auctionId)
    external view returns(
        uint256 id, 
        uint nft, 
        address seller, 
        uint256 duration, 
        uint256 startedAt, 
        uint256 startBlock, 
        AuctionStatus status, 
        uint256 endingPrice,
        uint256 decrementPrice,
        bool completed
    ) {
        Auction storage _auction = auctions[_auctionId];
        require(_auction.auctionType == AuctionType.Dutch, "This is not a dutch type of auction");
        AuctionStatus _status = _getAuctionStatus(_auctionId);
        DutchAuction storage _dutchAuction = dutchAuctions[_auction.auctionTypeId];

        return(_auctionId, _auction.nft, _auction.seller, _auction.duration, _auction.startedAt, _auction.startBlock, _status, _dutchAuction.endingPrice, _dutchAuction.decrementPrice, _dutchAuction.completed);
    }


    //#################################################################
    //# Blind Auction Implementations
    //#################################################################

    // @dev Creates and begins a new auction.
    // @_duration is in seconds and is converted to block count.
    function createBlindAuction(uint _nft, uint256 _duration)
    private returns(uint256) { 
        // Require msg.sender to own nft
        require(NftOwnership[_nft] == msg.sender);

        // Require duration to be at least a minute and calculate block count
        require(_duration >= 60);

        totalAuctions++;

        Auction storage _auction = auctions.push();
        _auction.nft = _nft;
        _auction.seller = msg.sender;
        _auction.duration = _duration;
        _auction.startedAt = block.timestamp;
        _auction.startBlock = block.number;
        _auction.cancelled = false;

        _auction.auctionType = AuctionType.Blind;
        _auction.auctionTypeId = totalBlindAuctions;
        totalBlindAuctions++;
        BlindAuction storage _blindAuction = blindAuctions.push();
        _blindAuction.highestBid = 0;
        _blindAuction.highestBidder = address(0);

        emit AuctionCreated(totalAuctions-1, _nft);

        return totalAuctions-1;
    }

    function bidBlindAuction(uint256 _auctionId)
    external payable statusIs(AuctionStatus.Active, _auctionId)
    returns(bool success) {
        require(msg.value > 0);

        Auction storage auction = auctions[_auctionId];
        require(auction.auctionType == AuctionType.Blind, "This is not a blind type of auction");

        BlindAuction storage _blindAuction = blindAuctions[auction.auctionTypeId];
        uint nftPrice = getNFTPrice(auction.nft);

        // Require address to be a new bidder
        require(_blindAuction.fundsByBidder[msg.sender] == 0, "You cannot bid more than once");
        uint256 newBid = msg.value;
        require(newBid >= nftPrice);

        _blindAuction.fundsByBidder[msg.sender] = newBid;

        if(newBid > _blindAuction.highestBid) {
            _blindAuction.highestBid = newBid;
            _blindAuction.highestBidder = msg.sender;
        }

        // Emit BidCreated event
        emit BidCreated(_auctionId, auction.nft, msg.sender, newBid);
        return true;
    }

    // @dev Allow people to withdraw their balances or the NFT
    function withdrawBalanceBlindAuction(uint256 _auctionId) external returns(bool success) {
        AuctionStatus _status = _getAuctionStatus(_auctionId);
        require(_status == AuctionStatus.Completed, "Please wait for the auction to complete");

        Auction storage auction = auctions[_auctionId];
        require(auction.auctionType == AuctionType.Blind, "This is not a blind type of auction");

        BlindAuction storage _blindAuction = blindAuctions[auction.auctionTypeId];
        address fundsFrom;
        uint withdrawalAmount;

        // The seller gets receives highest bid when the auction is completed.
        if (msg.sender == auction.seller) {
            fundsFrom = _blindAuction.highestBidder;
            withdrawalAmount = _blindAuction.highestBid;
        }
        // Highest bidder can only withdraw the NFT when the auction is completed.
        else if (msg.sender == _blindAuction.highestBidder) {
            transferFrom(auction.seller, _blindAuction.highestBidder, auction.nft);
            emit AuctionNFTWithdrawal(_auctionId, auction.nft, msg.sender);
            return true;
        }
        // Anyone else gets what they bid 
        else {
            fundsFrom = msg.sender;
            withdrawalAmount = _blindAuction.fundsByBidder[fundsFrom];
        }

        require(withdrawalAmount > 0);
        _blindAuction.fundsByBidder[fundsFrom] -= withdrawalAmount;
        _sendFunds(msg.sender, withdrawalAmount);

        emit AuctionFundWithdrawal(_auctionId, auction.nft, msg.sender, withdrawalAmount);

        return true;
    }

    function getBlindAuction(uint256 _auctionId)
    external view returns(
        uint256 id, 
        uint nft, 
        address seller, 
        uint256 duration, 
        uint256 startedAt, 
        uint256 startBlock, 
        AuctionStatus status, 
        uint256 highestBid, 
        address highestBidder
    ) {
        Auction storage _auction = auctions[_auctionId];
        AuctionStatus _status = _getAuctionStatus(_auctionId);

        require(_auction.auctionType == AuctionType.Blind, "This is not a blind type of auction");
        BlindAuction storage _blindAuction = blindAuctions[_auction.auctionTypeId];

        return(_auctionId, _auction.nft, _auction.seller, _auction.duration, _auction.startedAt, _auction.startBlock, _status, _blindAuction.highestBid, _blindAuction.highestBidder);
    }

    // @dev Return bid for given auction ID and bidder
    function getBlindAuctionBid(uint256 _auctionId, address bidder)
    external view returns(uint256) {
        Auction storage auction = auctions[_auctionId];
        require(auction.auctionType == AuctionType.Blind, "This is not a blind type of auction");
        BlindAuction storage _blindAuction = blindAuctions[auction.auctionTypeId];
        return _blindAuction.fundsByBidder[bidder];
    }

    //#################################################################
    //# Additional Utility Functions 
    //#################################################################

    function _getAuctionStatus(uint256 _auctionId)
    internal view returns(AuctionStatus) {
        Auction storage auction = auctions[_auctionId];

        if (auction.cancelled) {
            return AuctionStatus.Cancelled;
        } else if (auction.startedAt + auction.duration < block.timestamp) {
            return AuctionStatus.Completed;
        } else {
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

    function cancelAuction(uint256 _auctionId) external {
        _cancelAuction(_auctionId);
    }


    // @dev Cancels an auction unconditionally.
    function _cancelAuction(uint256 _auctionId)
    internal statusIs(AuctionStatus.Active, _auctionId)
    onlySeller(_auctionId) {
        Auction storage auction = auctions[_auctionId];
        EnglishAuction storage _englishAuction = englishAuctions[auction.auctionTypeId];
        auction.cancelled = true;
        _englishAuction.highestBidder = address(0);

        emit AuctionCancelled(_auctionId, auction.nft);
    }
    
    
    // Wasn't working properly so created same funtionality instead in Javascript
    // function getDutchAuctionPrice(uint _auctionId) public view returns(uint) {

    //     Auction storage auction = auctions[_auctionId];
    //     require(auction.auctionType == AuctionType.Dutch, "This is not a dutch type of auction");
    //     DutchAuction storage _dutchAuction = dutchAuctions[auction.auctionTypeId];
    //     uint nftPrice = getNFTPrice(auction.nft);

    //     AuctionStatus _status = _getAuctionStatus(_auctionId);
    //     uint endingPrice = _dutchAuction.endingPrice;
    //     if (_status == AuctionStatus.Completed) {
    //         return endingPrice;
    //     }
    //     uint diffTime = (block.timestamp - auction.startedAt) / 60; // Difference in time in minutes
    //     uint price = nftPrice - (diffTime * _dutchAuction.decrementPrice);
    //     if (price <= endingPrice) {
    //         return endingPrice;
    //     }
    //     return price;
    // }

}
