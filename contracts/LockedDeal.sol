// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./LockedPoolzData.sol";

contract LockedDeal is LockedPoolzData {
    constructor() public {
        StartIndex = 0;
    }

    event TokenWithdrawn(uint256 PoolId, address Recipient, uint256 Amount);

    uint256 internal StartIndex;

    function getWithdrawableAmount(uint256 _PoolId) public view isPoolValid(_PoolId) returns(uint256){
        Pool storage pool = AllPoolz[_PoolId];
        if(pool.StartAmount > now) return 0;
        uint64 totalPoolDuration = pool.FinishTime - pool.StartTime;
        uint256 timePassed = now - pool.StartTime;
        uint256 timePassedPermille = SafeMath.mul(timePassed, 1000);
        uint256 ratioPermille = SafeMath.div(timePassedPermille, totalPoolDuration);
        uint256 debitableAmount = SafeMath.div(SafeMath.mul(pool.StartAmount, ratioPermille), 1000);
        return SafeMath.sub(debitableAmount, pool.DebitedAmount);
    }

    //@dev no use of revert to make sure the loop will work
    function WithdrawToken(uint256 _PoolId) external returns (bool) {
        //pool is finished + got left overs + did not took them
        Pool storage pool = AllPoolz[_PoolId];
        if (
            _PoolId < Index &&
            pool.StartTime <= now &&
            SafeMath.sub(pool.StartTime, pool.DebitedAmount) > 0
        ) {
            uint256 tokenAmount = getWithdrawableAmount(_PoolId);
            pool.DebitedAmount = SafeMath.add(tokenAmount, pool.DebitedAmount);
            TransferToken(
                pool.Token,
                pool.Owner,
                tokenAmount
            );
            emit TokenWithdrawn(_PoolId, pool.Owner, tokenAmount);
            return true;
        }
        return false;
    }
}
