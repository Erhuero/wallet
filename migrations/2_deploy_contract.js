//const { web3 } = require("@openzeppelin/test-helpers/src/setup");

const Wallet = artifacts.require("Wallet");//import the object which represent the smart contract

module.exports = async function(deployer, _network, accounts) {//acounts : array of addresses
  await deployer.deploy(Wallet, [accounts[0], accounts[1], accounts[2]], 2);
  const wallet = await Wallet.deployed();//wallet is a pointer
  await web3.eth.sendTransaction({from: accounts[0], to: wallet.address, value: 10000});//send from the first address to recipent
};
