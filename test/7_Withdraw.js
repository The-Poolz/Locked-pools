const LockedDealV2 = artifacts.require("LockedDealV2")
const TestToken = artifacts.require("ERC20Token")
const { assert } = require("chai")
const timeMachine = require("ganache-time-traveler")
const constants = require("@openzeppelin/test-helpers/src/constants.js")
const BigNumber = require("bignumber.js")

contract("Withdraw", (accounts) => {
    let instance, Token, fromAddress, poolId
    const owner = accounts[1],
        allow = 10000,
        MyPoolz = []
    const year = 364

    before(async () => {
        instance = await LockedDealV2.new()
        Token = await TestToken.new("TestToken", "TEST")
        fromAddress = await instance.owner()
        await Token.approve(instance.address, constants.MAX_UINT256, { from: fromAddress })
    })

    it("should create a single new pool", async () => {
        const date = new Date()
        const startTime = Math.floor(date.getTime() / 1000)
        date.setDate(date.getDate() + 2)
        const finishTime = Math.floor(date.getTime() / 1000)
        const tx = await instance.CreateNewPool(Token.address, startTime, startTime, finishTime, allow, owner, {
            from: fromAddress
        })
        poolId = tx.logs[1].args.PoolId.toString()
        MyPoolz.push(poolId)
    })
    
    it("get withdrawable amount", async () => {
        const data = await instance.AllPoolz(poolId, { from: owner })
        const startAmount = data[3].toString()
        const debitedAmount = data[4].toString()
        const totalPoolDuration = data[2] - data[0]
        const date = new Date()
        const startTime = Math.floor(date.getTime() / 1000)
        date.setDate(date.getDate() + 1)
        const halfTime = Math.floor(date.getTime() / 1000)
        const timePassed = startTime - halfTime
        const timePassedPermille = timePassed * 1000
        const ratioPermille = timePassedPermille / totalPoolDuration
        const debitableAmount = (startAmount * ratioPermille) / 1000
        await timeMachine.advanceBlockAndSetTime(halfTime)
        const result = await instance.getWithdrawableAmount(poolId)
        const expectedResult = "5000"
        assert.equal((debitedAmount - debitableAmount).toString(), result.toString(), "check debited amount")
        assert.equal(expectedResult, result.toString(), "check return value")
    })

    it("fail to withdraw before cliff time", async () => {
        const amount = 10000
        const date = new Date()
        const startTime = Math.floor(date.getTime() / 1000)
        date.setDate(date.getDate() + year)
        const finishTime = Math.floor(date.getTime() / 1000)
        date.setDate(date.getDate() - year / 2)
        const halfYear = Math.floor(date.getTime() / 1000)
        const oldOwnerBal = new BigNumber(await Token.balanceOf(owner))
        let tx = await instance.CreateNewPool(Token.address, startTime, finishTime, finishTime, amount, owner)
        poolId = tx.logs[1].args.PoolId
        await timeMachine.advanceBlockAndSetTime(halfYear)
        const value = await instance.WithdrawToken.call(poolId)
        await instance.WithdrawToken(poolId)
        let ownerBal = new BigNumber(await Token.balanceOf(owner))
        assert.equal(value.toString(), "0", "check owner balanace")
        assert.equal(oldOwnerBal.toString(), ownerBal.toString(), "check old owner balanace")
        await timeMachine.advanceBlockAndSetTime(finishTime)
        const data = await instance.WithdrawToken(poolId)
        assert.equal(data.logs[data.logs.length - 1].args.Amount.toString(), amount)
        ownerBal = new BigNumber(await Token.balanceOf(owner))
        assert.notEqual(ownerBal.toString(), oldOwnerBal.toString())
        assert.equal(ownerBal.toString(), amount)
    })

    it("finish time < now", async () => {
        const date = new Date()
        const startTime = Math.floor(date.getTime() / 1000)
        date.setDate(date.getDate() + 1)
        const finishTime = Math.floor(date.getTime() / 1000)
        const tx = await instance.CreateNewPool(Token.address, startTime, startTime, finishTime, allow, owner, {
            from: fromAddress
        })
        poolId = tx.logs[1].args.PoolId.toString()
        MyPoolz.push(poolId)
        const data = await instance.AllPoolz(poolId, { from: owner })
        const startAmount = data[3].toString()
        const debitedAmount = data[4].toString()
        date.setDate(date.getDate() + 2)
        const futureTime = Math.floor(date.getTime() / 1000)
        await timeMachine.advanceBlockAndSetTime(futureTime)
        const amount = await instance.WithdrawToken.call(poolId)
        const result = await instance.getWithdrawableAmount(poolId)
        assert.equal(result.toString(), startAmount - debitedAmount, "finish time < now")
        assert.equal(
            amount.toString(),
            result.toString(),
            "WithdrawToken has the same refund amount as getWithdrawableAmount"
        )
    })

    it("now < start time", async () => {
        const date = new Date()
        date.setDate(date.getDate() - 1)
        const backTime = Math.floor(date.getTime() / 1000)
        await timeMachine.advanceBlockAndSetTime(backTime)
        const result = await instance.getWithdrawableAmount(poolId)
        assert.equal("0", result.toString(), "check debited amount")
    })

    it("Withdraw tokens", async () => {
        const date = new Date()
        date.setDate(date.getDate() - 1)
        const startTime = Math.floor(date.getTime() / 1000)
        date.setDate(date.getDate() + 2)
        const finishTime = Math.floor(date.getTime() / 1000)
        const tx = await instance.CreateNewPool(Token.address, startTime, startTime, finishTime, allow, owner, {
            from: fromAddress
        })
        poolId = tx.logs[1].args.PoolId.toString()
        MyPoolz.push(poolId)
        date.setDate(date.getDate() - 1)
        await timeMachine.advanceBlockAndSetTime(Math.floor(date.getTime() / 1000))
        const ids = await instance.GetMyPoolsId(owner, { from: owner })
        const data = await instance.WithdrawToken(poolId)
        const logs = data.logs[1].args
        assert.equal(poolId, logs.PoolId.toString(), "check pool ID")
        assert.equal(owner, logs.Recipient.toString(), "check owner address")
        assert.equal("5000", logs.Amount.toString(), "check token amount")
        assert.equal(ids.toString(), MyPoolz.toString(), "check active pool id")
        await timeMachine.advanceBlockAndSetTime(finishTime)
        await instance.WithdrawToken(MyPoolz[1])
        MyPoolz.splice(1, 1)
        const activeIds = await instance.GetMyPoolsId(owner, { from: owner })
        assert.equal(activeIds.toString(), MyPoolz.toString(), "check active pool id")
    })

    describe("withdraw after pool transfer", () => {
        let startTime, finishTime
        const ownerAddr = accounts[3]
        before(async () => {
            const date = new Date()
            startTime = Math.floor(date.getTime() / 1000)
            date.setDate(date.getDate() + 4)
            finishTime = Math.floor(date.getTime() / 1000)
            const tx = await instance.CreateNewPool(Token.address, startTime, startTime, finishTime, allow, ownerAddr, {
                from: fromAddress
            })
            poolId = tx.logs[1].args.PoolId.toString()
        })

        it("transfer pool and withdraw after 50% time", async () => {
            const newOwner = accounts[5]
            const result = await instance.PoolTransfer(poolId, newOwner, { from: ownerAddr })
            poolId = result.logs[result.logs.length - 1].args.PoolId
            const date = new Date()
            date.setDate(date.getDate() + 2)
            const halfTime = Math.floor(date.getTime() / 1000)
            await timeMachine.advanceBlockAndSetTime(halfTime)
            const oldBal = await Token.balanceOf(newOwner)
            const tx = await instance.WithdrawToken(poolId)
            const currentBal = await Token.balanceOf(newOwner)
            const expectedResult = allow / 2
            assert.equal(oldBal, "0")
            assert.equal(tx.logs[tx.logs.length - 1].args.Amount.toString(), expectedResult, "check amount value")
            assert.equal(currentBal.toString(), expectedResult)
        })

        it("withdraw tokens from inactive pool", async () => {
            poolId = poolId - 1
            const date = new Date()
            date.setDate(date.getDate() + 2)
            const halfTime = Math.floor(date.getTime() / 1000)
            await timeMachine.advanceBlockAndSetTime(halfTime)
            const result = await instance.WithdrawToken.call(poolId)
            const amount = await instance.getWithdrawableAmount(poolId)
            const expectedResult = "0"
            assert.equal(result, 0, "should return zero")
            assert.equal(amount, expectedResult, "check amount value")
        })
    })

    describe("Withdraw after Split Pool Amount", () => {
        it("should split pool to 50% and withdraw 50% amount", async () => {
            const splitOwner = accounts[7]
            const date = new Date()
            const startTime = Math.floor(date.getTime() / 1000)
            date.setDate(date.getDate() + year)
            const finishTime = Math.floor(date.getTime() / 1000)
            let tx = await instance.CreateNewPool(Token.address, startTime, startTime, finishTime, allow, owner, {
                from: fromAddress
            })
            const oldPoolId = tx.logs[1].args.PoolId.toString()
            date.setDate(date.getDate() - year / 2)
            const halfYear = Math.floor(date.getTime() / 1000)
            tx = await instance.SplitPoolAmount(oldPoolId, allow / 2, splitOwner, { from: owner })
            poolId = tx.logs[0].args.PoolId
            const ownerOldBal = new BigNumber(await Token.balanceOf(owner))
            const splitOwnerOldBal = new BigNumber(await Token.balanceOf(splitOwner))
            await timeMachine.advanceBlockAndSetTime(halfYear)
            await instance.WithdrawToken(oldPoolId) // withdraw base pool
            await instance.WithdrawToken(poolId) // withdraw splitted pool
            const ownerBal = new BigNumber(await Token.balanceOf(owner))
            const splitOwnerBal = new BigNumber(await Token.balanceOf(splitOwner))
            assert.equal(
                ownerBal.toString(),
                BigNumber.sum(ownerOldBal, allow / 4).toString(),
                "invalid pool owner balance"
            )
            assert.equal(
                splitOwnerBal.toString(),
                BigNumber.sum(splitOwnerOldBal, allow / 4).toString(),
                "invalid split pool owner balance"
            )
            await timeMachine.advanceBlockAndSetTime(Math.floor(Date.now() / 1000))
        })
    })

    describe("Withdraw after Split Pool Amount From", () => {
        it("should Split Pool Amount From to 50% and withdraw 50%", async () => {
            const spender = accounts[8]
            const date = new Date()
            const startTime = Math.floor(date.getTime() / 1000)
            date.setDate(date.getDate() + year)
            const finishTime = Math.floor(date.getTime() / 1000)
            date.setDate(date.getDate() - year / 2)
            const halfTime = Math.floor(date.getTime() / 1000)
            let tx = await instance.CreateNewPool(Token.address, startTime, startTime, finishTime, allow, owner, {
                from: fromAddress
            })
            const oldPoolId = tx.logs[1].args.PoolId.toString()
            await instance.ApproveAllowance(oldPoolId, allow / 2, spender, { from: owner })
            tx = await instance.SplitPoolAmountFrom(oldPoolId, allow / 2, spender, { from: spender })
            poolId = tx.logs[0].args.PoolId
            const ownerOldBal = new BigNumber(await Token.balanceOf(owner))
            const spenderOldBal = new BigNumber(await Token.balanceOf(spender))
            await timeMachine.advanceBlockAndSetTime(halfTime)
            await instance.WithdrawToken(oldPoolId) // withdraw base pool
            await instance.WithdrawToken(poolId) // withdraw splitted pool
            const ownerBal = new BigNumber(await Token.balanceOf(owner))
            const spenderBal = new BigNumber(await Token.balanceOf(spender))
            assert.equal(
                ownerBal.toString(),
                BigNumber.sum(ownerOldBal, allow / 4).toString(),
                "invalid pool owner balance"
            )
            assert.equal(
                spenderBal.toString(),
                BigNumber.sum(spenderOldBal, allow / 4).toString(),
                "invalid split pool owner balance"
            )
        })
    })

    after(async () => {
        const currentTime = Math.floor(Date.now() / 1000) // unix timestamp in seconds
        await timeMachine.advanceBlockAndSetTime(currentTime)
    })
})
