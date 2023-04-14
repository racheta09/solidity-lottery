import { useContractRead, useContract, Web3Button } from "@thirdweb-dev/react"

interface ClaimRewardProps {
    lotContractAddress: string
    numOfWinners: number
}
interface GetWinnerProps {
    i: number
    lotContractAddress: string
}
export default function ClaimReward({
    lotContractAddress,
    numOfWinners,
}: ClaimRewardProps) {
    const winners = []
    for (let i = 0; i < numOfWinners; i++) {
        winners.push(
            <GetWinner i={i} lotContractAddress={lotContractAddress} />
        )
    }
    return (
        <div className="flex flex-col justify-center">
            <h1 className="text-center text-2xl my-2 py-2">Claim Rewards</h1>
            <div>
                <h2 className="text-center text-xl my-2 py-2">
                    Winner Addresses
                </h2>
                <Web3Button
                    contractAddress={lotContractAddress}
                    action={(contract) => {
                        contract.call("collectRewards")
                    }}
                >
                    Collect Reward
                </Web3Button>
                {winners.map((winner: any, index: any) => (
                    <div
                        key={index}
                        className="flex justify-center my-2 py-2 align-middle"
                    >
                        {winner}
                    </div>
                ))}
            </div>
        </div>
    )
}

function GetWinner({ i, lotContractAddress }: GetWinnerProps) {
    const { data: lotcontract } = useContract(lotContractAddress)
    const { data: winnerIndex } = useContractRead(
        lotcontract,
        "winnerIndexes",
        [i.toString()]
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
