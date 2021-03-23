// SPDX-License-Identifier: MIT

pragma solidity >=0.4.24 <0.7.0;
import "openzeppelin-solidity/contracts/utils/Pausable.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "./ERC20Helper.sol";
import "./IPozBenefit.sol";

contract PozBenefit is Pausable, ERC20Helper, Ownable {
    constructor() public {
        PozFee = 15; // *10000
    }

    uint16 internal PozFee; // the fee for the first part of the pool
    
    modifier PercentCheckOk(uint16 _percent) {
        require(_percent < 10000, "Not in range");
        _;
    }
    modifier LeftIsBigger(uint16 _left, uint16 _right){
        require(_left > _right, "Not bigger");
        _;
    }

    function GetPOZFee() public view returns (uint16) {
        return PozFee;
    }
}
