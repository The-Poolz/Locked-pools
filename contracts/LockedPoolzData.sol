// SPDX-License-Identifier: MIT
pragma solidity >=0.4.24 <0.7.0;

import "./LockedPoolz.sol";

contract LockedPoolzData is LockedPoolz {
    function GetMyPoolsId() public view returns (uint256[]) {
        return MyPoolz[msg.sender];
    }

    function GetPoolData(uint256 _id)
        public
        view
        returns (
            uint64,
            uint256,
            address,
            address
        )
    {
        require(_id < Index, "Wrong Id");
        require(AllPoolz[_id].Owner == msg.sender, "Private Information");
        return (
            AllPoolz[_id].UnlockTime,
            AllPoolz[_id].Amount,
            AllPoolz[_id].Owner,
            AllPoolz[_id].Token
        );
    }
}
