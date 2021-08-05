import Portis from "@portis/web3";
import Web3 from "web3";
import { NFT_TransferAbi } from "./abi";

// const myPrivateEthereumNode = {
//   nodeUrl: 'https://rpc-mumbai.matic.today',
//   chainId: 80001,
// };

export const portis = new Portis(
  "9b58c894-cac3-4614-95ca-b5d94cac84b3",
  "mainnet",
  { scope: ["email"] }
);
// export const web3 = new Web3(portis.provider);
export const web3 = new Web3(Web3.givenProvider);
// change to the orignal deployed address
const contractAddr = "0x14043c8242DDaEe647849C560C39FBf6eD551C74";
export const NFT_TransferContract = new web3.eth.Contract(
  NFT_TransferAbi,
  contractAddr
);

export const getNFTPrice = async (tokenID) => {
  const result = await NFT_TransferContract.methods.getNFTPrice(tokenID).call();
  return result;
};

export const getNFTCount = async () => {
  const result = await NFT_TransferContract.methods.getNFTCount().call();
  return result;
};

export const mintNFT = async (name, url, price, onSale, onAuction, auctionType, duration, bidIcrement, endingPrice, decrementPrice) => 
{
  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];
  const result = await NFT_TransferContract.methods
    .mintNFT(name, url, price, onSale, onAuction, auctionType, duration, bidIcrement, endingPrice, decrementPrice)
    .send({
      from: account,
    });

  console.log(result);
};

export const getOnSaleTokens = async () => {
  const result = await NFT_TransferContract.methods.getOnSaleTokens().call();
  return result;
};

export const getUserNfts = async () => {
  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];
  const result = await NFT_TransferContract.methods.getUserNfts().call({
    from: account,
  });
  return result;
};

export const consensusNft = async (tokenId) => {
  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];
  const result = await NFT_TransferContract.methods
    .consensusNft(tokenId)
    .send({
      from: account,
      value: await getNFTPrice(tokenId),
    })
    .on("transactionHash", function (hash) {})
    .on("receipt", function (receipt) {})
    .on("confirmation", function (confirmationNumber, receipt) {
      window.alert("successfully purchase!");
    })
    .on("error", function (error, receipt) {
      window.alert("an error has occured!");
    });

  window.location.reload();
  console.log(result);
};

// get the owner Address of tokenID
export const ownerOf = async (tokenID) => {
  const result = await NFT_TransferContract.methods.ownerOf(tokenID).call();
  return result;
};

// get the URI of tokenID
export const tokenURI = async (tokenID) => {
  const url = await NFT_TransferContract.methods.tokenURI(tokenID).call();
  return url;
};

// get current account address
export const getAccountAddress = async () => {
  const accounts = await web3.eth.getAccounts();
  return accounts[0];
};

// get current account balance in ether
export const getAccountBalance = async () => {
  const accounts = await web3.eth.getAccounts();
  var result = await web3.eth.getBalance(accounts[0]);
  result = web3.utils.fromWei(result);
  return result;
};

// get all tokens currently on auction
export const getOnAuctionTokens = async () => {
  const result = await NFT_TransferContract.methods.getOnAuctionTokens().call();
  return result;
};

// get the auctionID of tokenID
export const getAuctionId = async (tokenID) => {
  const result = await NFT_TransferContract.methods.NftAuction(tokenID).call();
  return result;
};

// get the auctionType of given auctionID
export const getAuctionType = async (auctionID) => {
  const result = await NFT_TransferContract.methods.getAuctionType(auctionID).call();
  return result;
};


export const bid = async (auctionID, yourBid) => {
  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];
  var result;
  try {
    result = await NFT_TransferContract.methods
      .bid(auctionID)
      .send({
        from: account,
        value: yourBid,
      })
      .on("transactionHash", function (hash) {})
      .on("receipt", function (receipt) {})
      .on("confirmation", function (confirmationNumber, receipt) {
        window.alert("successfully bid!");
      })
      .on("error", function (error, receipt) {
        console.log(error);
        window.alert("an error has occured!");
      });
  } catch (e) {
    console.log(e);
    return;
  }
  window.location.reload();
  console.log(result);
};

// get the higgest bidder of auctionID
export const getHighestBid = async (auctionID) => {
  const result = await NFT_TransferContract.methods
    .getHighestBid(auctionID)
    .call();
  return result;
};

// get the bid of current account
export const getBid = async (auctionID) => {
  const accounts = await web3.eth.getAccounts();
  const result = await NFT_TransferContract.methods
    .getBid(auctionID, accounts[0])
    .call();
  return result;
};

export const getAuction = async (auctionID) => {
  const result = await NFT_TransferContract.methods
    .getAuction(auctionID)
    .call();
  return result;
};

export const withdrawBalance = async (auctionID) => {
  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];
  try {
    const result = await NFT_TransferContract.methods
      .withdrawBalance(auctionID)
      .send({
        from: account,
      });
    console.log(result);
    return result;
  } catch (e) {
    console.log(e.message);
    return false;
  }
};


//#################################################################
//# Dutch Auction 
//#################################################################

export const getDutchAuction = async (auctionID) => {
  const result = await NFT_TransferContract.methods
    .getDutchAuction(auctionID)
    .call();
  return result;
};

export const consensusDutchAuction = async (auctionID, price) => {
  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];
  const result = await NFT_TransferContract.methods
    .consensusDutchAuction(auctionID)
    .send({
      from: account,
      value: price,
    })
    .on("transactionHash", function (hash) {})
    .on("receipt", function (receipt) {})
    .on("confirmation", function (confirmationNumber, receipt) {
      window.alert("Your purchase is successful!");
    })
    .on("error", function (error, receipt) {
      window.alert("An error has occured!");
    });

  window.location.reload();
  console.log(result);
};
