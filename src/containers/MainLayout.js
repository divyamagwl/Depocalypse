import React from "react";
import "../styles/MainLayout.css";

import Sidebar from "../components/Sidebar";

function MainLayout(props) {
  const { showPortis, isLoggedIn, setWallet, setIsLoggedIn, wallet, email } = props;

  return (
    <div className="main__layout">
      <Sidebar
        showPortis={showPortis}
        isLoggedIn={isLoggedIn}
        setWallet={setWallet}
        setIsLoggedIn={setIsLoggedIn}
        wallet={wallet}
        email={email}
      />

      {props.children}
    </div>
  );
}

export default MainLayout;
