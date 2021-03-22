const LockedDeal = artifacts.require("LockedDeal");
const { assert } = require('chai');

contract('Managable', accounts => {
    let instance, fromAddress

    before(async () => {
        instance = await LockedDeal.new()
        const owner = await instance.owner()
        fromAddress = owner.toString()
    })

    it('should set whitelist address', async () => {
        const whiteListAddress = accounts[9]
        await instance.setWhiteListAddress(whiteListAddress, {from: fromAddress})
        const address = await instance.WhiteList_Address()
        assert.equal(whiteListAddress, address)
    })
    it('should set WhiteListId', async () => {
        const whiteListId = 1
        await instance.setWhiteListId(whiteListId, {from: fromAddress})
        const id = await instance.WhiteListId()
        assert.equal(whiteListId, id)
    })
    it('should swap token filter', async () => {
        const currentFilter = await instance.isTokenFilterOn()
        await instance.swapTokenFilter({from: fromAddress})
        const newFilter = await instance.isTokenFilterOn()
        assert.equal(currentFilter, !newFilter)
    })
    it('should set max transaction limit', async () => {
        const newLimit = 300
        await instance.setMaxTransactionLimit(newLimit, {from: fromAddress})
        const limit = await instance.maxTransactionLimit()
        assert.equal(newLimit, limit)
    })
})