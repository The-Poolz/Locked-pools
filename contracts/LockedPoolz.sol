// SPDX-License-Identifier: MIT
pragma solidity >=0.4.24 <0.7.0;
pragma experimental ABIEncoderV2;

import "./Manageable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract LockedPoolz is Manageable {
    constructor() public {
        Index = 0;
    }
    

    // add contract name
    string public name;

    event NewPoolCreated(address Token, uint64 FinishTime, uint256 StartAmount, address Owner);

    struct Pool {
        uint64 UnlockTime;
        uint256 Amount;
        address Owner;
        address Token;
        mapping(address => uint) allowance;
    }
    // transfer ownership
    // allowance
    // split amount

    mapping(uint256 => Pool) AllPoolz;
    mapping(address => uint256[]) MyPoolz;
    uint256 internal Index;

    modifier isTokenValid(address _Token){
        require(IsERC20(_Token), "Need Valid ERC20 Token"); //check if _Token is ERC20
        _;
    }

    //create a new pool
    function CreatePool(
        address _Token, //token to lock address
        uint64 _FinishTime, //Until what time the pool will work
        uint256 _StartAmount, //Total amount of the tokens to sell in the pool
        address _Owner // Who the tokens belong to
    ) internal {
        require(_Owner != address(0x0), "can't lock for zero");
        TransferInToken(_Token, msg.sender, _StartAmount);
        //register the pool
        AllPoolz[Index] = Pool(_FinishTime, _StartAmount, _Owner, _Token);
        MyPoolz[_Owner].push(Index);
        Index = SafeMath.add(Index, 1); //joke - overflowfrom 0 on int256 = 1.16E77
        emit NewPoolCreated(_Token, _FinishTime, _StartAmount, _Owner);
    }

    function CreatePoolsInBulk(
        address _Token,
        uint64[2][] calldata _FinishTime,
        uint256[2][] calldata _StartAmount,
        address[] calldata _Owner
    ) external isTokenValid(_Token) {
        require(_FinishTime.length == _StartAmount.length, "Invalid Arguments" );
        for(uint i=0 ; i<_Owner.length; i++){
            for(uint j=0 ; j < _FinishTime[i].length ; j++){
                if(_FinishTime[j][0] == i && _StartAmount[j][0] == i){
                    CreatePool(_Token, _FinishTime[j][1], _StartAmount[j][1], _Owner[i]);
                }
            }
        }
    }
    
    function CreatePoolsInBulk2(
        address _Token,
        uint64[][] calldata _FinishTime,
        uint256[] calldata _StartAmount,
        address[] calldata _Owner
    ) external isTokenValid(_Token) {
        require(_Owner.length == _StartAmount.length, "Invalid array length of Owners or Amounts");
        require(_Owner.length == _FinishTime.length, "Invalid array length of FinishTime");
        for(uint i=0 ; i < _Owner.length ; i++){
            for(uint j=0 ; j < _FinishTime[i].length ; j++){
                CreatePool(_Token, _FinishTime[i][j], _StartAmount[i], _Owner[i]);
            }
        }
    }

}
