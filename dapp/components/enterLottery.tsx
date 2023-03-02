import { useState } from "react"
import {
    useContractWrite,
    useContractRead,
    useContract,
    Web3Button,
} from "@thirdweb-dev/react"

interface EnterLotteryProps {
    ercContractAddress: string
    lotContractAddress: string
    registrationAmount: string,
    ercAbi: string
}
export default function EnterLottery({
    ercContractAddress,
    lotContractAddress,
    registrationAmount,
    ercAbi
}: EnterLotteryProps) {
    return (
        <div className="flex flex-col justify-center">
            <h2 className="text-center text-3xl m-2 p-2">Lottery</h2>
            <h3 className="text-center text-xl m-2 p-2">Approve tokens and Enter Lottery</h3>
            <Web3Button
                contractAddress={ercContractAddress}
                contractAbi={ercAbi}
                action={(contract) =>
                    contract.call(
                        "approve",
                        lotContractAddress,
                        registrationAmount
                    )
                }
            >
                Approve {(parseInt(registrationAmount) * 10 ** -18).toFixed(2)} tokens
            </Web3Button>
            <h2 className="text-center text-xl m-2 p-2">Buy Ticket</h2>
            <Web3Button
                contractAddress={lotContractAddress}
                action={(contract) => contract.call("enterLottery")}
            >
                Enter Lottery
            </Web3Button>
        </div>
    )
}
