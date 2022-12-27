const LockedDealV2 = artifacts.require("LockedDealV2")
const TestToken = artifacts.require("ERC20Token")
const { assert } = require("chai")
const timeMachine = require("ganache-time-traveler")
const truffleAssert = require("truffle-assertions")
const constants = require("@openzeppelin/test-helpers/src/constants.js")
const BigNumber = require("bignumber.js")
const { poolTime } = require("./helper.js")

contract("Access to Locked Deal", (accounts) => {
    let instance,
        Token,
        owner = accounts[9],
        poolId,
        poolAmount = 100
    const splittingAmount = 25

    before(async () => {
        instance = await LockedDealV2.new()
        Token = await TestToken.new("TestToken", "TEST")
        await Token.approve(instance.address, constants.MAX_UINT256)
        const { startTime, cliffTime, finishTime } = poolTime()
        await instance.CreateNewPool(Token.address, startTime, cliffTime, finishTime, poolAmount, owner)
        const tx = await instance.CreateNewPool(Token.address, startTime, cliffTime, finishTime, poolAmount, owner)
        poolId = tx.logs[1].args.PoolId
    })

    it("Pool Transfer", async () => {
        const newOwner = accounts[8]
        poolId = 1
        await instance.TransferPoolOwnership(poolId, newOwner, { from: owner })
        poolId++
        const pool = await instance.AllPoolz(poolId, { from: newOwner })
        const newPools = await instance.GetAllMyPoolsId(newOwner, { from: newOwner })
        assert.equal(newPools[0].toString(), poolId)
        assert.equal(pool[5], newOwner)
        owner = newOwner
    })

    it("Split Pool Amount with owner address", async () => {
        const { startTime, cliffTime, finishTime } = poolTime()
        let tx = await instance.CreateNewPool(Token.address, startTime, cliffTime, finishTime, poolAmount, owner)
        poolId = tx.logs[1].args.PoolId
        tx = await instance.SplitPoolAmount(poolId, splittingAmount, owner, { from: owner })
        const pid = tx.logs[0].args.PoolId
        const pool = await instance.AllPoolz(poolId, { from: owner })
        const newPool = await instance.AllPoolz(pid, { from: owner })
        assert.equal(BigNumber.sum(newPool.StartAmount, pool.StartAmount).toString(), poolAmount.toString())
        assert.equal(newPool.DebitedAmount.toString(), "0")
    })

    it("Split Pool Amount with new address", async () => {
        const approvedAddress = accounts[7]
        const fullPoolsAmount = await instance.AllPoolz(poolId, { from: owner })
        const tx = await instance.SplitPoolAmount(poolId, splittingAmount, approvedAddress, { from: owner })
        const pid = tx.logs[0].args.PoolId
        const pool = await instance.AllPoolz(poolId, { from: owner })
        const newPool = await instance.AllPoolz(pid, { from: approvedAddress })
        assert.equal(fullPoolsAmount.StartAmount, BigNumber.sum(newPool.StartAmount, pool.StartAmount).toString())
        assert.equal(newPool.DebitedAmount.toString(), "0")
        assert.equal(pool.DebitedAmount.toString(), "0")
    })

    it("returns new pool id", async () => {
        const pid = await instance.SplitPoolAmount.call(poolId, splittingAmount, owner, { from: owner })
        const tx = await instance.SplitPoolAmount(poolId, splittingAmount, owner, { from: owner })
        assert.equal(pid.toString(), tx.logs[0].args.PoolId.toString())
    })

    describe("Giving approval and splitting pool", () => {
        const approvalAmount = 10,
            spender = accounts[1]

        it("giving approval", async () => {
            const { startTime, cliffTime, finishTime } = poolTime()
            let tx = await instance.CreateNewPool(Token.address, startTime, cliffTime, finishTime, poolAmount, owner)
            poolId = tx.logs[1].args.PoolId
            await instance.ApproveAllowance(poolId, approvalAmount, spender, { from: owner })
            const amount = await instance.Allowance(poolId, spender)
            const dataOwner = await instance.AllPoolz(poolId, { from: owner })
            const dataSpender = await instance.AllPoolz(poolId, { from: spender })
            assert.equal(approvalAmount, amount)
            assert.deepEqual(dataOwner, dataSpender)
        })

        it("spliting pool from approved address", async () => {
            const { startTime, cliffTime, finishTime } = poolTime()
            let tx = await instance.CreateNewPool(Token.address, startTime, cliffTime, finishTime, poolAmount, owner)
            const newOwner = accounts[2]
            await instance.ApproveAllowance(poolId, approvalAmount, spender, { from: owner })
            tx = await instance.SplitPoolAmountFrom(poolId, approvalAmount, newOwner, { from: spender })
            const newPoolId = tx.logs[0].args.PoolId
            const splitPool = await instance.AllPoolz(newPoolId)
            const pool = await instance.AllPoolz(poolId)
            assert.equal(poolAmount, BigNumber.sum(splitPool.StartAmount, pool.StartAmount).toString())
        })
    })

    describe("Fail Tests", () => {
        it("Fail to transfer ownership when called from wrong address", async () => {
            await truffleAssert.reverts(instance.TransferPoolOwnership(poolId, accounts[5]), "You are not Pool Owner")
            await truffleAssert.reverts(
                instance.TransferPoolOwnership(poolId, accounts[8], { from: accounts[8] }),
                "Can't be the same owner"
            )
        })

        it("Fail to Create Pool with 0 address owner", async () => {
            const { startTime, cliffTime, finishTime } = poolTime()
            await truffleAssert.reverts(
                instance.CreateNewPool(
                    Token.address,
                    startTime,
                    cliffTime,
                    finishTime,
                    poolAmount,
                    constants.ZERO_ADDRESS
                ),
                "Zero Address is not allowed"
            )
        })

        it("Fail to transfer ownership to 0 address", async () => {
            await truffleAssert.reverts(
                instance.TransferPoolOwnership(poolId, constants.ZERO_ADDRESS, { from: owner }),
                "Zero Address is not allowed"
            )
        })

        it("Fail to split pool when balance is not enough", async () => {
            const data = await instance.AllPoolz(poolId, { from: owner })
            const invalidAmount = data.StartAmount + 1
            await truffleAssert.reverts(
                instance.SplitPoolAmount(poolId, invalidAmount, owner, { from: owner }),
                "Not Enough Amount Balance"
            )
        })

        it("Not enough Allowance when split pool amount", async () => {
            const approvalAmount = 100
            await truffleAssert.reverts(
                instance.SplitPoolAmountFrom(poolId, approvalAmount, accounts[2], { from: owner }),
                "Not enough Allowance"
            )
        })

        it("Fail to execute when Pool ID is invalid", async () => {
            const invalidId = 99
            await truffleAssert.reverts(
                instance.TransferPoolOwnership(invalidId, accounts[5], { from: owner }),
                "Pool does not exist"
            )
        })

        it("Failed to split pool after withdrawing", async () => {
            const { startTime, cliffTime, finishTime } = poolTime()
            await timeMachine.advanceBlockAndSetTime(finishTime)
            await instance.WithdrawToken(poolId)
            const data = await instance.AllPoolz(poolId, { from: owner })
            const amount = data[3]
            await truffleAssert.reverts(
                instance.SplitPoolAmount(poolId, amount, owner, { from: owner }),
                "Not Enough Amount Balance"
            )
            await timeMachine.advanceBlockAndSetTime(Math.floor(Date.now() / 1000))
        })
    })
})
