import React, { useEffect, useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import CreateNFT from './containers/CreateNFT';
import Market from './containers/Market';
import './BaseRouter.css'
import Purchase from './containers/Purchase';
import axios from 'axios';
import { getOnSaleTokens, getUserNfts, tokenURI } from './services/web3';
import LoadingScreen from './LoadingScreen';
import NoNftScreen from './NoNftScreen';

function BaseRouter({wallet, isLoggedIn}) {

    const [nfts, setNfts] = useState(null);
    const [yourNfts, setYourNfts] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
 
    useEffect(() => {
        console.log('running useEffect');
        setTimeout(() => {}, 2000);

        const fetchData = async () => {
            const onSaleNfts = await getOnSaleTokens();
            console.log(onSaleNfts);
            const userNfts = await getUserNfts();
            
            const count = parseInt(onSaleNfts[0]);
            const onSaleNftsArray = onSaleNfts.slice(1,count+1);

            var nft_array = [];
            onSaleNftsArray.forEach(async i => {
              var uri = await tokenURI(i);
              // uri = 'https://ipfs.io/ipfs/' + uri.slice(7);
              uri = uri.slice(7); 
              uri = uri.substring(0, uri.length - 14);
              uri = 'https://' + uri + '.ipfs.dweb.link/metadata.json';
              // var result = await axios(uri)
              await axios.get(uri).then(result => {
                var nft = result.data;
                nft.tokenID = i;
                nft_array.push(nft);
              }).catch(error => {
                if (error.response) {
                  // Request made and server responded
                  console.log(error.response.data);
                  console.log(error.response.status);
                  console.log(error.response.headers);
                } else if (error.request) {
                  // The request was made but no response was received
                  console.log(error.request);
                } else {
                  // Something happened in setting up the request that triggered an Error
                  console.log('Error', error.message);
                }
              })
              
            });
            
            

            var nft_array_2 = [];
            console.log(nft_array_2);
            userNfts.forEach(async i =>  {
              var uri = await tokenURI(i);
              // uri = 'https://ipfs.io/ipfs/' + uri.slice(7);
              uri = uri.slice(7); 
              uri = uri.substring(0, uri.length - 14);
              uri = 'https://' + uri + '.ipfs.dweb.link/metadata.json';
              // var result = await axios(uri)
              await axios.get(uri).then(result => {
                var nft = result.data;
                nft.tokenID = i;
                nft_array_2.push(nft);
              }).catch(error => {
                if (error.response) {
                  // Request made and server responded
                  console.log(error.response.data);
                  console.log(error.response.status);
                  console.log(error.response.headers);
                } else if (error.request) {
                  // The request was made but no response was received
                  console.log(error.request);
                } else {
                  // Something happened in setting up the request that triggered an Error
                  console.log('Error', error.message);
                }
              })

              
          });
          setNfts(nft_array);
          setYourNfts(nft_array_2);
          setTimeout(() => setIsLoading(false), 3000);
        };
        
        fetchData()
    },[]);

  return (
    <div className='base__router'>
    {isLoading && <LoadingScreen text={'Loading NFTs, please be Fungible!'}/> }
    {( !isLoading ) && 
    <Switch>
      <Route exact path='/' render={() => ( nfts.length > 0 ? <Market nfts={nfts} /> : <NoNftScreen/> )}/>
      <Route exact path='/create-nft' 
      render={() => (
        <CreateNFT 
          wallet={wallet} 
          isLoggedIn={isLoggedIn}
        />
      )}/>
      <Route exact path='/your-gallery' render={() => ( yourNfts.length > 0 ? <Market nfts={yourNfts} /> : <NoNftScreen/> )}/>
      <Route path="/market/:tokenID" component={Purchase} />
    </Switch>}
  </div>)
};

export default BaseRouter;