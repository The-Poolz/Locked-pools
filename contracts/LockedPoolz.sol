// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./Manageable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract LockedPoolz is Manageable {
    constructor() public {
        Index = 0;
    }
    
    // add contract name
    string public name;

    event NewPoolCreated(uint256 PoolId, address Token, uint64 FinishTime, uint256 StartAmount, address Owner);
    event PoolOwnershipTransfered(uint256 PoolId, address NewOwner, address OldOwner);
    event PoolApproval(uint256 PoolId, address Spender, uint256 Amount);
    event PoolSplit(uint256 OldPoolId, uint256 NewPoolId, uint256 NewAmount, address NewOwner);

    struct Pool {
        uint64 UnlockTime;
        uint256 Amount;
        address Owner;
        address Token;
        mapping(address => uint) Allowance;
    }
    // transfer ownership
    // allowance
    // split amount

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
        require(_amount <= AllPoolz[_PoolId].Allowance[msg.sender], "Not enough Allowance");
        _;
    }

    modifier isLocked(uint256 _PoolId){
        require(AllPoolz[_PoolId].UnlockTime > now, "Pool is Unlocked");
        _;
    }

    modifier notZeroAddress(address _address){
        require(_address != address(0x0), "Zero Address is not allowed");
        _;
    }

    modifier isGreaterThanZero(uint256 _num){
        require(_num > 0, "Array length should be greater than zero");
        _;
    }

    modifier isBelowLimit(uint256 _num){
        require(_num <= maxTransactionLimit, "Max array length limit exceeded");
        _;
    }

    function SplitPool(uint256 _PoolId, uint256 _NewAmount , address _NewOwner) internal returns(uint256) {
        Pool storage pool = AllPoolz[_PoolId];
        require(pool.Amount >= _NewAmount, "Not Enough Amount Balance");
        uint256 poolAmount = SafeMath.sub(pool.Amount, _NewAmount);
        pool.Amount = poolAmount;
        uint256 poolId = CreatePool(pool.Token, pool.UnlockTime, _NewAmount, _NewOwner);
        emit PoolSplit(_PoolId, poolId, _NewAmount, _NewOwner);
        return poolId;
    }

    //create a new pool 
    function CreatePool(
        address _Token, //token to lock address
        uint64 _FinishTime, //Until what time the pool will work
        uint256 _StartAmount, //Total amount of the tokens to sell in the pool
        address _Owner // Who the tokens belong to
    ) internal returns(uint256){
        //register the pool
        AllPoolz[Index] = Pool(_FinishTime, _StartAmount, _Owner, _Token);
        MyPoolz[_Owner].push(Index);
        emit NewPoolCreated(Index, _Token, _FinishTime, _StartAmount, _Owner);
        uint256 poolId = Index;
        Index = SafeMath.add(Index, 1); //joke - overflowfrom 0 on int256 = 1.16E77
        return poolId;
    }
}
