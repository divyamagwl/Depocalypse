import React from 'react'
import CharityCard from '../components/CharityCard'
import  '../styles/Market.css'

function Charity({nfts}) {
    return (
        <div className='market'> 
                {nfts && nfts.map((nft) => (
                    <CharityCard
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

export default Charity
