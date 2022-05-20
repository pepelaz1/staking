//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol"; 
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol"; 
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Erc20Token.sol";

contract Staking {
    address private immutable owner;

    ERC20 private lpToken;

    Erc20Token private rewardToken;
 
    uint8 private rewardPercent = 20;

    mapping(address => uint256) balances;   

    mapping(address => uint256) rewards;   

    // times when stacking begins
    mapping(address => uint) startTimes; 

    // unstake delay in minutes
    uint8 private unstakeDelay = 10;

    // reward delay in minutes
    uint8 private rewardDelay = 20;

    modifier onlyOwner() {
        require(msg.sender == owner, "This operation is available only to the owner");
        _;
    }
    
    modifier timePassed(uint _duration) {
        require(block.timestamp > startTimes[msg.sender] + _duration * 60, "Time delay has not passed yet");
        _;
    }

    constructor(address _lpAddress, address _rewardAddress)  {
        owner = msg.sender;
        lpToken = ERC20(_lpAddress);
        rewardToken = Erc20Token(_rewardAddress);
    }

    function stake(uint256 _amount) public {  
        lpToken.transferFrom(msg.sender, address(this), _amount);
        balances[msg.sender] += _amount;

       if (block.timestamp > startTimes[msg.sender] +  uint16(rewardDelay) * 60 ) {
             // if reward delay has passed then claim 
             claim();
        }
        startTimes[msg.sender] = block.timestamp;

        // calculate reward and save it for caller address
        uint256 reward = rewards[msg.sender] + (_amount * rewardPercent) / 100;
        rewards[msg.sender] = reward;
    }

    function stakedBy(address _account) public view returns (uint256) {
        return balances[_account];
    }

    function unstake() timePassed(unstakeDelay) public {
        lpToken.transfer(msg.sender, balances[msg.sender]);
        balances[msg.sender] = 0;
    }

    function claim() timePassed(rewardDelay) public  {
        rewardToken.transfer(msg.sender, rewards[msg.sender]);
        rewards[msg.sender] = 0;
    }

    function configure(uint8 _rewardPercent, uint8 _rewardDelay, uint8 _unstakeDelay) onlyOwner public {
        rewardPercent = _rewardPercent;
        rewardDelay = _rewardDelay;
        unstakeDelay = _unstakeDelay;
    }

    function getRewardDelay() public view returns(uint8) {
        return rewardDelay;
    }

    function getRewardPercent() public view returns(uint8) {
        return rewardPercent;
    }

    function getUnstakeDelay() public view returns(uint8) {
        return unstakeDelay;
    }
}
