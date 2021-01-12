pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./VRFConsumerBase.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract LotteryContract is VRFConsumerBase, ERC20 {
    using Address for address;

    struct LotteryConfig {
        uint256 numOfWinners;
        uint256 playersLimit;
        uint256 registrationAmount;
        uint256 adminFeePercentage;
        address lotteryTokenAddress;
        uint256 randomSeed;
        uint256 startedAt;
    }

    address[] public lotteryPlayers;
    address public adminAddress;
    enum LotteryStatus {NOTSTARTED, INPROGRESS, CLOSED}
    mapping(uint256 => address) public winnerAddresses;
    uint256[] public winnerIndexes;
    uint256 public totalLotteryPool;
    uint256 public adminFeesAmount;
    uint256 public rewardPoolAmount;

    IERC20 lotteryToken;
    LotteryStatus public lotteryStatus;
    LotteryConfig lotteryConfig;

    bytes32 internal keyHash;
    uint256 internal fee;
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

    /**
     * @dev Sets the value for adminAddress which establishes the Admin of the contract
     * Only the adminAddress will be able to set the lottery configuration,
     * start the lottery and reset the lottery.
     *
     * It also sets the required fees, keyHash etc. for the ChainLink Oracle RNG
     *
     * The adminAdress value is immutable along with the initial
     * configuration of VRF Smart Contract. They can only be set once during
     * construction.
     */
    constructor()
        public
        VRFConsumerBase(
            0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9, // VRF Coordinator
            0xa36085F69e2889c224210F603D836748e7dC0088 // LINK Token
        )
        ERC20("LotteryTokens", "LOT")
    {
        adminAddress = msg.sender;
        lotteryStatus = LotteryStatus.NOTSTARTED;
        totalLotteryPool = 0;
        keyHash = 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4;
        fee = 0.1 * 10**18; // 0.1 LINK
        areWinnersGenerated = false;
        isRandomNumberGenerated = false;
    }

    /**
     * @dev Calls ChainLink Oracle's inherited function for
     * Random Number Generation.
     *
     * Requirements:
     *
     * - the contract must have a balance of at least `fee` required for VRF.
     */
    function getRandomNumber(uint256 userProvidedSeed)
        internal
        returns (bytes32 requestId)
    {
        require(
            LINK.balanceOf(address(this)) >= fee,
            "Not enough LINK - fill contract with faucet"
        );
        isRandomNumberGenerated = false;
        return requestRandomness(keyHash, fee, userProvidedSeed);
    }

    /**
     * @dev The callback function of ChainLink Oracle when the
     * Random Number Generation is completed. An event is fired
     * to notify the same and the randomResult is saved.
     *
     * Emits an {RandomNumberGenerated} event indicating the random number is
     * generated by the Oracle.
     *
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        randomResult = randomness;
        isRandomNumberGenerated = true;
        emit RandomNumberGenerated(randomness);
    }

    /**
     * @dev Sets the Lottery Config, initializes an instance of
     * ERC20 contract that the lottery is based on and starts the lottery.
     *
     * Emits an {LotteryStarted} event indicating the Admin has started the Lottery.
     *
     * Requirements:
     *
     * - Cannot be called if the lottery is in progress.
     * - Only the address set at `adminAddress` can call this function.
     * - Number of winners `numOfWinners` should be less than or equal to half the number of
     *   players `playersLimit`.
     */
    function setLotteryRules(
        uint256 numOfWinners,
        uint256 playersLimit,
        uint256 registrationAmount,
        uint256 adminFeePercentage,
        address lotteryTokenAddress,
        uint256 randomSeed
    ) public {
        require(
            msg.sender == adminAddress,
            "Starting the Lottery requires Admin Access"
        );
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
            randomSeed,
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

    /**
     * @dev Player enters the lottery and the registration amount is
     * transferred from the player to the contract.
     *
     * Returns participant's index. This is similar to unique registration id.
     * Emits an {MaxParticipationCompleted} event indicating that all the required players have entered the lottery.
     *
     * Requirements:
     *
     * - The player has set the necessary allowance to the Contract.
     * - The Lottery is in progress.
     * - Number of players allowed to enter in the lottery should be
     *   less than or equal to the allowed players `lotteryConfig.playersLimit`.
     */
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
        if (lotteryPlayers.length == lotteryConfig.playersLimit) {
            emit MaxParticipationCompleted(msg.sender);
            getRandomNumber(lotteryConfig.randomSeed);
        }
        return lotteryPlayers.length;
    }

    /**
     * @dev Settles the lottery, the winners are calculated based on
     * the random number generated and the winnings are transferred from
     * the contract to the winning players. The Admin fee is calculated and
     * transferred back to Admin `adminAddress`.
     *
     * Emits an {WinnersGenerated} event indicating that the winners for the lottery have been generated.
     * Emits {LotterySettled} event indicating that the winnings have been transferred to the Admin and the winners.
     *
     * Requirements:
     *
     * - The random number has been generated
     * - The Lottery is in progress.
     */
    function settleLottery() public {
        require(
            isRandomNumberGenerated,
            "Lottery Configuration still in progress. Ploease try in a short while"
        );
        require(
            lotteryStatus == LotteryStatus.INPROGRESS,
            "The Lottery is not started or closed"
        );
        for (uint256 i = 0; i < lotteryConfig.numOfWinners; i = i.add(1)) {
            uint256 winningIndex = randomResult.mod(lotteryConfig.playersLimit);
            uint256 counter = 0;
            while (winnerAddresses[winningIndex] != address(0)) {
                randomResult = getRandomNumberBlockchain(i, randomResult);
                winningIndex = randomResult.mod(lotteryConfig.playersLimit);
                counter = counter.add(1);
                if (counter == lotteryConfig.playersLimit) {
                    while (winnerAddresses[winningIndex] != address(0)) {
                        winningIndex = (winningIndex.add(1)).mod(
                            lotteryConfig.playersLimit
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

        lotteryToken.transfer(adminAddress, adminFeesAmount);

        emit LotterySettled();
    }

    function collectRewards() public {
        for (uint256 i = 0; i < winnerIndexes.length; i = i.add(1)) {
            if (address(msg.sender) == winnerAddresses[i]) {
                _burn(address(msg.sender), lotteryConfig.registrationAmount);
                lotteryToken.transfer(address(msg.sender), rewardPoolAmount);
            }
        }
    }

    /**
     * @dev Generates a random number based on the blockHash and random offset
     */
    function getRandomNumberBlockchain(uint256 offset, uint256 randomness)
        internal
        view
        returns (uint256)
    {
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

    /**
     * @dev Resets the lottery, clears the existing state variable values and the lottery
     * can be initialized again.
     *
     * Emits {LotteryReset} event indicating that the lottery config and contract state is reset.
     *
     * Requirements:
     *
     * - Only the address set at `adminAddress` can call this function.
     * - The Lottery has closed.
     */
    function resetLottery() public {
        require(
            msg.sender == adminAddress,
            "Resetting the Lottery requires Admin Access"
        );
        require(
            lotteryStatus == LotteryStatus.CLOSED,
            "Lottery Still in Progress"
        );
        uint256 tokenBalance = lotteryToken.balanceOf(address(this));
        if (tokenBalance > 0) {
            lotteryToken.transfer(adminAddress, tokenBalance);
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
