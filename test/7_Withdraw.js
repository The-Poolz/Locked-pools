const LockedDealV2 = artifacts.require("LockedDealV2")
const TestToken = artifacts.require("ERC20Token")
const { assert } = require('chai')
const timeMachine = require('ganache-time-traveler')
const BigNumber = require('bignumber.js')

contract('Withdraw', (accounts) => {
    let instance, Token, fromAddress, poolId
    const owner = accounts[1], allow = 10000, MyPoolz = []

    before(async () => {
        instance = await LockedDealV2.new()
        Token = await TestToken.new('TestToken', 'TEST')
        fromAddress = await instance.owner()
    })

    it('should create a single new pool', async () => {
        await Token.approve(instance.address, allow, { from: fromAddress })
        const date = new Date()
        const startTime = Math.floor(date.getTime() / 1000)
        date.setDate(date.getDate() + 2)
        const finishTime = Math.floor(date.getTime() / 1000)
        const tx = await instance.CreateNewPool(Token.address, startTime, finishTime, allow, owner, { from: fromAddress })
        poolId = tx.logs[1].args.PoolId.toString()
        MyPoolz.push(poolId)
    })

    it('get withdrawable amount', async () => {
        const data = await instance.AllPoolz(poolId, { from: owner })
        const startAmount = data[2].toString()
        const debitedAmount = data[3].toString()
        const totalPoolDuration = data[1] - data[0]
        const date = new Date()
        const startTime = Math.floor(date.getTime() / 1000)
        date.setDate(date.getDate() + 1)
        const halfTime = Math.floor(date.getTime() / 1000)
        const timePassed = startTime - halfTime
        const timePassedPermille = timePassed * 1000
        const ratioPermille = timePassedPermille / totalPoolDuration
        const debitableAmount = (startAmount * ratioPermille) / 1000
        await timeMachine.advanceBlockAndSetTime(halfTime)
        const result = await instance.getWithdrawableAmount(poolId)
        const expectedResult = '5000'
        assert.equal((debitedAmount - debitableAmount).toString(), result.toString(), 'check debited amount')
        assert.equal(expectedResult, result.toString(), 'check return value')
    })

    it('finish time < now', async () => {
        await Token.approve(instance.address, allow, { from: fromAddress })
        const date = new Date()
        const startTime = Math.floor(date.getTime() / 1000)
        date.setDate(date.getDate() + 1)
        const finishTime = Math.floor(date.getTime() / 1000)
        const tx = await instance.CreateNewPool(Token.address, startTime, finishTime, allow, owner, { from: fromAddress })
        poolId = tx.logs[1].args.PoolId.toString()
        MyPoolz.push(poolId)
        const data = await instance.AllPoolz(poolId, { from: owner })
        const startAmount = data[2].toString()
        const debitedAmount = data[3].toString()
        date.setDate(date.getDate() + 2)
        const futureTime = Math.floor(date.getTime() / 1000)
        await timeMachine.advanceBlockAndSetTime(futureTime)
        const result = await instance.getWithdrawableAmount(poolId)
        assert.equal(result.toString(), startAmount - debitedAmount, 'finish time < now')
    })

    it('now < start time', async () => {
        const date = new Date
        date.setDate(date.getDate() - 1)
        const backTime = Math.floor(date.getTime() / 1000)
        await timeMachine.advanceBlockAndSetTime(backTime)
        const result = await instance.getWithdrawableAmount(poolId)
        assert.equal('0', result.toString(), 'check debited amount')
    })

    it('Withdraw tokens', async () => {
        await Token.approve(instance.address, allow, { from: fromAddress })
        const date = new Date()
        date.setDate(date.getDate() - 1)
        const startTime = Math.floor(date.getTime() / 1000)
        date.setDate(date.getDate() + 2)
        const finishTime = Math.floor(date.getTime() / 1000)
        const tx = await instance.CreateNewPool(Token.address, startTime, finishTime, allow, owner, { from: fromAddress })
        poolId = tx.logs[1].args.PoolId.toString()
        MyPoolz.push(poolId)
        date.setDate(date.getDate() - 1)
        await timeMachine.advanceBlockAndSetTime(Math.floor(date.getTime() / 1000))
        const ids = await instance.GetMyPoolsId({ from: owner })
        const data = await instance.WithdrawToken(poolId)
        const logs = data.logs[1].args
        assert.equal(poolId, logs.PoolId.toString(), 'check pool ID')
        assert.equal(owner, logs.Recipient.toString(), 'check owner address')
        assert.equal('5000', logs.Amount.toString(), 'check token amount')
        assert.equal(ids.toString(), MyPoolz.toString(), 'check active pool id')
        const result = await instance.WithdrawToken.call(parseInt(poolId) + 1)
        assert.equal(result, false, 'wrong poolID')
        await timeMachine.advanceBlockAndSetTime(finishTime)
        await instance.WithdrawToken(MyPoolz[1])
        MyPoolz.splice(1, 1)
        const activeIds = await instance.GetMyPoolsId({ from: owner })
        assert.equal(activeIds.toString(), MyPoolz.toString(), 'check active pool id')
    })

    describe('withdraw after pool transfer', () => {
        let startTime, finishTime
        const ownerAddr = accounts[3]
        before(async () => {
            await Token.approve(instance.address, allow, { from: fromAddress })
            const date = new Date()
            startTime = Math.floor(date.getTime() / 1000)
            date.setDate(date.getDate() + 4)
            finishTime = Math.floor(date.getTime() / 1000)
            const tx = await instance.CreateNewPool(Token.address, startTime, finishTime, allow, ownerAddr, { from: fromAddress })
            poolId = tx.logs[1].args.PoolId.toString()
        })

        it('withdraw after 25% time', async () => {
            const date = new Date()
            date.setDate(date.getDate() + 1)
            const fourthPart = Math.floor(date.getTime() / 1000)
            await timeMachine.advanceBlockAndSetTime(fourthPart)
            const oldBal = await Token.balanceOf(ownerAddr)
            const result = await instance.WithdrawToken(poolId)
            const currentBal = await Token.balanceOf(ownerAddr)
            const expectedResult = '2500'
            assert.equal(oldBal, '0')
            assert.equal(result.logs[result.logs.length - 1].args.Amount.toString(), expectedResult, 'check amount value')
            assert.equal((currentBal).toString(), expectedResult)
        })

        it('transfer pool and withdraw after 50% time', async () => {
            const newOwner = accounts[5]
            const result = await instance.PoolTransfer(poolId, newOwner, {from: ownerAddr})
            poolId = result.logs[result.logs.length - 1].args.PoolId
            const date = new Date()
            date.setDate(date.getDate() + 2)
            const halfTime = Math.floor(date.getTime() / 1000)
            await timeMachine.advanceBlockAndSetTime(halfTime)
            const oldBal = await Token.balanceOf(newOwner)
            const tx = await instance.WithdrawToken(poolId)
            const currentBal = await Token.balanceOf(newOwner)
            const expectedResult = '2500'
            assert.equal(oldBal, '0')
            assert.equal(tx.logs[tx.logs.length - 1].args.Amount.toString(), expectedResult, 'check amount value')
            assert.equal((currentBal).toString(), expectedResult)
        })
    })

    after(async () => {
        const currentTime = Math.floor(Date.now() / 1000) // unix timestamp in seconds
        await timeMachine.advanceBlockAndSetTime(currentTime)
    })
}) 