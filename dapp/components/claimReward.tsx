import { useEffect, useState } from "react"
import {
    useContractWrite,
    useContractRead,
    useContract,
    Web3Button,
} from "@thirdweb-dev/react"
import GetWinner from "./getWinner"

export default function ClaimReward() {
    const erccontractaddress = "0x7c19bC82119F535Ee18b759aAE81d4b5D95E4d3d"
    const lotcontractaddress = "0x69e795F21B5De63914694aEd4994ad5B0198cd4A"
    const { data: lotcontract } = useContract(lotcontractaddress)
    const [winners, setWinners] = useState<any[]>([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ])
    // useEffect(() => {
    //     for (let i = 0; i < 10; i++) {
    //         setWinners([...winners, GetWinner(i)])
    //     }
    // }, [winners, lotcontract])
    return (
        <div className="flex flex-col justify-center">
            <h1 className="text-center text-2xl m-2 p-2">Claim Rewards</h1>
            <div>
                <h2 className="text-center text-xl m-2 p-2">
                    Winner Addresses
                </h2>
                <Web3Button
                    contractAddress={lotcontractaddress}
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
                        <GetWinner i={index} />
                    </div>
                ))}
                <Web3Button
                    contractAddress={lotcontractaddress}
                    action={(contract) => {
                        contract.call("resetLottery")
                    }}
                    className="m-2 p-2"
                >
                    Reset Lottery
                </Web3Button>
            </div>
        </div>
    )
}
