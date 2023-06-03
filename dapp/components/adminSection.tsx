import {
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
        <div className="min-w-max m-2 p-2">
            <h1 className="text-3xl text-center m-2 p-2"> Admin Functions</h1>
            {lotStatus == "0" ? (
                <StartLottery lotContractAddress={lotContractAddress} />
            ) : lotStatus == "1" ? (
                <Web3Button
                    contractAddress={lotContractAddress}
                    action={(contract) => {
                        contract.call("settleLottery")
                    }}
                >
                    Settle Lottery
                </Web3Button>
            ) : (
                <Web3Button
                    contractAddress={lotContractAddress}
                    action={(contract) => {
                        contract.call("resetLottery")
                    }}
                >
                    Reset Lottery
                </Web3Button>
            )}
        </div>
    )
}
