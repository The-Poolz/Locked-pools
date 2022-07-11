# Locked Deal V2
[![Build Status](https://travis-ci.com/The-Poolz/Locked-pools.svg?branch=master)](https://travis-ci.com/The-Poolz/Locked-pools)
[![codecov](https://codecov.io/gh/The-Poolz/Locked-pools/branch/master/graph/badge.svg?token=szMZsBIF3L)](https://codecov.io/gh/The-Poolz/Locked-pools)
[![CodeFactor](https://www.codefactor.io/repository/github/the-poolz/locked-pools/badge)](https://www.codefactor.io/repository/github/the-poolz/locked-pools)

Smart contract for secure storage of ERC20 tokens.

### Installation

```console
npm install
```

### Testing

```console
truffle run coverage
```
### Deploy

```console
truffle dashboard
truffle migrate --f 1 --to 1 --network dashboard
```

## List of functions for admin
### How to set a new whitelist address?

You should use setWhiteListAddress() function.

```solidity
    function setWhiteListAddress(address _address) external;
```

### Setting token fee for whitelist id

You should use setTokenFeeWhiteListId() function.

```solidity
    function setTokenFeeWhiteListId(uint256 _id) external;
```

### Setting token filter for whitelist id

You should use setTokenFilterWhiteListId() function.

```solidity
    function setTokenFilterWhiteListId(uint256 _id) external;
```

### Setting user whitelist id

You should use setUserWhiteListId() function.

```solidity
    function setUserWhiteListId(uint256 _id) external;
```

### Setting max transaction limit

You should use setMaxTransactionLimit() function.

```solidity
    function setMaxTransactionLimit(uint256 _newLimit) external;
```

### Setting minimum duration

You should use SetMinDuration() function.

```solidity
    function SetMinDuration(uint16 _minDuration) public;
```

### Swapping token filter

You should use swapTokenFilter() function.

```solidity
    function swapTokenFilter() external;
```

## List of functions for pool owner
### Transfering pool ownership

You should use TransferPoolOwnership() function.

```solidity
function TransferPoolOwnership(
        uint256 _PoolId,
        address _NewOwner
    ) external;
```

### Splitting pool amount

You should use SplitPoolAmount() function.

```solidity
    function SplitPoolAmount(
        uint256 _PoolId,
        uint256 _NewAmount,
        address _NewOwner
    ) external returns(uint256)
```

### Approving allowance

You should use ApproveAllowance() function.

```solidity
    function ApproveAllowance(
        uint256 _PoolId,
        uint256 _Amount,
        address _Spender
    ) external;
```

## List of functions for user
### Creating new pool

First of all, you have to approve amount of tokens to the Locked-Pools contract.
After that, you should use CreateNewPool() function.

```solidity
    function CreateNewPool(
        address _Token, // token to lock address
        uint256 _StartTime, // until what time the pool will start
        uint256 _FinishTime, // until what time the pool will end
        uint256 _StartAmount, // total amount of the tokens to sell in the pool
        address _Owner // who the tokens belong to
    ) external payable;
```

### Creating array of pools

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

### Creating array of pools with respect to finish time

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

### Getting my pools' ids by token

You should use the GetMyPoolsIdByToken() function.

```solidity
    function GetMyPoolsIdByToken(address[] memory _tokens)
        public
        view
        returns (uint256[] memory);
```

### Getting pools' data

You should use the GetPoolsData() function.

```solidity
    function GetPoolsData(uint256[] memory _ids)
        public
        view
        returns (Pool[] memory)
    {
```

### Check whether a token is without fee

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

### Gettting pool data

You should use GetPoolData() function.

```solidity
        function GetPoolData(uint256 _id)
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

### Withdrawing token

You should use WithdrawToken() function.

```solidity
    function WithdrawToken(uint256 _PoolId) external returns (bool);
```

### Getting withdrawable amount

You should use getWithdrawableAmount() function.

```solidity
    function getWithdrawableAmount(uint256 _PoolId) public view returns(uint256)
```

### Splitting pool amount from already existing

You should use SplitPoolAmountFrom() function.

```solidity
        function SplitPoolAmountFrom(
        uint256 _PoolId,
        uint256 _Amount,
        address _Address
    ) external returns(uint256);
```

### Getting pool's allowance

You should use GetPoolAllowance() function.

```solidity
    function GetPoolAllowance(uint256 _PoolId, address _Address) public view returns(uint256);
```

### Approving allowance

You should use ApproveAllowance() function.

```solidity
    function ApproveAllowance(
        uint256 _PoolId,
        uint256 _Amount,
        address _Spender
    ) external;
```
