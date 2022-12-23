const LockedDealV2 = artifacts.require("LockedDealV2")
const TestToken = artifacts.require("ERC20Token")
const truffleAssert = require("truffle-assertions")
const constants = require("@openzeppelin/test-helpers/src/constants.js")

contract("Pools - events", (accounts) => {
    let lockedDeal
    let testToken

    let fromAddress = accounts[0]
    let owner = accounts[9]

    let poolId
    let allow = 100
    let result

    before(async () => {
        lockedDeal = await LockedDealV2.new()
        testToken = await TestToken.new("test", "tst")
        await testToken.approve(lockedDeal.address, constants.MAX_UINT256, { from: fromAddress })
    })

    describe("TokenWithdrawn event is emitted", async () => {
        before(async () => {
            let date = new Date()
            date.setDate(date.getDate() - 1)
            const startTime = Math.floor(date.getTime() / 1000)
            const finishTime = startTime + 60 * 60 * 24

            const tx = await lockedDeal.CreateNewPool(testToken.address, startTime, startTime, finishTime, allow, owner, {
                from: fromAddress
            })
            poolId = tx.logs[1].args.PoolId
        })

        it("TokenWithdrawn event is emitted", async () => {
            result = await lockedDeal.WithdrawToken(poolId.toNumber())
            // Check event
            truffleAssert.eventEmitted(result, "TokenWithdrawn")
        })
    })

    describe("NewPoolCreated event is emitted", async () => {
        before(async () => {
            let date = new Date()
            date.setDate(date.getDate() + 1)

            const startTime = Math.floor(date.getTime() / 1000)
            const finishTime = startTime + 60 * 60 * 24
            const owner = accounts[1]
            const tx = await lockedDeal.CreateNewPool(testToken.address, startTime, startTime, finishTime, allow, owner, {
                from: fromAddress
            })

            result = tx
        })

        it("NewPoolCreated event is emitted", async () => {
            // Check event
            truffleAssert.eventEmitted(result, "NewPoolCreated")
        })
    })

    describe("Pool transfer event is emitted", async () => {
        before(async () => {
            let date = new Date()
            date.setDate(date.getDate() + 1)

            let startTime = Math.floor(date.getTime() / 1000)
            let finishTime = startTime + 60 * 60 * 24
            await lockedDeal.CreateNewPool(testToken.address, startTime, startTime, finishTime, allow, owner, {
                from: fromAddress
            })
            date.setDate(date.getDate() + 1)
            startTime = Math.floor(date.getTime() / 1000)
            finishTime = startTime + 60 * 60 * 24
            const tx = await lockedDeal.CreateNewPool(testToken.address, startTime, startTime, finishTime, allow, owner, {
                from: fromAddress
            })
            poolId = tx.logs[1].args.PoolId
        })

        it("Pool transfer event is emitted", async () => {
            const newOwner = accounts[8]

            result = await lockedDeal.TransferPoolOwnership(poolId, newOwner, { from: owner })
            // Check event
            truffleAssert.eventEmitted(result, "PoolTransferred")
        })
    })

    describe("PoolApproval event is emitted", async () => {
        const approvalAmount = 10
        const spender = accounts[1]

        before(async () => {
            let date = new Date()
            date.setDate(date.getDate() + 1)

            const startTime = Math.floor(date.getTime() / 1000)
            const finishTime = startTime + 60 * 60 * 24
            const tx = await lockedDeal.CreateNewPool(testToken.address, startTime, startTime, finishTime, allow, owner, {
                from: fromAddress
            })
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
            allow -= amount

            let date = new Date()
            date.setDate(date.getDate() + 1)

            const startTime = Math.floor(date.getTime() / 1000)
            const finishTime = startTime + 60 * 60 * 24

            const tx = await lockedDeal.CreateNewPool(testToken.address, startTime, startTime, finishTime, allow, owner, {
                from: fromAddress
            })
            poolId = tx.logs[1].args.PoolId
        })

        it("PoolSplit event is emitted", async () => {
            result = await lockedDeal.SplitPoolAmount(poolId, amount, owner, { from: owner })
            // Check event
            truffleAssert.eventEmitted(result, "PoolSplit")
        })
    })
})
