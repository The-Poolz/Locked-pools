// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LockedManageable.sol";

contract LockedPoolz is LockedManageable {
    modifier isTokenValid(address _Token) {
        require(isTokenWhiteListed(_Token), "Need Valid ERC20 Token"); //check if _Token is ERC20
        _;
    }

    function SplitPool(
        uint256 _PoolId,
        uint256 _NewAmount,
        address _NewOwner
    ) internal returns (uint256 poolId) {
        Pool storage pool = AllPoolz[_PoolId];
        uint256 leftAmount = remainingAmount(_PoolId);
        require(
            leftAmount >= _NewAmount,
            "Not Enough Amount Balance"
        );
        uint256 _percent = percentageRatio(
            leftAmount,
            _NewAmount
        );
        uint256 newPoolStartAmount = (pool.StartAmount * _percent) / 100_000_000;
        uint256 newPoolDebitedAmount = (pool.DebitedAmount * _percent) / 100_000_000;
        pool.StartAmount = pool.StartAmount - newPoolStartAmount;
        pool.DebitedAmount = pool.DebitedAmount - newPoolDebitedAmount;
        poolId = CreatePool(
            pool.Token,
            pool.StartTime,
            pool.CliffTime,
            pool.FinishTime,
            newPoolStartAmount,
            newPoolDebitedAmount,
            _NewOwner
        );
        emit PoolSplit(_PoolId, poolId, _NewAmount, _NewOwner);
    }

    //create a new pool
    function CreatePool(
        address _Token, // token to lock address
        uint256 _StartTime, // Until what time the pool will Start
        uint256 _CliffTime, // Before CliffTime can't withdraw tokens
        uint256 _FinishTime, // Until what time the pool will end
        uint256 _StartAmount, // Total amount of the tokens to sell in the pool
        uint256 _DebitedAmount, // Withdrawn amount
        address _Owner // Who the tokens belong to
    ) internal isTokenValid(_Token) returns (uint256 poolId) {
        require(
            _StartTime <= _FinishTime,
            "StartTime is greater than FinishTime"
        );
        //register the pool
        AllPoolz[Index] = Pool(
            _StartTime,
            _CliffTime,
            _FinishTime,
            _StartAmount,
            _DebitedAmount,
            _Owner,
            _Token
        );
        MyPoolz[_Owner].push(Index);
        emit NewPoolCreated(
            Index,
            _Token,
            _StartTime,
            _CliffTime,
            _FinishTime,
            _StartAmount,
            _DebitedAmount,
            _Owner
        );
        poolId = Index;
        Index++;
    }

    function remainingAmount(uint256 _PoolId) internal view returns (uint256 amount) {
        amount = AllPoolz[_PoolId].StartAmount - AllPoolz[_PoolId].DebitedAmount;
    }

    function percentageRatio(uint256 _remainingAmount, uint256 _splitAmount)
        internal
        pure
        returns (uint256 ratio)
    {
        // uint doesn't support decimals.
        ratio =  (_splitAmount * 100_000_000) / _remainingAmount;
    }
}
