const LockedDealV2 = artifacts.require("LockedDealV2")
const TestToken = artifacts.require("ERC20Token")
const WhiteList = artifacts.require("WhiteList")
const truffleAssert = require('truffle-assertions')

contract('Fail Create Pool', accounts => {
    let instance, Token, fromAddress = accounts[0]
    let date, future, startTime, finishTime
    let whiteList
    const allow = 100

    before(async () => {
        instance = await LockedDealV2.new()
        Token = await TestToken.new('TestToken', 'TEST')
        whiteList = await WhiteList.new()
        await instance.setWhiteListAddress(whiteList.address)
        date = new Date()
        date.setDate(date.getDate() + 1)
        future = Math.floor(date.getTime() / 1000)
        startTime = future
        finishTime = future + 60 * 60 * 24 * 30
    })

    it('Fail to Create Pool when approval is not given', async () => {
        await truffleAssert.reverts(instance.CreateNewPool(Token.address, startTime, finishTime, allow, fromAddress, { from: fromAddress }), "no allowance")
    })

    it('Fail to Create Pool when Time array length is Zero', async () => {
        await Token.approve(instance.address, 100, { from: fromAddress })
        await truffleAssert.reverts(instance.CreatePoolsWrtTime(Token.address, [], [], [100], [accounts[6]], { from: fromAddress }), "Array length should be greater than zero")
    })

    it('Fail to Create Pool when maxTransactionLimit is exceeded', async () => {
        const allow = 1
        const owner = accounts[6]
        let date = new Date()
        date.setDate(date.getDate() + 1)
        const future = Math.floor(date.getTime() / 1000)
        let ownerArray = [], startArray = [], finishArray = [], amountArray = []
        await Token.approve(instance.address, allow * 401, { from: fromAddress })
        for (let i = 0; i < 401; i++) {
            ownerArray.push(owner)
            startArray.push(future)
            finishArray.push(future + 60 * 60 * 24)
            amountArray.push(allow)
        }
        await truffleAssert.reverts(instance.CreateMassPools(Token.address, startArray, finishArray, amountArray, ownerArray, { from: fromAddress }), "Max array length limit exceeded")
    })

    it('Fail to Create Pool wrt Time when max limit is exceeded', async () => {
        const allow = 1
        const owner = accounts[6]
        let date = new Date()
        date.setDate(date.getDate() + 1)
        const future = Math.floor(date.getTime() / 1000)
        let ownerArray = [], startTime = [], finishTime = [], amountArray = []
        await Token.approve(instance.address, allow * 410, { from: fromAddress })
        for (let i = 0; i < 41; i++) {
            ownerArray.push(owner)
            amountArray.push(allow)
        }
        for (let i = 1; i <= 10; i++) {
            startTime.push(future + i * 3600)
            finishTime.push(future + i * 3600 + 60 * 60)
        }
        await truffleAssert.reverts(instance.CreatePoolsWrtTime(Token.address, startTime, finishTime, amountArray, ownerArray, { from: fromAddress }), "Max array length limit exceeded")
    })

    it('Fail to Create Pool when whitelist filter activated', async () => {
        await instance.swapTokenFilter()
        const owner = accounts[1]
        const now = Date.now()
        const timestamp = Number(now.toFixed()) + 3600
        const id = await whiteList.CreateManualWhiteList.call(timestamp, instance.address)
        await instance.setTokenFilterWhiteListId(id)
        await Token.approve(instance.address, allow)
        await truffleAssert.reverts(instance.CreateNewPool(Token.address, startTime, finishTime, allow, owner), "Need Valid ERC20 Token")
    })
})