const TrustSwap = artifacts.require("TrustSwap");
const TestToken = artifacts.require("TestToken");

module.exports = function(deployer) {
  deployer.deploy(TrustSwap);
  deployer.link(TrustSwap, TestToken);
  deployer.deploy(TestToken);
};
