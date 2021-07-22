import './App.css';
import MainLayout from "./containers/MainLayout";
import CreateNFT from './CreateNFT';

function App() {
  return (
    <div>
      <MainLayout/>


      {/* nft form to store data */}
      <CreateNFT  /* need to pass user wallet address */ />
    </div>
  );
}

export default App;
