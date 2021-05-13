import React, { useEffect,useState } from 'react';//nouveau API de react hooks
import {getWeb3, getWallet} from './utils.js';

function App() {
  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState(undefined);
  const [wallet, setWallet] = useState(undefined);//contract instance of wallet

  useEffect(() => {//initialiser l'etat
    const init = async () => {//fonction init
      const web3 = getWeb3();
      const accounts  = await web3.eth.getAccounts();//liste de comptes generes par ganache
      const wallet = await getWallet(web3);//contract instance wallet
      setWeb3(web3);
      setAccounts(accounts);
      setWallet(wallet);
      //the component will be updated and rerendered
    };
  }, []);

  if(
    typeof web3 === 'undefined' 
    || typeof accounts === 'undefined' 
    || typeof wallet === 'undefined'
  ){
    return <div>Loading ...</div>//loading screen
  }

  return (
    <div>
      Multisig Dapp
    </div>
  );
}

export default App;
