import React, { useEffect, useState } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import Spinner from 'react-spinner-material'; 
import { ethers } from "ethers";
import TweetNFT from './utils/TweetNFT.json';

// Constants
const TWITTER_HANDLE = 'SilverC0de';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/assets/tweetnft-qm7rh3tc1e';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0xEAd6a4689b098330482C3fCf8dDf3171Bb9C7490";


const App = () => {
  let [currentAccount, setCurrentAccount] = useState("");


  let [tweet, setTweet] = useState("");


  // Render Smth
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if(ethereum){
      //metamask is connected
      console.log('Ethereum is connected chief', ethereum);
    } else {
      //metamask is not connected
      console.log('make sure you have metamask on your PC');
      return true;
    }

    const accounts = await ethereum.request({
      methos: 'eth_accounts'
    });

    const chainID = await ethereum.request({
      method: 'eth_chainId'
    });

    if(chainID != '0x4'){
      //Rinkeby chain ID is 0x4
      alert('Please connect to Rinkeby network')
    }

    if(accounts.length == 0){
      //no ethereum accounts found
      console.log('no ethereum account found')
    } else {
      const account = accounts[0];
      setCurrentAccount = account;
      mintCallback();
      console.log('ethereum account found', account);
    }
  }

  const connectWallet = async () => {
    try{
      const { ethereum } = window;
      if(!ethereum){
        alert('Please download metamask extension on your web browser')
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      })

      const chainID = await ethereum.request({
        method: 'eth_chainId'
      });

      if(chainID != '0x4'){
        //Rinkeby chain ID is 0x4
        alert('Please connect to Rinkeby network')
      }

      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
      mintCallback();
    } catch(e){
      console.log(e)
    }
  }

  const mintNFT = async (event) => {
    event.preventDefault();

    try{
      const { ethereum } = window;

      if(ethereum){
        renderLoadingContainer()

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, TweetNFT.abi, signer);

        //will pop wallet to pay gas because the the function that mints NFT is called on the smart contract
        let transaction = await connectedContract.mint('TweetNFT', tweet, 'Let\'s fucking go');
        await transaction.wait();

        
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${transaction.hash}`);
        alert(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${transaction.hash}`)

        mintCallback();
      } else {
        console.log('Ethereum account NOT found')
      }
    } catch (e){
      console.log(e)
    }
  }

  const mintCallback = async () => {    
    try{
      const { ethereum } = window;

      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, TweetNFT.abi, signer);

        connectedContract.on("minted", (sender, tokenID) => {
          	alert(`Hey there! We've minted your NFT. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: <https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenID.toNumber()}>`)
        })
      } else {
        console.log('Ethereum account NOT found')
      }
    } catch (e){
      console.log(e)
    }
  }


  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick= {connectWallet} className="cta-button connect-wallet-button">
      Connect Wallet
    </button>
  );

  const renderConnectedContainer = () => (
    <input type = 'button' button onClick = {connectWallet} className="cta-button connect-wallet-button" value = 'Mint NFT' />
  );


  const renderLoadingContainer = () => (
    <p>
      <div align = 'center' class = 'space'>
        <Spinner radius={40} color={"#a9d1ff"} stroke={1} visible={true} />
      </div>
    </p>
  );



  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Tweeter NFTs</p>
          <p className="sub-text">
            Type something, turn it into an NFT
          </p>
          <p>
            <button onClick={()=> window.open(OPENSEA_LINK, "_blank")}className="collection-wallet-button">View collections on OpenSea</button>
          </p>
          
          <form>
            <label>
              <input type="text" value={tweet} class = "edit" onChange={(e) => setTweet(e.target.value)}
 placeholder = "Type something" />
            </label>
          { 
            (setCurrentAccount === "") 
            ? renderNotConnectedContainer() 
            : renderConnectedContainer()
          }
          </form>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
        
      </div>
      
    </div>
  );
};

export default App;