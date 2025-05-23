
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EscrowSwap {
    address public buyer;
    address public seller;
    uint256 public expectedSellerAmount;
    uint256 public expectedBuyerAmount;
    uint256 public deadline;

    bool public buyerFunded;
    bool public sellerFunded;
    bool public completed;

    event BuyerFunded(address indexed buyer, uint256 amount);
    event SellerFunded(address indexed seller, uint256 amount);
    event Swapped(address indexed buyer, address indexed seller);
    event Refunded(address indexed to, uint256 amount);
    event TimeoutTriggered();

    constructor(
        address _seller,
        uint256 _expectedSellerAmount,
        uint256 _timeoutSeconds
    ) payable {
        require(msg.value > 0, "Buyer must fund at deployment");
        buyer = msg.sender;
        seller = _seller;
        expectedSellerAmount = _expectedSellerAmount;
        expectedBuyerAmount = msg.value;
        deadline = block.timestamp + _timeoutSeconds;
        buyerFunded = true;

        emit BuyerFunded(buyer, msg.value);
    }

    function sellerDeposit() public payable {
        require(msg.sender == seller, "Only seller can deposit");
        require(!sellerFunded, "Seller already deposited");
        require(msg.value == expectedSellerAmount, "Incorrect amount");

        sellerFunded = true;

        emit SellerFunded(seller, msg.value);

        if (buyerFunded && sellerFunded) {
            executeSwap();
        }
    }

    function executeSwap() private {
        require(!completed, "Already completed");
        completed = true;

        payable(seller).transfer(expectedBuyerAmount);
        payable(buyer).transfer(expectedSellerAmount);

        emit Swapped(buyer, seller);
    }

    function timeoutRefund() public {
        require(block.timestamp >= deadline, "Deadline not reached");
        require(!completed, "Already completed");
        completed = true;

        if (buyerFunded) {
            payable(buyer).transfer(expectedBuyerAmount);
            emit Refunded(buyer, expectedBuyerAmount);
        }

        if (sellerFunded) {
            payable(seller).transfer(expectedSellerAmount);
            emit Refunded(seller, expectedSellerAmount);
        }

        emit TimeoutTriggered();
    }
}
