import { CircularProgress } from '@material-ui/core';
import React from 'react'
import './LoadingScreen.css';

function LoadingScreen({text}) {
    return (
        <div className='loadingscreen'>
           <h1>{text}</h1>
           <CircularProgress/>
        </div>
    )
}

export default LoadingScreen
