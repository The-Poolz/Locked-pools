// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LockedCreation.sol";

contract LockedControl is LockedCreation {
    function TransferPoolOwnership(uint256 _PoolId, address _NewOwner)
        external
        isPoolValid(_PoolId)
        isPoolOwner(_PoolId)
        notZeroAddress(_NewOwner)
        returns (uint256 newPoolId)
    {
        Pool storage pool = AllPoolz[_PoolId];
        require(_NewOwner != pool.Owner, "Can't be the same owner");
        uint256 transferAmount = pool.StartAmount - pool.DebitedAmount;
        newPoolId = TransferPool(_PoolId, transferAmount, _NewOwner);
    }

    function ApproveAllowance(
        uint256 _PoolId,
        uint256 _Amount,
        address _Spender
    )
        external
        isPoolValid(_PoolId)
        isPoolOwner(_PoolId)
        notZeroAddress(_Spender)
    {
        Allowance[_PoolId][_Spender] = _Amount;
        emit PoolApproval(_PoolId, _Spender, _Amount);
    }

    function TransferPoolFrom(
        uint256 _PoolId,
        address _Address
    )
        external
        isPoolValid(_PoolId)
        notZeroAddress(_Address)
        returns (uint256 poolId)
    {
        Pool storage pool = AllPoolz[_PoolId];
        uint256 transferAmount = pool.StartAmount - pool.DebitedAmount;
        require(transferAmount <= Allowance[poolId][msg.sender], "Not enough Allowance");
        poolId = TransferPool(_PoolId, transferAmount, _Address);
        // Todo - is the bottom line required?
        uint256 _NewAmount = Allowance[_PoolId][msg.sender] - transferAmount;
        Allowance[_PoolId][msg.sender] = _NewAmount;
    }
}
