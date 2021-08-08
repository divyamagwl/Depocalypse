import React, { useEffect, useState } from 'react'
import '../styles/Purchase.css'
import { Icon } from '@iconify/react';
import ethereumIcon from '@iconify-icons/mdi/ethereum';
import keyboardBackspace from '@iconify-icons/mdi/keyboard-backspace';
import { useHistory } from 'react-router-dom'
import { getAccountAddress, tokenURI, web3, bidBlindAuction, getBlindAuction, getBlindAuctionBid, withdrawBalanceBlindAuction, ownerOf } from '../services/web3';
import axios from 'axios';

function BlindAuctionPurchase(props) {
    const { goBack } = useHistory()
    
    const tokenID = props.match.params.tokenID;
    const auctionID = props.match.params.auctionID;
    const [account, setAccount] = useState('');
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
        duration: '',
        startedAt: '',
        startBlock: '',
        status: '',
        highestBid: '',
        highestBidder: '',
    })
    const [auctionCompleted, setAuctionCompleted] = useState(false);
    const [auctionEndTime, setAuctionEndTime] = useState(0);
    const [currentOwner, setCurrentOwner] = useState('');

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

            const _auctionDetails = await getBlindAuction(auctionID);
            setAuctionDetails(_auctionDetails);

            const _yourBid = await getBlindAuctionBid(auctionID);
            setYourBid(_yourBid);

            const ownerAddr = _auctionDetails.seller;
            const userAddr = await getAccountAddress();
            setAccount(userAddr);
            const disable = ownerAddr === userAddr;
            setIsDisable(disable);

            checkAuctionEnd(_auctionDetails);

            const currOwner = await ownerOf(tokenID);
            setCurrentOwner(currOwner);
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
            }, 10000);
        }
        else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [auctionCompleted, auctionDetails]) 

    const onPlaceBid = () => {
        if(inputBid !== 0) {
            bidBlindAuction(auctionID, web3.utils.toWei(inputBid));
        }
        else {
            window.alert("Increase bid price");
        }
    }

    const withdraw = async () => {
        const result = await withdrawBalanceBlindAuction(auctionID);
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
                    {(auctionCompleted) && (auctionDetails.highestBidder === account) && 
                        <h2>Congrats! You Won! 🎉</h2>
                    }
                    {
                        (auctionCompleted) && (!isDisable) && (auctionDetails.highestBid !== yourBid) && (yourBid != 0) &&
                        <h2>Sorry you didn't win 😅</h2>
                    }
                    {data.image && <img src={dwebLink(data.image)} alt="nft artwork" />}
                </div>

                <div className="purchase__details">
                    <h1>#{tokenID} {data.name}</h1>
                    <h2>Auction Type: Blind 👀</h2>
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
                            (auctionCompleted) && (!isDisable) && (auctionDetails.highestBid !== yourBid) && (yourBid != 0) &&
                            <React.Fragment>
                                {/* <h3>Sorry you didn't win</h3> */}
                                <button onClick={withdraw}>Withdraw balance</button>
                            </React.Fragment>
                        }
                        {
                            (auctionCompleted) && (auctionDetails.highestBidder === account) && (currentOwner !== account) &&
                            <React.Fragment>
                                {/* <h3>Congrats! you won</h3> */}
                                <button onClick={withdraw}>Claim your NFT</button>
                            </React.Fragment>
                        }
                        {
                            (isDisable) && (auctionCompleted) &&
                            <button onClick={withdraw}>Claim your money</button>
                        }
                    </div>
                    <div className="purchase__auctionDetails">
                        <div className="purchase__auctionDetails__Bids">
                            {
                                (auctionDetails.highestBidder === account) && (auctionCompleted) ?
                                <h2>Your Bid: {web3.utils.fromWei((auctionDetails.highestBid).toString())}</h2> :
                                <h2>Your Bid: {web3.utils.fromWei((yourBid).toString())}</h2> 
                            }
                        </div>
                        {(!auctionCompleted) && (yourBid !== 0) &&
                        <React.Fragment>
                        <label>Place your bid (allowed only once)</label>
                        <input 
                        required
                        type="number" 
                        min="0.01"
                        step="0.01" 
                        value={inputBid}
                        onChange={(e) => setInputBid(e.target.value)}
                        />
                        </React.Fragment>
                        }
                    </div>
                </div>
            </div> 
    )
}

export default BlindAuctionPurchase;