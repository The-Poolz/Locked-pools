// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LockedPoolz.sol";
import "poolz-helper-v2/contracts/Array.sol";

contract LockedCreation is LockedPoolz {
    function CreateNewPool(
        address _Token, //token to lock address
        uint256 _StartTime, //Until what time the pool will start
        uint256 _CliffTime, //Before CliffTime can't withdraw tokens
        uint256 _FinishTime, //Until what time the pool will end
        uint256 _StartAmount, //Total amount of the tokens to sell in the pool
        address _Owner // Who the tokens belong to
    ) external payable notZeroAddress(_Owner) notZeroValue(_StartAmount) {
        TransferInToken(_Token, msg.sender, _StartAmount);
        payFee(_Token, Fee);
        CreatePool(
            _Token,
            _StartTime,
            _CliffTime,
            _FinishTime,
            _StartAmount,
            0,
            _Owner
        );
    }

    function CreateMassPools(
        address _Token,
        uint256[] calldata _StartTime,
        uint256[] calldata _CliffTime,
        uint256[] calldata _FinishTime,
        uint256[] calldata _StartAmount,
        address[] calldata _Owner
    ) external payable isBelowLimit(_Owner.length) {
        require(_Owner.length == _FinishTime.length, "Date Array Invalid");
        require(_StartTime.length == _FinishTime.length, "Date Array Invalid");
        require(_Owner.length == _StartAmount.length, "Amount Array Invalid");
        require(_CliffTime.length == _FinishTime.length,"CliffTime Array Invalid");
        TransferInToken(_Token, msg.sender, Array.getArraySum(_StartAmount));
        payFee(_Token, Fee * _Owner.length);
        uint256 firstPoolId = Index;
        for (uint256 i = 0; i < _Owner.length; i++) {
            CreatePool(
                _Token,
                _StartTime[i],
                _CliffTime[i],
                _FinishTime[i],
                _StartAmount[i],
                0,
                _Owner[i]
            );
        }
        uint256 lastPoolId = Index - 1;
        emit MassPoolsCreated(firstPoolId, lastPoolId);
    }

    // create pools with respect to finish time
    function CreatePoolsWrtTime(
        address _Token,
        uint256[] calldata _StartTime,
        uint256[] calldata _CliffTime,
        uint256[] calldata _FinishTime,
        uint256[] calldata _StartAmount,
        address[] calldata _Owner
    ) external payable isBelowLimit(_Owner.length * _FinishTime.length) {
        require(_Owner.length == _StartAmount.length, "Amount Array Invalid");
        require(_FinishTime.length == _StartTime.length, "Date Array Invalid");
        require(_CliffTime.length == _FinishTime.length, "CliffTime Array Invalid");
        TransferInToken(
            _Token,
            msg.sender,
            Array.getArraySum(_StartAmount) * _FinishTime.length
        );
        uint256 firstPoolId = Index;
        payFee(_Token, Fee * _Owner.length * _FinishTime.length);
        for (uint256 i = 0; i < _FinishTime.length; i++) {
            for (uint256 j = 0; j < _Owner.length; j++) {
                CreatePool(
                    _Token,
                    _StartTime[i],
                    _CliffTime[i],
                    _FinishTime[i],
                    _StartAmount[j],
                    0,
                    _Owner[j]
                );
            }
        }
        uint256 lastPoolId = Index - 1;
        emit MassPoolsCreated(firstPoolId, lastPoolId);
    }

    function payFee(address _token, uint256 _amount) internal {
        if (isTokenWithFee(_token) && isUserPaysFee(msg.sender)) {
            PayFee(_amount);
        }
    }
}
