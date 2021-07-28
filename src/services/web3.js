import Portis from "@portis/web3";
import Web3 from "web3";
import { NFT_TransferAbi } from "./abi";

const myPrivateEthereumNode = {
  nodeUrl: 'http://127.0.0.1:7545',
  chainId: 1377,
};

export const portis = new Portis('9b58c894-cac3-4614-95ca-b5d94cac84b3', myPrivateEthereumNode, { scope: ['email'] });
// export const web3 = new Web3(portis.provider);
export const web3 = new Web3(Web3.givenProvider);
// change to the orignal deployed address
const contractAddr = '0x459e204C424463882015e98D11779c5F60aa03e9';
export const NFT_TransferContract = new web3.eth.Contract(NFT_TransferAbi, contractAddr);

export const mintNFT = async (name, url, price, onSale) => {
    // this works for both, meta mask and portis
    const accounts = await web3.eth.getAccounts((error, accounts) => {
      console.log(accounts);
    });
    const account = accounts[0];
    const gas = await NFT_TransferContract.methods.mintNFT(name, url, price, onSale).estimateGas();
    const result = await NFT_TransferContract.methods.mintNFT(name, url, price, onSale).send({
        from: account,
        gas: gas
      });
}

export const getUserNfts = async () => {
  const accounts = await web3.eth.getAccounts((error, accounts) => {
    console.log(accounts);
  });
  const account = accounts[0];
  const result = await NFT_TransferContract.methods.getUserNfts(account).call();
  return result;
}

export const tokenURI = async (tokenID) => {
  const url = await NFT_TransferContract.methods.tokenURI(tokenID).call();
  return url;
}

export const getCount = async () => {
  const result = await NFT_TransferContract.methods.getCount().call();
  return result;
}

export const ownerOf = async (tokenID) => {
  const result = await NFT_TransferContract.methods.ownerOf(tokenID).call();
  return result;
}

// export const buy = async (tokenID) => {
//   const accounts = await web3.eth.getAccounts((error, accounts) => {
//     console.log(accounts);
//   });
//   const account = accounts[0];
//   const from = await ownerOf(tokenID);
//   const gas = await NFT_TransferContract.methods.transferFrom(from, account, tokenID).estimateGas();
//   const result = await NFT_TransferContract.methods.transferFrom(from, account, tokenID).send({
//       from: account,
//       gas: gas,
//     });
// }


export const buy = async (tokenId, price) => {
  const accounts = await web3.eth.getAccounts((error, accounts) => {
    console.log(accounts);
  });
  const account = accounts[0];
  NFT_TransferContract.methods.buyToken(tokenId)
  .send({ from:account, value: 1000000000000000000 * price, })
    .on("confirmation", () => {
      window.alert('successfully purchased');
    });
};