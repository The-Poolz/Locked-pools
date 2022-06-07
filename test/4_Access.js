const LockedDealV2 = artifacts.require("LockedDealV2")
const TestToken = artifacts.require("ERC20Token")
const { assert } = require('chai')
const truffleAssert = require('truffle-assertions')
const constants = require('@openzeppelin/test-helpers/src/constants.js');

contract('Access to Locked Deal', accounts => {
    let instance, Token, fromAddress = accounts[0], owner = accounts[9], poolId, allow = 100

    before(async () => {
        instance = await LockedDealV2.new()
        Token = await TestToken.new('TestToken', 'TEST')
        await Token.approve(instance.address, allow, {from: fromAddress})
        let date = new Date()
        date.setDate(date.getDate() + 1)
        let startTime = Math.floor(date.getTime() / 1000)
        let finishTime = startTime + 60*60*24*30
        await instance.CreateNewPool(Token.address, startTime, finishTime, allow, owner, {from: fromAddress})
        // poolId = tx.logs[1].args.PoolId

        await Token.approve(instance.address, allow, {from: fromAddress})
        // let date = new Date()
        date.setDate(date.getDate() + 1)
        startTime = Math.floor(date.getTime() / 1000)
        finishTime = startTime + 60*60*24*30
        const tx = await instance.CreateNewPool(Token.address, startTime, finishTime, allow, owner, {from: fromAddress})
        poolId = tx.logs[1].args.PoolId
    })

    it('Transfers Ownership', async () => {
        const newOwner = accounts[8]
        poolId = 1
        await instance.TransferPoolOwnership(poolId, newOwner, {from: owner})
        const pool = await instance.GetPoolData(poolId, {from: newOwner})
        const newPools = await instance.GetAllMyPoolsId({from: newOwner})
        assert.equal(newPools[0].toString(), poolId)
        assert.equal(pool[4], newOwner)
        owner = newOwner
    })

    it('Split Pool Amount with owner address', async () => {
        const amount = 25
        allow = allow - amount
        // const tx = await instance.SplitPoolAmount.call(poolId, amount, owner, {from: owner})
        // console.log(tx.toString())
        const tx = await instance.SplitPoolAmount(poolId, amount, owner, {from: owner})
        const pid = tx.logs[0].args.PoolId
        const pAmount = tx.logs[0].args.StartAmount
        assert.equal(amount, pAmount)
        const pool = await instance.GetPoolData(poolId, {from: owner})
        assert.equal(pool[2], allow)
        const newPool = await instance.GetPoolData(pid, {from: owner})
        assert.equal(newPool[2], amount)
    })

    it('Split Pool Amount with new address', async () => {
        const amount = 25
        allow = allow - amount
        const approvedAddress = accounts[7]
        const tx = await instance.SplitPoolAmount(poolId, amount, approvedAddress, {from: owner})
        const pid = tx.logs[0].args.PoolId
        const pool = await instance.GetPoolData(poolId, {from: owner})
        assert.equal(pool[2], allow)
        const newPool = await instance.GetPoolData(pid, {from: approvedAddress})
        assert.equal(newPool[2], amount)
    })

    it('returns new pool id', async () => {
        const amount = 10
        allow = allow - amount
        const pid = await instance.SplitPoolAmount.call(poolId, amount, owner, {from: owner})
        const tx = await instance.SplitPoolAmount(poolId, amount, owner, {from: owner})
        assert.equal(pid.toString(), tx.logs[0].args.PoolId.toString())
    })

    describe('Giving approval and splitting pool', () => {
        const approvalAmount = 10, spender = accounts[1]

        // it('print all data', async () => {
        //     const data = await instance.GetPoolData(poolId, {from: owner})
        //     console.log(data[1].toString())
        // })

        it('giving approval', async () => {
            await instance.ApproveAllowance(poolId, approvalAmount, spender, {from: owner})
            const amount = await instance.GetPoolAllowance(poolId, spender)
            const dataOwner = await instance.GetPoolData(poolId, {from: owner})
            const dataSpender = await instance.GetPoolData(poolId, {from: spender})
            assert.equal(approvalAmount, amount)
            assert.deepEqual(dataOwner, dataSpender)
        })

        it('spliting pool from approved address', async () => {
            const newOwner = accounts[2]
            const amount = await instance.GetPoolAllowance(poolId, spender)
            const tx = await instance.SplitPoolAmountFrom(poolId, approvalAmount, newOwner, {from: spender})
            const newPoolId = tx.logs[0].args.PoolId
            const data = await instance.GetPoolData(newPoolId, {from: newOwner})
            assert.equal(approvalAmount, data[2])

        })
    })

    describe('Fail Tests', () => {
        it('Fail to transfer ownership when called from wrong address', async () => {
            await truffleAssert.reverts(instance.TransferPoolOwnership(poolId, accounts[5], {from: fromAddress}), "You are not Pool Owner")
        })
    
        it('Fail to Create Pool with 0 address owner', async () => {
            const allow = 100
            let date = new Date()
            date.setDate(date.getDate() + 1)
            const startTime = Math.floor(date.getTime() / 1000)
            const finishTime = startTime + 60*60*24
            await truffleAssert.reverts(instance.CreateNewPool(Token.address, startTime, finishTime, allow, constants.ZERO_ADDRESS, {from: fromAddress}), "Zero Address is not allowed")
        })
    
        it('Fail to transfer ownership to 0 address', async () => {
            await truffleAssert.reverts(instance.TransferPoolOwnership(poolId, constants.ZERO_ADDRESS, {from: owner}), "Zero Address is not allowed")
        })
    
        it('Fail to split pool when balance is not enough', async () => {
            const data = await instance.GetPoolData(poolId, {from: owner})
            const amount = data[1] + 1
            await truffleAssert.reverts(instance.SplitPoolAmount(poolId, amount, owner, {from: owner}), "Not Enough Amount Balance")
        })

        it('Fail to execute when Pool ID is invalid', async () => {
            await truffleAssert.reverts(instance.TransferPoolOwnership(99, accounts[5], {from: owner}), "Pool does not exist")
        })
    })

})