const LockedDeal = artifacts.require("LockedDeal");
const TestToken = artifacts.require("TestToken");
const { assert } = require('chai');

contract('Create Pool', accounts => {
    let instance, Token, fromAddress = accounts[0]

    before(async () => {
        instance = await LockedDeal.new()
        Token = await TestToken.new()
    })

    it('should create pools in buld', async () => {
        const allow = 1
        await Token.approve(instance.address , allow * 7, { from: fromAddress })
        let date = new Date()
        date.setDate(date.getDate() + 1)
        const future = Math.floor(date.getTime() / 1000)
        const owners = [accounts[9], accounts[8], accounts[7]]
        const futureTimeStamps = []
        futureTimeStamps.push([0, future])
        futureTimeStamps.push([1, future - 3600])
        futureTimeStamps.push([1, future + 7200])
        futureTimeStamps.push([2, future + 10800])
        futureTimeStamps.push([2, future - 7200])
        const startAmounts = []
        startAmounts.push([0, allow])
        startAmounts.push([1, allow])
        startAmounts.push([1, allow])
        startAmounts.push([2, allow])
        startAmounts.push([2, allow])
        const tx = await instance.CreatePoolsInBulk(Token.address, futureTimeStamps, startAmounts, owners , {from: fromAddress})
        // console.log(tx)
    })

    it('Create pools in bulk 2', async () => {
        const allow = 1
        await Token.approve(instance.address , allow * 7, { from: fromAddress })
        let date = new Date()
        date.setDate(date.getDate() + 1)
        const future = Math.floor(date.getTime() / 1000)
        const owners = [accounts[9], accounts[8], accounts[7]]
        const futureTimeStamps = []
        futureTimeStamps.push([future])
        futureTimeStamps.push([future - 3600, future + 3600, future + 2*3600])
        futureTimeStamps.push([future - 3600, future + 3600])
        console.log(futureTimeStamps)
        const startAmounts = [allow, allow , allow]
        const tx = await instance.CreatePoolsInBulk2(Token.address, futureTimeStamps, startAmounts, owners, {from: fromAddress})
        console.log(tx)

    })

})