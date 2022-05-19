//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";


contract Erc20Token {

    address private immutable owner;

    // uint256  private totalAmount = 10000e18;

    // string  constant private tokenName = "Pepelaz";

    // string constant private tokenSymbol = "PPLZ";

    uint256  private totalAmount;

    string  private tokenName;

    string private tokenSymbol;

    mapping(address => uint256) balances;   

    mapping(address => mapping (address => uint256)) allowed;

    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
    
    event Transfer(address indexed from, address indexed to, uint tokens);

    modifier onlyOwner {
        require(msg.sender == owner, "This operation is available only to the owner");
        _;
    }

    constructor(string memory _name, string memory _symbol, uint256 _totalSupply) {
        owner = msg.sender;
        totalAmount = _totalSupply;
        tokenName = _name;
        tokenSymbol = _symbol;
        balances[msg.sender] = totalAmount;
    }

    function name() public view returns (string memory) {
        return tokenName;
    }

    function symbol() public view returns (string memory) {
        return tokenSymbol;
    }

    function decimals() public view returns (uint8) {
        return 18;
    }

    function totalSupply() public view returns (uint256) {
        return totalAmount;
    }

    function balanceOf(address _owner) public view returns (uint256) {
        return balances[_owner];
    }

     function allowance(address _owner, address _spender) public view returns (uint256) {
        return allowed[_owner][_spender];
    }

    function transfer(address _to, uint256 _amount) public returns (bool) {
        require(_amount <= balances[msg.sender],"Not possible to transfer more than exising amount");
        balances[msg.sender] -= _amount;
        balances[_to] += _amount;
        emit Transfer(msg.sender, _to, _amount);
        return true;
    }

    function approve(address _spender, uint256 _amount) public returns (bool) {
        _approve(msg.sender, _spender, _amount);
        return true;
    }

    function _approve(address _owner, address _spender, uint256 _amount) private {
         allowed[_owner][_spender] = _amount;
        emit Approval(_owner, _spender, _amount);
    }

    function increaseAllowance(address _spender, uint256 _added) public returns (bool) {
        _approve(msg.sender, _spender, allowance(msg.sender, _spender) + _added);
        return true;
    }

    function decreaseAllowance(address _spender, uint256 _subtracted) public returns (bool) {
        uint256 current = allowance(msg.sender, _spender);
        require(current >= _subtracted, "Not possible to decrease less than zero");
        _approve(owner, _spender, current - _subtracted);
        return true;
    }

    function transferFrom(address _from, address _to, uint _amount) public returns (bool) {
        require(_amount <= balances[_from], "Not possible to transfer more than exising amount");
        require(_amount <= allowed[_from][msg.sender], "Not possible to transfer more than approved amount");
        balances[_from] -= _amount;
        allowed[_from][msg.sender] -= _amount;
        balances[_to] += _amount;
        emit Transfer(_from, _to, _amount);
        return true;
    }

    function mint(address _account, uint256 _amount) onlyOwner public  {
        totalAmount += _amount;
        balances[_account] += _amount;
        emit Transfer(address(0), _account, _amount);
    }

     function burn(address _account, uint256 _amount) onlyOwner public  {
        require(_amount <= balances[_account], "Not possible to burn more than exising amount");
        balances[_account] -= _amount;
        totalAmount -= _amount;
        emit Transfer(_account, address(0), _amount);
    }

}