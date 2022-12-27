const LockedDealV2 = artifacts.require("LockedDealV2")
const TestToken = artifacts.require("ERC20Token")
const truffleAssert = require("truffle-assertions")
const constants = require("@openzeppelin/test-helpers/src/constants.js")
const { poolTime } = require("./helper.js")

contract("Fail Create Pool", (accounts) => {
    let instance,
        Token,
        fromAddress = accounts[0]
    let date, future, startTime, finishTime, cliffTime
    const poolAmount = 100
    const owner = accounts[6]

    before(async () => {
        instance = await LockedDealV2.new()
        Token = await TestToken.new("TestToken", "TEST")
        ;({ startTime, cliffTime, finishTime } = poolTime())
        future = startTime
    })

    it("Fail to Create Pool when approval is not given", async () => {
        await truffleAssert.reverts(
            instance.CreateNewPool(Token.address, startTime, cliffTime, finishTime, poolAmount, fromAddress),
            "no allowance"
        )
    })

    it("Failed to get data when pool does not exist", async () => {
        await truffleAssert.reverts(instance.GetPoolsData([55], { from: accounts[1] }), "Pool does not exist")
    })

    it("Fail to Create Pool when StartTime is greater than FinishTime", async () => {
        date = new Date()
        date.setDate(date.getDate() + 1)
        startTime = Math.floor(date.getTime() / 1000)
        finishTime = startTime - 1
        await Token.approve(instance.address, constants.MAX_UINT256)
        await truffleAssert.reverts(
            instance.CreateNewPool(Token.address, startTime, cliffTime, finishTime, poolAmount, fromAddress),
            "StartTime is greater than FinishTime"
        )
    })

    it("Fail to Create Mass Pool when array length not equal", async () => {
        await truffleAssert.reverts(
            instance.CreateMassPools(
                Token.address,
                [startTime, startTime],
                [startTime, startTime],
                [finishTime, finishTime],
                [poolAmount, poolAmount],
                [accounts[0]]
            ),
            "Date Array Invalid"
        )
        await truffleAssert.reverts(
            instance.CreateMassPools(
                Token.address,
                [startTime],
                [startTime],
                [finishTime, finishTime],
                [poolAmount, poolAmount],
                [accounts[0], accounts[1]]
            ),
            "Date Array Invalid"
        )
        await truffleAssert.reverts(
            instance.CreateMassPools(
                Token.address,
                [startTime, startTime],
                [startTime, startTime],
                [finishTime, finishTime],
                [poolAmount],
                [accounts[0], accounts[1]]
            ),
            "Amount Array Invalid"
        )
    })

    it("Fail to Create Wrt Time Pool when array length not equal", async () => {
        await truffleAssert.reverts(
            instance.CreatePoolsWrtTime(
                Token.address,
                [startTime, startTime],
                [startTime, startTime],
                [finishTime, finishTime],
                [poolAmount],
                [accounts[0], accounts[1]]
            ),
            "Amount Array Invalid"
        )
        await truffleAssert.reverts(
            instance.CreatePoolsWrtTime(
                Token.address,
                [startTime],
                [startTime],
                [finishTime, finishTime],
                [poolAmount, poolAmount],
                [accounts[0], accounts[1]]
            ),
            "Date Array Invalid"
        )
    })

    it("Fail to Create Pool when maxTransactionLimit is exceeded", async () => {
        let ownerArray = [],
            startArray = [],
            finishArray = [],
            amountArray = []
        for (let i = 0; i < 401; i++) {
            ownerArray.push(owner)
            startArray.push(future)
            finishArray.push(future + 60 * 60 * 24)
            amountArray.push(poolAmount)
        }
        await truffleAssert.reverts(
            instance.CreateMassPools(Token.address, startArray, startArray, finishArray, amountArray, ownerArray),
            "Invalid array length limit"
        )
    })

    it("Fail to Create Pool wrt Time when max limit is exceeded", async () => {
        let ownerArray = [],
            startTime = [],
            cliffTime = [],
            finishTime = [],
            amountArray = []
        for (let i = 0; i < 41; i++) {
            ownerArray.push(owner)
            amountArray.push(poolAmount)
        }
        for (let i = 1; i <= 10; i++) {
            startTime.push(future + i * 3600)
            finishTime.push(future + i * 3600 + 60 * 60)
        }
        cliffTime = startTime
        await truffleAssert.reverts(
            instance.CreatePoolsWrtTime(Token.address, startTime, cliffTime, finishTime, amountArray, ownerArray),
            "Invalid array length limit"
        )
    })
})
