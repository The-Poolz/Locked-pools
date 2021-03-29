// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "./PozBenefit.sol";
import "./IWhiteList.sol";

contract Manageable is PozBenefit {
    constructor() public {
        Fee = 20; // *10000
        MinDuration = 0; //need to set
        maxTransactionLimit = 400;
    }
    mapping (address => uint256) FeeMap;
    //@dev for percent use uint16
    uint16 internal Fee; //the fee for the pool
    uint16 internal MinDuration; //the minimum duration of a pool, in seconds

    address public WhiteList_Address;
    bool public isTokenFilterOn;
    uint public WhiteListId;
    uint256 public maxTransactionLimit;
    
    function setWhiteListAddress(address _address) external onlyOwner{
        WhiteList_Address = _address;
    }

    function setWhiteListId(uint256 _id) external onlyOwner{
        WhiteListId= _id;
    }

    function swapTokenFilter() external onlyOwner{
        isTokenFilterOn = !isTokenFilterOn;
    }

    function isTokenWhiteListed(address _tokenAddress) public view returns(bool) {
        return !isTokenFilterOn || IWhiteList(WhiteList_Address).Check(_tokenAddress, WhiteListId) > 0;
    }

    function setMaxTransactionLimit(uint256 _newLimit) external onlyOwner{
        maxTransactionLimit = _newLimit;
    }

    function GetMinDuration() public view returns (uint16) {
        return MinDuration;
    }

    function SetMinDuration(uint16 _minDuration) public onlyOwner {
        MinDuration = _minDuration;
    }

    function GetFee() public view returns (uint16) {
        return Fee;
    }

    function SetFee(uint16 _fee) public onlyOwner
        PercentCheckOk(_fee)
        LeftIsBigger( _fee, PozFee) {
        Fee = _fee;
    }

    function SetPOZFee(uint16 _fee)
        public
        onlyOwner
        PercentCheckOk(_fee)
        LeftIsBigger( Fee,_fee)
    {
        PozFee = _fee;
    }

    function WithdrawETHFee(address payable _to) public onlyOwner {
        _to.transfer(address(this).balance); // keeps only fee eth on contract //To Do need to take 16% to burn!!!
    }

    function WithdrawERC20Fee(address _Token, address _to) public onlyOwner {    
        ERC20(_Token).transfer(_to, FeeMap[_Token]);
        FeeMap[_Token] = 0 ;
    }
}
