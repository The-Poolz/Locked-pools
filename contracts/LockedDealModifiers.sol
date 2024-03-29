// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title contains modifiers and stores variables.
contract LockedDealModifiers {
    mapping(uint256 => mapping(address => uint256)) public Allowance;
    mapping(uint256 => Pool) public AllPoolz;
    mapping(address => uint256[]) public MyPoolz;
    uint256 public Index;

    address public WhiteList_Address;
    bool public isTokenFilterOn; // use to enable/disable token filter
    uint256 public TokenFeeWhiteListId;
    uint256 public TokenFilterWhiteListId;
    uint256 public UserWhiteListId;
    uint256 public maxTransactionLimit;

    struct Pool {
        uint256 StartTime;
        uint256 CliffTime;
        uint256 FinishTime;
        uint256 StartAmount;
        uint256 DebitedAmount; // withdrawn amount
        address Owner;
        address Token;
    }

    modifier notZeroAddress(address _address) {
        require(_address != address(0x0), "Zero Address is not allowed");
        _;
    }

    modifier isPoolValid(uint256 _PoolId) {
        require(_PoolId < Index, "Pool does not exist");
        _;
    }

    modifier notZeroValue(uint256 _Amount) {
        require(_Amount > 0, "Amount must be greater than zero");
        _;
    }

    modifier isPoolOwner(uint256 _PoolId) {
        require(
            AllPoolz[_PoolId].Owner == msg.sender,
            "You are not Pool Owner"
        );
        _;
    }

    modifier isAllowed(uint256 _PoolId, uint256 _amount) {
        require(
            _amount <= Allowance[_PoolId][msg.sender],
            "Not enough Allowance"
        );
        _;
    }

    modifier isBelowLimit(uint256 _num) {
        require(
            _num > 0 && _num <= maxTransactionLimit,
            "Invalid array length limit"
        );
        _;
    }
}
