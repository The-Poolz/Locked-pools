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
        return KeepNElementsInArray(ids, index);
    }

    function KeepNElementsInArray(uint256[] memory _arr, uint256 _n)
        internal
        pure
        returns (uint256[] memory)
    {
        if (_arr.length == _n) return _arr;
        require(_arr.length > _n,"can't cut more then got");
        uint256[] memory activeIds = new uint256[](_n);
        for (uint256 i = 0; i < _n; i++) {
            activeIds[i] = _arr[i];
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
        require(
            pool.Owner == msg.sender || Allowance[msg.sender][_id] > 0,
            "Private Information"
        );
        return (
            pool.StartTime,
            pool.FinishTime,
            pool.StartAmount,
            pool.DebitedAmount,
            pool.Owner,
            pool.Token
        );
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
            if (isInArray(_tokens, AllPoolz[allIds[i]].Token)) {
                ids[index++] = allIds[i];
            }
        }
        return KeepNElementsInArray(ids, index);
    }

    function isInArray(address[] memory _arr, address _elem)
        internal
        pure
        returns (bool)
    {
        for (uint256 i = 0; i < _arr.length; i++) {
            if (_arr[i] == _elem) return true;
        }
        return false;
    }
}
