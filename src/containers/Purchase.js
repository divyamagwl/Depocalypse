import React from 'react'
import '../styles/Purchase.css'
import { Icon, InlineIcon } from '@iconify/react';
import ethereumIcon from '@iconify-icons/mdi/ethereum';
import keyboardBackspace from '@iconify-icons/mdi/keyboard-backspace';


function Purchase() {
    return (
            <div className='purchase'>
                <div className="goback">
                    <Icon icon={keyboardBackspace} /> 
                </div>
                <div>
                  
                </div>
                <div className="purchase__artwork">
                    <img src="https://images.squarespace-cdn.com/content/v1/5857eeba9de4bb486e1ba151/1617454647979-WWZJY0BDAYR9AUS496PH/IMG_0519.GIF" alt="nft artwork" />
                    
                </div>

                <div className="purchase__details">
                    <h1>Cool Dude</h1>
                    <h3>This dude dances and move his shoulders, 
                        make sure you watch him doing more moves in secret. 

                        This dude dances and move his shoulders, 
                        make sure you watch him doing more moves in secret. 

                        This dude dances and move his shoulders, 
                        make sure you watch him doing more moves in secret. 

                        This dude dances and move his shoulders, 
                        make sure you watch him doing more moves in secret. 
                    </h3>
                    <div className="purchase__detailsBuy">
                        <div className="value">
                            <h2>0.02 ETH </h2>
                            <Icon icon={ethereumIcon} style={{ color: 'white' }} className='symbol'/>
                        </div>
                        <button>Buy now</button>
                    </div>
                </div>
            </div>
        
    
    )
}

export default Purchase
