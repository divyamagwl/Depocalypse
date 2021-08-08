import React, { useEffect, useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import CreateNFT from './containers/CreateNFT';
import Market from './containers/Market';
import Auction from './containers/Auction';
import './BaseRouter.css'
import Purchase from './containers/Purchase';
import EnglishAuctionPurchase from './containers/EnglishAuctionPurchase';
import DutchAuctionPurchase from './containers/DutchAuctionPurchase';
import axios from 'axios';
import { getOnSaleTokens, getOnAuctionTokens, getUserNfts, tokenURI, getAuctionId, getAuctionType, sf, getOnCharityTokens } from './services/web3';
import LoadingScreen from './LoadingScreen';
import NoNftScreen from './NoNftScreen';
import BlindAuctionPurchase from './containers/BlindAuctionPurchase';
import CharityPurchase from './containers/CharityPurchase';
import Charity from './containers/Charity';

function BaseRouter({wallet, isLoggedIn}) {

    const [nfts, setNfts] = useState(null);
    const [auctionNfts, setAuctionNfts] = useState(null);
    const [charityNfts, setCharityNfts] = useState(null);
    const [yourNfts, setYourNfts] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const getURI = async (i) => {
      var uri = await tokenURI(i);
      uri = uri.slice(7); 
      uri = uri.substring(0, uri.length - 14);
      uri = 'https://' + uri + '.ipfs.dweb.link/metadata.json';
      return uri
    }

    useEffect(() => {
        setTimeout(() => {
          
        }, 2000);

        const fetchData = async () => {
            // super fluid initalisation
            await sf.initialize()
            const onSaleNftIDs = await getOnSaleTokens();
            const userNfts = await getUserNfts();
            
            const count = parseInt(onSaleNftIDs[0]);
            const onSaleNftsArray = onSaleNftIDs.slice(1,count+1);

            var sale_nft_array = [];
            onSaleNftsArray.forEach(async i => {
              var uri = await getURI(i);
              await axios.get(uri).then(result => {
                var nft = result.data;
                nft.tokenID = i;
                sale_nft_array.push(nft);
              }).catch(error => { console.log(error); })
            });
            
            var your_nft_array = [];
            userNfts.forEach(async i =>  {
              var uri = await getURI(i);
              await axios.get(uri).then(result => {
                var nft = result.data;
                nft.tokenID = i;
                your_nft_array.push(nft);
              }).catch(error => { console.log(error); })
            });

          const onAuctionNfts = await getOnAuctionTokens();
          console.log(onAuctionNfts);
          const countAuction = parseInt(onAuctionNfts[0]);
          const onAuctionNftsArray = onAuctionNfts.slice(1,countAuction+1);

          var auction_nft_array = [];
          onAuctionNftsArray.forEach(async i => {
            var uri = await getURI(i);
            var nft;
            await axios.get(uri).then(result => {
              nft = result.data;
              nft.tokenID = i;
              auction_nft_array.push(nft);
            }).catch(error => { console.log(error) })

            nft.auctionID = await getAuctionId(i);
            nft.auctionType = await getAuctionType(nft.auctionID);
            console.log(nft.auctionType);
          });

          const onCharityNfts = await getOnCharityTokens();
          console.log(onCharityNfts);
          const countCharity = parseInt(onCharityNfts[0]);
          const onCharityNftsArray = onCharityNfts.slice(1,countCharity+1);

          var charity_nft_array = [];
          onCharityNftsArray.forEach(async i => {
            var uri = await getURI(i);
            var nft;
            await axios.get(uri).then(result => {
              nft = result.data;
              nft.tokenID = i;
              charity_nft_array.push(nft);
            }).catch(error => { console.log(error) })
          });

          console.log(charity_nft_array);
          setNfts(sale_nft_array);
          setAuctionNfts(auction_nft_array)
          setYourNfts(your_nft_array);
          setCharityNfts(charity_nft_array);
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
      <Route exact path='/auctions' render={() => ( auctionNfts.length > 0 ? <Auction nfts={auctionNfts} /> : <NoNftScreen/> )}/>
      <Route exact path='/charity' render={() => ( charityNfts.length > 0 ? <Charity nfts={charityNfts} /> : <NoNftScreen/> )}/>
      <Route exact path='/create-nft' 
      render={() => (
        <CreateNFT 
          wallet={wallet} 
          isLoggedIn={isLoggedIn}
        />
      )}/>
      <Route exact path='/your-gallery' render={() => ( yourNfts.length > 0 ? <Market nfts={yourNfts} /> : <NoNftScreen/> )}/>
      <Route path="/market/:tokenID" component={Purchase} />
      <Route path="/auction/e/:tokenID/:auctionID" component={EnglishAuctionPurchase} />
      <Route path="/auction/d/:tokenID/:auctionID" component={DutchAuctionPurchase} />
      <Route path="/auction/b/:tokenID/:auctionID" component={BlindAuctionPurchase} />
      <Route path="/charity/:tokenID" component={CharityPurchase} />
    </Switch>}
  </div>)
};

export default BaseRouter;

