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
## How to set a new whitelist address?

You should use setWhiteListAddress() function.

```solidity
    function setWhiteListAddress(address _address) external;
```

## How to set a new token fee whitelist id?

You should use setTokenFeeWhiteListId() function.

```solidity
    function setTokenFeeWhiteListId(uint256 _id) external;
```

## How to set a new token filter whitelist id?

You should use setTokenFilterWhiteListId() function.

```solidity
    function setTokenFilterWhiteListId(uint256 _id) external;
```

## How to set a new user whitelist id?

You should use setUserWhiteListId() function.

```solidity
    function setUserWhiteListId(uint256 _id) external;
```

## How to swap a token filter?

You should use swapTokenFilter() function.

```solidity
    function swapTokenFilter() external;
```

## How to check whether a token is without fee?

You should use isTokenWithoutFee() function.

```solidity
    function isTokenWithoutFee(address _tokenAddress) public view returns(bool);
```

## How to check whether a token is whitelisted?

You should use isTokenWhiteListed() function.

```solidity
    function isTokenWhiteListed(address _tokenAddress) public view returns(bool);
```

## How to check whether a user is without fee?

You should use isUserWithoutFee() function.

```solidity
    function isUserWithoutFee(address _UserAddress) public view returns(bool);
```

## List of functions for pool owner
## How to create a single new pool?

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

## How to create a pool array?

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

## How to create an array of pools with respect to finish time?

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

## How to get all your pool ids by token addresses?

You should use the GetMyPoolsIdByToken() function.

```solidity
    function GetMyPoolsIdByToken(address[] memory _tokens)
        public
        view
        returns (uint256[] memory);
```

## How to get pools data by pools' ids?

You should use the GetPoolsData() function.

```solidity
    function GetPoolsData(uint256[] memory _ids)
        public
        view
        returns (Pool[] memory)
    {
```
