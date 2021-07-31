import React from 'react'
import Card from '../components/Card'
import  '../styles/Market.css'

function Market({nfts}) {
    return (
        <div className='market'> 
                {nfts && nfts.map((nft) => (
                    <Card
                    key={nft.tokenID}
                    tokenID={nft.tokenID}
                    name={nft.name}
                    description={nft.description}
                    src={nft.image}
                    price={nft.price}
                    />
                ))
                }
        </div>
    )
}

export default Market
