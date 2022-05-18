//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Erc20Token.sol";

contract Staking {
    uint256 private constant MAX_UINT256 = 2**256 - 1;

    address private immutable owner;

    ERC20 private lpToken;

    Erc20Token private rewardToken;
 
    mapping(address => uint256) balances;   

    uint private rewardPercent = 20;

    modifier onlyOwner() {
        require(msg.sender == owner, "This operation is available only to the owner");
        _;
    }

    constructor(address _lpAddress, address _rewardAddress)  {
        owner = msg.sender;
        lpToken = ERC20(_lpAddress);
        lpToken.approve(address(this), MAX_UINT256);

        rewardToken = Erc20Token(_rewardAddress);
    }

    function stake(uint256 _amount) public {  
        lpToken.transferFrom(msg.sender, address(this), _amount);
        balances[msg.sender] = _amount;
    }

    function stakedBy(address _account) public view returns (uint256) {
        return balances[_account];
    }

    function unstake() public {
        lpToken.transferFrom(address(this), msg.sender, balances[msg.sender]);
        balances[msg.sender] = 0;
    }

    function claim() public  {
        uint256 amount = rewardToken.totalSupply() / 100 * rewardPercent;

        rewardToken.approve(address(this), amount);
        rewardToken.transferFrom(address(this), msg.sender, amount);
    }

    function configure(uint8 _rewardPercent) onlyOwner public {
        rewardPercent = _rewardPercent;
    }
}
