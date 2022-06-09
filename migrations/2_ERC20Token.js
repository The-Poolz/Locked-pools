const TestToken = artifacts.require("ERC20Token")

module.exports = function(deployer) {
  // deployer.link(LockedDealV2, TestToken);
  deployer.deploy(TestToken, 'TestToken', 'TEST')
}