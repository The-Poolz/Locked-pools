// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LockedControl.sol";

contract LockedPoolzData is LockedControl {
    function GetAllMyPoolsId(address _UserAddress)
        public
        view
        returns (uint256[] memory)
    {
        return MyPoolz[_UserAddress];
    }

    // function GetMyPoolzwithBalance
    // reconsider msg.sender
    function GetMyPoolsId(address _UserAddress)
        public
        view
        returns (uint256[] memory)
    {
        uint256[] storage allIds = MyPoolz[_UserAddress];
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

    function GetMyPoolsIdByToken(address _UserAddress, address[] memory _Tokens)
        public
        view
        returns (uint256[] memory)
    {
        uint256[] storage allIds = MyPoolz[_UserAddress];
        uint256[] memory ids = new uint256[](allIds.length);
        uint256 index;
        for (uint256 i = 0; i < allIds.length; i++) {
            if (Array.isInArray(_Tokens, AllPoolz[allIds[i]].Token)) {
                ids[index++] = allIds[i];
            }
        }
        return Array.KeepNElementsInArray(ids, index);
    }

    function GetMyPoolDataByToken(
        address _UserAddress,
        address[] memory _Tokens
    ) public view returns (Pool[] memory) {
        return GetPoolsData(GetMyPoolsIdByToken(_UserAddress, _Tokens));
    }
}
