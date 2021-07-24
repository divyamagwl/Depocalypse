import React from 'react'
import '../styles/Sidebar.css'
import { Icon, InlineIcon } from '@iconify/react';
import ethereumIcon from '@iconify-icons/mdi/ethereum';
import Logout from './Logout';

function Sidebar({showPortis, isLoggedIn, setWallet, setIsLoggedIn, wallet, email}) {
    return (
        <div className='sidebar'>
            <div className="sidebar__logo">
                <h2>Depocalyse</h2>
            </div>

            <div className="sidebar__options">
                <h3>Marketplace</h3>
                <h3>Auctions</h3>
                <h3>Your Gallery</h3>
            </div>

            

            <button className="show-portis" onClick={showPortis}>Show Account <img src="https://docs.portis.io/_media/logo_bw.svg" alt="powered by portis" /></button>

            {isLoggedIn && 

                <div className="sidebar__user">
                    <div className="sidebar__userWallet">
                        <div className="sidebar__userWalletAmount">
                            <InlineIcon icon={ethereumIcon}/> 0 ETH
                        </div>
                        <div className="sidebar__userWalletAddress">
                                {wallet}
                        </div>
                    </div>

                    <div className="sidebar__userInfo">
                        {email}
                    </div>
                    <div>
                    <Logout 
                        setWallet={setWallet}
                        setIsLoggedIn={setIsLoggedIn}
                        wallet={wallet}
                    />
                    </div>
                </div>
                
            }
        </div>
    )
}

export default Sidebar
