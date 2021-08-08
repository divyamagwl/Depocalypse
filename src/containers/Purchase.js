import React, { useEffect, useState } from 'react'
import '../styles/Purchase.css'
import { Icon } from '@iconify/react';
import ethereumIcon from '@iconify-icons/mdi/ethereum';
import keyboardBackspace from '@iconify-icons/mdi/keyboard-backspace';
import { useHistory } from 'react-router-dom'
import { consensusNft, getAccountAddress, ownerOf, tokenURI, web3, startFlow, stopFlow, getFlowBalance } from '../services/web3';
import axios from 'axios';
// import { getPriceFeed } from '../services/priceFeed';

function Purchase(props) {
    const { goBack } = useHistory()
    

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
    // const [isLoading, setIsLoading] = useState('');
    // const [latestPrice, setLatestPrice] = useState(0);

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

            // const price = await getPriceFeed();
            // setLatestPrice(price);
          };
       
         fetchData();
    },[tokenID]);

    return (

            <div className='purchase'>
                <div className="goback">
                    <Icon icon={keyboardBackspace} onClick={goBack} className='gobackButton'/> 
                </div> 
                <div> 
                
                </div> 
                <div className="purchase__artwork">
                    {/* {data.image && <img src={"https://ipfs.io/ipfs/" + data.image.slice(7)} alt="nft artwork" />} */}
                    {data.image && <img src={dwebLink(data.image)} alt="nft artwork" />}
                </div>

                <div className="purchase__details">
                    <h1>#{tokenID} {data.name}</h1>
                    <h3>{data.description}</h3>
                    <div className="purchase__detailsBuy">
                        <div className="value">
                            <h2>{web3.utils.fromWei((data.price).toString())}</h2> 
                            <Icon icon={ethereumIcon} style={{ color: 'white' }} className='symbol'/>
                        </div>
                        <button onClick={() => {consensusNft(tokenID)}} disabled={isDisable}>Buy now</button>
                    </div>
                    
                </div>
            </div> 
    )
}

export default Purchase
