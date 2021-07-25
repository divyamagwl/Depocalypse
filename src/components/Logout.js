import React from "react";
import "../styles/Logout.css";

import { portis } from "../services/web3";

function Logout(props) {

    const logout = async () => {
        await portis.logout();
        props.setWallet(null);
        props.setIsLoggedIn(false);
    }

    return (
        <div className="logout-button">
          <h3 onClick={logout}>Logout</h3>         
        </div>
    );
}
  
export default Logout;