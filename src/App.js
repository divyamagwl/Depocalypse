import React, { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import BaseRouter from "./routes";

import MainLayout from "./containers/MainLayout";
import './App.css'
import { portis } from "./services/web3";

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [wallet, setWallet] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    onLogin();
    checkLoggedIn();
  }, []);

  async function onLogin() {
      portis.onLogin((wallet, email) => {
      console.log(wallet, email);
      setWallet(wallet);
      setEmail(email);
    });
  }

  async function checkLoggedIn() {
    await portis.isLoggedIn().then(({ error, result }) => {
      setIsLoggedIn(result);
    });
  }

  // async function onWalletChange() {
  //     portis.onActiveWalletChanged(walletAddress => {
  //     setWallet(walletAddress);
  //   })
  // }

  async function showPortis() {
    await portis.showPortis();
    onLogin();
    checkLoggedIn();
    // onWalletChange();
  }

  return (
    <div className='App'>
      <Router>
        <MainLayout
        showPortis={showPortis}
        isLoggedIn={isLoggedIn}
        setWallet={setWallet}
        setIsLoggedIn={setIsLoggedIn}
        wallet={wallet}
        email={email}
        >
          <BaseRouter 
            wallet={wallet}
            isLoggedIn={isLoggedIn}
          />
        </MainLayout>
      </Router>
    </div>
  );
}

export default App;

