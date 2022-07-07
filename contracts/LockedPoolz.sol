// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Manageable.sol";

contract LockedPoolz is Manageable {
    constructor() {
        Index = 0;
    }
    
    // add contract name
    string public name;

    event NewPoolCreated(uint256 PoolId, address Token, uint256 StartTime, uint256 FinishTime, uint256 StartAmount, address Owner);
    event PoolOwnershipTransfered(uint256 PoolId, address NewOwner, address OldOwner);
    event PoolApproval(uint256 PoolId, address Spender, uint256 Amount);
    event PoolSplit(uint256 OldPoolId, uint256 NewPoolId, uint256 NewAmount, address NewOwner);

    struct Pool {
        uint256 StartTime;
        uint256 FinishTime;
        uint256 StartAmount;
        uint256 DebitedAmount;
        address Owner;
        address Token;
    }

    mapping(address => mapping(uint256 => uint256)) public Allowance;
    mapping(uint256 => Pool) AllPoolz;
    mapping(address => uint256[]) MyPoolz;
    uint256 internal Index;

    modifier isTokenValid(address _Token){
        require(isTokenWhiteListed(_Token), "Need Valid ERC20 Token"); //check if _Token is ERC20
        _;
    }

    modifier isPoolValid(uint256 _PoolId){
        require(_PoolId < Index, "Pool does not exist");
        _;
    }

    modifier isPoolOwner(uint256 _PoolId){
        require(AllPoolz[_PoolId].Owner == msg.sender, "You are not Pool Owner");
        _;
    }

    modifier isAllowed(uint256 _PoolId, uint256 _amount){
        require(_amount <= Allowance[msg.sender][_PoolId], "Not enough Allowance");
        _;
    }

    modifier isLocked(uint256 _PoolId){
        require(AllPoolz[_PoolId].StartTime > block.timestamp, "Pool is Unlocked");
        _;
    }

    modifier isGreaterThanZero(uint256 _num){
        require(_num > 0, "Array length should be greater than zero");
        _;
    }

    // modifier isTimeLengthValid(uint256 _startLength, uint256 _finishLength){
    //     require(_startLength > 0, "Time Array length should be greater than zero");
    //     require(_startLength == _finishLength, "Start and Finish Arrays should have same length");
    //     _;
    // }

    modifier isBelowLimit(uint256 _num){
        require(_num <= maxTransactionLimit, "Max array length limit exceeded");
        _;
    }

    function SplitPool(uint256 _PoolId, uint256 _NewAmount , address _NewOwner) internal returns(uint256) {
        Pool storage pool = AllPoolz[_PoolId];
        require(pool.StartAmount >= _NewAmount, "Not Enough Amount Balance");
        uint256 poolAmount = pool.StartAmount - _NewAmount;
        pool.StartAmount = poolAmount;
        uint256 poolId = CreatePool(pool.Token, pool.StartTime, pool.FinishTime, _NewAmount, _NewOwner);
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
    ) internal isTokenValid(_Token) returns(uint256){
        require(_StartTime <= _FinishTime, "StartTime is greater than FinishTime");
        //register the pool
        AllPoolz[Index].StartTime = _StartTime; //Since v 0.7.0 we cannot assign structs containing nested mappings
        AllPoolz[Index].FinishTime = _FinishTime;
        AllPoolz[Index].StartAmount = _StartAmount;
        AllPoolz[Index].Owner = _Owner;
        AllPoolz[Index].Token = _Token;
        MyPoolz[_Owner].push(Index);
        emit NewPoolCreated(Index, _Token, _StartTime, _FinishTime, _StartAmount, _Owner);
        uint256 poolId = Index;
        Index++;
        return poolId;
    }
}
