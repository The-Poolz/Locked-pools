const LockedDeal = artifacts.require("LockedDeal");
const { assert } = require('chai');

contract('Managable', accounts => {
    let instance, ownerAddress

    before(async () => {
        instance = await LockedDeal.new()
        const owner = await instance.owner()
        ownerAddress = owner.toString()
    })

    it('should set whitelist address', async () => {
        const whiteListAddress = accounts[9]
        await instance.setWhiteListAddress(whiteListAddress, {from: ownerAddress})
        const address = await instance.WhiteList_Address()
        assert.equal(whiteListAddress, address)
    })
    it('should set WhiteListId', async () => {
        const whiteListId = 1
        await instance.setWhiteListId(whiteListId, {from: ownerAddress})
        const id = await instance.WhiteListId()
        assert.equal(whiteListId, id)
    })
    it('should swap token filter', async () => {
        const currentFilter = await instance.isTokenFilterOn()
        await instance.swapTokenFilter({from: ownerAddress})
        const newFilter = await instance.isTokenFilterOn()
        assert.equal(currentFilter, !newFilter)
    })
    it('should set max transaction limit', async () => {
        const newLimit = 300
        await instance.setMaxTransactionLimit(newLimit, {from: ownerAddress})
        const limit = await instance.maxTransactionLimit()
        assert.equal(newLimit, limit)
    })
    it('shoule set min duration', async () => {
        const newMinDuration = 100
        await instance.SetMinDuration(newMinDuration, {from: ownerAddress})
        const minDuration = await instance.GetMinDuration()
        assert.equal(newMinDuration, minDuration)
    })
    it('should set fee', async () => {
        const newFee = 30
        await instance.SetFee(newFee, {from: ownerAddress})
        const fee = await instance.GetFee()
        assert.equal(newFee, fee)
    })
    it('should set POZ fee', async () => {
        const newPozFee = 20
        await instance.SetPOZFee(newPozFee, {from: ownerAddress})
        const PozFee = await instance.GetPOZFee()
        assert.equal(newPozFee, PozFee)
    })
    // it('should set Min POZ', async () => {
    //     const newMinPoz = 100
    //     await instance.SetMinPoz(newMinPoz, {from: ownerAddress})
    //     const minPoz = await instance.GetMinPoz()
    //     assert.equal(newMinPoz, minPoz)
    // })
})