// SPDX-License-Identifier: UNLICENSE-2.0

pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// TODO implement a function that takes lists of addresses and pick an address to transfer certain amounts to it 
contract GiftCardContract is ReentrancyGuard {
    error Address_Zero();
    error Token_NOTExist();
    error Transfer_FAILED();
    error Card_Already_Claimed();
    error YOU_Are_Not_AUTHORIZED();
    error AmountIs_Zero();

    struct GiftCardStruct {
        uint256 poolBalance;
        address owner;
        bool isRedeem;
        address recipient;
        string mail;
        address token;
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

    event RandomTransfer(address indexed sender, address indexed recipient, uint256 amount);
    event Refund(bytes32 indexed cardId, address indexed creator, uint256 amount);



    modifier Token_Exist(address token) {
        if (allowedTokens[token] == false) revert Token_NOTExist();
        _;
    }

    modifier AddressZero(address addressCheck) {
        if (addressCheck == address(0)) revert Address_Zero();
        _;
    } 
    
    modifier AmountISZero(uint256 amount) {
        if (amount == 0) revert AmountIs_Zero();
        _;
    }
    constructor(address _tokenAddress) {
        allowedTokens[_tokenAddress] = true;
    }

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
            mail: _mail,
            token: tokenAddress
        });
        emit GiftCardCreated(cardId, msg.sender, _recipient, amount);
    }

    function redeemGiftCard(bytes32 _cardId) external  nonReentrant {
        GiftCardStruct storage card = _giftCard[_cardId];
        if (card.isRedeem) revert Card_Already_Claimed();
        if (card.recipient != msg.sender) revert YOU_Are_Not_AUTHORIZED();

        card.isRedeem = true;

        // Get 5% of the pool balance
        uint256 amount = (card.poolBalance * 5) / 100;

        require(
            IERC20(card.token).transferFrom(
                msg.sender,
                address(this),
                amount
            ),
            "Transfer failed"
        );

        emit GiftCardRedeemed(_cardId, msg.sender, amount);
    }

    

   

function transferRandom(address[] calldata recipients, uint256 amount, address tokenAddress) external {
    require(recipients.length > 0, "No recipients provided");
    require(IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount), "Transfer failed");

    // Generate a random index
    uint256 randomIndex = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) % recipients.length;
    address selectedRecipient = recipients[randomIndex];

    // Transfer the amount to the selected recipient
    require(IERC20(tokenAddress).transfer(selectedRecipient, amount), "Transfer to recipient failed");

    emit RandomTransfer(msg.sender, selectedRecipient, amount);
}

function refundGiftCard(bytes32 _cardId) external {
    GiftCardStruct storage card = _giftCard[_cardId];
    require(card.owner == msg.sender, "Only creator can refund");
    require(!card.isRedeem, "Card already redeemed");
    // require(block.timestamp > card.expirationDate, "Gift card has not expired");

    uint256 amount = (card.poolBalance * 10) / 100;
    card.poolBalance = 0;
    card.isRedeem = true;

    require(IERC20(card.token).transfer(msg.sender, amount), "Transfer failed");
    emit Refund(_cardId, msg.sender, amount);
}


function createBatchGiftCards(address[] calldata _recipients, uint256[] calldata _amounts, address _tokenAddress, uint256 _expirationDate) external {
    require(_recipients.length == _amounts.length, "Recipients and amounts length mismatch");
    IERC20 token = IERC20(_tokenAddress);

    for (uint256 i = 0; i < _recipients.length; i++) {
        require(token.transferFrom(msg.sender, address(this), _amounts[i]), "Transfer failed");
        bytes32 cardId = keccak256(abi.encodePacked(msg.sender, _recipients[i], block.timestamp, i));
        _giftCard[cardId] = GiftCardStruct({
            poolBalance: _amounts[i],
            owner: msg.sender,
            recipient: _recipients[i],
            isRedeem: false,
            mail: "", token: address(token)
        });
        emit GiftCardCreated(cardId, msg.sender, _recipients[i], _amounts[i]);
    }
}

}
