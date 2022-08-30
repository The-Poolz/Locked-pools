const LockedDealV2 = artifacts.require("LockedDealV2")
const TestToken = artifacts.require("ERC20Token")
const { assert } = require('chai')

contract('Create Pool', accounts => {
    let instance, Token
    let invalidToken, poolId
    let startTime, finishTime
    const owner = accounts[1], fromAddress = accounts[0]
    const allow = 100

    before(async () => {
        instance = await LockedDealV2.new()
        Token = await TestToken.new('TestToken', 'TEST')
        invalidToken = await TestToken.new('InvalidToken', 'TEST')
    })

    it('should create a single new pool', async () => {
        await Token.approve(instance.address, allow, { from: fromAddress })
        let date = new Date()
        date.setDate(date.getDate() + 1)
        startTime = Math.floor(date.getTime() / 1000)
        finishTime = startTime + 60 * 60 * 24 * 30
        const tx = await instance.CreateNewPool(Token.address, startTime, finishTime, allow, owner, { from: fromAddress })
        poolId = tx.logs[1].args.PoolId
        const result = await instance.AllPoolz(poolId, { from: owner })
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
        poolId = lastPoolId
    })

    it('should get all my pools ids by token', async () => {
        let result = await instance.GetMyPoolsIdByToken([Token.address], { from: accounts[1] })
        assert.equal(result.toString(), [0])

        result = await instance.GetMyPoolsIdByToken([Token.address], { from: accounts[7] })
        assert.equal(result.toString(), [3, 8, 11, 14, 17, 20, 23])

        result = await instance.GetMyPoolsIdByToken([Token.address], { from: accounts[8] })
        assert.equal(result.toString(), [2, 7, 10, 13, 16, 19, 22])

        result = await instance.GetMyPoolsIdByToken([Token.address, invalidToken.address], { from: accounts[9] })
        assert.equal(result.toString(), [1, 6, 9, 12, 15, 18, 21])

        result = await instance.GetMyPoolsIdByToken([Token.address, invalidToken.address], { from: accounts[6] })
        assert.equal(result.toString(), [4])

        result = await instance.GetMyPoolsIdByToken([Token.address], { from: accounts[5] })
        assert.equal(result.toString(), [5])

        result = await instance.GetMyPoolsIdByToken([invalidToken.address], { from: accounts[5] })
        assert.equal(result.toString(), [])
    })

    it('should get pools data by ids', async () => {
        const result = await instance.GetPoolsData([0], { from: accounts[1] })
        assert.equal(1, result.length)
        assert.equal(startTime, result[0].StartTime)
        assert.equal(finishTime, result[0].FinishTime)
        assert.equal(100, result[0].StartAmount)
        assert.equal(0, result[0].DebitedAmount)
        assert.equal(accounts[1], result[0].Owner)
        assert.equal(Token.address, result[0].Token)
    })
    
    it('should transfer locked pool', async () => {
        const owner = accounts[7]
        const newOwner = accounts[2]
        const result = await instance.PoolTransfer(poolId, newOwner, { from: owner })
        assert.equal(result.logs[result.logs.length - 1].args.PoolId.toString(), parseInt(poolId) + 1)
        assert.equal(result.logs[result.logs.length - 1].args.oldPoolId.toString(), poolId.toString())
        assert.equal(result.logs[result.logs.length - 1].args.OldOwner.toString(), owner)
        assert.equal(result.logs[result.logs.length - 1].args.NewOwner.toString(), newOwner.toString())
    })
    
    it('should get my pools data by token', async () => {
        const owner = accounts[4]
        const result = await instance.GetMyPoolDataByToken([Token.address], {from: owner})
        assert.equal(result.length, 0)
        let date = new Date()
        date.setDate(date.getDate() + 1)
        startTime = Math.floor(date.getTime() / 1000)
        finishTime = startTime + 60 * 60 * 24 * 30
        await Token.approve(instance.address, allow, { from: fromAddress })
        await instance.CreateNewPool(Token.address, startTime, finishTime, allow, owner)
        const data = await instance.GetMyPoolDataByToken([Token.address], {from: owner})
        assert.equal(1, data.length)
        assert.equal(startTime, data[0].StartTime)
        assert.equal(finishTime, data[0].FinishTime)
        assert.equal(allow, data[0].StartAmount)
        assert.equal(0, data[0].DebitedAmount)
        assert.equal(owner, data[0].Owner)
        assert.equal(Token.address, data[0].Token)
    })
})