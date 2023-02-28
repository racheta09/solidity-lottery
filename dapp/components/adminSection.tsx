import { useEffect, useState } from "react"
import {
    useContractWrite,
    useContractRead,
    useContract,
    Web3Button,
} from "@thirdweb-dev/react"
import StartLottery from "./startLottery"

interface AdminSectionProps {
    lotContractAddress: string
    lotStatus: string
}

export default function AdminSection({
    lotStatus,
    lotContractAddress,
}: AdminSectionProps) {
    return (
        <>
            <h1 className="text-3xl text-center m-2 p-2"> Admin Function</h1>
            {lotStatus == "0" ? (
                <StartLottery lotContractAddress={lotContractAddress} />
            ) : lotStatus == "1" ? (
                <Web3Button
                    contractAddress={lotContractAddress}
                    action={(contract) => {
                        contract.call("settleLottery")
                    }}
                    className="m-2 p-2"
                >
                    Settle Lottery
                </Web3Button>
            ) : (
                <Web3Button
                    contractAddress={lotContractAddress}
                    action={(contract) => {
                        contract.call("resetLottery")
                    }}
                    className="m-2 p-2"
                >
                    Reset Lottery
                </Web3Button>
            )}
        </>
    )
}