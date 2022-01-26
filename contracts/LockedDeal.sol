// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./LockedPoolzData.sol";

contract LockedDeal is LockedPoolzData {
    constructor() public {
        StartIndex = 0;
    }

    event TokenWithdrawn(uint256 PoolId, address Recipient, uint256 Amount);

    uint256 internal StartIndex;

    // @dev no use of revert to make sure the loop will work
    function WithdrawToken(uint256 _PoolId) public returns (bool) {
        // pool is finished + got left overs + did not took them
        if (
            _PoolId < Index &&
            AllPoolz[_PoolId].UnlockTime <= now &&
            AllPoolz[_PoolId].Amount > 0
        ) {
            TransferToken(
                AllPoolz[_PoolId].Token,
                AllPoolz[_PoolId].Owner,
                AllPoolz[_PoolId].Amount
            );
            emit TokenWithdrawn(_PoolId, AllPoolz[_PoolId].Owner, AllPoolz[_PoolId].Amount);
            AllPoolz[_PoolId].Amount = 0;
            return true;
        }
        return false;
    }
}
