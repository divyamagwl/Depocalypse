import React from 'react'
import '../styles/Card.css';
import { Icon } from '@iconify/react';
import ethereumIcon from '@iconify-icons/mdi/ethereum';
import { useHistory } from 'react-router-dom'
import { web3 } from '../services/web3';
import { AUCTION_TYPES, URL_AUCTION_TYPES } from '../services/constants';

function AuctionCard({tokenID, auctionID, name, description, src, price, auctionType}) {
    const { push } = useHistory()
    const auction_type = AUCTION_TYPES[auctionType];
    const url_auction_type = URL_AUCTION_TYPES[auctionType];

    var uri = src.slice(7); 
    uri = uri.substring(0, uri.length - 5);
    uri = 'https://' + uri + '.ipfs.dweb.link/blob';

    return (
        <div className='card' onClick={() => push('/auction/' + url_auction_type + "/" + tokenID + "/" + auctionID)}>
            <img src={uri} alt="nft artwork" />
            <div className="card__info">
                <h2>{name}</h2>
                <h4>{description.length >= 100 ? description.substring(0, 100) + '...' : description}</h4>
                <h4 style={{color: "green"}}>{auction_type}</h4>
            </div>
            <div className='card__infoValueParent'>
                <div className="card__infoValue">
                        <h3>{web3.utils.fromWei(price)}</h3>
                        <Icon icon={ethereumIcon} /*style={{ fontSize: '48px' }} style={{ color: 'black' }}*/ className='symbol'/>
                </div>
            </div>
        </div>
    )
}

export default AuctionCard
