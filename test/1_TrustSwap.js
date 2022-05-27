const LockedDeal = artifacts.require("LockedDeal");
const TestToken = artifacts.require("Token");
const { assert } = require('chai');

contract('LockedDeal', (accounts) => {
    let instance, Token
    const allow = 1, owner = accounts[2]
    const date = new Date()

    before(async () => {
        instance = await LockedDeal.deployed()
        Token = await TestToken.new('TestToken', 'TEST')
        await instance.swapTokenFilter()
        await instance.swapUserFilter()
    })

    it('Lock 1 test token for account2 from acount 0', async () => {
        await Token.approve(instance.address, allow)
        date.setDate(date.getDate() + 1)   // add a day
        const startTime = Math.floor(date.getTime() / 1000)
        const finishTime = startTime + 60 * 60 * 24 * 30
        await instance.CreateNewPool(Token.address, startTime, finishTime, allow, owner)
        const mypoolz = await instance.GetAllMyPoolsId({from: owner})
        assert.equal(mypoolz.length, 1)
    })

    it('fail on withdraw from account 2', async () => {
        let took = await instance.WithdrawToken.call(0)
        assert.isFalse(took)
    })

    it('open new pool for account 1 ', async () => {
        await Token.approve(instance.address, allow)
        const date = new Date()
        date.setDate(date.getDate() - 1)  // sub a day
        const startTime = Math.floor(date.getTime() / 1000)
        const finishTime = startTime + 60 * 60 * 24 * 30
        await instance.CreateNewPool(Token.address, startTime, finishTime, allow, accounts[1])
        const mypoolz = await instance.GetAllMyPoolsId({ from: accounts[1] })
        assert.equal(mypoolz.length, 1)
    })

    it('withdraw from account 1', async () => {
        let took = await instance.WithdrawToken.call(1)
        assert.isTrue(took)
    })
})