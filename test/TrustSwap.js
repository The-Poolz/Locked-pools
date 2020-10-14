const TrustSwap = artifacts.require("TrustSwap");
const TestToken = artifacts.require("TestToken");
const { assert } = require('chai');
//const truffleAssert = require('truffle-assertions');

contract('TrustSwap', (accounts) => {
  it('Lock 1 test token for account2 from acount 0', async () => {
    const allow = 1;
    let Token = await TestToken.deployed();
    let instance = await TrustSwap.deployed();
    await Token.approve(instance.address , allow, { from: accounts[0] });
    let date = new Date();
    date.setDate(date.getDate() + 1);   // add a day
    await instance.CreatePool(Token.address,Math.floor(date.getTime() / 1000),allow,accounts[2]);
    let mypoolz = await instance.GetMyPoolsId({ from: accounts[2] });
    console.log(mypoolz    );
    assert.equal(mypoolz.length, 1);
  });
 /* it('revert on withdraw from account 2', async () => {
  });
  it('open new pool for account 1 ', async () => {
  });
  it('withdraw from account 1', async () => {
  });*/
});
