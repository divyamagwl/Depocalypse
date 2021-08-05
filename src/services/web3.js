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

//#################################################################
//# General Utility functions
//#################################################################

export const getNFTPrice = async (tokenID) => {
  const result = await NFT_TransferContract.methods.getNFTPrice(tokenID).call();
  return result;
};

export const getNFTCount = async () => {
  const result = await NFT_TransferContract.methods.getNFTCount().call();
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


//#################################################################
//# Create NFT
//#################################################################

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


//#################################################################
//# Sale functions
//#################################################################

export const getOnSaleTokens = async () => {
  const result = await NFT_TransferContract.methods.getOnSaleTokens().call();
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

//#################################################################
//# Auction Utilities
//#################################################################

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


//#################################################################
//# English Auction
//#################################################################

// place bid for auctionID
export const bid = async (auctionID, yourBid) => {
  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];
  try {
    await NFT_TransferContract.methods
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
};

// get the bid of current account
export const getBid = async (auctionID) => {
  const accounts = await web3.eth.getAccounts();
  const result = await NFT_TransferContract.methods
    .getBid(auctionID, accounts[0])
    .call();
  return result;
};

// get auction details of auctionID
export const getAuction = async (auctionID) => {
  const result = await NFT_TransferContract.methods
    .getAuction(auctionID)
    .call();
  return result;
};

// withdraw balance for given auctionID
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

export const getDutchAuctionPrice = async (_auctionDetails, _data, _auctionCompleted) => {

  const nftPrice = _data.price;
  const endingPrice = _auctionDetails.endingPrice;
  if (_auctionCompleted) {
      return endingPrice;
  }
  const now = Math.floor((Date.now()) / 1000); // UNIX time in sec
  const diffTime = Math.round((now - _auctionDetails.startedAt) / 60); // Difference in time in minutes
  const price = nftPrice - (diffTime * _auctionDetails.decrementPrice);
  if (price <= endingPrice) {
      return endingPrice;
  }
  return price;
}

export const consensusDutchAuction = async (auctionID, price) => {
  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];
  await NFT_TransferContract.methods
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
};

//#################################################################
//# Blind Auction 
//#################################################################

export const getBlindAuction = async (auctionID) => {
  const result = await NFT_TransferContract.methods
    .getBlindAuction(auctionID)
    .call();
  return result;
};

// get the bid of current account
export const getBlindAuctionBid = async (auctionID) => {
  const accounts = await web3.eth.getAccounts();
  const result = await NFT_TransferContract.methods
    .getBlindAuctionBid(auctionID, accounts[0])
    .call();
  return result;
};

export const bidBlindAuction = async (auctionID, yourBid) => {
  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];
  try {
    await NFT_TransferContract.methods
      .bidBlindAuction(auctionID)
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
};

export const withdrawBalanceBlindAuction = async (auctionID) => {
  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];
  try {
    const result = await NFT_TransferContract.methods
      .withdrawBalanceBlindAuction(auctionID)
      .send({
        from: account,
      });
    return result;
  } catch (e) {
    console.log(e.message);
    return false;
  }
};
