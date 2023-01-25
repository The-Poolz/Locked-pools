const LockedDealV2 = artifacts.require("LockedDealV2")
const TestToken = artifacts.require("ERC20Token")
const BigNumber = require("bignumber.js")
const { assert } = require("chai")

contract("Managable", (accounts) => {
    let instance, ownerAddress
    let testToken

    before(async () => {
        instance = await LockedDealV2.new()
        const owner = await instance.owner()
        ownerAddress = owner.toString()
        testToken = await TestToken.new("test", "tst")
    })

    it("should set whitelist address", async () => {
        const whiteListAddress = accounts[9]
        await instance.setWhiteListAddress(whiteListAddress, { from: ownerAddress })
        const address = await instance.WhiteList_Address()
        assert.equal(whiteListAddress, address)
    })

    it("should set WhiteListId", async () => {
        const whiteListId = 1
        await instance.setTokenFeeWhiteListId(whiteListId, { from: ownerAddress })
        const id = await instance.TokenFeeWhiteListId()
        assert.equal(whiteListId, id)
    })

    it("should swap token filter", async () => {
        const currentFilter = await instance.isTokenFilterOn()
        await instance.swapTokenFilter({ from: ownerAddress })
        const newFilter = await instance.isTokenFilterOn()
        assert.equal(currentFilter, !newFilter)
    })

    it("should set max transaction limit", async () => {
        const newLimit = 300
        await instance.setMaxTransactionLimit(newLimit, { from: ownerAddress })
        const limit = await instance.maxTransactionLimit()
        assert.equal(newLimit, limit)
    })

    it("should set fee", async () => {
        const newFee = 30
        await instance.SetFeeAmount(newFee, { from: ownerAddress })
        const fee = await instance.Fee()
        assert.equal(newFee, fee)
    })

    it("should set POZ token", async () => {
        await instance.SetFeeToken(testToken.address, { from: ownerAddress })
        const FeeToken = await instance.FeeToken()
        assert.equal(FeeToken, testToken.address)
    })

    it("should set token filter whitelist id", async () => {
        const whiteListId = 2
        await instance.setTokenFilterWhiteListId(whiteListId, { from: ownerAddress })
        const id = await instance.TokenFilterWhiteListId()
        assert.equal(whiteListId, id)
    })

    it("should set token filter whitelist id", async () => {
        const whiteListId = 3
        await instance.setUserWhiteListId(whiteListId, { from: ownerAddress })
        const id = await instance.UserWhiteListId()
        assert.equal(whiteListId, id)
    })

    it("should set decimal multiplier", async () => {
        const twoDecimals = 1000 // 10*10**2
        let multiplier = await instance.DecimalMultiplier()
        const defaultMultiplier = new BigNumber(10 ** 18)
        assert.equal(multiplier.toString(), defaultMultiplier.toString(), "check default decimal value")
        await instance.setDecimalMultiplier(twoDecimals)
        multiplier = await instance.DecimalMultiplier()
        assert.equal(multiplier.toString(), twoDecimals.toString(), "check updated decimal value")
    })
})
