// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "poolz-helper/contracts/ERC20Helper.sol";
import "poolz-helper/contracts/ETHHelper.sol";
import "poolz-helper/contracts/IWhiteList.sol";

contract Manageable is ETHHelper, ERC20Helper {
    constructor() public {
        maxTransactionLimit = 400;
        isTokenFilterOn = true;
        isUserFilterOn = true;
    }

    mapping (address => uint256) public FeeMap; // to make sure admin takes only fee tokens
    address public FeeTokenAddress;
    uint256 public FeeERC20;
    uint256 public Fee; //the fee for the pool
    uint256 public MinDuration; //the minimum duration of a pool, in seconds

    address public WhiteList_Address;
    bool public isTokenFilterOn;
    bool public isUserFilterOn;
    uint public TokenWhiteListId;
    uint public UserWhiteListId;
    uint256 public maxTransactionLimit;
    
    function setWhiteListAddress(address _address) external onlyOwner{
        WhiteList_Address = _address;
    }

    function setTokenWhiteListId(uint256 _id) external onlyOwner{
        TokenWhiteListId= _id;
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
        return !isTokenFilterOn || IWhiteList(WhiteList_Address).Check(_tokenAddress, TokenWhiteListId) > 0;
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

    function SetFee(uint16 _fee) public onlyOwner{
        Fee = _fee;
    }

    function SetTokenFee(address _tokenAddress, uint256 _fee) public onlyOwner{
        FeeMap[_tokenAddress] = _fee;
    }

    function WithdrawETHFee(address payable _to) public onlyOwner {
        _to.transfer(address(this).balance); // keeps only fee eth on contract //To Do need to take 16% to burn!!!
    }

    function WithdrawERC20Fee(address _Token, address _to) public onlyOwner {
        // ERC20(_Token).transfer(_to, FeeMap[_Token]);
        TransferToken(_Token, _to, FeeMap[_Token]);
        FeeMap[_Token] = 0 ;
    }
}
