// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LockedPoolzData.sol";

contract LockedDealV2 is LockedPoolzData {
    event TokenWithdrawn(uint256 PoolId, address Recipient, uint256 Amount);

    function getWithdrawableAmount(uint256 _PoolId) public view isPoolValid(_PoolId) returns(uint256){
        Pool storage pool = AllPoolz[_PoolId];
        if(block.timestamp < pool.StartTime) return 0;
        if(pool.FinishTime < block.timestamp) return pool.StartAmount - pool.DebitedAmount;
        uint256 totalPoolDuration = pool.FinishTime - pool.StartTime;
        uint256 timePassed = block.timestamp - pool.StartTime;
        uint256 timePassedPermille = timePassed * 1000;
        uint256 ratioPermille = timePassedPermille / totalPoolDuration;
        uint256 debitableAmount = pool.StartAmount * ratioPermille/ 1000;
        return debitableAmount - pool.DebitedAmount;
    }

    //@dev no use of revert to make sure the loop will work
    function WithdrawToken(uint256 _PoolId) external returns (bool) {
        //pool is finished + got left overs + did not took them
        Pool storage pool = AllPoolz[_PoolId];
        if (
            _PoolId < Index &&
            pool.StartTime <= block.timestamp &&
            pool.StartTime - pool.DebitedAmount > 0
        ) {
            uint256 tokenAmount = getWithdrawableAmount(_PoolId);
            uint256 tempDebitAmount = tokenAmount + pool.DebitedAmount;
            pool.DebitedAmount = tempDebitAmount;
            TransferToken(
                pool.Token,
                pool.Owner,
                tokenAmount
            );
            if(pool.DebitedAmount == pool.StartAmount){
                delete MyPoolz[pool.Owner][_PoolId];
            }
            emit TokenWithdrawn(_PoolId, pool.Owner, tokenAmount);
            return true;
        }
        return false;
    }
}
