const LockedDealV2 = artifacts.require("LockedDealV2")

module.exports = function (deployer) {
  deployer.deploy(LockedDealV2)
}