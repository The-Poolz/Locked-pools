const LockedDeal = artifacts.require("LockedDeal");
const TestToken = artifacts.require("TestToken");

module.exports = function(deployer) {
  deployer.deploy(LockedDeal);
  deployer.link(LockedDeal, TestToken);
  deployer.deploy(TestToken);
};
