import { useState } from "react"
import {
    useContractWrite,
    useContractRead,
    useContract,
    Web3Button,
} from "@thirdweb-dev/react"

// const inter = Inter({ subsets: ["latin"] })

export default function StartLottery() {
    const erccontractaddress = "0x7c19bC82119F535Ee18b759aAE81d4b5D95E4d3d"
    const lotcontractaddress = "0xab3148C540c8791d290C6e5C12643298D4f68a7b"
    // const { data: erccontract } = useContract(erccontractaddress)
    const { data: lotcontract } = useContract(lotcontractaddress)
    const { data: lotteryStatus } = useContractRead(
        lotcontract,
        "lotteryStatus"
    )
    const { mutateAsync } = useContractWrite(lotcontract, "setLotteryRules")
    const [lotteryRules, setLotteryRules] = useState({
        numOfWinners: "",
        playersLimit: "",
        registrationAmount: "",
        adminFee: "",
        tokenAddress: "",
    })

    const formHandler = (e: any, values: any) => {
        setLotteryRules({ ...lotteryRules, [values]: e.target.value })
    }
    console.log(lotteryStatus)
    return (
        <div className="flex flex-col justify-center">
            <h1 className="text-center text-2xl m-2 p-2">Start Lottery</h1>
            <h2 className="text-center text-xl m-2 p-2">
                Lottery {lotteryStatus == 0 && "Not Started"}
                {lotteryStatus == 1 && "In Progress"}
                {lotteryStatus == 2 && "Closed"}
            </h2>
            <form className="flex flex-col justify-center">
                <label htmlFor="numOfWinners" className="m-2 p-2">
                    Number of Winners:
                </label>
                <input
                    type="text"
                    name="numOfWinners"
                    onChange={(e) => formHandler(e, "numOfWinners")}
                    value={lotteryRules.numOfWinners}
                    className="rounded m-2 p-2"
                />
                <label htmlFor="playersLimit" className="m-2 p-2">
                    Players Limit:
                </label>
                <input
                    type="text"
                    name="playersLimit"
                    onChange={(e) => formHandler(e, "playersLimit")}
                    value={lotteryRules.playersLimit}
                    className="rounded m-2 p-2"
                />
                <label htmlFor="registrationAmount" className="m-2 p-2">
                    Registration Amount:
                </label>
                <input
                    type="text"
                    name="registrationAmount"
                    onChange={(e) => formHandler(e, "registrationAmount")}
                    value={lotteryRules.registrationAmount}
                    className="rounded m-2 p-2"
                />
                <label htmlFor="adminFee" className="m-2 p-2">
                    Admin Fee Percentage:
                </label>
                <input
                    type="text"
                    name="adminFee"
                    onChange={(e) => formHandler(e, "adminFee")}
                    value={lotteryRules.adminFee}
                    className="rounded m-2 p-2"
                />
                <label htmlFor="tokenAddress" className="m-2 p-2">
                    Token Address:
                </label>
                <input
                    type="text"
                    name="tokenAddress"
                    onChange={(e) => formHandler(e, "tokenAddress")}
                    value={lotteryRules.tokenAddress}
                    className="rounded m-2 p-2"
                />
                <Web3Button
                    contractAddress={lotcontractaddress}
                    action={() =>
                        mutateAsync([
                            lotteryRules.numOfWinners,
                            lotteryRules.playersLimit,
                            lotteryRules.registrationAmount,
                            lotteryRules.adminFee,
                            lotteryRules.tokenAddress,
                        ])
                    }
                    className="m-2 p-2"
                >
                    Start Lottery
                </Web3Button>
                {/* <span className={isLoading ? "" : error ? "text-red-600" : "text-green-600"}>
                    {isLoading ? "": error? error.toString(): .toString()}
                </span> */}
            </form>
        </div>
    )
}
