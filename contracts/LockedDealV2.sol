// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./LockedPoolzData.sol";

contract LockedDealV2 is LockedPoolzData {
    event TokenWithdrawn(uint256 PoolId, address Recipient, uint256 Amount);

    function getWithdrawableAmount(uint256 _PoolId) public view isPoolValid(_PoolId) returns(uint256){
        Pool storage pool = AllPoolz[_PoolId];
        if(now < pool.StartTime) return 0;
        if(pool.FinishTime < now) return SafeMath.sub(pool.StartAmount, pool.DebitedAmount);
        uint256 totalPoolDuration = pool.FinishTime - pool.StartTime;
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
            uint256 tempDebitAmount = SafeMath.add(tokenAmount, pool.DebitedAmount);
            pool.DebitedAmount = tempDebitAmount;
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
