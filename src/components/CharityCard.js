import React from 'react'
import '../styles/Card.css';
import { Icon } from '@iconify/react';
import ethereumIcon from '@iconify-icons/mdi/ethereum';
import { useHistory } from 'react-router-dom'
import { web3 } from '../services/web3';



function Card({tokenID, name, description, src, price}) {
    const { push } = useHistory()

    var uri = src.slice(7); 
    uri = uri.substring(0, uri.length - 5);
    uri = 'https://' + uri + '.ipfs.dweb.link/blob';

    return (
        <div className='card' onClick={() => push('/charity/' + tokenID)}>
            {/* <img src={"https://ipfs.io/ipfs/" + src.slice(7)} alt="nft artwork" /> */}
            <img src={uri} alt="nft artwork" />
            <div className="card__info">
                <h2>{name}</h2>
                <h4>{description.length >= 100 ? description.substring(0, 100) + '...' : description}</h4>
                
            </div>
            <div className='card__infoValueParent'>
                <div className="card__infoValue">
                        <h4>Charity</h4>
                        {/* <h3>{web3.utils.fromWei(price)}</h3>
                        <Icon icon={ethereumIcon} className='symbol'/> */}
                </div>
            </div>
        </div>





        
    )
}

export default Card
