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
- [License](#license)

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
### Transfer of ownership of locked tokens

```solidity
function TransferPoolOwnership(
        uint256 _PoolId,
        address _NewOwner
    ) external;
```

### Splitting a pool amount
When you splitting a pool, it creates a new pool with splitted amount, in the original pool, the amount is reduced by the amount of the new pool.

```solidity
    function SplitPoolAmount(
        uint256 _PoolId,
        uint256 _NewAmount,
        address _NewOwner
    ) external returns(uint256)
```

### Approving an allowance

```solidity
    function ApproveAllowance(
        uint256 _PoolId,
        uint256 _Amount,
        address _Spender
    ) external;
```

## List of functions for user
### Creating a new pool
<pre><b>ATENTION!</b>
The number of locked tokens must be approved by the contract of the token before use.</pre>

**CreateNewPool()** function allows us to create a new pool for locking tokens. If it is needed you have to pay some fee for creation.

```solidity
    function CreateNewPool(
        address _Token, // Token address to lock
        uint256 _StartTime, // Until what time a pool will start
        uint256 _FinishTime, // Until what time a pool will end
        uint256 _StartAmount, // Total amount of the tokens to sell in a pool
        address _Owner // Token owner
    ) external payable;
```

### Creating an array of pools
<pre><b>ATENTION!</b>
The number of locked tokens must be approved by the contract of the token before use.</pre>

**CreateMassPool()** function allows us to create an array of pools for locking tokens.

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
<pre><b>ATENTION!</b>
The number of locked tokens must be approved by the contract of the token before use.</pre>

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

Find pool IDs by specifying token addresses.

```solidity
    function GetMyPoolsIdByToken(address[] memory _tokens)
        public
        view
        returns (uint256[] memory);
```

### Getting a pools' data

Each element of the Pool array will return:
<pre>uint256 <b>StartTime</b>,
uint256 <b>FinishTime</b>,
uint256 <b>StartAmount</b>,
uint256 <b>DebitedAmount</b>,
address <b>Owner</b>, 
address <b>Token</b></pre>

```solidity
    function GetPoolsData(uint256[] memory _ids)
        public
        view
        returns (Pool[] memory)
```

### Is Token without fee

If `_tokenAddress` returns **true**, we don't need to pay to create the pool.

```solidity
    function isTokenWithoutFee(address _tokenAddress) public view returns(bool);
```

### Check token validation

If **false** is returned, the token cannot be used in a locked pool.

```solidity
    function isTokenWhiteListed(address _tokenAddress) public view returns(bool);
```

### Is User without fee

Returns **true** if `_UserAddress` have allocation in WhiteList.

```solidity
    function isUserWithoutFee(address _UserAddress) public view returns(bool);
```

### Gettting a pool data

```solidity
        function AllPoolz(uint256 _id)
        public
        view
        returns (
            uint256, // StartTime
            uint256, // FinishTime
            uint256, // StartAmount
            uint256, // DebitedAmount
            address, // Owner
            address  // Token
        );
```

### Getting all my pools' ids

The function returns an array of all your pools IDs.

```solidity
    function GetAllMyPoolsId() public view returns (uint256[] memory);
```

### Getting my pools ids
Returns only your pools with a balance.

```solidity
    function GetMyPoolsId() public view returns (uint256[] memory);
```

### Withdrawing a token
The **WithdrawToken()** function allows you to withdraw tokens if the pool is over, provided they are still in the pool.

```solidity
    function WithdrawToken(uint256 _PoolId) external returns (bool);
```

### Getting a withdrawable amount

See how many tokens can be unlocked in a pool.

```solidity
    function getWithdrawableAmount(uint256 _PoolId) public view returns(uint256)
```

### Splitting a pool amount from already an existing pool's allowance for a user.
When splitting a pool, the existing allowance for a user in the pool will be reduced by the specified amount.

```solidity
        function SplitPoolAmountFrom(
        uint256 _PoolId,
        uint256 _Amount,
        address _Address
    ) external returns(uint256);
```

### Getting allowance

```solidity
    function GetPoolAllowance(uint256 _PoolId, address _Address) public view returns(uint256);
```

## License
The-Poolz Contracts is released under the MIT License.
