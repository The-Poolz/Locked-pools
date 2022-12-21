// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LockedManageable.sol";

contract LockedPoolz is LockedManageable {
    modifier isTokenValid(address _Token) {
        require(isTokenWhiteListed(_Token), "Need Valid ERC20 Token"); //check if _Token is ERC20
        _;
    }

    function TransferPool(
        uint256 _PoolId,
        uint256 _transferAmount,
        address _NewOwner
    ) internal returns (uint256 newPoolId) {
        Pool storage pool = AllPoolz[_PoolId];
        require(pool.StartAmount - pool.DebitedAmount >= _transferAmount, "Not Enough Amount Balance");
        newPoolId = ReplicatePool(
            pool.Token,
            pool.StartTime,
            pool.CliffTime,
            pool.FinishTime,
            pool.StartAmount,
            pool.DebitedAmount,
            _NewOwner
        );
        pool.StartAmount = pool.StartAmount - _transferAmount;
        emit PoolTransferred(_PoolId, newPoolId, _transferAmount, pool.Owner, _NewOwner);
    }

    //create a new pool
    function CreatePool(
        address _Token, // token to lock address
        uint256 _StartTime, // Until what time the pool will Start
        uint256 _CliffTime, // Before CliffTime can't withdraw tokens 
        uint256 _FinishTime, // Until what time the pool will end
        uint256 _StartAmount, //Total amount of the tokens to sell in the pool
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
            0,
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
            _Owner
        );
        poolId = Index;
        Index++;
    }

    //Replicate a new pool
    function ReplicatePool(
        address _Token, // token to lock address
        uint256 _StartTime, // Until what time the pool will Start
        uint256 _CliffTime, // Before CliffTime can't withdraw tokens 
        uint256 _FinishTime, // Until what time the pool will end
        uint256 _StartAmount, //Total amount of the tokens to sell in the pool
        uint256 _debitedAmount, // used only for splittingPool to replicate the old pool
        address _Owner // Who the tokens belong to,
    ) private isTokenValid(_Token) returns (uint256 poolId) {
        //register the pool
        AllPoolz[Index] = Pool(
            _StartTime,
            _CliffTime,
            _FinishTime,
            _StartAmount,
            _debitedAmount,
            _Owner,
            _Token
        );
        MyPoolz[_Owner].push(Index);
        emit PoolReplicated(
            Index,
            _Token,
            _StartTime,
            _CliffTime,
            _FinishTime,
            _StartAmount,
            _debitedAmount,
            _Owner
        );
        poolId = Index;
        Index++;
    }
}
