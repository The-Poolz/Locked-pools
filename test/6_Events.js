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

  before(async () => {
    lockedControl = await LockedControl.new();
    lockedDeal = await LockedDeal.new();
    lockedPoolz = await LockedPoolz.new();
    testToken = await TestToken.new("test", 'tst');
  });

  describe('TokenWithdrawn event emitted', async () => {
    let result;

    before(async () => {
      result = await lockedDeal.WithdrawToken(0);
      // result = await truffleAssert.createTransactionResult(lockedDeal, lockedDeal.transactionHash);
    });

    it('TokenWithdrawn event emitted', async () => {
      // Check event
      console.log(result);
      truffleAssert.eventEmitted(result, 'TokenWithdrawn');
    });

  });

  describe('NewPoolCreated event is emitted', async () => {
    let result;
    // let ownerAddress = lockedPoolz.address;
    // console.log(lockedPoolz);

    before(async () => {
      result = await lockedControl.CreateNewPool(testToken.address, 5, 1, ownerAddress);
      // result = await truffleAssert.createTransactionResult(lockedPoolz, lockedPoolz.transactionHash);
    });

    it('NewPoolCreated event is emitted', async () => {
      // Check event
      truffleAssert.eventEmitted(result, 'NewPoolCreated');
    });

  });

  describe('PoolOwnershipTransfered event emitted', async () => {
    let result;

    before(async () => {
      result = await lockedControl.TransferPoolOwnership();
      // result = await truffleAssert.createTransactionResult(lockedControl, lockedControl.transactionHash);
    });

    it('PoolOwnershipTransfered event emitted', async () => {
      // Check event
      truffleAssert.eventEmitted(result, 'PoolOwnershipTransfered');
    });
    
  });

  describe('PoolApproval event emitted', async () => {
    let result;

    before(async () => {
      result = await lockedControl.ApproveAllowance();
      // result = await truffleAssert.createTransactionResult(lockedControl, lockedControl.transactionHash);
    });

    it('PoolApproval event emitted', async () => {
      // Check event
      truffleAssert.eventEmitted(result, 'PoolApproval');
    });
    
  });

  describe('PoolSplit event emitted', async () => {
    let result;

    before(async () => {
      result = await lockedControl.SplitPoolAmount();
      // result = await truffleAssert.createTransactionResult(lockedPoolz, lockedPoolz.transactionHash);
    });

    it('PoolSplit event emitted', async () => {
      // Check event
      truffleAssert.eventEmitted(result, 'PoolSplit');
    });
    
  });

});