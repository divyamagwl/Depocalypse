import React, { useEffect, useState } from 'react'
import Card from '../components/Card'
import { getCount, getUserNfts, tokenURI } from '../services/web3';
import  '../styles/Market.css'
import axios from 'axios';
import { NFTStorage } from 'nft.storage';


function Market() {
    const [nfts, setNfts] = useState(null);

    useEffect(() => {

        const fetchData = async () => {
            var nft = {};
            var count = await getCount();

            for(var i=0; i<count; i++){
            var result = await axios(
                await tokenURI(i),
            );
            nft[i] = result.data;
            }
            setNfts(nft);  
        };
       
        fetchData();
    },[]);

    return (
        
        <div className='market'> 

                {nfts && Object.keys(nfts).map((key) => (
                    <Card
                    key={key}
                    tokenID={key}
                    name={nfts[key].name}
                    description={nfts[key].description}
                    src={nfts[key].image}
                    price={nfts[key].price}
                    />
                     // console.log(key, nfts[key]);
                ))
                }
               
                
                {/* <Card
                tokenID='0'
                name='Cool Cat'
                description='very cool nft cat'
                src='https://ipfs.io/ipfs/bafybeihqpmqde5hnlio333nvuej3qq6qduav6atwmsmsbqsob5m4iem5b4/blob'
                price='10 ETH'
                />

                <Card
                tokenID='1'
                name='ghost'
                description='a ghost which goes up and down there is fjakdjf afjakfj afdjakfdj  afajfkajksdf kajf ajklfjak jfkljk very bid djf kjk skdajf afjkla fajalkjsdfk aksldfjka jsdfkljakfjaks ajdsfkaj sdkfjaksdf jkajfkakdlfjkajfkajkfjakfjkaj fkj'
                src='https://ipfs.io/ipfs/bafybeigxsjz6zle4n4h7tzs75wix5zmba55jtfq32pv6loe3zmtgf3ou5y/blob'
                price='10 ETH'
                />

                <Card
                tokenID='3'
                name='Einstein'
                description='einstein is smart'
                src='https://ipfs.io/ipfs/bafybeienkzpouj7lrx4gav7xbgyycxtf6i3d7dmzbokgrlhusjvyirnb2u/blob'
                price='10 ETH'
                />

                <Card
                tokenID='4'
                name='Cool Dude'
                description='coin spins, and spins, till there is a '
                src='https://images.squarespace-cdn.com/content/v1/5857eeba9de4bb486e1ba151/1617454647979-WWZJY0BDAYR9AUS496PH/IMG_0519.GIF'
                price='10 ETH'
                /> */}
        </div>
    )
}

export default Market
