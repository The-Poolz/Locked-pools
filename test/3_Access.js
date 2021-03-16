const LockedDeal = artifacts.require("LockedDeal");
const TestToken = artifacts.require("TestToken");
const { assert } = require('chai');

contract('Access to Locked Deal', accounts => {
    let instance, Token, fromAddress = accounts[0], owner = accounts[9], poolId, allow = 100

    before(async () => {
        instance = await LockedDeal.new()
        Token = await TestToken.new()
        await Token.approve(instance.address, allow, {from: fromAddress})
        let date = new Date()
        date.setDate(date.getDate() + 1)
        const future = Math.floor(date.getTime() / 1000)
        const tx = await instance.CreateNewPool(Token.address, future, allow, owner, {from: fromAddress})
        poolId = tx.logs[1].args.PoolId
    })

    it('Transfers Ownership', async () => {
        const newOwner = accounts[8]
        await instance.transferPoolOwnership(poolId, newOwner, {from: owner})
        const pool = await instance.GetPoolData(poolId, {from: newOwner})
        assert.equal(pool[2], newOwner)
        owner = newOwner
    })

    it('Split Pool Amount', async () => {
        const amount = allow / 2
        allow = allow - amount
        const tx = await instance.splitPoolAmount(poolId, amount, {from: owner})
        assert.equal(amount , tx.logs[0].args.StartAmount)
        const pool = await instance.GetPoolData(poolId, {from: owner})
        assert.equal(pool[1], allow)
    })
})