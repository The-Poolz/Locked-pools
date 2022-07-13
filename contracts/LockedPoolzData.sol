// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LockedControl.sol";

contract LockedPoolzData is LockedControl {
    function GetAllMyPoolsId() public view returns (uint256[] memory) {
        return MyPoolz[msg.sender];
    }

    // function GetMyPoolzwithBalance
    // reconsider msg.sender
    function GetMyPoolsId() public view returns (uint256[] memory) {
        uint256[] storage allIds = MyPoolz[msg.sender];
        uint256[] memory ids = new uint256[](allIds.length);
        uint256 index;
        for (uint256 i = 0; i < allIds.length; i++) {
            if (
                AllPoolz[allIds[i]].StartAmount >
                AllPoolz[allIds[i]].DebitedAmount
            ) {
                ids[index++] = allIds[i];
            }
        }
        return Array.KeepNElementsInArray(ids, index);
    }

    function GetPoolsData(uint256[] memory _ids)
        public
        view
        returns (Pool[] memory)
    {
        Pool[] memory data = new Pool[](_ids.length);
        for (uint256 i = 0; i < _ids.length; i++) {
            require(_ids[i] < Index, "Pool does not exist");
            data[i] = Pool(
                AllPoolz[_ids[i]].StartTime,
                AllPoolz[_ids[i]].FinishTime,
                AllPoolz[_ids[i]].StartAmount,
                AllPoolz[_ids[i]].DebitedAmount,
                AllPoolz[_ids[i]].Owner,
                AllPoolz[_ids[i]].Token
            );
        }
        return data;
    }

    function GetMyPoolsIdByToken(address[] memory _tokens)
        public
        view
        returns (uint256[] memory)
    {
        uint256[] storage allIds = MyPoolz[msg.sender];
        uint256[] memory ids = new uint256[](allIds.length);
        uint256 index;
        for (uint256 i = 0; i < allIds.length; i++) {
            if (Array.isInArray(_tokens, AllPoolz[allIds[i]].Token)) {
                ids[index++] = allIds[i];
            }
        }
        return Array.KeepNElementsInArray(ids, index);
    }
}
