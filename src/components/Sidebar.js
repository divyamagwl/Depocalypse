import React from 'react'
import '../styles/Sidebar.css'
import { Icon, InlineIcon } from '@iconify/react';
import ethereumIcon from '@iconify-icons/mdi/ethereum';
import Logout from './Logout';
import { useHistory } from 'react-router-dom'

function Sidebar({showPortis, isLoggedIn, setWallet, setIsLoggedIn, wallet, email}) {
    const { push } = useHistory()

    return (
        <div className='sidebar'>
            <div className="sidebar__logo">
                <h2>Depocalyse</h2>
            </div>

            <div className="sidebar__options">
                <h3 onClick={() => push('/')}>Marketplace</h3>
                <h3 onClick={() => push('/auction')}>Auctions</h3>
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
                    
                </div>
            }

            <button className="show-portis" onClick={showPortis}>Show Account <img src="https://docs.portis.io/_media/logo_bw.svg" alt="powered by portis" /></button>
        </div>
    )
}

export default Sidebar
