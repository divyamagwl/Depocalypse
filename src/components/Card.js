import React from 'react'
import '../styles/Card.css';
import { Icon, InlineIcon } from '@iconify/react';
import ethereumIcon from '@iconify-icons/mdi/ethereum';
import { useHistory } from 'react-router-dom'



function Card({tokenID, name, description, src, price}) {
    const { push } = useHistory()



    return (
        <div className='card' onClick={() => push('/market/' + tokenID)}>
            <img src={"https://ipfs.io/ipfs/" + src.slice(7)} alt="nft artwork" />
            <div className="card__info">
                <h2>{name}</h2>
                <h4>{description.length >= 100 ? description.substring(0, 100) + '...' : description}</h4>
            </div>
            <div className='card__infoValueParent'>
                <div className="card__infoValue">
                        <h3>{price}</h3>
                        <Icon icon={ethereumIcon} /*style={{ fontSize: '48px' }} style={{ color: 'black' }}*/ className='symbol'/>
                </div>
            </div>
        </div>
    )
}

export default Card
