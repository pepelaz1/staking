//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenTwo is ERC20 {
    uint constant _initial_supply = 10e18;
    constructor() ERC20("TokenTwo", "TT") {
        _mint(msg.sender, _initial_supply);
    }
}