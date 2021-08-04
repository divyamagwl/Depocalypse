import React, { useEffect, useState } from 'react'
import '../styles/Purchase.css'
import { Icon } from '@iconify/react';
import ethereumIcon from '@iconify-icons/mdi/ethereum';
import keyboardBackspace from '@iconify-icons/mdi/keyboard-backspace';
import { useHistory } from 'react-router-dom'
import { getAccountAddress, tokenURI, web3, bid, getAuction, getBid, withdrawBalance } from '../services/web3';
import axios from 'axios';

// TODO: Add a loader because second useEffect takes some time

function AuctionPurchase(props) {
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
    const [inputBid, setInputBid] = useState(0);
    const [yourBid, setYourBid] = useState(0);
    const [auctionDetails, setAuctionDetails] = useState({
        id: '',
        nft: '',
        seller: '',
        bidIncrement: '',
        duration: '',
        startedAt: '',
        startBlock: '',
        status: '',
        highestBid: '',
        highestBidder: '',
    })
    const [auctionCompleted, setAuctionCompleted] = useState(false);
    const [auctionEndTime, setAuctionEndTime] = useState(0);

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

    const checkAuctionEnd = (_auctionDetails) => {
        const now = Math.floor((Date.now()) / 1000); // UNIX time in sec
        const startedAt = parseInt(_auctionDetails.startedAt);
        const duration = parseInt(_auctionDetails.duration);
        const unixAuctionEndTime = startedAt + duration
        console.log( now, unixAuctionEndTime );
        setAuctionEndTime(auctionEndTimeHumanDate(unixAuctionEndTime));

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

            const _auctionDetails = await getAuction(auctionID);
            setAuctionDetails(_auctionDetails);

            const _yourBid = await getBid(auctionID);
            setYourBid(_yourBid);

            const ownerAddr = _auctionDetails.seller;
            const userAddr = await getAccountAddress();
            const disable = ownerAddr === userAddr;
            setIsDisable(disable);

            checkAuctionEnd(_auctionDetails);
        };

        fetchData();
    },[tokenID, auctionID]);

    // 2nd use effect
    useEffect(() => {
        if(auctionDetails.startedAt === "") { 
            return
        }
        let interval
        if(!auctionCompleted) {
            interval = setInterval(() => {
                checkAuctionEnd(auctionDetails);
            }, 1000);
        }
        else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [auctionCompleted, auctionDetails]) 

    const onPlaceBid = () => {
        if(inputBid !== 0) {
            bid(auctionID, web3.utils.toWei(inputBid));
        }
        else {
            window.alert("Increase bid price");
        }
    }

    const withdraw = async () => {
        const result = await withdrawBalance(auctionID);
        console.log(result)
        if (result) {
            window.alert("Transaction is successful");
            window.location.reload();
        }
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
                    <h3>{data.description}</h3>
                    <div className="purchase__detailsBuy">
                        <div className="value">
                            <h2>Initial: {web3.utils.fromWei((data.price).toString())}</h2>
                            <Icon icon={ethereumIcon} style={{ color: 'white' }} className='symbol'/>
                        </div>
                        {/* These might not be working properly */}
                        {
                            (!auctionCompleted) &&
                            <button onClick={onPlaceBid} disabled={isDisable}>Bid</button>
                        }
                        {
                            // eslint-disable-next-line
                            (!isDisable) && (auctionDetails.highestBid !== yourBid) && (yourBid != 0) &&
                            <button onClick={withdraw}>Withdraw balance</button>
                        }
                        {
                            (auctionDetails.highestBid === yourBid) && (auctionCompleted) &&
                            <button onClick={withdraw}>Claim your NFT</button>
                        }
                        {
                            (isDisable) && (auctionCompleted) &&
                            <button onClick={withdraw}>Claim your money</button>
                        }
                    </div>
                    <div className="purchase__auctionDetails">
                        <div className="purchase__auctionDetails__Bids">
                            <h2>Highest Bid: {web3.utils.fromWei((auctionDetails.highestBid).toString())}</h2> 
                            <h2>Your Bid: {web3.utils.fromWei((yourBid).toString())}</h2> 
                        </div>
                        {(!auctionCompleted) &&
                        <label>Increase your bid by</label>}
                        {(!auctionCompleted) &&
                        <input 
                        required
                        type="number" 
                        min="0.01"
                        step="0.01" 
                        value={inputBid}
                        onChange={(e) => setInputBid(e.target.value)}
                        />}
                    </div>
                </div>
            </div> 
    )
}

export default AuctionPurchase
