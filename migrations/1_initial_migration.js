const Migrations = artifacts.require("Migrations");//import the object which represent the smart contract

module.exports = function (deployer) {
  deployer.deploy(Migrations);
};
