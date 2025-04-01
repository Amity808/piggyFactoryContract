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
    error Already_Initialized();

    enum GiftCardStatus {
        PENDING, 
    REDEEMED}

    struct GiftCardStruct {
        uint256 poolBalance;
        address owner;
        bool isRedeem;
        address recipient;
        string mail;
        address token;
        GiftCardStatus status;
    }

    uint256 public giftCount;
    address public ownerAccount;
    bool private initialized;


    mapping(bytes32 => GiftCardStruct) public _giftCard;
    mapping(address => bytes32) public _giftCardSig;
    mapping(address => bool) public allowedTokens;
    mapping(address => mapping(uint256 => bytes32)) public _bytes32;
    mapping(address => bytes32[]) private userGiftCards;

    event GiftCardCreated(
        bytes32 indexed cardId,
        address indexed creator,
        address indexed recipient,
        uint256 amount
    );
    event GiftCardRedeemed(
        bytes32 indexed cardId,
        address indexed recipient,
        uint256 amount
    );

    event RandomTransfer(
        address indexed sender,
        address indexed recipient,
        uint256 amount
    );
    event Refund(
        bytes32 indexed cardId,
        address indexed creator,
        uint256 amount
    );
    
    event FundsDistributed(
    address indexed sender,
    address[] recipients,
    uint256 totalAmount
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
        if (amount == 0) revert AmountIs_Zero();
        _;
    }
    modifier notInitialized() {
        if (initialized) revert Already_Initialized();
        _;
    }
    constructor(address _tokenAddress, address _owner) {
        allowedTokens[_tokenAddress] = true;
        ownerAccount = _owner;
    }

  

    function createGiftcard(
        address _recipient,
        uint256 amount,
        address tokenAddress,
        string memory _mail
    )
        public
        AmountISZero(amount)
        AddressZero(tokenAddress)
        Token_Exist(tokenAddress) returns(bytes32 cardId)
    {
        require(
            IERC20(tokenAddress).transferFrom(
                msg.sender,
                address(this),
                amount
            ),
            "Tarnsfer Failed"
        );
        cardId = keccak256(
            abi.encodePacked(msg.sender, _recipient, block.timestamp)
        );
        _giftCard[cardId] = GiftCardStruct({
            poolBalance: amount,
            owner: msg.sender,
            isRedeem: false,
            recipient: _recipient,
            mail: _mail,
            token: tokenAddress, status: GiftCardStatus.PENDING
        });

        userGiftCards[msg.sender].push(cardId);
        userGiftCards[_recipient].push(cardId);


        emit GiftCardCreated(cardId, msg.sender, _recipient, amount);
        cardId;
    }

    function redeemGiftCard(bytes32 _cardId) external nonReentrant {
        GiftCardStruct storage card = _giftCard[_cardId];
        if (card.isRedeem) revert Card_Already_Claimed();
        if (card.recipient != msg.sender) revert YOU_Are_Not_AUTHORIZED();

        

        // Get 5% of the pool balance
        uint256 amount = (card.poolBalance * 5) / 100;

        require(
            IERC20(card.token).transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        card.isRedeem = true;
        card.status = GiftCardStatus.REDEEMED;

        emit GiftCardRedeemed(_cardId, msg.sender, amount);
    }

    function transferRandom(
        address[] calldata recipients,
        uint256 amount,
        address tokenAddress
    ) external {
        require(recipients.length > 0, "No recipients provided");
        require(
            IERC20(tokenAddress).transferFrom(
                msg.sender,
                address(this),
                amount
            ),
            "Transfer failed"
        );

        // Generate a random index
        uint256 randomIndex = uint256(
            keccak256(
                abi.encodePacked(block.timestamp, block.prevrandao, msg.sender)
            )
        ) % recipients.length;
        address selectedRecipient = recipients[randomIndex];

        // Transfer the amount to the selected recipient
        require(
            IERC20(tokenAddress).transfer(selectedRecipient, amount),
            "Transfer to recipient failed"
        );

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

        require(
            IERC20(card.token).transfer(msg.sender, amount),
            "Transfer failed"
        );
        emit Refund(_cardId, msg.sender, amount);
    }

    function createBatchGiftCards(
        address[] calldata _recipients,
        uint256[] calldata _amounts,
        string[] memory mail,
        address _tokenAddress    ) external {
        require(
            _recipients.length == _amounts.length,
            "Recipients and amounts length mismatch"
        );
        IERC20 token = IERC20(_tokenAddress);

        for (uint256 i = 0; i < _recipients.length; i++) {
            require(
                token.transferFrom(msg.sender, address(this), _amounts[i]),
                "Transfer failed"
            );
            bytes32 cardId = keccak256(
                abi.encodePacked(msg.sender, _recipients[i], block.timestamp, i)
            );
            _giftCard[cardId] = GiftCardStruct({
                poolBalance: _amounts[i],
                owner: msg.sender,
                recipient: _recipients[i],
                isRedeem: false,
                mail: mail[i],
                token: address(token),
                status: GiftCardStatus.PENDING
            });
            emit GiftCardCreated(
                cardId,
                msg.sender,
                _recipients[i],
                _amounts[i]
            );
        }
    }

    
    function distributeEqually(
    address[] calldata recipients,
    uint256 totalAmount,
    address tokenAddress
) external {
    // Validate inputs
    require(recipients.length > 0, "No recipients provided");
    require(totalAmount > 0, "Amount must be greater than zero");
    require(tokenAddress != address(0), "Invalid token address");

    // Transfer total amount from sender to contract
    require(
        IERC20(tokenAddress).transferFrom(
            msg.sender,
            address(this),
            totalAmount
        ),
        "Transfer failed"
    );

    // Calculate amount per recipient
    uint256 amountPerRecipient = totalAmount / recipients.length;

    // Distribute funds to each recipient
    for (uint256 i = 0; i < recipients.length; i++) {
        require(
            IERC20(tokenAddress).transfer(recipients[i], amountPerRecipient),
            "Transfer to recipient failed"
        );
    }

    // If there's a remainder due to division, send it back to sender
    // uint256 remainder = totalAmount - (amountPerRecipient * recipients.length);
    // if (remainder > 0) {
    //     require(
    //         IERC20(tokenAddress).transfer(msg.sender, remainder),
    //         "Remainder transfer failed"
    //     );
    // }

    emit FundsDistributed(msg.sender, recipients, totalAmount);
}

    //view funtions
    function getGiftCardsForAddress(
        address user
    ) public view returns (bytes32[] memory) {
        return userGiftCards[user];
    }

    // Add a function to get details of a specific card
    function getGiftCardDetails(
        bytes32 cardId
    )
        public
        view
        returns (
            uint256 poolBalance,
            address owner,
            bool isRedeem,
            address recipient,
            string memory mail,
            address token,
            GiftCardStatus status
        )
    {
        GiftCardStruct memory card = _giftCard[cardId];
        return (
            card.poolBalance,
            card.owner,
            card.isRedeem,
            card.recipient,
            card.mail,
            card.token,
            card.status
        );
    }
}
