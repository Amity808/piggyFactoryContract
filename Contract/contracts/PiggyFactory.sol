// SPDX-License-Identifier: MIT

import "./Piggy.sol";
import "./GiftCard.sol";
pragma solidity 0.8.28;


contract PiggyFactory {


    error Invalid_Index(); 
    error Deployment_Failed();
    error Only_Admin();

    address [] public  deployment;
    uint256 public deploymentCount;
    address public admin;


    mapping (uint => address) public piggyDeploy;
    mapping (uint => address) public GiftCardDeploy;


    modifier getDeploymentCount(uint256 index) {
        if (index > deploymentCount) revert Invalid_Index();
        _;
    }

    modifier onlyAdmin() {
        if (msg.sender != admin) revert Only_Admin();
        _;
    }

    event PiggyDeployed(address indexed piggy, address indexed owner, string purpose);
    

    constructor() {
        admin = msg.sender;
    }


    function deployPiggy(string memory purpose, address _token, address _token1) external returns(address piggy) {
        bytes memory bytecode = type(PiggyBank).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(purpose));
        assembly {
            piggy := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }

        if (piggy == address(0)) revert Deployment_Failed();
        

        PiggyBank(piggy).initialize(purpose, admin, msg.sender, _token, _token1);
        

        piggyDeploy[deploymentCount] = piggy;
        deploymentCount++;

        emit PiggyDeployed(piggy, msg.sender, purpose);
    }



    function addToken(uint256 index, address token) public getDeploymentCount(index) onlyAdmin {
        address currentIndex = piggyDeploy[index];
        PiggyBank(currentIndex).addToken(token);

    }
    
}