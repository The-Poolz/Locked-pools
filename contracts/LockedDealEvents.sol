// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LockedDealEvents {
    event TokenWithdrawn(uint256 PoolId, address Recipient, uint256 Amount);
    event MassPoolsCreated(uint256 FirstPoolId, uint256 LastPoolId);
    event NewPoolCreated(
        uint256 PoolId,
        address Token,
        uint256 StartTime,
        uint256 FinishTime,
        uint256 StartAmount,
        address Owner
    );
    event PoolOwnershipTransfered(
        uint256 PoolId,
        address NewOwner,
        address OldOwner
    );
    event PoolApproval(uint256 PoolId, address Spender, uint256 Amount);
    event PoolSplit(
        uint256 OldPoolId,
        uint256 NewPoolId,
        uint256 NewAmount,
        address NewOwner
    );
}
