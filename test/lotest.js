const LotteryContract = artifacts.require("LotteryContract")
const ERCContract = artifacts.require("ERC")

contract("LotteryContract", (accounts) => {
    it("should set up new lottery rules", async () => {
        const lotteryInstance = await LotteryContract.deployed()
        const t = await lotteryInstance.setLotteryRules(
            "2",
            "5",
            web3.utils.toWei("1"),
            "20",
            ERCContract.address,
            "109283746578294762",
            { from: accounts[0] }
        )
        const status = await lotteryInstance.lotteryStatus()
        assert.equal(status, 1, "lottery status not okay")
    })
    it("should enter lottery", async () => {
        const lotteryInstance = await LotteryContract.deployed()
        const ercInstance = await ERCContract.deployed()

        await ercInstance.transfer(accounts[1], web3.utils.toWei("1"), {
            from: accounts[0],
        })
        await ercInstance.transfer(accounts[2], web3.utils.toWei("1"), {
            from: accounts[0],
        })
        await ercInstance.transfer(accounts[3], web3.utils.toWei("1"), {
            from: accounts[0],
        })
        await ercInstance.transfer(accounts[4], web3.utils.toWei("1"), {
            from: accounts[0],
        })
        await ercInstance.transfer(accounts[5], web3.utils.toWei("1"), {
            from: accounts[0],
        })

        await ercInstance.approve(
            lotteryInstance.address,
            web3.utils.toWei("1"),
            { from: accounts[1] }
        )
        await ercInstance.approve(
            lotteryInstance.address,
            web3.utils.toWei("1"),
            { from: accounts[2] }
        )
        await ercInstance.approve(
            lotteryInstance.address,
            web3.utils.toWei("1"),
            { from: accounts[3] }
        )
        await ercInstance.approve(
            lotteryInstance.address,
            web3.utils.toWei("1"),
            { from: accounts[4] }
        )
        await ercInstance.approve(
            lotteryInstance.address,
            web3.utils.toWei("1"),
            { from: accounts[5] }
        )

        await lotteryInstance.enterLottery({ from: accounts[1] })
        await lotteryInstance.enterLottery({ from: accounts[2] })
        await lotteryInstance.enterLottery({ from: accounts[3] })
        await lotteryInstance.enterLottery({ from: accounts[4] })
        await lotteryInstance.enterLottery({ from: accounts[5] })

        const lotteryPool = await lotteryInstance.totalLotteryPool()
        assert.equal(lotteryPool, web3.utils.toWei("5"), "amount mismatch")
    })
    it("should settle lottery", async () => {
        const lotteryInstance = await LotteryContract.deployed()
        await lotteryInstance.getRandomNumber()
        await lotteryInstance.settleLottery()

        const status = await lotteryInstance.lotteryStatus()
        assert.equal(status, 2, "lottery status not okay")
    })
    it("should collect rewards", async () => {
        const lotteryInstance = await LotteryContract.deployed()
        const ercInstance = await ERCContract.deployed()

        for (let i = 0; i < 2; i++) {
            const winnerIndex = await lotteryInstance.winnerIndexes(
                i.toString()
            )
            const winnerAddress = await lotteryInstance.winnerAddresses(
                winnerIndex
            )
            await lotteryInstance.collectRewards({ from: winnerAddress })
            const winnerBalance = (
                await ercInstance.balanceOf(winnerAddress)
            ).toString()
            assert.equal(
                winnerBalance,
                web3.utils.toWei("2"),
                "winner amount incorrect"
            )
        }
    })
})
