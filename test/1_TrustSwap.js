const LockedDealV2 = artifacts.require("LockedDealV2")
const TestToken = artifacts.require("ERC20Token")
const { assert } = require("chai")
const constants = require("@openzeppelin/test-helpers/src/constants.js")
const { poolTime } = require("./helper.js")

contract("LockedDealV2", (accounts) => {
    let instance, Token, poolId
    const poolAmount = 10000,
        owner = accounts[2]

    before(async () => {
        instance = await LockedDealV2.deployed()
        Token = await TestToken.new("TestToken", "TEST")
    })

    it("Lock 1 test token for account2 from acount 0", async () => {
        await Token.approve(instance.address, constants.MAX_UINT256)
        const { startTime, cliffTime, finishTime } = poolTime()
        const tx = await instance.CreateNewPool(Token.address, startTime, cliffTime, finishTime, poolAmount, owner)
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
        const { startTime, cliffTime, finishTime } = poolTime()
        const tx = await instance.CreateNewPool(Token.address, startTime, cliffTime, finishTime, poolAmount, accounts[1])
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
