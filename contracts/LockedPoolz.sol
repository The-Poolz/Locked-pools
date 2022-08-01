// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LockedManageable.sol";

contract LockedPoolz is LockedManageable {
    constructor() {
        Index = 0;
    }

    modifier isTokenValid(address _Token) {
        require(isTokenWhiteListed(_Token), "Need Valid ERC20 Token"); //check if _Token is ERC20
        _;
    }

    function SplitPool(
        uint256 _PoolId,
        uint256 _NewAmount,
        address _NewOwner
    ) internal isLocked(_PoolId) returns (uint256) {
        Pool storage pool = AllPoolz[_PoolId];
        require(pool.StartAmount >= _NewAmount, "Not Enough Amount Balance");
        uint256 poolAmount = pool.StartAmount - _NewAmount;
        pool.StartAmount = poolAmount;
        uint256 poolId = CreatePool(
            pool.Token,
            pool.StartTime,
            pool.FinishTime,
            _NewAmount,
            _NewOwner
        );
        emit PoolSplit(_PoolId, poolId, _NewAmount, _NewOwner);
        return poolId;
    }

    //create a new pool
    function CreatePool(
        address _Token, // token to lock address
        uint256 _StartTime, // Until what time the pool will Start
        uint256 _FinishTime, // Until what time the pool will end
        uint256 _StartAmount, //Total amount of the tokens to sell in the pool
        address _Owner // Who the tokens belong to
    ) internal isTokenValid(_Token) returns (uint256) {
        require(
            _StartTime <= _FinishTime,
            "StartTime is greater than FinishTime"
        );
        //register the pool
        AllPoolz[Index] = Pool(_StartTime, _FinishTime, _StartAmount, 0, _Owner, _Token);
        MyPoolz[_Owner].push(Index);
        emit NewPoolCreated(
            Index,
            _Token,
            _StartTime,
            _FinishTime,
            _StartAmount,
            _Owner
        );
        uint256 poolId = Index;
        Index++;
        return poolId;
    }
}
