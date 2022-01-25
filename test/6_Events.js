const LockedControl = artifacts.require("LockedControl");
const LockedDeal = artifacts.require("LockedDeal");
const LockedPoolz = artifacts.require("LockedPoolz");
const TestToken = artifacts.require("Token");
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');
const timeMachine = require('ganache-time-traveler');

contract('Pools - events', (accounts) => {
  let lockedControl;
  let lockedDeal;
  let lockedPoolz;
  let testToken;

  let fromAddress = accounts[0];
  let owner = accounts[9];

  let poolId;
  let allow = 100;
  let result;
  let date;

  before(async () => {
    lockedControl = await LockedControl.new();
    lockedDeal = await LockedDeal.new();
    lockedPoolz = await LockedPoolz.new();
    testToken = await TestToken.new("test", 'tst');
  });

  describe('TokenWithdrawn event emitted', async () => {

    before(async () => {
      await testToken.approve(lockedDeal.address, allow, { from: fromAddress });

      let date = new Date();
      date.setDate(date.getDate() - 1);
      let future = Math.floor(date.getTime() / 1000);

      const tx = await lockedDeal.CreateNewPool(testToken.address, future, allow, owner, { from: fromAddress });
      poolId = tx.logs[1].args.PoolId;
    });

    it('TokenWithdrawn event emitted', async () => {
      result = await lockedDeal.WithdrawToken(poolId.toNumber());
      // Check event
      truffleAssert.eventEmitted(result, 'TokenWithdrawn');
    });

  });

  describe('NewPoolCreated event is emitted', async () => {

    before(async () => {
      await testToken.approve(lockedDeal.address, allow, { from: fromAddress });

      let date = new Date();
      date.setDate(date.getDate() + 1);

      const future = Math.floor(date.getTime() / 1000);
      const owner = accounts[1];
      const tx = await lockedDeal.CreateNewPool(testToken.address, future, allow, owner, { from: fromAddress });
      const poolId = tx.logs[1].args.PoolId;

      result = tx;
    });

    it('NewPoolCreated event is emitted', async () => {
      // Check event
      truffleAssert.eventEmitted(result, 'NewPoolCreated');
    });

  });

  describe('PoolOwnershipTransfered event emitted', async () => {

    before(async () => {
      await testToken.approve(lockedDeal.address, allow, { from: fromAddress });

      let date = new Date();
      date.setDate(date.getDate() + 1);

      let future = Math.floor(date.getTime() / 1000);
      await lockedDeal.CreateNewPool(testToken.address, future, allow, owner, { from: fromAddress });
      // poolId = tx.logs[1].args.PoolId

      await testToken.approve(lockedDeal.address, allow, { from: fromAddress });
      // let date = new Date()
      date.setDate(date.getDate() + 1);
      future = Math.floor(date.getTime() / 1000);
      const tx = await lockedDeal.CreateNewPool(testToken.address, future, allow, owner, { from: fromAddress });
      poolId = tx.logs[1].args.PoolId;
    });

    it('PoolOwnershipTransfered event emitted', async () => {
      const newOwner = accounts[8];

      result = await lockedDeal.TransferPoolOwnership(poolId, newOwner, { from: owner });
      // Check event
      truffleAssert.eventEmitted(result, 'PoolOwnershipTransfered');
    });
    
  });

  describe('PoolApproval event emitted', async () => {

    const approvalAmount = 10;
    const spender = accounts[1];

    before(async () => {
      await testToken.approve(lockedDeal.address, allow, { from: fromAddress });

      let date = new Date();
      date.setDate(date.getDate() + 1);

      let future = Math.floor(date.getTime() / 1000);
      const tx = await lockedDeal.CreateNewPool(testToken.address, future, allow, owner, { from: fromAddress });
      poolId = tx.logs[1].args.PoolId;
    });

    it('PoolApproval event emitted', async () => {
      result = await lockedDeal.ApproveAllowance(poolId, approvalAmount, spender, { from: owner });
      // Check event
      truffleAssert.eventEmitted(result, 'PoolApproval');
    });
    
  });

  describe('PoolSplit event emitted', async () => {
    const amount = 10;

    before(async () => {
      allow -= amount;

      await testToken.approve(lockedDeal.address, allow, { from: fromAddress });

      let date = new Date();
      date.setDate(date.getDate() + 1);

      let future = Math.floor(date.getTime() / 1000);

      const tx = await lockedDeal.CreateNewPool(testToken.address, future, allow, owner, { from: fromAddress });
      poolId = tx.logs[1].args.PoolId;
    });

    it('PoolSplit event emitted', async () => {
      result = await lockedDeal.SplitPoolAmount(poolId, amount, owner, { from: owner });
      // Check event
      truffleAssert.eventEmitted(result, 'PoolSplit');
    });
    
  });

});