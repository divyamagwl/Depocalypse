import React, { useEffect, useState } from 'react'
import '../styles/Purchase.css'
import { Icon, InlineIcon } from '@iconify/react';
import ethereumIcon from '@iconify-icons/mdi/ethereum';
import keyboardBackspace from '@iconify-icons/mdi/keyboard-backspace';
import { useHistory } from 'react-router-dom'
import { buy, ownerOf, tokenURI } from '../services/web3';
import axios from 'axios';

function Purchase(props) {
    const { push } = useHistory()
    

    const tokenID = props.match.params.tokenID;
    const [data, setData] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            const url =  await tokenURI(tokenID);
            const result = await axios(url);
            setData(result.data);
          };
       
         fetchData();
    },[]);

    return (
        
            <div className='purchase'>
                <div className="goback">
                    <Icon icon={keyboardBackspace} onClick={() => push('/')} className='gobackButton'/> 
                </div>
                <div>
                    
                </div>
                <div className="purchase__artwork">
                    {data.image && <img src={"https://ipfs.io/ipfs/" + data.image.slice(7)} alt="nft artwork" />}
                </div>

                <div className="purchase__details">
                    <h1>#{tokenID} {data.name}</h1>
                    <h3>{data.description}</h3>
                    <div className="purchase__detailsBuy">
                        <div className="value">
                            <h2>{data.price}</h2>
                            <Icon icon={ethereumIcon} style={{ color: 'white' }} className='symbol'/>
                        </div>
                        <button onClick={() => buy(tokenID, data.price)}>Buy now</button>
                    </div>
                </div>
            </div> 
    )
}

export default Purchase
