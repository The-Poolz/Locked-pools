const LockedDealV2 = artifacts.require("LockedDealV2")
const TestToken = artifacts.require("ERC20Token")
const truffleAssert = require("truffle-assertions")
const constants = require("@openzeppelin/test-helpers/src/constants.js")
const { poolTime } = require("./helper.js")
const timeMachine = require("ganache-time-traveler")

contract("Pools - events", (accounts) => {
    let lockedDeal
    let testToken

    let fromAddress = accounts[0]
    let owner = accounts[9]

    let poolId
    let poolAmount = 100
    let result

    before(async () => {
        lockedDeal = await LockedDealV2.new()
        testToken = await TestToken.new("test", "tst")
        await testToken.approve(lockedDeal.address, constants.MAX_UINT256, { from: fromAddress })
    })

    describe("TokenWithdrawn event is emitted", async () => {
        before(async () => {
            const { startTime, cliffTime, finishTime } = poolTime()
            const tx = await lockedDeal.CreateNewPool(testToken.address, startTime, cliffTime, finishTime, poolAmount, owner)
            poolId = tx.logs[1].args.PoolId
        })

        it("TokenWithdrawn event is emitted", async () => {
            const finishTime = await lockedDeal.AllPoolz(poolId)
            await timeMachine.advanceBlockAndSetTime(parseInt(finishTime.FinishTime))
            result = await lockedDeal.WithdrawToken(poolId.toNumber())
            // Check event
            truffleAssert.eventEmitted(result, "TokenWithdrawn")
        })
    })

    describe("NewPoolCreated event is emitted", async () => {
        before(async () => {
            const { startTime, cliffTime, finishTime } = poolTime()
            const owner = accounts[1]
            const tx = await lockedDeal.CreateNewPool(testToken.address, startTime, cliffTime, finishTime, poolAmount, owner)
            result = tx
        })

        it("NewPoolCreated event is emitted", async () => {
            // Check event
            truffleAssert.eventEmitted(result, "NewPoolCreated")
        })
    })

    describe("Pool transfer event is emitted", async () => {
        before(async () => {
            const { startTime, cliffTime, finishTime } = poolTime()
            await lockedDeal.CreateNewPool(testToken.address, startTime, cliffTime, finishTime, poolAmount, owner)
            const tx = await lockedDeal.CreateNewPool(testToken.address, startTime, cliffTime, finishTime, poolAmount, owner)
            poolId = tx.logs[1].args.PoolId
        })

        it("Pool transfer event is emitted", async () => {
            const newOwner = accounts[8]
            result = await lockedDeal.TransferPoolOwnership(poolId, newOwner, { from: owner })
            // Check event
            truffleAssert.eventEmitted(result, "PoolSplit")
        })
    })

    describe("PoolApproval event is emitted", async () => {
        const approvalAmount = 10
        const spender = accounts[1]

        before(async () => {
            const { startTime, cliffTime, finishTime } = poolTime()
            const tx = await lockedDeal.CreateNewPool(testToken.address, startTime, cliffTime, finishTime, poolAmount, owner)
            poolId = tx.logs[1].args.PoolId
        })

        it("PoolApproval event is emitted", async () => {
            result = await lockedDeal.ApproveAllowance(poolId, approvalAmount, spender, { from: owner })
            // Check event
            truffleAssert.eventEmitted(result, "PoolApproval")
        })
    })

    describe("PoolSplit event is emitted", async () => {
        const amount = 10

        before(async () => {
            poolAmount -= amount
            const { startTime, cliffTime, finishTime } = poolTime()
            const tx = await lockedDeal.CreateNewPool(testToken.address, startTime, cliffTime, finishTime, poolAmount, owner)
            poolId = tx.logs[1].args.PoolId
        })

        it("PoolSplit event is emitted", async () => {
            result = await lockedDeal.SplitPoolAmount(poolId, amount, owner, { from: owner })
            // Check event
            truffleAssert.eventEmitted(result, "PoolSplit")
        })
    })
})
