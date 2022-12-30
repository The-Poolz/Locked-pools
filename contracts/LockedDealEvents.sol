// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LockedDealEvents {
    event TokenWithdrawn(
        uint256 PoolId,
        address indexed Recipient,
        uint256 Amount,
        uint256 LeftAmount
    );
    event MassPoolsCreated(uint256 FirstPoolId, uint256 LastPoolId);
    event NewPoolCreated(
        uint256 PoolId,
        address indexed Token,
        uint256 StartTime,
        uint256 CliffTime,
        uint256 FinishTime,
        uint256 StartAmount,
        uint256 DebitedAmount,
        address indexed Owner
    );
    event PoolApproval(uint256 PoolId, address indexed Spender, uint256 Amount);
    event PoolSplit(
        uint256 OldPoolId,
        uint256 NewPoolId,
        uint256 OriginalLeftAmount,
        uint256 NewAmount,
        address indexed OldOwner,
        address indexed NewOwner
    );
}
