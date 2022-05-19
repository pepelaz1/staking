//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Erc20Token.sol";

contract Staking {
    //uint256 private constant MAX_UINT256 = 2**256 - 1;

    address private immutable owner;

    ERC20 private lpToken;

    Erc20Token private rewardToken;
 
    uint8 private rewardPercent = 20;

    mapping(address => uint256) balances;   

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
        lpToken.approve(address(this), type(uint256).max);

        rewardToken = Erc20Token(_rewardAddress);
    }

    function stake(uint256 _amount) public {  
        lpToken.transferFrom(msg.sender, address(this), _amount);
        balances[msg.sender] = _amount;
        startTimes[msg.sender] = block.timestamp;
    }

    function stakedBy(address _account) public view returns (uint256) {
        return balances[_account];
    }

    function unstake() timePassed(unstakeDelay) public {
        lpToken.transferFrom(address(this), msg.sender, balances[msg.sender]);
        balances[msg.sender] = 0;
    }

    function claim() timePassed(rewardDelay) public  {
        uint256 amount = rewardToken.totalSupply() / 100 * rewardPercent;

        rewardToken.approve(address(this), amount);
        rewardToken.transferFrom(address(this), msg.sender, amount);
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
