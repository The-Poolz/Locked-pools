const LockedDealV2 = artifacts.require("LockedDealV2")
const TestToken = artifacts.require("ERC20Token")
const truffleAssert = require('truffle-assertions')

contract('Fail Create Pool', accounts => {
    let instance, Token, fromAddress = accounts[0]
    let date, future, startTime, finishTime
    const allow = 100
    const owner = accounts[6]

    before(async () => {
        instance = await LockedDealV2.new()
        Token = await TestToken.new('TestToken', 'TEST')
        date = new Date()
        date.setDate(date.getDate() + 1)
        future = Math.floor(date.getTime() / 1000)
        startTime = future
        finishTime = future + 60 * 60 * 24 * 30
    })

    it('Fail to Create Pool when approval is not given', async () => {
        await truffleAssert.reverts(instance.CreateNewPool(Token.address, startTime, finishTime, allow, fromAddress, { from: fromAddress }), "no allowance")
    })

    it('Fail to Create Pool when StartTime is greater than FinishTime', async () => {
        date = new Date()
        date.setDate(date.getDate() + 1)
        startTime = Math.floor(date.getTime() / 1000)
        finishTime = startTime - 1
        await Token.approve(instance.address, allow, { from: fromAddress })
        await truffleAssert.reverts(instance.CreateNewPool(Token.address, startTime, finishTime, allow, fromAddress, { from: fromAddress }), "StartTime is greater than FinishTime")
    })

    it('Fail to Create Mass Pool when array length not equal', async () => {
        await Token.approve(instance.address, allow * 2, { from: fromAddress })
        await truffleAssert.reverts(
                instance.CreateMassPools(Token.address, [startTime,startTime], [finishTime,finishTime], [allow, allow], [accounts[0]], { from: fromAddress }), "Date Array Invalid")
        await truffleAssert.reverts(
                instance.CreateMassPools(Token.address, [startTime], [finishTime, finishTime], [allow, allow], [accounts[0], accounts[1]], { from: fromAddress }), "Date Array Invalid")
        await truffleAssert.reverts(
            instance.CreateMassPools(Token.address, [startTime, startTime], [finishTime, finishTime], [allow], [accounts[0], accounts[1]], { from: fromAddress }), "Amount Array Invalid")
    })

    it('Fail to Create Wrt Time Pool when array length not equal', async () => {
        await Token.approve(instance.address, allow * 2, { from: fromAddress })
        await truffleAssert.reverts(
            instance.CreatePoolsWrtTime(Token.address, [startTime, startTime], [finishTime, finishTime], [allow], [accounts[0], accounts[1]], { from: fromAddress }), "Amount Array Invalid")
        await truffleAssert.reverts(
                instance.CreatePoolsWrtTime(Token.address, [startTime], [finishTime, finishTime], [allow, allow], [accounts[0], accounts[1]], { from: fromAddress }), "Date Array Invalid")
    })

    it('Fail to Create Pool when Time array length is Zero', async () => {
        await Token.approve(instance.address, 100, { from: fromAddress })
        await truffleAssert.reverts(instance.CreatePoolsWrtTime(Token.address, [], [], [100], [accounts[6]], { from: fromAddress }), "Array length should be greater than zero")
    })

    it('Fail to Create Pool when maxTransactionLimit is exceeded', async () => {
        let ownerArray = [], startArray = [], finishArray = [], amountArray = []
        await Token.approve(instance.address, allow * 401, { from: fromAddress })
        for (let i = 0; i < 401; i++) {
            ownerArray.push(owner)
            startArray.push(future)
            finishArray.push(future + 60 * 60 * 24)
            amountArray.push(allow)
        }
        await truffleAssert.reverts(instance.CreateMassPools(Token.address, startArray, finishArray, amountArray, ownerArray, { from: fromAddress }), "Max array length limit exceeded")
    })

    it('Fail to Create Pool wrt Time when max limit is exceeded', async () => {
        let ownerArray = [], startTime = [], finishTime = [], amountArray = []
        await Token.approve(instance.address, allow * 410, { from: fromAddress })
        for (let i = 0; i < 41; i++) {
            ownerArray.push(owner)
            amountArray.push(allow)
        }
        for (let i = 1; i <= 10; i++) {
            startTime.push(future + i * 3600)
            finishTime.push(future + i * 3600 + 60 * 60)
        }
        await truffleAssert.reverts(instance.CreatePoolsWrtTime(Token.address, startTime, finishTime, amountArray, ownerArray, { from: fromAddress }), "Max array length limit exceeded")
    })
})