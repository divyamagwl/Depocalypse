import React from 'react'
import AuctionCard from '../components/AuctionCard'
import  '../styles/Market.css'

function Auction({nfts}) {
    return (
        <div className='market'> 
                {nfts && nfts.map((nft) => (
                    <AuctionCard
                    key={nft.tokenID}
                    tokenID={nft.tokenID}
                    auctionID={nft.auctionID}
                    name={nft.name}
                    description={nft.description}
                    src={nft.image}
                    price={nft.price}
                    auctionType={nft.auctionType}
                    />
                ))
                }
        </div>
    )
}

export default Auction
