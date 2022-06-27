// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LockedControl.sol";

contract LockedPoolzData is LockedControl {
    function GetAllMyPoolsId() public view returns (uint256[] memory) {
        return MyPoolz[msg.sender];
    }

    // function GetMyPoolzwithBalance 
    // reconsider msg.sender
    function GetMyPoolsId() public view returns (uint256[] memory){
        uint256[] storage allIds = MyPoolz[msg.sender];
        uint256[] memory ids = new uint256[](allIds.length);
        uint256 index;
        for(uint i=0 ; i<allIds.length ; i++){
            if(AllPoolz[allIds[i]].StartAmount > AllPoolz[allIds[i]].DebitedAmount ){
                ids[index] = allIds[i];
                index++;
            }
        }
        uint[] memory activeIds = new uint256[](index);
        for(uint256 i = 0; i < index; i++){
            activeIds[i] = ids[i];
        } 
        return activeIds;
    }

    function GetPoolData(uint256 _id)
        public
        view
        isPoolValid(_id)
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            address,
            address
        )
    {
        Pool storage pool = AllPoolz[_id];
        require(pool.Owner == msg.sender || pool.Allowance[msg.sender] > 0, "Private Information");
        return (
            pool.StartTime,
            pool.FinishTime,
            pool.StartAmount,
            pool.DebitedAmount,
            pool.Owner,
            pool.Token
        );
    }
}
