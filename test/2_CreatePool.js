const LockedDeal = artifacts.require("LockedDeal");
const TestToken = artifacts.require("Token");
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');

contract('Create Pool', accounts => {
    let instance, Token, fromAddress = accounts[0], FeeToken
    const allow = 100

    before(async () => {
        instance = await LockedDeal.new()
        Token = await TestToken.new('TestToken', 'TEST')
        FeeToken = await TestToken.new('FeeToken', 'FEE')
        await instance.swapTokenFilter()
        await instance.swapUserFilter()
        await instance.SetTokenFee(FeeToken.address, '1')
    })

    it('should create a single new pool', async () => {
        await Token.approve(instance.address, allow)
        await FeeToken.approve(instance.address, allow)
        const date = new Date()
        date.setDate(date.getDate() + 1)
        const startTime = Math.floor(date.getTime() / 1000)
        const finishTime = startTime + 60 * 60 * 24 * 30
        const owner = accounts[1]
        const tx = await instance.CreateNewPoolERC20(Token.address, startTime, finishTime, allow, owner, FeeToken.address)
        const poolId = tx.logs[2].args.PoolId
        const result = await instance.GetPoolData(poolId, { from: owner })
        assert.equal(result[4], owner)
    })

    it('should create pools in mass', async () => {
        const numberOfPools = 5
        await Token.approve(instance.address, allow * numberOfPools)
        await FeeToken.approve(instance.address, allow * numberOfPools)
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
        const cost = web3.utils.toWei('1', 'ether')
        const tx = await instance.CreateMassPoolsMain(Token.address, startTimeStamps, finishTimeStamps, startAmounts, owners,
            { value: cost })
        const firstPoolId = tx.logs[tx.logs.length - 1].args.FirstPoolId.toString()
        const lastPoolId = tx.logs[tx.logs.length - 1].args.LastPoolId.toString()
        const pids = []
        tx.logs.forEach(element => {
            if (element.event === 'NewPoolCreated') {
                pids.push(element.args.PoolId.toString())
            }
        })
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
        const tx = await instance.CreatePoolsWrtTimeMain(Token.address, startTimeStamps, finishTimeStamps, startAmounts, owners)
        const firstPoolId = tx.logs[tx.logs.length - 1].args.FirstPoolId.toString()
        const lastPoolId = tx.logs[tx.logs.length - 1].args.LastPoolId.toString()
        const pids = []
        tx.logs.forEach(element => {
            if (element.event === 'NewPoolCreated') {
                pids.push(element.args.PoolId.toString())
            }
        })
        assert.equal(firstPoolId, '6')
        assert.equal(lastPoolId, (numberOfOwners * numberOfTimestamps + parseInt(firstPoolId) - 1).toString())
        assert.equal(pids.length, numberOfOwners * numberOfTimestamps)
        assert.equal(pids.length, lastPoolId - firstPoolId + 1)
    })
})