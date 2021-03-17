const LockedDeal = artifacts.require("LockedDeal");
const TestToken = artifacts.require("TestToken");
const { assert } = require('chai');

contract('Create Pool', accounts => {
    let instance, Token, fromAddress = accounts[0]

    before(async () => {
        instance = await LockedDeal.new()
        Token = await TestToken.new()
    })

    it('should create pools in mass', async () => {
        const allow = 100
        const numberOfPools = 5
        await Token.approve(instance.address , allow * numberOfPools, { from: fromAddress })
        let date = new Date()
        date.setDate(date.getDate() + 1)
        const future = Math.floor(date.getTime() / 1000)
        const futureTimeStamps = []
        futureTimeStamps.push(future)
        futureTimeStamps.push(future - 3600)
        futureTimeStamps.push(future + 3600)
        futureTimeStamps.push(future + 7200)
        futureTimeStamps.push(future - 7200)
        const startAmounts = [allow, allow, allow, allow, allow]
        const owners = [accounts[9], accounts [8], accounts[7], accounts[6], accounts[5]]
        const tx = await instance.CreateMassPools(Token.address, futureTimeStamps, startAmounts, owners, {from: fromAddress})
        const pids = []
        tx.logs.forEach(element => {
            if(element.event === 'NewPoolCreated'){
                pids.push(element.args.PoolId.toString())
            }
        });
        assert.equal(pids.length, numberOfPools)
    })

    it('should create pools with respect to finish time', async () => {
        const allow = 100
        const numberOfPools = 15
        await Token.approve(instance.address , allow * numberOfPools, { from: fromAddress })
        let date = new Date()
        date.setDate(date.getDate() + 1)
        const future = Math.floor(date.getTime() / 1000)
        const futureTimeStamps = []
        for(let i=1 ; i<= 5 ; i++){ // generating array of length 5
            futureTimeStamps.push(future + 3600*i)
        }
        const startAmounts = [allow, allow, allow]
        const owners = [accounts[9], accounts [8], accounts[7]]
        const tx = await instance.CreatePoolsWrtTime(Token.address, futureTimeStamps, startAmounts, owners, {from: fromAddress})
        const pids = []
        tx.logs.forEach(element => {
            if(element.event === 'NewPoolCreated'){
                pids.push(element.args.PoolId.toString())
            }
        });
        assert.equal(pids.length, numberOfPools)
    })

})