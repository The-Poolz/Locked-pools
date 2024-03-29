const LockedDealV2 = artifacts.require("LockedDealV2")
const TestToken = artifacts.require("ERC20Token")
const { assert } = require("chai")
const constants = require("@openzeppelin/test-helpers/src/constants.js")
const { poolTime } = require("./helper.js")
const timeMachine = require("ganache-time-traveler")

contract("Create Pool", (accounts) => {
    let instance, Token
    let invalidToken, poolId
    let startTime, finishTime, cliffTime
    const owner = accounts[1],
        fromAddress = accounts[0]
    const poolAmount = 100

    before(async () => {
        instance = await LockedDealV2.new()
        Token = await TestToken.new("TestToken", "TEST")
        invalidToken = await TestToken.new("InvalidToken", "TEST")
    })

    it("should create a single new pool", async () => {
        await Token.approve(instance.address, constants.MAX_UINT256, { from: fromAddress })
        ;({ startTime, cliffTime, finishTime } = poolTime())
        const tx = await instance.CreateNewPool(Token.address, startTime, cliffTime, finishTime, poolAmount, owner, {
            from: fromAddress
        })
        poolId = tx.logs[1].args.PoolId
        const result = await instance.AllPoolz(poolId, { from: owner })
        assert.equal(result[5], owner)
    })

    it("should create pools in mass", async () => {
        const numberOfPools = 5
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
        const cliffTimeStamps = startTimeStamps
        const startAmounts = [poolAmount, poolAmount, poolAmount, poolAmount, poolAmount]
        const owners = [accounts[9], accounts[8], accounts[7], accounts[6], accounts[5]]
        const tx = await instance.CreateMassPools(
            Token.address,
            startTimeStamps,
            cliffTimeStamps,
            finishTimeStamps,
            startAmounts,
            owners,
            { from: fromAddress }
        )
        const firstPoolId = tx.logs[tx.logs.length - 1].args.FirstPoolId.toString()
        const lastPoolId = tx.logs[tx.logs.length - 1].args.LastPoolId.toString()
        const pids = []
        tx.logs.forEach((element) => {
            if (element.event === "NewPoolCreated") {
                pids.push(element.args.PoolId.toString())
            }
        })
        assert.equal(firstPoolId, "1")
        assert.equal(lastPoolId, numberOfPools.toString())
        assert.equal(pids.length, numberOfPools)
        assert.equal(pids.length, lastPoolId - firstPoolId + 1)
    })

    it("should create pools with respect to finish time", async () => {
        const numberOfOwners = 3
        const numberOfTimestamps = 6
        let date = new Date()
        date.setDate(date.getDate() + 1)
        let future = Math.floor(date.getTime() / 1000)
        const startTimeStamps = []
        for (let i = 1; i <= numberOfTimestamps; i++) {
            // generating array of length 5
            startTimeStamps.push(future + 3600 * i)
        }
        future = future + 60 * 60 * 24 * 30
        const finishTimeStamps = []
        for (let i = 1; i <= numberOfTimestamps; i++) {
            // generating array of length 5
            finishTimeStamps.push(future + 3600 * i)
        }
        const cliffTimeStamps = startTimeStamps
        const startAmounts = [poolAmount, poolAmount, poolAmount]
        const owners = [accounts[9], accounts[8], accounts[7]]
        // const result = await instance.CreatePoolsWrtTime.call(Token.address, startTimeStamps, startAmounts, owners, {from: fromAddress})
        const tx = await instance.CreatePoolsWrtTime(
            Token.address,
            startTimeStamps,
            cliffTimeStamps,
            finishTimeStamps,
            startAmounts,
            owners,
            { from: fromAddress }
        )
        const firstPoolId = tx.logs[tx.logs.length - 1].args.FirstPoolId.toString()
        const lastPoolId = tx.logs[tx.logs.length - 1].args.LastPoolId.toString()
        const pids = []
        tx.logs.forEach((element) => {
            if (element.event === "NewPoolCreated") {
                pids.push(element.args.PoolId.toString())
            }
        })
        assert.equal(firstPoolId, "6")
        assert.equal(lastPoolId, (numberOfOwners * numberOfTimestamps + parseInt(firstPoolId) - 1).toString())
        assert.equal(pids.length, numberOfOwners * numberOfTimestamps)
        assert.equal(pids.length, lastPoolId - firstPoolId + 1)
        poolId = lastPoolId
    })

    it("should get all my pools ids by token", async () => {
        let result = await instance.GetMyPoolsIdByToken(accounts[1], [Token.address], { from: accounts[1] })
        assert.equal(result.toString(), [0])

        result = await instance.GetMyPoolsIdByToken(accounts[7], [Token.address], { from: accounts[7] })
        assert.equal(result.toString(), [3, 8, 11, 14, 17, 20, 23])

        result = await instance.GetMyPoolsIdByToken(accounts[8], [Token.address], { from: accounts[8] })
        assert.equal(result.toString(), [2, 7, 10, 13, 16, 19, 22])

        result = await instance.GetMyPoolsIdByToken(accounts[9], [Token.address, invalidToken.address], {
            from: accounts[9]
        })
        assert.equal(result.toString(), [1, 6, 9, 12, 15, 18, 21])

        result = await instance.GetMyPoolsIdByToken(accounts[6], [Token.address, invalidToken.address], {
            from: accounts[6]
        })
        assert.equal(result.toString(), [4])

        result = await instance.GetMyPoolsIdByToken(accounts[5], [Token.address], { from: accounts[5] })
        assert.equal(result.toString(), [5])

        result = await instance.GetMyPoolsIdByToken(accounts[5], [invalidToken.address], { from: accounts[5] })
        assert.equal(result.toString(), [])
    })

    it("should get pools data by ids", async () => {
        const result = await instance.GetPoolsData([0], { from: accounts[1] })
        assert.equal(1, result.length)
        assert.equal(startTime, result[0].StartTime)
        assert.equal(finishTime, result[0].FinishTime)
        assert.equal(100, result[0].StartAmount)
        assert.equal(0, result[0].DebitedAmount)
        assert.equal(accounts[1], result[0].Owner)
        assert.equal(Token.address, result[0].Token)
    })

    it("should transfer locked pool", async () => {
        const owner = accounts[7]
        const newOwner = accounts[2]
        const transferAmount = await instance.AllPoolz(poolId)
        const result = await instance.TransferPoolOwnership(poolId, newOwner, { from: owner })
        const data = result.logs[result.logs.length - 1].args
        assert.equal(data.NewPoolId.toString(), parseInt(poolId) + 1)
        assert.equal(data.OldPoolId.toString(), poolId.toString())
        assert.equal(data.OriginalLeftAmount.toString(), "0")
        assert.equal(data.NewAmount.toString(), (transferAmount.StartAmount - transferAmount.DebitedAmount).toString())
        assert.equal(data.OldOwner.toString(), owner)
        assert.equal(data.NewOwner.toString(), newOwner.toString())
    })

    it("should get user data of pools", async () => {
        const userAddress = accounts[3]
        await instance.CreateNewPool(Token.address, startTime, cliffTime, finishTime, poolAmount, userAddress)
        const tx = await instance.CreateNewPool(
            Token.address,
            startTime,
            cliffTime,
            finishTime,
            poolAmount,
            userAddress
        )
        poolId = tx.logs[1].args.PoolId
        await timeMachine.advanceBlockAndSetTime(finishTime)
        await instance.WithdrawToken(poolId)
        const result = await instance.GetMyPoolsData(userAddress)
        assert.equal(1, result.length)
        assert.equal(startTime, result[0].StartTime)
        assert.equal(finishTime, result[0].FinishTime)
        assert.equal(100, result[0].StartAmount)
        assert.equal(0, result[0].DebitedAmount)
        assert.equal(userAddress, result[0].Owner)
        assert.equal(Token.address, result[0].Token)
        await timeMachine.advanceBlockAndSetTime(startTime)
    })

    it("should get all pools user data", async () => {
        const userAddress = accounts[0]
        await instance.CreateNewPool(Token.address, startTime, cliffTime, finishTime, poolAmount, userAddress)
        const tx = await instance.CreateNewPool(
            Token.address,
            startTime,
            cliffTime,
            finishTime,
            poolAmount,
            userAddress
        )
        poolId = tx.logs[1].args.PoolId
        await timeMachine.advanceBlockAndSetTime(finishTime)
        await instance.WithdrawToken(poolId)
        const result = await instance.GetAllMyPoolsData(userAddress)
        assert.equal(2, result.length)
        assert.equal(startTime, result[0].StartTime)
        assert.equal(finishTime, result[0].FinishTime)
        assert.equal(100, result[0].StartAmount)
        assert.equal(0, result[0].DebitedAmount)
        assert.equal(userAddress, result[0].Owner)
        assert.equal(Token.address, result[0].Token)
        assert.equal(startTime, result[1].StartTime)
        assert.equal(finishTime, result[1].FinishTime)
        assert.equal(100, result[1].StartAmount)
        assert.equal(100, result[1].DebitedAmount)
        assert.equal(userAddress, result[1].Owner)
        assert.equal(Token.address, result[1].Token)
        await timeMachine.advanceBlockAndSetTime(startTime)
    })

    it("should get my pools data by token", async () => {
        const owner = accounts[4]
        const result = await instance.GetMyPoolDataByToken(owner, [Token.address], { from: owner })
        assert.equal(result[0].length, 0)
        assert.equal(result[1].length, 0)
        const { startTime, cliffTime, finishTime } = poolTime()
        const tx = await instance.CreateNewPool(Token.address, startTime, cliffTime, finishTime, poolAmount, owner)
        poolId = tx.logs[1].args.PoolId
        const data = await instance.GetMyPoolDataByToken(owner, [Token.address], { from: owner })
        assert.equal(1, data[0].length)
        assert.equal(1, data[1].length)
        assert.equal(startTime, data[0][0].StartTime)
        assert.equal(finishTime, data[0][0].FinishTime)
        assert.equal(poolAmount, data[0][0].StartAmount)
        assert.equal(0, data[0][0].DebitedAmount)
        assert.equal(owner, data[0][0].Owner)
        assert.equal(Token.address, data[0][0].Token)
        assert.equal(poolId.toString(), data[1][data[0].length - 1].toString())
    })
})
