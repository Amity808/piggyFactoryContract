// SPDX-License-Identifier: UNLICENSE-2.0

pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


contract GiftCardContract is ReentrancyGuard {
    error Address_Zero();
    error Token_NOTExist();
    error Transfer_FAILED();
    error Card_Already_Claimed();
    error YOU_Are_Not_AUTHORIZED();

    struct GiftCardStruct {
        uint256 poolBalance;
        address owner;
        bool isRedeem;
        address recipient;
        string mail;
    }

    mapping(bytes32 => GiftCardStruct) public _giftCard;
    mapping(address => bytes32) public _giftCardSig;
    mapping(address => bool) public allowedTokens;

    event GiftCardCreated(
        bytes32 cardId,
        address indexed creator,
        address indexed recipient,
        uint256 amount
    );
    event GiftCardRedeemed(
        bytes32 cardId,
        address indexed recipient,
        uint256 amount
    );

    modifier Token_Exist(address token) {
        if (allowedTokens[token] == false) revert Token_NOTExist();
        _;
    }

    modifier AddressZero(address addressCheck) {
        if (addressCheck == address(0)) revert Address_Zero();
        _;
    } 
    
    modifier AmountISZero(uint256 amount) {
        if (amount == 0) revert AmountIsZero();
        _;
    }
    constructor(address _tokenAddress) {}

    function createGiftCard(
        address _recipient,
        uint256 amount,
        address tokenAddress, string memory _mail
    ) public AmountISZero(amount)
        AddressZero(tokenAddress)
        Token_Exist(tokenAddress) {
        require(
            IERC20(tokenAddress).transferFrom(
                msg.sender,
                address(this),
                amount
            ),
            "Tarnsfer Failed"
        );
        bytes32 cardId = keccak256(
            abi.encodePacked(msg.sender, _recipient, block.timestamp)
        );
        _giftCard[cardId] = GiftCardStruct({
            poolBalance: amount,
            owner: msg.sender,
            isRedeem: false,
            recipient: _recipient,
            mail: _mail
        });
        emit GiftCardCreated(cardId, msg.sender, _recipient, amount);
    }

    function redeemGiftCard(bytes32 _cardId, address tokenAddress) external Token_Exist(token)  nonReentrant {
        GiftCardStruct storage card = _giftCard[_cardId];
        if (card.isRedeem) revert Card_Already_Claimed();
        if (card.recipient != msg.sender) revert YOU_Are_Not_AUTHORIZED();

        card.isRedeem = true;

        // Get 5% of the pool balance
        uint256 amount = (card.poolBalance * 5) / 100;

        require(
            IERC20(tokenAddress).transferFrom(
                msg.sender,
                address(this),
                amount
            ),
            "Transfer failed"
        );

        emit GiftCardRedeemed(_cardId, msg.sender, amount);
    }
}
