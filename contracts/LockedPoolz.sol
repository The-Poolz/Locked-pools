// SPDX-License-Identifier: MIT
pragma solidity >=0.4.24 <0.7.0;
pragma experimental ABIEncoderV2;

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

    struct Pool {
        uint64 UnlockTime;
        uint256 Amount;
        address Owner;
        address Token;
        // mapping(address => uint) Allowance;
    }
    // transfer ownership
    // allowance
    // split amount

    mapping(uint256 => Pool) AllPoolz;
    mapping(address => uint256[]) MyPoolz;
    uint256 internal Index;

    modifier isTokenValid(address _Token){
        // use whitelist
        require(isTokenWhiteListed(_Token), "Need Valid ERC20 Token"); //check if _Token is ERC20
        _;
    }

    modifier isPoolOwner(uint256 _PoolId){
        require(AllPoolz[_PoolId].Owner == msg.sender, "You are not Pool Owner");
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

    function TransferPoolOwnership(
        uint256 _PoolId,
        address _NewOwner
    ) external isPoolOwner(_PoolId) isLocked(_PoolId) notZeroAddress(_NewOwner) {
        Pool storage pool = AllPoolz[_PoolId];
        pool.Owner = _NewOwner;
        emit PoolOwnershipTransfered(_PoolId, _NewOwner, msg.sender);
    }

    function SplitPool(uint256 _PoolId, uint256 _NewAmount , address _NewOwner) internal {
        Pool storage pool = AllPoolz[_PoolId];
        require(pool.Amount >= _NewAmount, "Not Enough Amount Balance");
        uint256 poolAmount = SafeMath.sub(pool.Amount, _NewAmount);
        pool.Amount = poolAmount;
        CreatePool(pool.Token, pool.UnlockTime, _NewAmount, _NewOwner);
    }

    function SplitPoolAmount(
        uint256 _PoolId,
        uint256 _NewAmount
    ) external isPoolOwner(_PoolId) isLocked(_PoolId) {
        SplitPool(_PoolId, _NewAmount, msg.sender);
    }

    function ApproveAllowance(
        uint256 _PoolId,
        uint256 _NewAmount,
        address _NewOwner
    ) external isPoolOwner(_PoolId) isLocked(_PoolId) notZeroAddress(_NewOwner) {
        SplitPool(_PoolId, _NewAmount, _NewOwner);
    }

    //create a new pool
    function CreatePool(
        address _Token, //token to lock address
        uint64 _FinishTime, //Until what time the pool will work
        uint256 _StartAmount, //Total amount of the tokens to sell in the pool
        address _Owner // Who the tokens belong to
    ) internal {
        //register the pool
        AllPoolz[Index] = Pool(_FinishTime, _StartAmount, _Owner, _Token);
        MyPoolz[_Owner].push(Index);
        emit NewPoolCreated(Index, _Token, _FinishTime, _StartAmount, _Owner);
        Index = SafeMath.add(Index, 1); //joke - overflowfrom 0 on int256 = 1.16E77
    }

    function CreateNewPool(
        address _Token, //token to lock address
        uint64 _FinishTime, //Until what time the pool will work
        uint256 _StartAmount, //Total amount of the tokens to sell in the pool
        address _Owner // Who the tokens belong to
    ) public  notZeroAddress(_Owner) {
        TransferInToken(_Token, msg.sender, _StartAmount);
        CreatePool(_Token, _FinishTime, _StartAmount, _Owner);
    }

    function CreateMassPools(
        address _Token,
        uint64[] calldata _FinishTime,
        uint256[] calldata _StartAmount,
        address[] calldata _Owner
    ) external {
        require(_Owner.length <= 400 && _Owner.length > 0, "Array length Invalid");
        require(_Owner.length == _FinishTime.length, "Date Array Invalid");
        require(_Owner.length == _StartAmount.length, "Amount Array Invalid");
        for(uint i=0 ; i < _Owner.length; i++){
            CreateNewPool(_Token, _FinishTime[i], _StartAmount[i], _Owner[i]);
        }
    }

    // create pools with respect to finish time
    function CreatePoolsWrtTime(
        address _Token,
        uint64[] calldata _FinishTime,
        uint256[] calldata _StartAmount,
        address[] calldata _Owner
    ) external {
        require(_Owner.length * _FinishTime.length <= 400 && _Owner.length > 0, "Array length Invalid");
        require(_Owner.length == _StartAmount.length, "Amount Array Invalid");
        for(uint i=0 ; i < _FinishTime.length ; i++){
            for(uint j=0 ; j < _Owner.length ; j++){
                CreateNewPool(_Token, _FinishTime[i], _StartAmount[j], _Owner[j]);
            }
        }
    }
}
