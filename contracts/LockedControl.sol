// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LockedPoolz.sol";

contract LockedControl is LockedPoolz{

    event MassPoolsCreated(uint256 FirstPoolId, uint256 LastPoolId);

    function TransferPoolOwnership(
        uint256 _PoolId,
        address _NewOwner
    ) external isPoolValid(_PoolId) isPoolOwner(_PoolId) notZeroAddress(_NewOwner) {
        Pool storage pool = AllPoolz[_PoolId];
        pool.Owner = _NewOwner;
        uint256[] storage array = MyPoolz[msg.sender];
        for(uint i=0 ; i<array.length ; i++){
            if(array[i] == _PoolId){
                array[i] = array[array.length - 1];
                array.pop();
            }
        }
        MyPoolz[_NewOwner].push(_PoolId);
        emit PoolOwnershipTransfered(_PoolId, _NewOwner, msg.sender);
    }

    function SplitPoolAmount(
        uint256 _PoolId,
        uint256 _NewAmount,
        address _NewOwner
    ) external isPoolValid(_PoolId) isPoolOwner(_PoolId) isLocked(_PoolId) returns(uint256) {
        uint256 poolId = SplitPool(_PoolId, _NewAmount, _NewOwner);
        return poolId;
    }

    function ApproveAllowance(
        uint256 _PoolId,
        uint256 _Amount,
        address _Spender
    ) external isPoolValid(_PoolId) isPoolOwner(_PoolId) isLocked(_PoolId) notZeroAddress(_Spender) {
        Allowance[_PoolId][_Spender] = _Amount;
        emit PoolApproval(_PoolId, _Spender, _Amount);
    }

    function GetPoolAllowance(uint256 _PoolId, address _Address) public view isPoolValid(_PoolId) returns(uint256){
        return Allowance[_PoolId][_Address];
    }

    function SplitPoolAmountFrom(
        uint256 _PoolId,
        uint256 _Amount,
        address _Address
    ) external isPoolValid(_PoolId) isAllowed(_PoolId, _Amount) isLocked(_PoolId) returns(uint256) {
        uint256 poolId = SplitPool(_PoolId, _Amount, _Address);
        uint256 _NewAmount = Allowance[_PoolId][msg.sender] - _Amount;
        Allowance[_PoolId][msg.sender]  = _NewAmount;
        return poolId;
    }

    function CreateNewPool(
        address _Token, //token to lock address
        uint256 _StartTime, //Until what time the pool will start
        uint256 _FinishTime, //Until what time the pool will end
        uint256 _StartAmount, //Total amount of the tokens to sell in the pool
        address _Owner // Who the tokens belong to
    ) external payable notZeroAddress(_Owner) returns(uint256) {
        TransferInToken(_Token, msg.sender, _StartAmount);
        if(WhiteList_Address != address(0) && !(isUserWithoutFee(msg.sender) || isTokenWithoutFee(_Token))){
            PayFee(Fee);
        }
        CreatePool(_Token, _StartTime, _FinishTime, _StartAmount, _Owner);
    }

    function CreateMassPools(
        address _Token,
        uint256[] calldata _StartTime,
        uint256[] calldata _FinishTime,
        uint256[] calldata _StartAmount,
        address[] calldata _Owner
    )   external payable
        isGreaterThanZero(_Owner.length)
        isBelowLimit(_Owner.length)
    {
        require(_Owner.length == _FinishTime.length, "Date Array Invalid");
        require(_StartTime.length == _FinishTime.length, "Date Array Invalid");
        require(_Owner.length == _StartAmount.length, "Amount Array Invalid");
        TransferInToken(_Token, msg.sender, getArraySum(_StartAmount));
        if(WhiteList_Address != address(0) && !(isUserWithoutFee(msg.sender) || isTokenWithoutFee(_Token))){
            PayFee(Fee * _Owner.length);
        }
        uint256 firstPoolId = Index;
        for(uint i=0 ; i < _Owner.length; i++){
            CreatePool(_Token, _StartTime[i], _FinishTime[i], _StartAmount[i], _Owner[i]);
        }
        uint256 lastPoolId = Index - 1;
        emit MassPoolsCreated(firstPoolId, lastPoolId);
    }

    // create pools with respect to finish time
    function CreatePoolsWrtTime(
        address _Token,
        uint256[] calldata _StartTime,
        uint256[] calldata _FinishTime,
        uint256[] calldata _StartAmount,
        address[] calldata _Owner
    )   external payable
        isGreaterThanZero(_StartTime.length)
        isBelowLimit(_Owner.length * _FinishTime.length)
    {
        require(_Owner.length == _StartAmount.length, "Amount Array Invalid");
        require(_FinishTime.length == _StartTime.length, "Date Array Invalid");
        TransferInToken(_Token, msg.sender, getArraySum(_StartAmount) * _FinishTime.length);
        uint256 firstPoolId = Index;
        if(WhiteList_Address != address(0) && !(isUserWithoutFee(msg.sender) || isTokenWithoutFee(_Token))){
            PayFee(Fee * _Owner.length * _FinishTime.length);
        }
        for(uint i=0 ; i < _FinishTime.length ; i++){
            for(uint j=0 ; j < _Owner.length ; j++){
                CreatePool(_Token, _StartTime[i], _FinishTime[i], _StartAmount[j], _Owner[j]);
            }
        }
        uint256 lastPoolId = Index - 1;
        emit MassPoolsCreated(firstPoolId, lastPoolId);
    }

    function getArraySum(uint256[] calldata _array) internal pure returns(uint256) {
        uint256 sum = 0;
        for(uint i=0 ; i<_array.length ; i++){
            sum = sum + _array[i];
        }
        return sum;
    }
}