import Web3 from 'web3';
import Wallet from './contracts/Wallet.json';

const getWeb3 = () => {
    return new Web3('http://127.0.0.1:9545');
};

const getWallet = async web3 => {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = Wallet.networks[networkId];
    return new web3.eth.Contract(
        Wallet.abi,//passer le abi qui determine la signature du smart contract, pour appeler toutes les fonctions
        deployedNetwork && deployedNetwork.address
    )
};

export {getWeb3, getWallet};