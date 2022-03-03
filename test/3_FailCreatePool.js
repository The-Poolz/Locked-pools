const LockedDeal = artifacts.require("LockedDeal");
const TestToken = artifacts.require("Token");
const truffleAssert = require('truffle-assertions');

contract('Fail Create Pool', accounts => {
    let instance, Token, FeeToken
    const fromAddress = accounts[0]

    before(async () => {
        instance = await LockedDeal.new()
        Token = await TestToken.new('TestToken', 'TEST')
        FeeToken = await TestToken.new('FeeToken', 'FEE')
        await instance.swapTokenFilter()
        await instance.swapUserFilter()
        await instance.SetTokenFee(FeeToken.address, '20')
    })

    it('Fail to Create Pool when approval is not given', async () => {
        let date = new Date()
        date.setDate(date.getDate() + 1)
        const future = Math.floor(date.getTime() / 1000)
        const startTime = future
        const finishTime = future + 60 * 60 * 24 * 30
        await truffleAssert.reverts(instance.CreateNewPoolERC20(Token.address, startTime, finishTime, 100, fromAddress, FeeToken.address), "no allowance")
        await truffleAssert.reverts(instance.CreateNewPoolMain(Token.address, startTime, finishTime, 100, fromAddress), "no allowance")
    })

    it('Fail to Create Pool when Time array length is Zero', async () => {
        await Token.approve(instance.address, 100, { from: fromAddress })
        await FeeToken.approve(instance.address, 100, { from: fromAddress })
        await truffleAssert.reverts(instance.CreatePoolsWrtTimeMain(Token.address, [], [], [100], [accounts[6]], { from: fromAddress }), "Array length should be greater than zero")
        await truffleAssert.reverts(instance.CreatePoolsWrtTimeERC20(Token.address, [], [], [100], [accounts[6]], FeeToken.address, { from: fromAddress }), "Array length should be greater than zero")
    })

    it('Fail to Create Pool when maxTransactionLimit is exceeded', async () => {
        const allow = 1
        const owner = accounts[6]
        let date = new Date()
        date.setDate(date.getDate() + 1)
        const future = Math.floor(date.getTime() / 1000)
        let ownerArray = [], startArray = [], finishArray = [], amountArray = []
        await Token.approve(instance.address, allow * 401, { from: fromAddress })
        await FeeToken.approve(instance.address, allow * 401, { from: fromAddress })
        for (let i = 0; i < 401; i++) {
            ownerArray.push(owner)
            startArray.push(future)
            finishArray.push(future + 60 * 60 * 24)
            amountArray.push(allow)
        }
        await truffleAssert.reverts(instance.CreateMassPoolsERC20(Token.address, startArray, finishArray, amountArray, ownerArray, FeeToken.address, { from: fromAddress }), "Max array length limit exceeded")
        await truffleAssert.reverts(instance.CreateMassPoolsMain(Token.address, startArray, finishArray, amountArray, ownerArray, { from: fromAddress }), "Max array length limit exceeded")
    })

    it('Fail to Create Pool wrt Time when max limit is exceeded', async () => {
        const allow = 1
        const owner = accounts[6]
        let date = new Date()
        date.setDate(date.getDate() + 1)
        const future = Math.floor(date.getTime() / 1000)
        let ownerArray = [], startTime = [], finishTime = [], amountArray = []
        await Token.approve(instance.address, allow * 410, { from: fromAddress })
        await FeeToken.approve(instance.address, allow * 410, { from: fromAddress })
        for (let i = 0; i < 41; i++) {
            ownerArray.push(owner)
            amountArray.push(allow)
        }
        for (let i = 1; i <= 10; i++) {
            startTime.push(future + i * 3600)
            finishTime.push(future + i * 3600 + 60 * 60)
        }
        await truffleAssert.reverts(instance.CreatePoolsWrtTimeERC20(Token.address, startTime, finishTime, amountArray, ownerArray, FeeToken.address), "Max array length limit exceeded")
        await truffleAssert.reverts(instance.CreatePoolsWrtTimeMain(Token.address, startTime, finishTime, amountArray, ownerArray), "Max array length limit exceeded")
    })
})