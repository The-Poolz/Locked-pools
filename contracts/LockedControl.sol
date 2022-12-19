// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LockedCreation.sol";

contract LockedControl is LockedCreation {
    function PoolTransfer(uint256 _PoolId, address _NewOwner)
        external
        isPoolValid(_PoolId)
        isPoolOwner(_PoolId)
        notZeroAddress(_NewOwner)
    {
        Pool storage pool = AllPoolz[_PoolId];
        require(_NewOwner != pool.Owner, "Can't be the same owner");
        uint256 newPoolId = SplitPool(_PoolId, pool.StartAmount, _NewOwner);
        emit PoolTransferred(newPoolId, _PoolId, _NewOwner, msg.sender);
    }

    function SplitPoolAmount(
        uint256 _PoolId,
        uint256 _NewAmount,
        address _NewOwner
    )
        external
        isPoolValid(_PoolId)
        isPoolOwner(_PoolId)
        notZeroAddress(_NewOwner)
        returns (uint256)
    {
        return SplitPool(_PoolId, _NewAmount, _NewOwner);
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

    function SplitPoolAmountFrom(
        uint256 _PoolId,
        uint256 _Amount,
        address _Address
    )
        external
        isPoolValid(_PoolId)
        isAllowed(_PoolId, _Amount)
        notZeroAddress(_Address)
        returns (uint256 poolId)
    {
        poolId = SplitPool(_PoolId, _Amount, _Address);
        uint256 _NewAmount = Allowance[_PoolId][msg.sender] - _Amount;
        Allowance[_PoolId][msg.sender] = _NewAmount;
    }
}
