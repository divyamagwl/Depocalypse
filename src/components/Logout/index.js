import React from "react";
import "./styles.css";

import { portis } from "../../services/web3";

function Logout(props) {

    const logout = async () => {
        await portis.logout();
        props.setWallet(null);
        props.setIsLoggedIn(false);
    }

    return (
        <div>
            <button className="logout-button" onClick={logout}>Logout</button>                
        </div>
    );
}
  
export default Logout;