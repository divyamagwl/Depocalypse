import React, { useEffect, useState } from 'react'
import '../styles/Sidebar.css'
// import { InlineIcon } from '@iconify/react';
// import ethereumIcon from '@iconify-icons/mdi/ethereum';
import Logout from './Logout';
import { useHistory } from 'react-router-dom'
import { getPriceFeed } from '../services/priceFeed';

function Sidebar({showPortis, isLoggedIn, setWallet, setIsLoggedIn, wallet, email}) {
    const { push } = useHistory()
    const [latestPrice, setLatestPrice] = useState(0);

    useEffect(async () => {
        const maticPrice = await getPriceFeed();
        setLatestPrice(maticPrice);
    }, [])

    return (
        <div className='sidebar'>
            <div className="sidebar__logo">
                <h2>Depocalypse</h2>
            </div>

            <div className="sidebar__options">
                <h3 onClick={() => push('/')}>Marketplace</h3>
                <h3 onClick={() => push('/auctions')}>Auctionplace</h3>
                <h3 onClick={() => push('/charity')}>Charity</h3>
                <h3 onClick={() => push('/create-nft')}>Create NFT</h3>
                <h3 onClick={() => push('/your-gallery')}>Your Gallery</h3>
                {
                    isLoggedIn &&
                    <Logout
                        setWallet={setWallet}
                        setIsLoggedIn={setIsLoggedIn}
                        wallet={wallet}
                    />
                }
            </div>

            <div className="sidebar__priceFeed">
                <span>Price feed - Powered by <img src="https://cryptologos.cc/logos/chainlink-link-logo.png" alt="" /></span> 
                <span>MATIC/USD - {latestPrice.toFixed(3)} $</span>
            </div>

            {isLoggedIn && 

                <div className="sidebar__user">
                    {/* <div className="sidebar__userWallet">
                        <div className="sidebar__userWalletAmount">
                            <InlineIcon icon={ethereumIcon}/> {balance}
                        </div>
                        <div className="sidebar__userWalletAddress">
                                {wallet}
                        </div>
                    </div> */}

                    


                    <div className="sidebar__userInfo">
                        {email}
                    </div>
                    
                </div>
            }

            <button className="show-portis" onClick={showPortis}>Show Account <img src="https://docs.portis.io/_media/logo_bw.svg" alt="powered by portis" /></button>
        </div>
    )
}

export default Sidebar
