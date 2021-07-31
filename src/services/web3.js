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
const contractAddr = '0xD94902D39BC520fE0D5413472fCE417807cAbF88';
export const NFT_TransferContract = new web3.eth.Contract(NFT_TransferAbi, contractAddr);

export const getNFTPrice = async (tokenID) => {
  const result = await NFT_TransferContract.methods.getNFTPrice(tokenID).call();
  return result;
}

export const getNFTCount = async () => {
  const result = await NFT_TransferContract.methods.getNFTCount().call();
  return result;
}

export const mintNFT = async (name, url, price, onSale) => {
    // this works for both, meta mask and portis
    const accounts = await web3.eth.getAccounts((error, accounts) => {
      console.log(accounts);
    });
    const account = accounts[0];
    // portis and metamask automatically calculates the gas
    // const gas = await NFT_TransferContract.methods.mintNFT(name, url, price, onSale).estimateGas();
    const result = await NFT_TransferContract.methods.mintNFT(name, url, price, onSale).send({
        from: account,
        // gas: gas,
      })
      // .on('confirmation', function(confirmationNumber, receipt){
      //   window.alert('Successfully minted!')
      // })
      // .on('error', function(error, receipt) {
      //   window.alert('an error has occured!')
      // });

    console.log(result);
}

export const getOnSaleTokens = async () => {
  const result = await NFT_TransferContract.methods.getOnSaleTokens().call();
  return result;
}

export const getUserNfts = async () => {
  const accounts = await web3.eth.getAccounts((error, accounts) => {
    console.log(accounts);
  });
  const account = accounts[0];
  const result = await NFT_TransferContract.methods.getUserNfts().call({
    from: account,
  });
  return result;
}

export const consensusNft = async(tokenId) => {
  const accounts = await web3.eth.getAccounts((error, accounts) => {
    console.log(accounts);
  });
  const account = accounts[0];
  const result = await NFT_TransferContract.methods.consensusNft(tokenId)
  .send({ 
    from: account, 
    value: await getNFTPrice(tokenId),
  })
  .on('transactionHash', function(hash){

  })
  .on('receipt', function(receipt){
  
  })
  .on('confirmation', function(confirmationNumber, receipt){
    window.alert('successfully purchase!')
  })
  .on('error', function(error, receipt) {
    window.alert('an error has occured!')
  });

  window.location.reload();
  console.log(result);
};

// get the owner Address of tokenID
export const ownerOf = async (tokenID) => {
  const result = await NFT_TransferContract.methods.ownerOf(tokenID).call();
  return result;
}

// get the URI of tokenID
export const tokenURI = async (tokenID) => {
  const url = await NFT_TransferContract.methods.tokenURI(tokenID).call();
  return url;
}


// get current account address
export const getAccountAddress = async () => {
  const accounts = await web3.eth.getAccounts();
  return accounts[0];
}

// get current account balance in ether
export const getAccountBalance = async () => {
  const accounts = await web3.eth.getAccounts();
  var result = await web3.eth.getBalance(accounts[0]);
  result = web3.utils.fromWei(result);
  return result;
}
