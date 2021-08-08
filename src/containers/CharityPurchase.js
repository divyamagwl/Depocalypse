import React, { useEffect, useState } from 'react'
import '../styles/Purchase.css'
import { Icon } from '@iconify/react';
import ethereumIcon from '@iconify-icons/mdi/ethereum';
import keyboardBackspace from '@iconify-icons/mdi/keyboard-backspace';
import { useHistory } from 'react-router-dom'
import { consensusNft, getAccountAddress, ownerOf, tokenURI, web3, startFlow, stopFlow, getFlowBalance } from '../services/web3';
import axios from 'axios';
import { CircularProgress } from '@material-ui/core';

function CharityPurchase(props) {
    const { goBack } = useHistory()
    
    const flowRateValue = (flow) => {
        var value = flow * '1e18'
        console.log(value);
        return value
    }

    const tokenID = props.match.params.tokenID;
    const [data, setData] = useState({
        name: '',
        price: '',
        image: '',
        description: '',
    });
    const [isDisable, setIsDisable] = useState(true);
    const [flowBalance, setOwnerFlowBalance] = useState(0);
    const [userFlowBalance, SetUserFlowBalance] = useState(0);
    const [counter, setCounter] = useState(0);
    const [ownerAddress, setOwnerAddress] = useState(null);
    const [userAddress, setUserAddress] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [flowRate, setFlowRate] = useState('0');
    // const [isLoading, setIsLoading] = useState('');

    const dwebLink = (url) => {
        var uri = url.slice(7); 
        uri = uri.substring(0, uri.length - 5);
        uri = 'https://' + uri + '.ipfs.dweb.link/blob';
        return uri;
    }

    useEffect(() => {
        const fetchData = async () => {
            var url =  await tokenURI(tokenID);

            url = url.slice(7); 
            url = url.substring(0, url.length - 14);
            url = 'https://' + url + '.ipfs.dweb.link/metadata.json';

            const result = await axios(url);

            setData(result.data);
            const ownerAddr = await ownerOf(tokenID);
            const userAddr = await getAccountAddress();
            const disable = ownerAddr === userAddr;
            setOwnerAddress(ownerAddr);
            setUserAddress(userAddr);
            setIsDisable(disable);
        };
        
        fetchData();
    },[tokenID]);

    useEffect(() => {
        if(ownerAddress == null || userAddress == null){
            setTimeout(() => {
                setCounter(counter + 1);
            }, 7000);
            return;
        }

        
        const fetchBalance = async () => {
            console.log(ownerAddress, userAddress);
            const ownerBal = await getFlowBalance(ownerAddress);
            const userBal = await getFlowBalance(userAddress);

            setTimeout(() => {
                console.log("updating balance", counter);
                setCounter(counter + 1);
            }, 7000);
            setOwnerFlowBalance(ownerBal);
            SetUserFlowBalance(userBal);
            setIsLoading(false);
        };
        
        fetchBalance();
    }, [counter])

    return (

            <div className='purchase'>
                <div className="goback">
                    <Icon icon={keyboardBackspace} onClick={goBack} className='gobackButton'/> 
                </div> 
                <div className="poweredBy"> 
                    <h3>Powered by - SuperFluid</h3> 
                </div> 
                <div className="purchase__artwork">
                    {/* {data.image && <img src={"https://ipfs.io/ipfs/" + data.image.slice(7)} alt="nft artwork" />} */}
                    {data.image && <img src={dwebLink(data.image)} alt="nft artwork" />}
                </div>

                <div className="purchase__details">
                    <h1>#{tokenID} {data.name}</h1>
                    <h3>{data.description}</h3>
                    {/* <div className="purchase__detailsBuy">
                        <div className="value">
                            <h2>{web3.utils.fromWei((data.price).toString())}</h2>
                            <Icon icon={ethereumIcon} style={{ color: 'white' }} className='symbol'/>
                        </div>
                        <button onClick={() => {consensusNft(tokenID)}} disabled={isDisable}>Buy now</button>
                    </div> */}

                    <div className="purchase_charity">
                        <h2>Creators DAIx balance</h2>
                        <h1>{flowBalance} {isLoading && <CircularProgress/>} </h1>
                        <label>Set Flow rate : {flowRate} DAI per second</label>
                        <input 
                        min="0.00000038589"
                        required
                        type="number" 
                        value={flowRate}
                        onChange={(e) => setFlowRate(e.target.value)}
                        />
                        <p>{flowRate * 3600 * 24 * 30} DAI per month</p>
                        <button disabled={isDisable} className="charity__startFlow" onClick={()=> startFlow(tokenID,flowRateValue(flowRate))}>start</button>
                        <button disabled={isDisable} className="charity__stopFlow" onClick={()=> stopFlow(tokenID)}>stop</button>
                        <h3>Your DAIx balance {userFlowBalance} {isLoading && <CircularProgress/>}</h3>
                    </div>
                </div>


            </div> 
    )
}

export default CharityPurchase
