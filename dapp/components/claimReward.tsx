import { useEffect, useState } from "react"
import {
    useContractWrite,
    useContractRead,
    useContract,
    Web3Button,
} from "@thirdweb-dev/react"

interface ClaimRewardProps {
    lotContractAddress: string
    numOfWinners: number
}
export default function ClaimReward({
    lotContractAddress,
    numOfWinners,
}: ClaimRewardProps) {
    const winners = []
    for (let i = 0; i < numOfWinners; i++) {
        winners.push(<GetWinner i={i} />)
    }

    return (
        <div className="flex flex-col justify-center">
            <h1 className="text-center text-2xl m-2 p-2">Claim Rewards</h1>
            <div>
                <h2 className="text-center text-xl m-2 p-2">
                    Winner Addresses
                </h2>
                <Web3Button
                    contractAddress={lotContractAddress}
                    action={(contract) => {
                        contract.call("collectRewards")
                    }}
                    className="m-2 p-2"
                >
                    Collect Reward
                </Web3Button>
                {winners.map((winner: any, index: any) => (
                    <div
                        key={index}
                        className="flex justify-center m-2 p-2 align-middle"
                    >
                        {winner}
                    </div>
                ))}
            </div>
        </div>
    )
}

function GetWinner(props: any) {
    const lotContractAddress = "0x8D89f72AcaF30e022a53Db0A941EDF60210c7C27"
    const { data: lotcontract } = useContract(lotContractAddress)
    const { data: winnerIndex } = useContractRead(
        lotcontract,
        "winnerIndexes",
        props.i.toString()
    )
    const { data: winner } = useContractRead(
        lotcontract,
        "winnerAddresses",
        winnerIndex
    )
    return (
        <>
            <div className="text-xl">{winner && winner.toString()}</div>
        </>
    )
}
