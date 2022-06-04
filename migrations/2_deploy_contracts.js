const LockedDealV2 = artifacts.require("LockedDealV2")
const TestToken = artifacts.require("ERC20Token")

module.exports = function(deployer) {
  deployer.deploy(LockedDealV2)
  // deployer.link(LockedDealV2, TestToken);
  deployer.deploy(TestToken, 'TestToken', 'TEST')
}