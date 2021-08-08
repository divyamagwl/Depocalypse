import React, { useState } from 'react'
import '../styles/CreateNFT.css'

import { NFTStorage } from 'nft.storage'

import { Icon } from '@iconify/react';
import keyboardBackspace from '@iconify-icons/mdi/keyboard-backspace';
import { useHistory } from 'react-router-dom'
import { mintNFT, web3 } from "../services/web3";
import { CircularProgress } from '@material-ui/core';

function CreateNFT({wallet, isLoggedIn}) {
      

      const { push, goBack } = useHistory()

      const dataURItoBlob = (dataURI) => {
        var byteString = atob(dataURI.split(',')[1]);
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        var bb = new Blob([ab], {type:'image/*'});
        return bb;
    }

    const fileToDataUri = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target.result)
        };
        reader.readAsDataURL(file);
        })
    

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [market, setMarket] = useState('Sell');
    const [dataUri, setDataUri] = useState('')
    const [price, setPrice] = useState('0')
    const [isLoading, setIsLoading] = useState(false);
    const [auctionType, setAuctionType] = useState('0');
    const [duration, setDuration]= useState('0');
    const [bidIcrement, setBidIncrement] = useState('0');
    const [endingPrice, setEndingPrice] = useState('0');
    const [decrementPrice, setDecrementPrice] = useState('0');

    const onChange = (file) => {
    
        if(!file) {
          setDataUri('');
          return;
        }
    
        fileToDataUri(file)
          .then(dataUri => {
            setDataUri(dataUri)
          })
        
      }
    

    const handleSubmit = async (e) =>  {
      try{
        setIsLoading(true);

        e.preventDefault();

        // if(){
        //   window.alert("Please log in to mint NFT");
        //   setIsLoading(false);
        //   return;
        // }
        
        // var image = new File([''], "this.jpeg", {type: "image/*"});
        var image = dataURItoBlob(dataUri);
        // api key for nft.storage
        const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDU4MTE5QzJENWQ1NEMwOEJmZWE2MjA1OWU3RjI4YjU2MGE5RUI2ZTUiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYyNjg5NjgzODI3NiwibmFtZSI6IkRlcG9jYWx5cHNlIn0.Lv5KWNAqcMI3aSkYg7Se396dsJ8miK586XuILazSg_M'
        const client = new NFTStorage({ token: apiKey })
        
        const weiPrice = web3.utils.toWei(price);
        // price and sell/auction
        const nft = { name, description, image, price:weiPrice };
        const metadata = await client.store(nft);
        window.alert("successfully stored");

        var storageUrl = metadata.url;
        // var storageUrl = "hello";
        await mintNFT(
          name, 
          storageUrl, 
          weiPrice, 
          market==='Sell'? true : false, 
          market==='Auction'? true : false, 
          market==='Charity'? true : false,
          auctionType, 
          duration,
          web3.utils.toWei(bidIcrement),
          web3.utils.toWei(endingPrice),
          web3.utils.toWei(decrementPrice)
          );
        setIsLoading(false);

        
        window.location.reload();
        // push('/');
      }
      catch (e) {
        console.log(e);
        window.alert('an error has occured, try again!');
        setIsLoading(false);
      }
        
    }

    return (
        <div className="create">
            <div className="goback">
                    <Icon icon={keyboardBackspace } onClick={goBack} className='gobackButton'/> 
            </div>
            <div className='poweredBy'>
                  <h3>Powered by NFT.Storage </h3>   
                  {/* <img src="https://docs.filecoin.io/images/filecoin-symbol-color.svg" width='40' alt="filecoin" />
                  <img src="https://docs.ipfs.io/images/ipfs-logo.svg" width='40' alt="ipfs" /> */}
            </div>
            <div className="create__artwork">
              <img src={dataUri===''? 'https://thumbs.gfycat.com/EqualPowerfulKoodoo-size_restricted.gif': dataUri} alt="upload artwork"/>     
            </div>

            <div className="create__details">
              <h1>Mint a new NFT 🖌 </h1>
              <form onSubmit={handleSubmit}>
                  <label>Name</label>
                  <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  />

                  <label>Description</label>
                  <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  ></textarea>

                  <label>Image/GIF Upload</label>
                  <input type="file" onChange={(event) => onChange(event.target.files[0] || null)} />

                  <label>NFT is for</label>
                  <select
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  >
                  <option value="Sell">Sell</option>
                  <option value="Auction">Auction</option>
                  <option value="Charity">Charity</option>
                  </select>

                  {
                    (market==='Auction') &&
                    <React.Fragment>
                      <label>Type of Auction</label>
                      <select
                      value={auctionType}
                      onChange={(e) => setAuctionType(e.target.value)}
                      >
                      <option value="0">English</option>
                      <option value="1">Dutch</option>
                      <option value="2">Blind</option>
                      </select>
                    </React.Fragment>
                  }

                  {
                    (market==='Auction') && (auctionType==='0') &&
                    <React.Fragment>
                      <label>Bid Increment</label>
                      <input 
                      required
                      type="number" 
                      min="0.01"
                      step="0.01" 
                      value={bidIcrement}
                      onChange={(e) => setBidIncrement(e.target.value)}
                      />

                      <label>Starting Price in ETH</label>
                      <input 
                      required
                      type="number" 
                      min="0.01"
                      step="0.01" 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      />
                    </React.Fragment>
                  }

                  {
                    (market==='Auction') && (auctionType==='1') &&
                    <React.Fragment>
                      <label>Minimum Ending Price</label>
                      <input 
                      required
                      type="number" 
                      min="0.01"
                      step="0.01" 
                      value={endingPrice}
                      onChange={(e) => setEndingPrice(e.target.value)}
                      />

                      <label>Price Decrement (for each min)</label>
                      <input 
                      required
                      type="number" 
                      min="0.001"
                      step="0.001" 
                      value={decrementPrice}
                      onChange={(e) => setDecrementPrice(e.target.value)}
                      />

                      <label>Maximum Starting Price in ETH</label>
                      <input 
                      required
                      type="number" 
                      min="0.01"
                      step="0.01" 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      />

                    </React.Fragment>
                  }

                  {
                    (market==='Auction') && (auctionType==='2') &&
                    <React.Fragment>
                      <label>Minimum Price in ETH</label>
                      <input 
                      required
                      type="number" 
                      min="0.01"
                      step="0.01" 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      />
                    </React.Fragment>
                  }

                  {
                    (market==='Auction') &&
                    <React.Fragment>
                      <label>Duration (in seconds)</label>
                      <input 
                      required
                      type="number" 
                      min="60"
                      step="60" 
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      />
                    </React.Fragment>
                  }

                  {
                    (market==='Sell') &&
                    <React.Fragment>
                      <label>Price in ETH</label>
                      <input 
                      required
                      type="number" 
                      min="0.01"
                      step="0.01" 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      />
                    </React.Fragment>
                  }

                  <div className="create__submitButton">
                    <button>Mint NFT </button> {isLoading &&  <CircularProgress />}
                  </div>
              </form>
            </div>
        </div>
    )
}

export default CreateNFT
