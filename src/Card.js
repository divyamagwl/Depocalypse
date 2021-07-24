import React from 'react'
import './Card.css'
import { Icon, InlineIcon } from '@iconify/react';
import ethereumIcon from '@iconify-icons/mdi/ethereum';


function Card({name, description, src, price}) {
    return (
        <div className='card'>
            <img src={src} alt="nft artwork" />
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
