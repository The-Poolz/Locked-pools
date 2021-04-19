// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./LockedControl.sol";

contract LockedPoolzData is LockedControl {
    function GetMyPoolsId() public view returns (uint256[] memory) {
        return MyPoolz[msg.sender];
    }

    function GetPoolData(uint256 _id)
        public
        view
        isPoolValid(_id)
        returns (
            uint64,
            uint256,
            address,
            address
        )
    {
        Pool storage pool = AllPoolz[_id];
        require(pool.Owner == msg.sender || pool.Allowance[msg.sender] > 0, "Private Information");
        return (
            AllPoolz[_id].UnlockTime,
            AllPoolz[_id].Amount,
            AllPoolz[_id].Owner,
            AllPoolz[_id].Token
        );
    }
}
