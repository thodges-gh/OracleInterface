var LinkToken = artifacts.require("linkToken/contracts/LinkToken.sol");
var Oracle = artifacts.require("chainlink/solidity/contracts/Oracle.sol");
var MyContract = artifacts.require("MyContract.sol");

module.exports = function(deployer) {
  deployer.deploy(LinkToken).then( function() {
    deployer.deploy(Oracle, LinkToken.address).then( function() {
      deployer.deploy(MyContract, LinkToken.address, Oracle.address);
    });
  });
};