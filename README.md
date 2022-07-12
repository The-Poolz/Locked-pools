# Locked Deal V2

[![Build Status](https://travis-ci.com/The-Poolz/Locked-pools.svg?branch=master)](https://travis-ci.com/The-Poolz/Locked-pools)
[![codecov](https://codecov.io/gh/The-Poolz/Locked-pools/branch/master/graph/badge.svg?token=szMZsBIF3L)](https://codecov.io/gh/The-Poolz/Locked-pools)
[![CodeFactor](https://www.codefactor.io/repository/github/the-poolz/locked-pools/badge)](https://www.codefactor.io/repository/github/the-poolz/locked-pools)

Smart contract for secure storage of ERC20 tokens.

### Navigation

- [Installation](#installation)
- [Admin](#list-of-functions-for-admin)
- [Owner of locked tokens](#list-of-functions-for-pool-owner)
- [User](#list-of-functions-for-user)

#### Installation

```console
npm install
```

#### Testing

```console
truffle run coverage
```

#### Deploy

```console
truffle dashboard
```

```console
truffle migrate --f 1 --to 1 --network dashboard
```

## List of functions for admin

### Whitelist address

**Problem:**
Admin has set the payment price for creating a pool, but it is necessary that certain addresses don't pay.

**Solution:**
Create a whitelist of addresses that don't pay and integrate it with Locked-pools.

- The default whitelist address is zero
- We can set only contract that implements [IWhiteList](https://github.com/The-Poolz/Poolz-Helper/blob/master/contracts/interfaces/IWhiteList.sol) interface.

```solidity
    function setWhiteListAddress(address _address) external;
```

### Non-paid token

Locked-pools can uses three manual whitelists. One of them is a whitelist for tokens that are exempt from paying fees.

```solidity
    function setTokenFeeWhiteListId(uint256 _id) external;
```

### Security token filter

If someone is trying to lock tokens that damage the contract, we can create a whitelist of tokens that can only be used to create a locked pool.

```solidity
    function setTokenFilterWhiteListId(uint256 _id) external;
```

### User without fee

Setting a whitelist ID for users who are exempt from paying fees.

```solidity
    function setUserWhiteListId(uint256 _id) external;
```

### Max transaction limit

There is a restriction on the implementation of mass locked pools.

```solidity
    // by default, the maximum transaction limit is 400
    function setMaxTransactionLimit(uint256 _newLimit) external;
```

### Enable/Disable token filter

```solidity
    // by default the token filter is disabled
    function swapTokenFilter() external;
```

## List of functions for pool owner
### Transfering a pool ownership

You should use TransferPoolOwnership() function.

```solidity
function TransferPoolOwnership(
        uint256 _PoolId,
        address _NewOwner
    ) external;
```

### Splitting a pool amount
When you splitting a pool, it creates a new pool with splitted amount,
but in first pool amount is decreased by amount of new pool.

You should use SplitPoolAmount() function.

```solidity
    function SplitPoolAmount(
        uint256 _PoolId,
        uint256 _NewAmount,
        address _NewOwner
    ) external returns(uint256)
```

### Approving an allowance

You should use ApproveAllowance() function.

```solidity
    function ApproveAllowance(
        uint256 _PoolId,
        uint256 _Amount,
        address _Spender
    ) external;
```

## List of functions for user
### Creating a new pool

**CreateNewPool()** function allows you to create a new pool for locking tokens.
There are such parameters:
 address _Token,       // Token address to lock
 uint256 _StartTime,   // Until what time a pool will start
 uint256 _FinishTime,  // Until what time a pool will end
 uint256 _StartAmount, // Total amount of the tokens to sell in a pool
 address _Owner        // Token owner
 If it is needed you have to pay some fee for creation.

First of all, you have to approve amount of tokens to the Locked-Pools contract.
After that, you should use CreateNewPool() function.

```solidity
    function CreateNewPool(
        address _Token,
        uint256 _StartTime,
        uint256 _FinishTime,
        uint256 _StartAmount,
        address _Owner
    ) external payable;
```

### Creating an array of pools
**CreateMassPool()** function allows you to create an array of pools for locking tokens.

First of all, you have to approve amount of tokens to the Locked-Pools contract.
After that, you should use CreateMassPools() function.

```solidity
    function CreateMassPools(
        address _Token,
        uint256[] calldata _StartTime,
        uint256[] calldata _FinishTime,
        uint256[] calldata _StartAmount,
        address[] calldata _Owner
    )   external payable;
```

### Creating an array of pools with respect to finish time

First of all, you have to approve amount of tokens to the Locked-Pools contract.
After that, you should use CreatePoolsWrtTime() function.

```solidity
    function CreatePoolsWrtTime(
        address _Token,
        uint256[] calldata _StartTime,
        uint256[] calldata _FinishTime,
        uint256[] calldata _StartAmount,
        address[] calldata _Owner
    )   external payable
```

### Getting my pools' ids by a token

You should use the GetMyPoolsIdByToken() function.

```solidity
    function GetMyPoolsIdByToken(address[] memory _tokens)
        public
        view
        returns (uint256[] memory);
```

### Getting a pools' data

You should use the GetPoolsData() function.

```solidity
    function GetPoolsData(uint256[] memory _ids)
        public
        view
        returns (Pool[] memory)
    {
```

### Check whether a token is without a fee

You should use isTokenWithoutFee() function.

```solidity
    function isTokenWithoutFee(address _tokenAddress) public view returns(bool);
```

### Check whether a token is whitelisted

You should use isTokenWhiteListed() function.

```solidity
    function isTokenWhiteListed(address _tokenAddress) public view returns(bool);
```

### Check whether a user is without fee

You should use isUserWithoutFee() function.

```solidity
    function isUserWithoutFee(address _UserAddress) public view returns(bool);
```

### Gettting a pool data

You should use AllPoolz() function.

```solidity
        function AllPoolz(uint256 _id)
        public
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            address,
            address
        );
```

### Getting all my pools' ids

You should use GetAllMyPoolsId() function.

```solidity
    function GetAllMyPoolsId() public view returns (uint256[] memory);
```

### Getting my pools' ids

You should use GetMyPoolsId() function.

```solidity
    function GetMyPoolsId() public view returns (uint256[] memory);
```

### Withdrawing a token
**WithdrawToken()**  function allows you to withdraw tokens if pool is finished,
there are left overs and it nobody have took.

You should use WithdrawToken() function.

```solidity
    function WithdrawToken(uint256 _PoolId) external returns (bool);
```

### Getting a withdrawable amount

You should use getWithdrawableAmount() function.

```solidity
    function getWithdrawableAmount(uint256 _PoolId) public view returns(uint256)
```

### Splitting a pool amount from already an existing pool's allowance for a user.
When you splitting a pool using this function, existing allowance for a user in the pool
will be decreased by the amount.

You should use SplitPoolAmountFrom() function.

```solidity
        function SplitPoolAmountFrom(
        uint256 _PoolId,
        uint256 _Amount,
        address _Address
    ) external returns(uint256);
```

### Getting a pool's allowance

You should use GetPoolAllowance() function.

```solidity
    function GetPoolAllowance(uint256 _PoolId, address _Address) public view returns(uint256);
```
