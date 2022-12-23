const LockedDealV2 = artifacts.require("LockedDealV2")
const TestToken = artifacts.require("ERC20Token")
const { assert } = require("chai")
const timeMachine = require("ganache-time-traveler")
const constants = require("@openzeppelin/test-helpers/src/constants.js")
const BigNumber = require("bignumber.js")

contract("Split Pool", (accounts) => {
    let instance, Token, poolId
    const owner = accounts[7]
    const splitOwner = accounts[9]
    const amount = 1000
    const year = 364

    before(async () => {
        instance = await LockedDealV2.new()
        Token = await TestToken.new("TestToken", "TEST")
        await Token.approve(instance.address, constants.MAX_UINT256)
    })

    it("split pool before cliff time", async () => {
        const date = new Date()
        const startTime = Math.floor(date.getTime() / 1000)
        date.setDate(date.getDate() + year)
        const finishTime = Math.floor(date.getTime() / 1000)
        date.setDate(date.getDate() - year / 2)
        const halfYear = Math.floor(date.getTime() / 1000)
        let tx = await instance.CreateNewPool(Token.address, startTime, halfYear, finishTime, amount, owner)
        poolId = tx.logs[1].args.PoolId
        await timeMachine.advanceBlockAndSetTime(startTime)
        const splitTx = await instance.SplitPoolAmount(poolId, amount / 4, splitOwner, { from: owner })
        const splitPoolId = splitTx.logs[0].args.PoolId
        const splitPoolData = await instance.AllPoolz(splitPoolId)
        assert.equal(splitPoolData.StartTime, startTime)
        assert.equal(splitPoolData.CliffTime, halfYear)
        assert.equal(splitPoolData.FinishTime, finishTime)
        assert.equal(splitPoolData.StartAmount, amount / 4)
        assert.equal(splitPoolData.DebitedAmount, "0")
        assert.equal(splitPoolData.Owner, splitOwner)
        assert.equal(splitPoolData.Token, Token.address)
        const poolData = await instance.AllPoolz(poolId)
        assert.equal(poolData.StartTime, startTime)
        assert.equal(poolData.CliffTime, halfYear)
        assert.equal(poolData.FinishTime, finishTime)
        assert.equal(poolData.StartAmount, amount - amount / 4)
        assert.equal(poolData.DebitedAmount, "0")
        assert.equal(poolData.Owner, owner)
        assert.equal(poolData.Token, Token.address)
    })

    it("Split Pool Amount From before cliff time", async () => {
        const spender = accounts[8]
        const date = new Date()
        const startTime = Math.floor(date.getTime() / 1000)
        date.setDate(date.getDate() + year)
        const finishTime = Math.floor(date.getTime() / 1000)
        date.setDate(date.getDate() - year / 2)
        const halfYear = Math.floor(date.getTime() / 1000)
        let tx = await instance.CreateNewPool(Token.address, startTime, halfYear, finishTime, amount, owner)
        poolId = tx.logs[1].args.PoolId
        await timeMachine.advanceBlockAndSetTime(startTime)
        await instance.ApproveAllowance(poolId, amount / 2, spender, { from: owner })
        tx = await instance.SplitPoolAmountFrom(poolId, amount / 2, spender, { from: spender })
        poolId = tx.logs[0].args.PoolId
        const poolData = await instance.AllPoolz(poolId)
        assert.equal(poolData.StartTime, startTime)
        assert.equal(poolData.CliffTime, halfYear)
        assert.equal(poolData.FinishTime, finishTime)
        assert.equal(poolData.StartAmount, amount / 2)
        assert.equal(poolData.DebitedAmount, "0")
        assert.equal(poolData.Owner, spender)
        assert.equal(poolData.Token, Token.address)
    })

    it("should split after withdraw", async () => {
        const date = new Date()
        const startTime = Math.floor(date.getTime() / 1000)
        date.setDate(date.getDate() + year)
        const finishTime = Math.floor(date.getTime() / 1000)
        date.setDate(date.getDate() - year / 2)
        const halfYear = Math.floor(date.getTime() / 1000)
        let tx = await instance.CreateNewPool(Token.address, startTime, halfYear, finishTime, amount, owner)
        poolId = tx.logs[1].args.PoolId
        const splitOwnerOldBal = new BigNumber(await Token.balanceOf(splitOwner))
        const ownerOldBal = new BigNumber(await Token.balanceOf(owner))
        await timeMachine.advanceBlockAndSetTime(halfYear)
        const data = await instance.WithdrawToken(poolId)
        const withdrawAmount = data.logs[data.logs.length - 1].args.Amount.toString()
        const splitTx = await instance.SplitPoolAmount(poolId, amount / 4, splitOwner, { from: owner })
        const splitPoolId = splitTx.logs[0].args.PoolId.toString()
        let poolData = await instance.AllPoolz(splitPoolId)
        assert.equal(poolData.StartAmount - poolData.DebitedAmount, amount / 4)
        assert.equal(parseInt(poolData.DebitedAmount / 2), parseInt(withdrawAmount / 4))
        assert.equal(poolData.Owner, splitOwner)
        await timeMachine.advanceBlockAndSetTime(finishTime)
        await instance.WithdrawToken(splitPoolId)
        await instance.WithdrawToken(poolId)
        const ownerBal = new BigNumber(await Token.balanceOf(owner))
        const splitOwnerBal = new BigNumber(await Token.balanceOf(splitOwner))
        poolData = await instance.AllPoolz(poolId)
        let splitPoolData = await instance.AllPoolz(splitPoolId)
        assert.equal(
            splitOwnerBal.toString(),
            BigNumber.sum(splitOwnerOldBal, amount / 4).toString(),
            "split owner balance"
        )
        assert.equal(ownerBal.toString(), BigNumber.sum(ownerOldBal, (amount * 3) / 4).toString(), "owner balance")
        assert.equal(BigNumber.sum(splitOwnerBal, ownerBal).toString(), amount.toString(), "check final balance")
        assert.equal(
            BigNumber.sum(poolData.DebitedAmount, splitPoolData.DebitedAmount).toString(),
            amount.toString(),
            "check final debited amount"
        )
        assert.equal(
            BigNumber.sum(poolData.StartAmount, splitPoolData.StartAmount),
            amount.toString(),
            "check start amount"
        )
    })

    describe("TransferPoolOwnership", () => {
        it("transfer pool after withdraw", async () => {
            Token = await TestToken.new("TestToken", "TEST")
            await Token.approve(instance.address, constants.MAX_UINT256)
            const date = new Date()
            const startTime = Math.floor(date.getTime() / 1000)
            date.setDate(date.getDate() + year)
            const finishTime = Math.floor(date.getTime() / 1000)
            date.setDate(date.getDate() - year / 2)
            const halfYear = Math.floor(date.getTime() / 1000)
            let tx = await instance.CreateNewPool(Token.address, startTime, halfYear, finishTime, amount, owner)
            poolId = tx.logs[1].args.PoolId
            await timeMachine.advanceBlockAndSetTime(halfYear)
            await instance.WithdrawToken(poolId)
            let data = await instance.AllPoolz(poolId)
            const result = await instance.TransferPoolOwnership(poolId, splitOwner, { from: owner })
            poolId = result.logs[result.logs.length - 1].args.newPoolId
            let splitdata = await instance.AllPoolz(poolId)
            assert.equal(splitdata.StartAmount.toString(), amount)
            assert.equal(data.StartAmount.toString(), splitdata.StartAmount.toString())
            await timeMachine.advanceBlockAndSetTime(finishTime)
            await instance.WithdrawToken(poolId)
            const splitOwnerOldBal = new BigNumber(await Token.balanceOf(splitOwner))
            const ownerOldBal = new BigNumber(await Token.balanceOf(owner))
            data = await instance.AllPoolz(poolId)
            assert.equal(data.StartAmount.toString(), amount)
            assert.equal(data.DebitedAmount.toString(), amount)
            assert.equal(BigNumber.sum(splitOwnerOldBal, ownerOldBal), amount)
        })
    })

    after(async () => {
        const currentTime = Math.floor(Date.now() / 1000) // unix timestamp in seconds
        await timeMachine.advanceBlockAndSetTime(currentTime)
    })
})
