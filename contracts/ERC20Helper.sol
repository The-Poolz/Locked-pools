// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract ERC20Helper {
    event TransferOut(uint256 Amount, address To, address Token);
    event TransferIn(uint256 Amount, address From, address Token);
    modifier TestAllownce(
        address _token,
        address _owner,
        uint256 _amount
    ) {
        require(ERC20(_token).allowance(_owner, address(this)) >= _amount, "No allownce");
        _;
    }
    function TransferToken(
        address _Token,
        address _Reciver,
        uint256 _Amount
    ) internal {
        uint256 OldBalance = CheckBalance(_Token, address(this));
        emit TransferOut(_Amount, _Reciver, _Token);
        ERC20(_Token).transfer(_Reciver, _Amount);
        assert((SafeMath.add(CheckBalance(_Token, address(this)), _Amount)) == OldBalance);
    } 
    function CheckBalance(address _Token,address _Subject) internal view returns(uint256) {
        return ERC20(_Token).balanceOf(_Subject);
    }
    function TransferInToken(address _Token,address _Subject,uint256 _Amount) internal TestAllownce(_Token,_Subject,_Amount) {
        require(_Amount > 0, "Amount should be greater than zero");
        uint256 OldBalance = CheckBalance(_Token, address(this));
        ERC20(_Token).transferFrom(_Subject, address(this), _Amount);
        emit TransferIn(_Amount, _Subject, _Token);
        assert(SafeMath.add(OldBalance, _Amount) == CheckBalance(_Token, address(this)));
    }
    function IsERC20(address _contractAddress) internal view returns (bool) {
        if (ERC20(_contractAddress).totalSupply() > 0) return true;
        return false;
    }// check whitelist
}