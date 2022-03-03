const LockedDeal = artifacts.require("LockedDeal");
const TestToken = artifacts.require("Token");
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');

contract('Pool creation', accounts => {
    let instance, Token, poolId, FeeToken
    const allow = 100, fromAddress = accounts[0]

    before(async () => {
        instance = await LockedDeal.new()
        Token = await TestToken.new('TestToken', 'TEST')
        FeeToken = await TestToken.new('FeeToken', 'FEE')
        await instance.swapTokenFilter()
        await instance.swapUserFilter()
        await instance.SetTokenFee(FeeToken.address, '20')
    })

    describe('creates single pools', () => {
        it('should create a single new pool', async () => {
            await Token.approve(instance.address, allow)
            const date = new Date()
            date.setDate(date.getDate() + 1)
            const startTime = Math.floor(date.getTime() / 1000)
            const finishTime = startTime + 60 * 60 * 24 * 30
            const owner = accounts[1]
            const tx = await instance.CreateNewPoolMain(Token.address, startTime, finishTime, allow, owner)
            poolId = tx.logs[tx.logs.length - 1].args.PoolId
            const result = await instance.GetPoolData(poolId, { from: owner })
            assert.equal(result[4], owner)
        })

        it('should create a single new ERC20 pool', async () => {
            await Token.approve(instance.address, allow)
            await FeeToken.approve(instance.address, allow)
            const date = new Date()
            date.setDate(date.getDate() + 1)
            const startTime = Math.floor(date.getTime() / 1000)
            const finishTime = startTime + 60 * 60 * 24 * 30
            const owner = accounts[1]
            const tx = await instance.CreateNewPoolERC20(Token.address, startTime, finishTime, allow, owner, FeeToken.address)
            poolId = tx.logs[tx.logs.length - 1].args.PoolId
            const result = await instance.GetPoolData(poolId, { from: owner })
            assert.equal(result[4], owner)
        })
    })

    describe('creates pools in mass', async () => {
        let startTimeStamps, finishTimeStamps, future
        const date = new Date()
        before(async () => {
            date.setDate(date.getDate() + 1)
            future = Math.floor(date.getTime() / 1000)

            startTimeStamps = []
            startTimeStamps.push(future)
            startTimeStamps.push(future - 3600)
            startTimeStamps.push(future + 3600)
            startTimeStamps.push(future + 7200)
            startTimeStamps.push(future - 7200)
            future = future + 60 * 60 * 24 * 30
            finishTimeStamps = []
            finishTimeStamps.push(future)
            finishTimeStamps.push(future - 3600)
            finishTimeStamps.push(future + 3600)
            finishTimeStamps.push(future + 7200)
            finishTimeStamps.push(future - 7200)
        })

        it('should create main pools in mass', async () => {
            const numberOfPools = 5
            await Token.approve(instance.address, allow * numberOfPools)
            const startAmounts = [allow, allow, allow, allow, allow]
            const owners = [accounts[9], accounts[8], accounts[7], accounts[6], accounts[5]]
            const cost = web3.utils.toWei('1', 'ether')
            const tx = await instance.CreateMassPoolsMain(Token.address, startTimeStamps, finishTimeStamps, startAmounts, owners,
                { value: cost })
            const firstPoolId = tx.logs[tx.logs.length - 1].args.FirstPoolId
            const lastPoolId = tx.logs[tx.logs.length - 1].args.LastPoolId
            const pids = []
            tx.logs.forEach(element => {
                if (element.event === 'NewPoolCreated') {
                    pids.push(element.args.PoolId.toString())
                }
            })
            assert.equal(firstPoolId, '2', 'check first pool Id')
            assert.equal(lastPoolId, numberOfPools + parseInt(firstPoolId) - 1, 'check last pool Id')
            assert.equal(pids.length, numberOfPools)
        })

        it('should create main pools with respect to finish time', async () => {
            const numberOfOwners = 3
            const numberOfTimestamps = 6
            await Token.approve(instance.address, allow * numberOfOwners * numberOfTimestamps, { from: fromAddress })
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
            assert.equal(firstPoolId, '7')
            assert.equal(lastPoolId, (numberOfOwners * numberOfTimestamps + parseInt(firstPoolId) - 1).toString()) // lastPoolId = 24
            assert.equal(pids.length, numberOfOwners * numberOfTimestamps)// pids.length = 18
        })

        it('should create mass pools ERC20', async () => {
            const numberOfPools = 5
            await Token.approve(instance.address, allow * numberOfPools)
            await FeeToken.approve(instance.address, allow * numberOfPools)
            const startAmounts = [allow, allow, allow, allow, allow]
            const owners = [accounts[9], accounts[8], accounts[7], accounts[6], accounts[5]]
            const cost = web3.utils.toWei('1', 'ether')
            const tx = await instance.CreateMassPoolsERC20(Token.address, startTimeStamps, finishTimeStamps, startAmounts, owners, FeeToken.address)
            const firstPoolId = tx.logs[tx.logs.length - 1].args.FirstPoolId.toString()
            const lastPoolId = tx.logs[tx.logs.length - 1].args.LastPoolId
            const pids = []
            tx.logs.forEach(element => {
                if (element.event === 'NewPoolCreated') {
                    pids.push(element.args.PoolId.toString())
                }
            })
            assert.equal(firstPoolId, '25', 'check first pool Id')
            assert.equal(lastPoolId, numberOfPools + parseInt(firstPoolId) - 1, 'check last pool Id')
            assert.equal(pids.length, numberOfPools)
        })

        it('should create mass pools ERC20 with respect to finish time', async () => {
            const numberOfOwners = 3
            const numberOfTimestamps = 6
            await Token.approve(instance.address, allow * numberOfOwners * numberOfTimestamps, { from: fromAddress })
            await FeeToken.approve(instance.address, allow * numberOfOwners * numberOfTimestamps, { from: fromAddress })
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
            const tx = await instance.CreatePoolsWrtTimeERC20(Token.address, startTimeStamps, finishTimeStamps, startAmounts, owners, FeeToken.address)
            const firstPoolId = tx.logs[tx.logs.length - 1].args.FirstPoolId.toString()
            const lastPoolId = tx.logs[tx.logs.length - 1].args.LastPoolId.toString()
            const pids = []
            tx.logs.forEach(element => {
                if (element.event === 'NewPoolCreated') {
                    pids.push(element.args.PoolId.toString())
                }
            })
            assert.equal(firstPoolId, '30')
            assert.equal(lastPoolId, (numberOfOwners * numberOfTimestamps + parseInt(firstPoolId) - 1).toString())
            assert.equal(pids.length, numberOfOwners * numberOfTimestamps)
        })
    })
})