import React from 'react';
import { Route, Switch } from 'react-router-dom';
import CreateNFT from './containers/CreateNFT';
import Market from './containers/Market';
import './BaseRouter.css'
import Purchase from './Purchase';

const BaseRouter = ({wallet, isLoggedIn}) => (
  <div className='base__router'>
    <Switch>
      <Route exact path='/' component={Market} />
      <Route exact path='/create-nft' 
      render={() => (
        <CreateNFT 
          wallet={wallet} 
          isLoggedIn={isLoggedIn}
        />
      )}/>
      <Route exact path='/nft' component={Purchase}/>
    </Switch>
  </div>
);

export default BaseRouter;