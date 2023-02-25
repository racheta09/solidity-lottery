import { useState } from "react"
import {
    useContractWrite,
    useContractRead,
    useContract,
    Web3Button,
} from "@thirdweb-dev/react"

// const inter = Inter({ subsets: ["latin"] })

export default function EnterLottery() {
    const erccontractaddress = "0x7c19bC82119F535Ee18b759aAE81d4b5D95E4d3d"
    const lotcontractaddress = "0x69e795F21B5De63914694aEd4994ad5B0198cd4A"

    return (
        <div className="flex flex-col justify-center">
            <h1 className="text-center text-2xl m-2 p-2">Lottery</h1>
            <h2 className="text-center text-xl m-2 p-2">Approve 1000 tokens</h2>
            <Web3Button
                contractAddress={erccontractaddress}
                action={(contract) =>
                    contract.call(
                        "approve",
                        lotcontractaddress,
                        "1000000000000000000000"
                    )
                }
                className="m-2 p-2"
            >
                Approve Token
            </Web3Button>
            <h2 className="text-center text-xl m-2 p-2">Buy Ticket</h2>
            <Web3Button
                contractAddress={lotcontractaddress}
                action={(contract) => contract.call("enterLottery")}
                className="m-2 p-2"
            >
                Enter Lottery
            </Web3Button>
            <Web3Button
                contractAddress={lotcontractaddress}
                action={(contract) => {
                    contract.call("settleLottery")
                }}
                className="m-2 p-2"
            >
                Settle Lottery
            </Web3Button>
        </div>
    )
}
