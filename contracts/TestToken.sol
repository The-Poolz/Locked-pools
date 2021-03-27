// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

/**
* @title TestToken is a basic ERC20 Token
*/
contract TestToken is ERC20, Ownable{

    // uint256 public totalSupply;
    // string public name;
    // string public symbol;
    // uint32 public decimals;

    /**
    * @dev assign totalSupply to account creating this contract
    */
    // constructor() public {
    //     symbol = "TEST";
    //     name = "TestToken";
    //     decimals = 5;
    //     totalSupply = 100000000000;

    //     owner = msg.sender;
    //     // balances[msg.sender] = totalSupply;
    //     balanceOf(msg.sender) = totalSupply;

    //     emit Transfer(0x0, msg.sender, totalSupply);
    // }
    constructor() ERC20("TestToken", "TEST") public {
        _setupDecimals(5);
        _mint(msg.sender, 100000000000);
    }
}

