const LockedDeal = artifacts.require("LockedDeal");
const TestToken = artifacts.require("Token");
const { assert } = require('chai');

contract('Managable', accounts => {
    let instance, ownerAddress;
    let testToken;

    before(async () => {
        instance = await LockedDeal.new()
        const owner = await instance.owner()
        ownerAddress = owner.toString()
        testToken = await TestToken.new("test", 'tst');
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
        const PozFee = await instance.PozFee()
        assert.equal(newPozFee, PozFee)
    })
    // it('should set Min POZ', async () => {
    //     const newMinPoz = 100
    //     await instance.SetMinPoz(newMinPoz, {from: ownerAddress})
    //     const minPoz = await instance.GetMinPoz()
    //     assert.equal(newMinPoz, minPoz)
    // })

    it('should withdraw ETH Fee', async () => {        
        const previousBalance = await web3.eth.getBalance(accounts[0]);
        await instance.WithdrawETHFee(accounts[0], { from: ownerAddress });
        const balance = await web3.eth.getBalance(accounts[0],  { from: ownerAddress });
        assert.notEqual(previousBalance, balance);
    })

    // it('should withdraw ERC20 Fee', async () => {
    //     // ERC20(_Token).transfer(_to, FeeMap[_Token]);
    //     // FeeMap[_Token] = 0 ;

    //    // console.log(instance.FeeMap[testToken.address]);
    //     const previousBalance = await web3.eth.getBalance(accounts[0]);
    //     instance.FeeMap = 10;
    //     await instance.WithdrawERC20Fee(testToken.address, accounts[0]);
    //     console.log(instance.FeeMap[testToken.address]);
    //     assert(instance.FeeMap[testToken.address], 0);
    // })
})