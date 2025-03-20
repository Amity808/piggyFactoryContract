// SPDX-License-Identifier: UNLICENSE-2.0

pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract GiftCard {

    error Address_Zero();
    error Token_NOTExist();
    error Transfer_FAILED();


    struct GiftCardStruct {
        uint256 poolBalance;
        address owner;
        bool isRedeem;
        // address recipient;
    }

    

    mapping (bytes32=> GiftCard) public _giftCard;
    mapping (address => bytes32) public _giftCardSig;
        mapping(address => bool) public allowedTokens;


    event GiftCardCreated(bytes32 cardId, address indexed creator, address indexed recipient, uint256 amount);
    event GiftCardRedeemed(bytes32 cardId, address indexed recipient, uint256 amount);



    modifier Token_Exist(address token) {
        if (allowedTokens[token] == false) revert Token_NOTExist();
        _;
    }

    modifier AddressZero(address addressCheck) {
        if (addressCheck == address(0)) revert Address_Zero();
        _;
    }
    constructor(address _tokenAddress) {

    }

    function createGiftCard(address _recipent, uint256 amount, address tokenAddress) public {
        require(allowedTokens[tokenAddress]);
    }

}