import React from "react";
import "../styles/Logout.css";

import { portis } from "../services/web3";
import { useHistory } from "react-router-dom";

function Logout(props) {
  const { push } = useHistory();
  const logout = async () => {
    push("/");
    await portis.logout();
    props.setWallet(null);
    props.setIsLoggedIn(false);
  };

  return (
    <div className="logout-button">
      <h3 onClick={logout}>Logout</h3>
    </div>
  );
}
export default Logout;
