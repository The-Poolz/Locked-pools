const LockedDealV2 = artifacts.require("LockedDealV2");
const TestToken = artifacts.require("ERC20Token");
const truffleAssert = require('truffle-assertions');

contract('Pools - events', (accounts) => {
  let lockedDeal;
  let testToken;

  let fromAddress = accounts[0];
  let owner = accounts[9];

  let poolId;
  let allow = 100;
  let result;

  before(async () => {
    lockedDeal = await LockedDealV2.new();
    testToken = await TestToken.new("test", 'tst');
  });

  describe('TokenWithdrawn event is emitted', async () => {

    before(async () => {
      await testToken.approve(lockedDeal.address, allow, { from: fromAddress });

      let date = new Date();
      date.setDate(date.getDate() - 1);
      const startTime = Math.floor(date.getTime() / 1000);
      const finishTime = startTime + 60 * 60 * 24

      const tx = await lockedDeal.CreateNewPool(testToken.address, startTime, finishTime, allow, owner, { from: fromAddress });
      poolId = tx.logs[1].args.PoolId;
    });

    it('TokenWithdrawn event is emitted', async () => {
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

      const startTime = Math.floor(date.getTime() / 1000);
      const finishTime = startTime + 60 * 60 * 24
      const owner = accounts[1];
      const tx = await lockedDeal.CreateNewPool(testToken.address, startTime, finishTime, allow, owner, { from: fromAddress });
      const poolId = tx.logs[1].args.PoolId;

      result = tx;
    });

    it('NewPoolCreated event is emitted', async () => {
      // Check event
      truffleAssert.eventEmitted(result, 'NewPoolCreated');
    });

  });

  describe('Pool transfer event is emitted', async () => {

    before(async () => {
      await testToken.approve(lockedDeal.address, allow, { from: fromAddress });

      let date = new Date();
      date.setDate(date.getDate() + 1);

      let startTime = Math.floor(date.getTime() / 1000);
      let finishTime = startTime + 60 * 60 * 24
      await lockedDeal.CreateNewPool(testToken.address, startTime, finishTime, allow, owner, { from: fromAddress });
      // poolId = tx.logs[1].args.PoolId

      await testToken.approve(lockedDeal.address, allow, { from: fromAddress });
      // let date = new Date()
      date.setDate(date.getDate() + 1);
      startTime = Math.floor(date.getTime() / 1000);
      finishTime = startTime + 60 * 60 * 24
      const tx = await lockedDeal.CreateNewPool(testToken.address, startTime, finishTime, allow, owner, { from: fromAddress });
      poolId = tx.logs[1].args.PoolId;
    });

    it('Pool transfer event is emitted', async () => {
      const newOwner = accounts[8];

      result = await lockedDeal.PoolTransfer(poolId, newOwner, { from: owner });
      // Check event
      truffleAssert.eventEmitted(result, 'PoolTransferred');
    });

  });

  describe('PoolApproval event is emitted', async () => {

    const approvalAmount = 10;
    const spender = accounts[1];

    before(async () => {
      await testToken.approve(lockedDeal.address, allow, { from: fromAddress });

      let date = new Date();
      date.setDate(date.getDate() + 1);

      const startTime = Math.floor(date.getTime() / 1000);
      const finishTime = startTime + 60 * 60 * 24
      const tx = await lockedDeal.CreateNewPool(testToken.address, startTime, finishTime, allow, owner, { from: fromAddress });
      poolId = tx.logs[1].args.PoolId;
    });

    it('PoolApproval event is emitted', async () => {
      result = await lockedDeal.ApproveAllowance(poolId, approvalAmount, spender, { from: owner });
      // Check event
      truffleAssert.eventEmitted(result, 'PoolApproval');
    });

  });

  describe('PoolSplit event is emitted', async () => {
    const amount = 10;

    before(async () => {
      allow -= amount;

      await testToken.approve(lockedDeal.address, allow, { from: fromAddress });

      let date = new Date();
      date.setDate(date.getDate() + 1);

      const startTime = Math.floor(date.getTime() / 1000);
      const finishTime = startTime + 60 * 60 * 24

      const tx = await lockedDeal.CreateNewPool(testToken.address, startTime, finishTime, allow, owner, { from: fromAddress });
      poolId = tx.logs[1].args.PoolId;
    });

    it('PoolSplit event is emitted', async () => {
      result = await lockedDeal.SplitPoolAmount(poolId, amount, owner, { from: owner });
      // Check event
      truffleAssert.eventEmitted(result, 'PoolSplit');
    });

  });

});