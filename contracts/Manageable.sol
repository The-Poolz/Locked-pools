// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "poolz-helper-v2/contracts/interfaces/IWhiteList.sol";
import "poolz-helper-v2/contracts/FeeBaseHelper.sol";

contract Manageable is FeeBaseHelper {
    constructor() {
        maxTransactionLimit = 400;
        isTokenFilterOn = false; // disable token filter whitelist
    }
    uint256 public MinDuration; //the minimum duration of a pool, in seconds

    address public WhiteList_Address;
    bool public isTokenFilterOn; // use to enable/disable token filter
    uint public TokenWhiteListId;
    uint public TokenFilterWhiteListId;
    uint public UserWhiteListId;
    uint256 public maxTransactionLimit;
    
    modifier notZeroAddress(address _address){
        require(_address != address(0x0), "Zero Address is not allowed");
        _;
    }

    function setWhiteListAddress(address _address) external onlyOwner{
        WhiteList_Address = _address;
    }

    function setTokenWhiteListId(uint256 _id) external onlyOwner{
        TokenWhiteListId= _id;
    }

    function setTokenFilterWhiteListId(uint256 _id) external onlyOwner{
        TokenFilterWhiteListId = _id;
    }

    function setUserWhiteListId(uint256 _id) external onlyOwner{
        UserWhiteListId = _id;
    }

    function swapTokenFilter() external onlyOwner{
        isTokenFilterOn = !isTokenFilterOn;
    }

    function isTokenWithoutFee(address _tokenAddress) notZeroAddress(WhiteList_Address) public view returns(bool) {
        return IWhiteList(WhiteList_Address).Check(_tokenAddress, TokenWhiteListId) > 0;
    }

    function isTokenWhiteListed(address _tokenAddress) public view returns(bool) {
        return !isTokenFilterOn || IWhiteList(WhiteList_Address).Check(_tokenAddress, TokenFilterWhiteListId) > 0;
    }

    function isUserWhiteListed(address _UserAddress) notZeroAddress(WhiteList_Address) public view returns(bool) {
        return IWhiteList(WhiteList_Address).Check(_UserAddress, UserWhiteListId) > 0;
    }

    function setMaxTransactionLimit(uint256 _newLimit) external onlyOwner{
        maxTransactionLimit = _newLimit;
    }

    function SetMinDuration(uint16 _minDuration) public onlyOwner {
        MinDuration = _minDuration;
    }
}
