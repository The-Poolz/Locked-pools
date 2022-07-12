// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "poolz-helper-v2/contracts/interfaces/IWhiteList.sol";
import "poolz-helper-v2/contracts/FeeBaseHelper.sol";
import "./LockedDealEvents.sol";
import "./LockedDealModifiers.sol";

contract LockedManageable is FeeBaseHelper, LockedDealEvents, LockedDealModifiers {
    constructor() {
        maxTransactionLimit = 400;
        isTokenFilterOn = false; // disable token filter whitelist
    }

    function setWhiteListAddress(address _address) external onlyOwner {
        WhiteList_Address = _address;
    }

    function setTokenFeeWhiteListId(uint256 _id) external onlyOwner {
        TokenFeeWhiteListId = _id;
    }

    function setTokenFilterWhiteListId(uint256 _id) external onlyOwner {
        TokenFilterWhiteListId = _id;
    }

    function setUserWhiteListId(uint256 _id) external onlyOwner {
        UserWhiteListId = _id;
    }

    function swapTokenFilter() external onlyOwner {
        isTokenFilterOn = !isTokenFilterOn;
    }

    function isTokenWithoutFee(address _tokenAddress) notZeroAddress(WhiteList_Address) public view returns(bool) {
        return IWhiteList(WhiteList_Address).Check(_tokenAddress, TokenFeeWhiteListId) > 0;
    }

    function isTokenWhiteListed(address _tokenAddress) public view returns(bool) {
        return !isTokenFilterOn || IWhiteList(WhiteList_Address).Check(_tokenAddress, TokenFilterWhiteListId) > 0;
    }

    function isUserWithoutFee(address _UserAddress) notZeroAddress(WhiteList_Address) public view returns(bool) {
        return IWhiteList(WhiteList_Address).Check(_UserAddress, UserWhiteListId) > 0;
    }

    function setMaxTransactionLimit(uint256 _newLimit) external onlyOwner{
        maxTransactionLimit = _newLimit;
    }
}
