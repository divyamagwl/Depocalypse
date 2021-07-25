const Migrations = artifacts.require("Migrations");
const NFT_Transfer = artifacts.require("NFT_Transfer");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(NFT_Transfer)
};
