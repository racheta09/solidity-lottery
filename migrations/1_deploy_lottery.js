const LotteryContract = artifacts.require("LotteryContract")

module.exports = async function (deployer) {
    deployer.deploy(LotteryContract)
}
