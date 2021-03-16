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
        await instance.TransferPoolOwnership(poolId, newOwner, {from: owner})
        const pool = await instance.GetPoolData(poolId, {from: newOwner})
        assert.equal(pool[2], newOwner)
        owner = newOwner
    })

    it('Split Pool Amount', async () => {
        const amount = allow - 25
        allow = allow - amount
        const tx = await instance.SplitPoolAmount(poolId, amount, {from: owner})
        const pid = tx.logs[0].args.PoolId
        const pAmount = tx.logs[0].args.StartAmount
        assert.equal(amount, pAmount)
        const pool = await instance.GetPoolData(poolId, {from: owner})
        assert.equal(pool[1], allow)
        const newPool = await instance.GetPoolData(pid, {from: owner})
        assert.equal(newPool[1], amount)
    })

    it('Approve Allowance', async () => {
        const amount = allow - 25
        allow = allow - amount
        const approvedAddress = accounts[7]
        const tx = await instance.ApproveAllowance(poolId, amount, approvedAddress, {from: owner})
        const pid = tx.logs[0].args.PoolId
        const pool = await instance.GetPoolData(poolId, {from: owner})
        assert.equal(pool[1], allow)
        const newPool = await instance.GetPoolData(pid, {from: approvedAddress})
        assert.equal(newPool[1], amount)
    })
})