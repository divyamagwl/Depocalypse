import React from 'react';
import { Route, Switch } from 'react-router-dom';
import CreateNFT from './containers/CreateNFT';
import Home from './containers/Home';

const BaseRouter = () => (
  <div>
    <Switch>
      <Route exact path='/' component={Home} />
      <Route exact path='/create-nft' component={CreateNFT} />
    </Switch>
  </div>
);

export default BaseRouter;