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
    const [price, setPrice] = useState('')
    const [isLoading, setIsLoading] = useState(false);

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
        await mintNFT(name, storageUrl, weiPrice, market==='Sell'? true : false);
        setIsLoading(false);

        
        window.location.reload();
        push('/');
      }
      catch{
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
              <h1>Mint a new NFT 🖌 {isLoading &&  <CircularProgress />}</h1>
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
                  </select>

                  <label>Price in ETH</label>
                  <input 
                  required
                  type="number" 
                  min="0.01"
                  step="0.01" 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  />

                  <button>Mint NFT </button>
              </form>
            </div>
        </div>
    )
}

export default CreateNFT
