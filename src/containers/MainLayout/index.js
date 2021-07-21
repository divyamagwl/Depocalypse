import React, { useEffect, useState } from "react";
import "./styles.css";

import Logout from "../../components/Logout";

import { portis } from "../../services/web3";

function MainLayout() {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [wallet, setWallet] = useState("");

    useEffect(() => {
        onLogin();
        checkLoggedIn();
    }, [])

    async function onLogin() {
        portis.onLogin(wallet => {
            setWallet(wallet);
        });
    }

    async function checkLoggedIn() {
        await portis.isLoggedIn().then(({ error, result }) => {
            // console.log(error, result);
            setIsLoggedIn(result);
        });;
    }

    async function showPortis() {
        await portis.showPortis();
        onLogin();
        checkLoggedIn();
    }
  
    return (
    <div>
        <button className="show-portis" onClick={showPortis}>Show Account</button>

        {isLoggedIn && 
        <div>
            <Logout 
                setWallet={setWallet}
                setIsLoggedIn={setIsLoggedIn}
                wallet={wallet}
            />
            Your etherwallet is {wallet}
        </div>
        }
        
    </div>
  );
}

export default MainLayout;
