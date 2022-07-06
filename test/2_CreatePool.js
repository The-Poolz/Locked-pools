const LockedDealV2 = artifacts.require("LockedDealV2")
const TestToken = artifacts.require("ERC20Token")
const { assert } = require('chai')
const constants = require('@openzeppelin/test-helpers/src/constants.js');

contract('Create Pool', accounts => {
    let instance, Token, fromAddress = accounts[0]
    let invalidToken

    before(async () => {
        instance = await LockedDealV2.new()
        Token = await TestToken.new('TestToken', 'TEST')
        invalidToken = await TestToken.new('InvalidToken', 'TEST')
    })

    it('should create a single new pool', async () => {
        const allow = 100
        await Token.approve(instance.address, allow, { from: fromAddress })
        let date = new Date()
        date.setDate(date.getDate() + 1)
        const startTime = Math.floor(date.getTime() / 1000)
        const finishTime = startTime + 60 * 60 * 24 * 30
        const owner = accounts[1]
        const tx = await instance.CreateNewPool(Token.address, startTime, finishTime, allow, owner, { from: fromAddress })
        const poolId = tx.logs[1].args.PoolId
        const result = await instance.GetPoolData(poolId, { from: owner })
        assert.equal(result[4], owner)
    })

    it('should create pools in mass', async () => {
        const allow = 100
        const numberOfPools = 5
        await Token.approve(instance.address, allow * numberOfPools, { from: fromAddress })
        let date = new Date()
        date.setDate(date.getDate() + 1)
        let future = Math.floor(date.getTime() / 1000)
        const startTimeStamps = []
        startTimeStamps.push(future)
        startTimeStamps.push(future - 3600)
        startTimeStamps.push(future + 3600)
        startTimeStamps.push(future + 7200)
        startTimeStamps.push(future - 7200)
        future = future + 60 * 60 * 24 * 30
        const finishTimeStamps = []
        finishTimeStamps.push(future)
        finishTimeStamps.push(future - 3600)
        finishTimeStamps.push(future + 3600)
        finishTimeStamps.push(future + 7200)
        finishTimeStamps.push(future - 7200)
        const startAmounts = [allow, allow, allow, allow, allow]
        const owners = [accounts[9], accounts[8], accounts[7], accounts[6], accounts[5]]
        const tx = await instance.CreateMassPools(Token.address, startTimeStamps, finishTimeStamps, startAmounts, owners, { from: fromAddress })
        const firstPoolId = tx.logs[tx.logs.length - 1].args.FirstPoolId.toString()
        const lastPoolId = tx.logs[tx.logs.length - 1].args.LastPoolId.toString()
        const pids = []
        tx.logs.forEach(element => {
            if (element.event === 'NewPoolCreated') {
                pids.push(element.args.PoolId.toString())
            }
        });
        assert.equal(firstPoolId, '1')
        assert.equal(lastPoolId, numberOfPools.toString())
        assert.equal(pids.length, numberOfPools)
        assert.equal(pids.length, lastPoolId - firstPoolId + 1)
    })

    it('should create pools with respect to finish time', async () => {
        const allow = 100
        const numberOfOwners = 3
        const numberOfTimestamps = 6
        await Token.approve(instance.address, allow * numberOfOwners * numberOfTimestamps, { from: fromAddress })
        let date = new Date()
        date.setDate(date.getDate() + 1)
        let future = Math.floor(date.getTime() / 1000)
        const startTimeStamps = []
        for (let i = 1; i <= numberOfTimestamps; i++) { // generating array of length 5
            startTimeStamps.push(future + 3600 * i)
        }
        future = future + 60 * 60 * 24 * 30
        const finishTimeStamps = []
        for (let i = 1; i <= numberOfTimestamps; i++) { // generating array of length 5
            finishTimeStamps.push(future + 3600 * i)
        }
        const startAmounts = [allow, allow, allow]
        const owners = [accounts[9], accounts[8], accounts[7]]
        // const result = await instance.CreatePoolsWrtTime.call(Token.address, startTimeStamps, startAmounts, owners, {from: fromAddress})
        const tx = await instance.CreatePoolsWrtTime(Token.address, startTimeStamps, finishTimeStamps, startAmounts, owners, { from: fromAddress })
        const firstPoolId = tx.logs[tx.logs.length - 1].args.FirstPoolId.toString()
        const lastPoolId = tx.logs[tx.logs.length - 1].args.LastPoolId.toString()
        const pids = []
        tx.logs.forEach(element => {
            if (element.event === 'NewPoolCreated') {
                pids.push(element.args.PoolId.toString())
            }
        });
        assert.equal(firstPoolId, '6')
        assert.equal(lastPoolId, (numberOfOwners * numberOfTimestamps + parseInt(firstPoolId) - 1).toString())
        assert.equal(pids.length, numberOfOwners * numberOfTimestamps)
        assert.equal(pids.length, lastPoolId - firstPoolId + 1)
    })

    it('should get all my pools ids by token', async () => {
        let result = await instance.GetMyPoolsIdByToken([Token.address], { from: accounts[1] });
        assert.equal(result.toString(), [0])

        result = await instance.GetMyPoolsIdByToken([Token.address], { from: accounts[7] });
        assert.equal(result.toString(), [3, 8, 11, 14, 17, 20, 23])

        result = await instance.GetMyPoolsIdByToken([Token.address], { from: accounts[8] });
        assert.equal(result.toString(), [2, 7, 10, 13, 16, 19, 22])

        result = await instance.GetMyPoolsIdByToken([Token.address, invalidToken.address], { from: accounts[9] });
        assert.equal(result.toString(), [1, 6, 9, 12, 15, 18, 21])

        result = await instance.GetMyPoolsIdByToken([Token.address, invalidToken.address], { from: accounts[6] });
        assert.equal(result.toString(), [4])

        result = await instance.GetMyPoolsIdByToken([Token.address], { from: accounts[5] });
        assert.equal(result.toString(), [5])

        result = await instance.GetMyPoolsIdByToken([invalidToken.address], { from: accounts[5] });
        assert.equal(result.toString(), [])
    })

    it('should get pools data by ids', async () => {
        const result = await instance.GetPoolsData([1, 6, 9, 12, 15, 18, 21], { from: accounts[9] });
        assert.equal(7, result.StartTimes.length)
    })
})