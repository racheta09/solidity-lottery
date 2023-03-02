// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LotteryContract is ERC20, ReentrancyGuard, Ownable {
    using Address for address;
    using SafeMath for uint256;

    struct LotteryConfig {
        uint256 numOfWinners;
        uint256 playersLimit;
        uint256 registrationAmount;
        uint256 adminFeePercentage;
        address lotteryTokenAddress;
        uint256 startedAt;
    }

    address[] public lotteryPlayers;
    enum LotteryStatus {
        NOTSTARTED,
        INPROGRESS,
        CLOSED
    }
    mapping(uint256 => address) public winnerAddresses;
    uint256[] public winnerIndexes;
    uint256 public totalLotteryPool;
    uint256 public adminFeesAmount;
    uint256 public rewardPoolAmount;

    IERC20 lotteryToken;
    LotteryStatus public lotteryStatus;
    LotteryConfig public lotteryConfig;

    uint256 internal randomResult;
    bool internal areWinnersGenerated;
    bool internal isRandomNumberGenerated;

    event MaxParticipationCompleted(address indexed _from);

    event RandomNumberGenerated(uint256 indexed randomness);

    event WinnersGenerated(uint256[] winnerIndexes);

    event LotterySettled();

    event LotteryStarted(
        address indexed lotteryTokenAddress,
        uint256 playersLimit,
        uint256 numOfWinners,
        uint256 registrationAmount,
        uint256 startedAt
    );

    event LotteryReset();

    constructor() ERC20("LotteryTokens", "LOT") {
        lotteryStatus = LotteryStatus.NOTSTARTED;
        totalLotteryPool = 0;
        areWinnersGenerated = false;
        isRandomNumberGenerated = false;
    }

    function setLotteryRules(
        uint256 numOfWinners,
        uint256 playersLimit,
        uint256 registrationAmount,
        uint256 adminFeePercentage,
        address lotteryTokenAddress
    ) public onlyOwner {
        require(
            lotteryStatus == LotteryStatus.NOTSTARTED,
            "Error: An existing lottery is in progress"
        );
        require(
            numOfWinners <= playersLimit.div(2),
            "Number of winners should be less than or equal to half the number of players"
        );
        lotteryConfig = LotteryConfig(
            numOfWinners,
            playersLimit,
            registrationAmount,
            adminFeePercentage,
            lotteryTokenAddress,
            block.timestamp
        );
        lotteryStatus = LotteryStatus.INPROGRESS;
        lotteryToken = IERC20(lotteryTokenAddress);
        emit LotteryStarted(
            lotteryTokenAddress,
            playersLimit,
            numOfWinners,
            registrationAmount,
            block.timestamp
        );
    }

    function enterLottery() public returns (uint256) {
        require(
            lotteryPlayers.length < lotteryConfig.playersLimit,
            "Max Participation for the Lottery Reached"
        );
        require(
            lotteryStatus == LotteryStatus.INPROGRESS,
            "The Lottery is not started or closed"
        );
        lotteryPlayers.push(msg.sender);
        lotteryToken.transferFrom(
            msg.sender,
            address(this),
            lotteryConfig.registrationAmount
        );
        totalLotteryPool = totalLotteryPool.add(
            lotteryConfig.registrationAmount
        );
        _mint(address(msg.sender), lotteryConfig.registrationAmount);

        return (lotteryPlayers.length).sub(1);
    }

    function settleLottery() public onlyOwner {
        require(
            lotteryStatus == LotteryStatus.INPROGRESS,
            "The Lottery is not started or closed"
        );
        bytes32 blockHash = blockhash(
            block.number - lotteryConfig.playersLimit
        );
        uint256 randomNumber = uint256(
            keccak256(abi.encodePacked(block.timestamp, blockHash))
        );
        randomResult = randomNumber;
        for (uint256 i = 0; i < lotteryConfig.numOfWinners; i = i.add(1)) {
            uint256 winningIndex = randomResult.mod(lotteryPlayers.length);
            uint256 counter = 0;
            while (winnerAddresses[winningIndex] != address(0)) {
                randomResult = getRandomNumberBlockchain(i, randomResult);
                winningIndex = randomResult.mod(lotteryPlayers.length);
                counter = counter.add(1);
                if (counter == lotteryPlayers.length) {
                    while (winnerAddresses[winningIndex] != address(0)) {
                        winningIndex = (winningIndex.add(1)).mod(
                            lotteryPlayers.length
                        );
                    }
                    counter = 0;
                }
            }
            winnerAddresses[winningIndex] = lotteryPlayers[winningIndex];
            winnerIndexes.push(winningIndex);
            randomResult = getRandomNumberBlockchain(i, randomResult);
        }
        areWinnersGenerated = true;
        emit WinnersGenerated(winnerIndexes);
        adminFeesAmount = (
            (totalLotteryPool.mul(lotteryConfig.adminFeePercentage)).div(100)
        );
        rewardPoolAmount = (totalLotteryPool.sub(adminFeesAmount)).div(
            lotteryConfig.numOfWinners
        );
        lotteryStatus = LotteryStatus.CLOSED;

        lotteryToken.transfer(owner(), adminFeesAmount);

        emit LotterySettled();
    }

    function collectRewards() public nonReentrant {
        require(
            lotteryStatus == LotteryStatus.CLOSED,
            "The Lottery is not settled. Please try in a short while."
        );
        for (uint256 i = 0; i < lotteryConfig.numOfWinners; i = i.add(1)) {
            if (address(msg.sender) == winnerAddresses[winnerIndexes[i]]) {
                _burn(address(msg.sender), lotteryConfig.registrationAmount);
                lotteryToken.transfer(address(msg.sender), rewardPoolAmount);
                winnerAddresses[winnerIndexes[i]] = address(0);
            }
        }
    }

    function getRandomNumberBlockchain(uint256 offset, uint256 randomness)
        internal
        view
        returns (uint256)
    {
        unchecked {
            bytes32 offsetBlockhash = blockhash(block.number.sub(offset));
            uint256 randomBlockchainNumber = uint256(offsetBlockhash);
            uint256 finalRandomNumber = randomness + randomBlockchainNumber;
            if (finalRandomNumber >= randomness) {
                return finalRandomNumber;
            } else {
                if (randomness >= randomBlockchainNumber) {
                    return randomness.sub(randomBlockchainNumber);
                }
                return randomBlockchainNumber.sub(randomness);
            }
        }
    }

    function resetLottery() public onlyOwner {
        require(
            lotteryStatus == LotteryStatus.CLOSED,
            "Lottery Still in Progress"
        );
        uint256 tokenBalance = lotteryToken.balanceOf(address(this));
        if (tokenBalance > 0) {
            lotteryToken.transfer(owner(), tokenBalance);
        }
        delete lotteryConfig;
        delete randomResult;
        delete lotteryStatus;
        delete totalLotteryPool;
        delete adminFeesAmount;
        delete rewardPoolAmount;
        for (uint256 i = 0; i < lotteryPlayers.length; i = i.add(1)) {
            delete winnerAddresses[i];
        }
        isRandomNumberGenerated = false;
        areWinnersGenerated = false;
        delete winnerIndexes;
        delete lotteryPlayers;
        emit LotteryReset();
    }
}
