export const giftHumman = [
    //"constructor(address _tokenAddress, address _owner)",
  
    "function createGiftcard(address _recipient, uint256 amount, address tokenAddress, string _mail)",
    "function redeemGiftCard(bytes32 _cardId)",
    "function transferRandom(address[] recipients, uint256 amount, address tokenAddress)",
    "function refundGiftCard(bytes32 _cardId)",
    "function createBatchGiftCards(address[] _recipients, uint256[] _amounts, string[] mail, address _tokenAddress)",
    
    "function getGiftCardsForAddress(address user) view returns (bytes32[] memory)",
    "function getGiftCardDetails(bytes32 cardId) view returns (uint256 poolBalance, address owner, bool isRedeem, address recipient, string mail, address token)",
  
    "event GiftCardCreated(bytes32 cardId, address indexed creator, address indexed recipient, uint256 amount)",
    "event GiftCardRedeemed(bytes32 cardId, address indexed recipient, uint256 amount)",
    "event RandomTransfer(address indexed sender, address indexed recipient, uint256 amount)",
    "event Refund(bytes32 indexed cardId, address indexed creator, uint256 amount)"
  ]
  