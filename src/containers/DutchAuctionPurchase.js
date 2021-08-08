import React, { useEffect, useState } from 'react'
import '../styles/Purchase.css'
import { Icon } from '@iconify/react';
import ethereumIcon from '@iconify-icons/mdi/ethereum';
import keyboardBackspace from '@iconify-icons/mdi/keyboard-backspace';
import { useHistory } from 'react-router-dom'
import { getAccountAddress, tokenURI, web3, getDutchAuction, consensusDutchAuction, getDutchAuctionPrice } from '../services/web3';
import axios from 'axios';

function DutchAuctionPurchase(props) {

    const { goBack } = useHistory()
    const tokenID = props.match.params.tokenID;
    const auctionID = props.match.params.auctionID;
    const [data, setData] = useState({
        name: '',
        price: '',
        image: '',
        description: '',
    });
    const [isDisable, setIsDisable] = useState(true);
    const [auctionDetails, setAuctionDetails] = useState({
        id: '',
        nft: '',
        seller: '',
        duration: '',
        startedAt: '',
        startBlock: '',
        status: '',
        endingPrice: '',
        decrementPrice: '',
        completed: ''
    })
    const [auctionCompleted, setAuctionCompleted] = useState(false);
    const [auctionEndTime, setAuctionEndTime] = useState(0);
    const [currentPrice, setCurrentPrice] = useState(0);

    const dwebLink = (url) => {
        var uri = url.slice(7); 
        uri = uri.substring(0, uri.length - 5);
        uri = 'https://' + uri + '.ipfs.dweb.link/blob';
        return uri;
    }
  
    const auctionEndTimeHumanDate = (unixAuctionEndTime) => {
        const unixTimestamp = unixAuctionEndTime
        const milliseconds = unixTimestamp * 1000      
        const dateObject = new Date(milliseconds)
        const humanDateFormat = dateObject.toLocaleString()
        return humanDateFormat;
    }

    const checkAuctionEnd = async (_auctionDetails, _data) => {
        const now = Math.floor((Date.now()) / 1000); // UNIX time in sec
        const startedAt = parseInt(_auctionDetails.startedAt);
        const duration = parseInt(_auctionDetails.duration);
        const unixAuctionEndTime = startedAt + duration
        console.log( now, _auctionDetails.startedAt );
        setAuctionEndTime(auctionEndTimeHumanDate(unixAuctionEndTime));

        const result = await getDutchAuctionPrice(_auctionDetails, _data, auctionCompleted);
        setCurrentPrice(result);

        if(unixAuctionEndTime < now) {
            console.log("Auction completed")
            setAuctionCompleted(true)
        }
    }
  
    useEffect(() => {
        const fetchData = async () => {
            var url =  await tokenURI(tokenID);
    
            url = url.slice(7); 
            url = url.substring(0, url.length - 14);
            url = 'https://' + url + '.ipfs.dweb.link/metadata.json';
    
            const result = await axios(url);
    
            setData(result.data);

            const _auctionDetails = await getDutchAuction(auctionID);
            setAuctionDetails(_auctionDetails);

            const ownerAddr = _auctionDetails.seller;
            const userAddr = await getAccountAddress();
            const disable = ownerAddr === userAddr;
            setIsDisable(disable);

            if(_auctionDetails.completed) {
                setCurrentPrice(result.data.price);
                setAuctionCompleted(true);
            }
            else {
                await checkAuctionEnd(_auctionDetails, result.data);
            }
        };

        fetchData();
    },[tokenID, auctionID]);

    // 2nd use effect
    useEffect(() => {
        if(auctionDetails.startedAt === "") { 
            return
        }
        if(auctionDetails.completed) {
            setCurrentPrice(data.price);
            setAuctionCompleted(true);
        }
        let interval
        if(!auctionCompleted) {
            interval = setInterval(async () => {
                await checkAuctionEnd(auctionDetails, data);
            }, 10000);
        }
        else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [auctionCompleted, auctionDetails]) 

    const buyNFT = async () => {
        await consensusDutchAuction(auctionID, currentPrice);
    }

    return (
            
            <div className='purchase'>
                <div className="goback">
                    <Icon icon={keyboardBackspace} onClick={goBack} className='gobackButton'/> 
                </div> 
                <div className='purchase__header'> 
                    <h2>Auction will end on: </h2>
                    {!auctionCompleted && <h3>{auctionEndTime}</h3>}
                    {auctionCompleted && <h3>Ended</h3>}
                    
                </div> 
                <div className="purchase__artwork">
                    {data.image && <img src={dwebLink(data.image)} alt="nft artwork" />}
                </div>

                <div className="purchase__details">
                    <h1>#{tokenID} {data.name}</h1>
                    <h2>Auction Type: Dutch 🇳🇱</h2>
                    <h3>{data.description}</h3>
                    <div className="purchase__detailsBuy">
                        <div className="value">
                            <h2>Initial: {web3.utils.fromWei((data.price).toString())}</h2>
                            <Icon icon={ethereumIcon} style={{ color: 'white' }} className='symbol'/>
                        </div>
                        {
                            (!auctionCompleted) && !auctionDetails.completed &&
                            <button onClick={buyNFT} disabled={isDisable}>Buy now</button>
                        }
                    </div>
                    <div className="purchase__auctionDetails">
                        <div className="purchase__auctionDetails__Bids">
                            <h2>Current Price: {web3.utils.fromWei(currentPrice.toString())}</h2> 
                        </div>
                    </div>
                    
                </div>
            </div> 
    )
}

export default DutchAuctionPurchase;