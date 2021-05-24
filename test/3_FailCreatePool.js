const LockedDeal = artifacts.require("LockedDeal");
const TestToken = artifacts.require("Token");
const truffleAssert = require('truffle-assertions');

contract('Fail Create Pool', accounts => {
    let instance, Token, fromAddress = accounts[0]

    before(async () => {
        instance = await LockedDeal.new()
        Token = await TestToken.new('TestToken', 'TEST')
    })

    it('Fail to Create Pool when approval is not given', async () => {
        let date = new Date()
        date.setDate(date.getDate() + 1)
        const future = Math.floor(date.getTime() / 1000)
        await truffleAssert.reverts(instance.CreateNewPool(Token.address, future, 100, fromAddress, {from:fromAddress}))
    })

    it('Fail to Create Pool when Time array length is Zero', async () => {
        await Token.approve(instance.address , 100, { from: fromAddress })
        await truffleAssert.reverts(instance.CreatePoolsWrtTime(Token.address, [], [100], [accounts[6]], {from: fromAddress}), "Array length should be greater than zero" )
    })

    it('Fail to Create Pool when maxTransactionLimit is exceeded', async () => {
        const allow = 1
        const owner = accounts[6]
        let date = new Date()
        date.setDate(date.getDate() + 1)
        const future = Math.floor(date.getTime() / 1000)
        let ownerArray = [], futureArray = [], amountArray=[]
        await Token.approve(instance.address , allow * 401, { from: fromAddress })
        for(let i=0 ; i<401 ; i++){
            ownerArray.push(owner)
            futureArray.push(future)
            amountArray.push(allow)
        }
        await truffleAssert.reverts(instance.CreateMassPools(Token.address, futureArray, amountArray, ownerArray, {from:fromAddress}), "Max array length limit exceeded")
    })

    it('Fail to Create Pool wrt Time when max limit is exceeded', async () => {
        const allow = 1
        const owner = accounts[6]
        let date = new Date()
        date.setDate(date.getDate() + 1)
        const future = Math.floor(date.getTime() / 1000)
        let ownerArray = [], futureArray = [], amountArray=[]
        await Token.approve(instance.address , allow * 410, { from: fromAddress })
        for(let i=0 ; i<41 ; i++){
            ownerArray.push(owner)
            amountArray.push(allow)
        }
        for(let i=1 ; i<=10 ; i++){
            futureArray.push(future + i*3600)
        }
        await truffleAssert.reverts(instance.CreatePoolsWrtTime(Token.address, futureArray, amountArray, ownerArray, {from:fromAddress}), "Max array length limit exceeded")
    })
})