// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "poolz-helper-v2/contracts/interfaces/IWhiteList.sol";
import "poolz-helper-v2/contracts/FeeBaseHelper.sol";

contract Manageable is FeeBaseHelper {
    constructor() {
        maxTransactionLimit = 400;
        isTokenFilterOn = false; // disable token blacklist
        isUserFilterOn = true;
    }
    uint256 public MinDuration; //the minimum duration of a pool, in seconds

    address public WhiteList_Address;
    bool public isTokenFilterOn; // use to enable/disable token blacklist
    bool public isUserFilterOn;
    uint public TokenWhiteListId;
    uint public TokenBlackListId;
    uint public UserWhiteListId;
    uint256 public maxTransactionLimit;
    
    function setWhiteListAddress(address _address) external onlyOwner{
        WhiteList_Address = _address;
    }

    function setTokenWhiteListId(uint256 _id) external onlyOwner{
        TokenWhiteListId= _id;
    }

    function setTokenBlackListId(uint256 _id) external onlyOwner{
        TokenBlackListId = _id;
    }

    function setUserWhiteListId(uint256 _id) external onlyOwner{
        UserWhiteListId= _id;
    }

    function swapTokenFilter() external onlyOwner{
        isTokenFilterOn = !isTokenFilterOn;
    }

    function swapUserFilter() external onlyOwner{
        isUserFilterOn = !isUserFilterOn;
    }

    function isTokenWhiteListed(address _tokenAddress) public view returns(bool) {
        return IWhiteList(WhiteList_Address).Check(_tokenAddress, TokenWhiteListId) > 0;
    }

    function isTokenBlackListed(address _tokenAddress) public view returns(bool) {
        return !isTokenFilterOn || IWhiteList(WhiteList_Address).Check(_tokenAddress, TokenBlackListId) > 0;
    }

    function isUserWhiteListed(address _UserAddress) public view returns(bool) {
        return !isUserFilterOn || IWhiteList(WhiteList_Address).Check(_UserAddress, UserWhiteListId) > 0;
    }

    function setMaxTransactionLimit(uint256 _newLimit) external onlyOwner{
        maxTransactionLimit = _newLimit;
    }

    function SetMinDuration(uint16 _minDuration) public onlyOwner {
        MinDuration = _minDuration;
    }
}
