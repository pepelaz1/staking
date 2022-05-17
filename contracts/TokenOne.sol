//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol'; 
import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol'; 
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenOne is ERC20 {
    uint constant _initial_supply = 10000e18;
    constructor() ERC20("TokenOne", "TO") {
        _mint(msg.sender, _initial_supply);
    }
}