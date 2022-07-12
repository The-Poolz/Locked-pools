# Locked Deal V2
[![Build Status](https://travis-ci.com/The-Poolz/Locked-pools.svg?branch=master)](https://travis-ci.com/The-Poolz/Locked-pools)
[![codecov](https://codecov.io/gh/The-Poolz/Locked-pools/branch/master/graph/badge.svg?token=szMZsBIF3L)](https://codecov.io/gh/The-Poolz/Locked-pools)
[![CodeFactor](https://www.codefactor.io/repository/github/the-poolz/locked-pools/badge)](https://www.codefactor.io/repository/github/the-poolz/locked-pools)

Smart contract for secure storage of ERC20 tokens.

### Navigation
- [Installation](#installation)
- [Admin](#admin-privileges)
- [Owner of locked tokens](#pool-owner-privileges)
- [User](#user-privileges)

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

## Admin privileges
### Setting a new whitelist address

You should use setWhiteListAddress() function.

```solidity
    function setWhiteListAddress(address _address) external;
```

Testnet tx: [link](https://testnet.bscscan.com/tx/0x346c84ff830fccadba03cdf43b1b11e40a46094a23060dcbaa89666673fde4b9)

### Setting a token fee for a whitelist id

You should use setTokenFeeWhiteListId() function.

```solidity
    function setTokenFeeWhiteListId(uint256 _id) external;
```

### Setting a token filter for a whitelist id

You should use setTokenFilterWhiteListId() function.

```solidity
    function setTokenFilterWhiteListId(uint256 _id) external;
```

### Setting a user's whitelist id

You should use setUserWhiteListId() function.

```solidity
    function setUserWhiteListId(uint256 _id) external;
```

### Setting a max transaction limit

You should use setMaxTransactionLimit() function.

```solidity
    function setMaxTransactionLimit(uint256 _newLimit) external;
```

### Setting a minimum duration

You should use SetMinDuration() function.

```solidity
    function SetMinDuration(uint16 _minDuration) public;
```

### Swapping a token filter

You should use swapTokenFilter() function.

```solidity
    function swapTokenFilter() external;
```

## Pool owner privileges
### Transfering a pool ownership

You should use TransferPoolOwnership() function.

```solidity
function TransferPoolOwnership(
        uint256 _PoolId,
        address _NewOwner
    ) external;
```

Testnet tx: [link](https://testnet.bscscan.com/tx/0x54cbdf138be5ad711f648bc2d9e7086d29f064e8afc82e89f36f04b5c69d7e44)

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

Testnet tx: [link](https://testnet.bscscan.com/tx/0x3c448f482b866eb8c379a3599d0555013a2396dde327a992d38267c28abdea19)

### Approving an allowance

You should use ApproveAllowance() function.

```solidity
    function ApproveAllowance(
        uint256 _PoolId,
        uint256 _Amount,
        address _Spender
    ) external;
```

Testnet tx: [link](https://testnet.bscscan.com/tx/0x0e1c940474c3dce49662c3252a3c40278ceb53724f7d2da4a76b1d2252c1cfa4)

## User privileges
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

Testnet tx: [link](https://testnet.bscscan.com/tx/0xcf6dabac264896a2ffafe75c090f6b25e400c05b9ed71dd7b4668437a3851470)

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

Testnet tx: [link](https://testnet.bscscan.com/tx/0xd0acd51a56bb7dcb4357a7c660ea82678cfa8542c2a7912c029aca1c6dea679e)

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

Testnet tx: [link](https://testnet.bscscan.com/tx/0x4be6d53d04253b9d8c158856e819dc9d07ae3221f875c2769f5dfc286c1137c9)

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

Testnet tx: [link](https://testnet.bscscan.com/tx/0xaf0f7a210f70da871a85652539a3fb944604fa87f2ad588612e736fce9a255c7)

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

Testnet tx: [link](https://testnet.bscscan.com/tx/0xecf9e18a1013d9c8cd404f798b66152fd3499cff46f3f2938f060e064ee5ef0f)

### Getting a pool's allowance

You should use GetPoolAllowance() function.

```solidity
    function GetPoolAllowance(uint256 _PoolId, address _Address) public view returns(uint256);
```
