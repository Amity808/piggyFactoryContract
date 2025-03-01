// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract PiggyBank  {

    error Token_NOTExist();
    error Only_Owner();
    error AmountIsZero();
    error IS_Piggyback_NotActive();
    error Address_Zero();
    error Only_Admin();
    error Not_Yet_Time();

    string public purpose;
    address public owner;
    uint256 public balance;
    bool public isActive;
    address public admin;
    uint256 public deadline;

    mapping(address => bool) public allowedTokens;

    modifier onlyAdmin() {
        if (msg.sender != admin) revert Only_Admin();
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert Only_Owner();
        _;
    }
    /////// reuse modifier
    modifier AmountISZero(uint256 amount) {
        if (amount == 0) revert AmountIsZero();
        _;
    }
    modifier AddressZero(address addressCheck) {
        if (addressCheck == address(0)) revert Address_Zero();
        _;
    }

    modifier Token_Exist(address token) {
        if (allowedTokens[token] == false) revert Token_NOTExist();
        _;
    }
    modifier Is_Active() {
        if (isActive == false) revert IS_Piggyback_NotActive();
        _;
    }

    modifier Is_Time() {
        if (block.timestamp < deadline) revert Not_Yet_Time();
        _;
    }

    event Deposited(address indexed from, address indexed token,uint256 amount);
    event Withdrawn(address indexed to, address indexed token, uint256 amount);

    

    function initialize(string memory _purpose, address _admin, address _owner, address _token, address _token1) external  {
        purpose = _purpose;
        owner = _owner;
        admin = _admin;
        allowedTokens[_token] = true;
        allowedTokens[_token1] = true;
    }

    function deposit(
        address token,
        uint256 amount, uint256 _days
    ) external onlyOwner AmountISZero(amount) AddressZero(token) {
        if (allowedTokens[token] == false) revert Token_NOTExist();
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Token transfer failed");
        deadline = block.timestamp + (_days * 1 days);
        balance += amount;
        isActive = true;
        emit Deposited(msg.sender, token, amount);
    }

    function calculateWithDeductionFee(
        uint256 _amount
    ) internal pure AmountISZero(_amount) returns (uint256) {
        uint256 fee = (_amount * 15) / 100;
        return fee;

    }

    function withdraw(
        address token
    ) external onlyOwner Token_Exist(token) AmountISZero(balance) Is_Active Is_Time {
    require(IERC20(token).transfer(msg.sender, balance), "Token transfer failed");
    balance = 0;
    isActive = false;
    emit Withdrawn(msg.sender, token, balance);
    }

    function emergencyWithdraw(
        address token
    ) external onlyOwner Token_Exist(token) AmountISZero(balance) Is_Active {
        if (allowedTokens[token] == false) revert Token_NOTExist();
        uint256 fine = calculateWithDeductionFee(balance);
        require(IERC20(token).transfer(msg.sender, (balance - fine)), "Token transfer failed");
        require(IERC20(token).transfer(admin, (fine)), "Token transfer failed");
        balance = 0;
        isActive = false;
        emit Withdrawn(msg.sender, token, balance);
    }

    function addToken(address token) external onlyAdmin {
        if (allowedTokens[token] == false) revert Token_NOTExist();
        allowedTokens[token] = true;
    }
}
