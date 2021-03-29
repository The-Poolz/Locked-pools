const LockedDeal = artifacts.require("LockedDeal");
const TestToken = artifacts.require("TestToken");
const { assert } = require('chai');
//const truffleAssert = require('truffle-assertions');

contract('LockedDeal', (accounts) => {
  it('Lock 1 test token for account2 from acount 0', async () => {
    const allow = 1;
    let Token = await TestToken.deployed();
    let instance = await LockedDeal.deployed();
    await Token.approve(instance.address , allow, { from: accounts[0] });
    let date = new Date();
    date.setDate(date.getDate() + 1);   // add a day
    await instance.CreateNewPool(Token.address,Math.floor(date.getTime() / 1000),allow,accounts[2]);
    let mypoolz = await instance.GetMyPoolsId({ from: accounts[2] });
    assert.equal(mypoolz.length, 1);
  });
  it('fail  on withdraw from account 2', async () => {
    let instance = await LockedDeal.deployed();
    let took = await instance.WithdrawToken.call(0);
    assert.isFalse(took);
  });
  it('open new pool for account 1 ', async () => {
    const allow = 1;
    let instance = await LockedDeal.deployed();
    let Token = await TestToken.deployed();
    await Token.approve(instance.address , allow, { from: accounts[0] });
    let date = new Date();
    date.setDate(date.getDate() - 1);   // sub a day
    await instance.CreateNewPool(Token.address,Math.floor(date.getTime() / 1000),allow,accounts[1]);
    let mypoolz = await instance.GetMyPoolsId({ from: accounts[1] });
    assert.equal(mypoolz.length, 1);
  });
  it('withdraw from account 1', async () => {
    let instance = await LockedDeal.deployed();
    let took = await instance.WithdrawToken.call(1);
    assert.isTrue(took);
  });
});
