import React, { useState } from 'react'
import '../styles/CreateNFT.css'

import { NFTStorage, File } from 'nft.storage'

function CreateNFT(props) {

    console.log("create-nft")
    console.log(props);

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
        // var image = new File([''], "this.jpeg", {type: "image/*"});
        var image = dataURItoBlob(dataUri);
        // api key for nft.storage
        const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDU4MTE5QzJENWQ1NEMwOEJmZWE2MjA1OWU3RjI4YjU2MGE5RUI2ZTUiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYyNjg5NjgzODI3NiwibmFtZSI6IkRlcG9jYWx5cHNlIn0.Lv5KWNAqcMI3aSkYg7Se396dsJ8miK586XuILazSg_M'
        const client = new NFTStorage({ token: apiKey })
        
        const nft = { name, description, image };
        const metadata = await client.store(nft);
        setStorageUrl(metadata.url);

        const tokenURL = metadata.url;
        // call smart contract
    }

    return (
        <div className="create">
            <h2>Mint a new NFT</h2>
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
                <img /*width="200" */height="200" src={dataUri===''? 'https://avatars.githubusercontent.com/ethereum': dataUri} alt="upload artwork"/>
                <input type="file" onChange={(event) => onChange(event.target.files[0] || null)} />
                
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
    )
}

export default CreateNFT
