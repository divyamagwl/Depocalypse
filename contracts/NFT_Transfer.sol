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
}