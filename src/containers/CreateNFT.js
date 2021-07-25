import React, { useState } from 'react'
import '../styles/CreateNFT.css'

import { NFTStorage, File } from 'nft.storage'

import { Icon, InlineIcon } from '@iconify/react';
import ethereumIcon from '@iconify-icons/mdi/ethereum';
import keyboardBackspace from '@iconify-icons/mdi/keyboard-backspace';

function CreateNFT({wallet, isLoggedIn}) {

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
    const [storageUrl, setStorageUrl] = useState('')
    const [price, setPrice] = useState('')

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

        e.preventDefault();

        if(!isLoggedIn) {
          window.alert("Please log in to mint NFT");
          return;
        }
        // var image = new File([''], "this.jpeg", {type: "image/*"});
        var image = dataURItoBlob(dataUri);
        // api key for nft.storage
        const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDU4MTE5QzJENWQ1NEMwOEJmZWE2MjA1OWU3RjI4YjU2MGE5RUI2ZTUiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYyNjg5NjgzODI3NiwibmFtZSI6IkRlcG9jYWx5cHNlIn0.Lv5KWNAqcMI3aSkYg7Se396dsJ8miK586XuILazSg_M'
        const client = new NFTStorage({ token: apiKey })
        
        // price and sell/auction
        const nft = { name, description, image };
        const metadata = await client.store(nft);
        setStorageUrl(metadata.url);

        const tokenURL = metadata.url;
        // call smart contract
    }

    return (
        <div className="create">
            <div className="goback">
                    <Icon icon={keyboardBackspace} /> 
            </div>
            <div className='poweredBy'>
                  <h3>Powered by NFT.Storage </h3>   
                  {/* <img src="https://docs.filecoin.io/images/filecoin-symbol-color.svg" width='40' alt="filecoin" />
                  <img src="https://docs.ipfs.io/images/ipfs-logo.svg" width='40' alt="ipfs" /> */}
            </div>
            <div className="create__artwork">
              <img src={dataUri===''? 'https://avatars.githubusercontent.com/ethereum': dataUri} alt="upload artwork"/>     
            </div>

            <div className="create__details">
              <h1>Mint a new NFT 🖌</h1>
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

                  <label>Price in ETH</label>
                  <input 
                  required
                  type="number" 
                  min="0.01"
                  step="0.01" 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  />
                  
                  <label>NFT is for</label>
                  <select
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  >
                  <option value="Sell">Sell</option>
                  <option value="Auction">Auction</option>
                  </select>

                  <label>{storageUrl}</label>

                  <button>Mint NFT</button>
              </form>
            </div>
        </div>
    )
}

export default CreateNFT