const LockedDeal = artifacts.require("LockedDeal");
const TestToken = artifacts.require("TestToken");
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');
const timeMachine = require('ganache-time-traveler');
const zero_address = "0x0000000000000000000000000000000000000000";

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
        const amount = 25
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
        const amount = 25
        allow = allow - amount
        const approvedAddress = accounts[7]
        const tx = await instance.ApproveAllowance(poolId, amount, approvedAddress, {from: owner})
        const pid = tx.logs[0].args.PoolId
        const pool = await instance.GetPoolData(poolId, {from: owner})
        assert.equal(pool[1], allow)
        const newPool = await instance.GetPoolData(pid, {from: approvedAddress})
        assert.equal(newPool[1], amount)
    })

    it('Fail to transfer ownership when called from wrong address', async () => {
        await truffleAssert.reverts(instance.TransferPoolOwnership(poolId, accounts[5], {from: fromAddress}), "You are not Pool Owner")
    })

    it('Fail to transfer ownership after pool is unlocked', async () => {
        const data = await instance.GetPoolData(poolId, {from: owner})
        const unlockTime = data[0].toString()
        const currentTime = Math.floor(new Date().getTime() / 1000)
        await timeMachine.advanceBlockAndSetTime(unlockTime)
        await truffleAssert.reverts(instance.TransferPoolOwnership(poolId, accounts[5], {from: owner}), "Pool is Unlocked")
        await timeMachine.advanceBlockAndSetTime(currentTime)
    })

    it('Fail to Create Pool with 0 address owner', async () => {
        const allow = 100
        let date = new Date()
        date.setDate(date.getDate() + 1)
        const future = Math.floor(date.getTime() / 1000)
        await truffleAssert.reverts(instance.CreateNewPool(Token.address, future, allow, zero_address, {from: fromAddress}))
    })

    it('Fail to transfer ownership to 0 address', async () => {
        await truffleAssert.reverts(instance.TransferPoolOwnership(poolId, zero_address, {from: owner}), "Zero Address is not allowed")
    })

    it('Fail to split pool when balance is not enough', async () => {
        const data = await instance.GetPoolData(poolId, {from: owner})
        const amount = data[1] + 1
        await truffleAssert.reverts(instance.SplitPoolAmount(poolId, amount, {from: owner}), "Not Enough Amount Balance")
    })
})