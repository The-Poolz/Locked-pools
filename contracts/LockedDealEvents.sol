// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LockedDealEvents {
    event TokenWithdrawn(uint256 PoolId, address indexed Recipient, uint256 Amount);
    event MassPoolsCreated(uint256 FirstPoolId, uint256 LastPoolId);
    event NewPoolCreated(
        uint256 PoolId,
        address indexed Token,
        uint256 StartTime,
        uint256 CliffTime,
        uint256 FinishTime,
        uint256 StartAmount,
        address indexed Owner
    );
    event PoolReplicated(
        uint256 PoolId,
        address indexed Token,
        uint256 StartTime,
        uint256 CliffTime,
        uint256 FinishTime,
        uint256 StartAmount,
        uint256 DebitedAmount,
        address indexed Owner
    );
    event PoolTransferred(
        uint256 oldPoolId,
        uint256 newPoolId,
        uint256 transferedAmount,
        address indexed OldOwner,
        address indexed NewOwner
    );
    event PoolApproval(uint256 PoolId, address indexed Spender, uint256 Amount);
}
