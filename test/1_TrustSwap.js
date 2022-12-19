const LockedDealV2 = artifacts.require("LockedDealV2")
const TestToken = artifacts.require("ERC20Token")
const { assert } = require("chai")
const constants = require("@openzeppelin/test-helpers/src/constants.js")

contract("LockedDealV2", (accounts) => {
    let instance, Token, poolId
    const allow = 10000,
        owner = accounts[2]
    const date = new Date()

    before(async () => {
        instance = await LockedDealV2.deployed()
        Token = await TestToken.new("TestToken", "TEST")
    })

    it("Lock 1 test token for account2 from acount 0", async () => {
        await Token.approve(instance.address, constants.MAX_UINT256)
        date.setDate(date.getDate() + 1) // add a day
        const startTime = Math.floor(date.getTime() / 1000)
        const lockTime = 0
        const finishTime = startTime + 60 * 60 * 24 * 30
        const tx = await instance.CreateNewPool(Token.address, startTime, lockTime, finishTime, allow, owner)
        poolId = tx.logs[1].args.PoolId
        const mypoolz = await instance.GetAllMyPoolsId(owner, { from: owner })
        assert.equal(mypoolz.length, 1)
    })

    it("fail on withdraw from account 2", async () => {
        const took = await instance.WithdrawToken.call(poolId)
        const result = await instance.getWithdrawableAmount(poolId)
        assert.equal(result.toString(), took.toString())
    })

    it("open new pool for account 1 ", async () => {
        const date = new Date()
        date.setDate(date.getDate() - 1) // sub a day
        const startTime = Math.floor(date.getTime() / 1000)
        const lockTime = startTime
        const finishTime = startTime + 60 * 60 * 24 * 30
        const tx = await instance.CreateNewPool(Token.address, startTime, lockTime, finishTime, allow, accounts[1])
        poolId = tx.logs[1].args.PoolId
        const mypoolz = await instance.GetAllMyPoolsId(owner, { from: accounts[1] })
        assert.equal(mypoolz.length, 1)
    })

    it("withdraw from account 1", async () => {
        const took = await instance.WithdrawToken.call(poolId)
        const result = await instance.getWithdrawableAmount(poolId)
        assert.equal(result.toString(), took.toString())
    })
})
