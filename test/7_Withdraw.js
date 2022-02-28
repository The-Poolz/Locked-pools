const LockedDeal = artifacts.require("LockedDeal")
const TestToken = artifacts.require("Token")
const { assert } = require('chai')
const timeMachine = require('ganache-time-traveler')

contract('LockedDeal', (accounts) => {
    let instance, Token, fromAddress, poolId
    const investor = accounts[1], allow = 10000

    before(async () => {
        instance = await LockedDeal.new()
        Token = await TestToken.new('TestToken', 'TEST')
        fromAddress = await instance.owner()
    })

    it('should create a single new pool', async () => {
        await Token.approve(instance.address, allow, { from: fromAddress })
        const date = new Date()
        const startTime = Math.floor(date.getTime() / 1000)
        date.setDate(date.getDate() + 2)
        const finishTime = Math.floor(date.getTime() / 1000)
        const tx = await instance.CreateNewPool(Token.address, startTime, finishTime, allow, investor, { from: fromAddress })
        poolId = tx.logs[1].args.PoolId.toString()
    })

    it('get withdrawable amount', async () => {
        const data = await instance.GetPoolData(poolId, { from: investor })
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
        const tx = await instance.CreateNewPool(Token.address, startTime, finishTime, allow, investor, { from: fromAddress })
        poolId = tx.logs[1].args.PoolId.toString()
        const data = await instance.GetPoolData(poolId, { from: investor })
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
        const tx = await instance.CreateNewPool(Token.address, startTime, finishTime, allow, investor, { from: fromAddress })
        poolId = tx.logs[1].args.PoolId.toString()
        date.setDate(date.getDate() - 1)
        await timeMachine.advanceBlockAndSetTime(Math.floor(date.getTime() / 1000))
        const data = await instance.WithdrawToken(poolId)
        const logs = data.logs[1].args
        assert.equal(poolId, logs.PoolId.toString(), 'check pool ID')
        assert.equal(investor, logs.Recipient.toString(), 'check owner address')
        assert.equal('5000', logs.Amount.toString(), 'check token amount')
        const result = await instance.WithdrawToken.call(parseInt(poolId) + 1)
        assert.equal(result, false, 'wrong poolID')
    })

    after(async () => {
        const currentTime = Math.floor(Date.now() / 1000) // unix timestamp in seconds
        await timeMachine.advanceBlockAndSetTime(currentTime)
    })
})