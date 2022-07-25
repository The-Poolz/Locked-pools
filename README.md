# Locked Deal V2

[![Build Status](https://travis-ci.com/The-Poolz/Locked-pools.svg?branch=master)](https://travis-ci.com/The-Poolz/Locked-pools)
[![codecov](https://codecov.io/gh/The-Poolz/Locked-pools/branch/master/graph/badge.svg?token=szMZsBIF3L)](https://codecov.io/gh/The-Poolz/Locked-pools)
[![CodeFactor](https://www.codefactor.io/repository/github/the-poolz/locked-pools/badge)](https://www.codefactor.io/repository/github/the-poolz/locked-pools)

Smart contract for secure storage of ERC20 tokens.

### Navigation

- [Installation](#installation)
- [Admin](#admin-settings)
- [Owner of locked tokens](#pool-owner-settings)
- [User](#user-settings)
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

## Admin settings

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

Testnet tx: [link](https://testnet.bscscan.com/tx/0x346c84ff830fccadba03cdf43b1b11e40a46094a23060dcbaa89666673fde4b9)

### Non-paid token

Locked-pools can uses three manual whitelists. One of them is a whitelist for tokens that are exempt from paying fees.

```solidity
    function setTokenFeeWhiteListId(uint256 _id) external;
```

Testnet tx: [link](https://testnet.bscscan.com/tx/0x2e0ff4c5e3691d5d6363cd674417fe0dc023102b5f6b59d98b62045d5c0b9c32)

### Security token filter

If someone is trying to lock tokens that damage the contract, we can create a whitelist of tokens that can only be used to create a locked pool.

```solidity
    function setTokenFilterWhiteListId(uint256 _id) external;
```

Testnet tx: [link](https://testnet.bscscan.com/tx/0x0a48a6fcbc0a3a2d6b2166ef1d2db59138ef825e1dcedb2a13b36e1fd5a639be)

### User without fee

Setting a whitelist ID for users who are exempt from paying fees.

```solidity
    function setUserWhiteListId(uint256 _id) external;
```

Testnet tx: [link](https://testnet.bscscan.com/tx/0xbd388e59f691ff901510185e6a81f56ba04562e57e8c40e04c93b7dc7fa90ccd)

### Max transaction limit

There is a restriction on the implementation of mass locked pools.

```solidity
    // by default, the maximum transaction limit is 400
    function setMaxTransactionLimit(uint256 _newLimit) external;
```

Testnet tx: [link](https://testnet.bscscan.com/tx/0x67662cceb667670602d3d5ea35827083c9b2651e8f82db06317bfbfb649891b5)

### Enable/Disable token filter

```solidity
    // by default the token filter is disabled
    function swapTokenFilter() external;
```

Testnet tx: [link](https://testnet.bscscan.com/tx/0xe985d976f303662e1710f9982d2ade3031073909370b21a8f5fca01ccc122286)

## Pool owner settings
### Transfer of ownership of locked tokens

After using PoolTransfer, a new locked-pool of tokens is created based on the previous one, but with a new owner.

```solidity
    function PoolTransfer(uint256 _PoolId, address _NewOwner)
        external;
```

Testnet tx: [link](https://testnet.bscscan.com/tx/0xf0617971a2bf135a0f3c739ff07c19162a2312b78844e0021707a203905c60f2)

### Splitting a pool amount
When you splitting a pool, it creates a new pool with splitted amount, in the original pool, the amount is reduced by the amount of the new pool.

```solidity
    function SplitPoolAmount(
        uint256 _PoolId,
        uint256 _NewAmount,
        address _NewOwner
    ) external returns(uint256)
```

Testnet tx: [link](https://testnet.bscscan.com/tx/0x3c448f482b866eb8c379a3599d0555013a2396dde327a992d38267c28abdea19)

### Approving an allowance

Using the ApproveAllowance function, we can allocate an amount for non-owner addresses to split the pool.

```solidity
    function ApproveAllowance(
        uint256 _PoolId,
        uint256 _Amount,
        address _Spender
    ) external;
```

Testnet tx: [link](https://testnet.bscscan.com/tx/0x0e1c940474c3dce49662c3252a3c40278ceb53724f7d2da4a76b1d2252c1cfa4)

## User settings
### Creating a new pool
<pre><b>ATTENTION!</b>
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

Testnet tx: [link](https://testnet.bscscan.com/tx/0xcf6dabac264896a2ffafe75c090f6b25e400c05b9ed71dd7b4668437a3851470)

### Creating an array of pools
<pre><b>ATTENTION!</b>
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

Testnet tx: [link](https://testnet.bscscan.com/tx/0xd0acd51a56bb7dcb4357a7c660ea82678cfa8542c2a7912c029aca1c6dea679e)

### Creating an array of pools with respect to finish time
<pre><b>ATTENTION!</b>
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

Testnet tx: [link](https://testnet.bscscan.com/tx/0x4be6d53d04253b9d8c158856e819dc9d07ae3221f875c2769f5dfc286c1137c9)

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

### Does the user have to pay a commission?

Returns **true** if `_UserAddress` have allocation in WhiteList.

```solidity
    function isUserWithoutFee(address _UserAddress) public view returns(bool);
```

### Gettting a pool data

There is a way how to get a pool data.

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

Testnet tx: [link](https://testnet.bscscan.com/tx/0xaf0f7a210f70da871a85652539a3fb944604fa87f2ad588612e736fce9a255c7)

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

Testnet tx: [link](https://testnet.bscscan.com/tx/0xecf9e18a1013d9c8cd404f798b66152fd3499cff46f3f2938f060e064ee5ef0f)

### Getting allowance

There is a way how to get a pool allowance.

```solidity
    function Allowance(uint256 _PoolId, address _Address) public view returns(uint256);
```

## License
The-Poolz Contracts is released under the MIT License.
