import { useContractRead, useContract, Web3Button } from "@thirdweb-dev/react"

interface EnterLotteryProps {
    ercContractAddress: string
    lotContractAddress: string
    registrationAmount: string
    numOfWinners: string
    playersLimit: string
}
interface GetParticipantProps {
    i: number
    lotContractAddress: string
}

const erc20Abi = [
    {
        inputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "_owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "_spender",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "_value",
                type: "uint256",
            },
        ],
        name: "Approval",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
        ],
        name: "Burn",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "_from",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "_to",
                type: "address",
            },
        ],
        name: "OwnershipTransferred",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "_from",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "_to",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "_value",
                type: "uint256",
            },
        ],
        name: "Transfer",
        type: "event",
    },
    { payable: true, stateMutability: "payable", type: "fallback" },
    {
        constant: false,
        inputs: [],
        name: "acceptOwnership",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            { internalType: "address", name: "_owner", type: "address" },
            { internalType: "address", name: "_spender", type: "address" },
        ],
        name: "allowance",
        outputs: [
            { internalType: "uint256", name: "remaining", type: "uint256" },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            { internalType: "address", name: "_spender", type: "address" },
            { internalType: "uint256", name: "_value", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ internalType: "bool", name: "success", type: "bool" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: true,
        inputs: [{ internalType: "address", name: "_owner", type: "address" }],
        name: "balanceOf",
        outputs: [
            { internalType: "uint256", name: "balance", type: "uint256" },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "decimals",
        outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "name",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "newOwner",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "owner",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "symbol",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "totalSupply",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            { internalType: "address", name: "_to", type: "address" },
            { internalType: "uint256", name: "_value", type: "uint256" },
        ],
        name: "transfer",
        outputs: [{ internalType: "bool", name: "success", type: "bool" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            { internalType: "address", name: "_from", type: "address" },
            { internalType: "address", name: "_to", type: "address" },
            { internalType: "uint256", name: "_value", type: "uint256" },
        ],
        name: "transferFrom",
        outputs: [{ internalType: "bool", name: "success", type: "bool" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            { internalType: "address", name: "_newOwner", type: "address" },
        ],
        name: "transferOwnership",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
]

export default function EnterLottery({
    ercContractAddress,
    lotContractAddress,
    registrationAmount,
    numOfWinners,
    playersLimit,
}: EnterLotteryProps) {
    const { data: ercContract } = useContract(ercContractAddress)
    const { data: ticker } = useContractRead(ercContract, "symbol")
    const { data: lotContract } = useContract(lotContractAddress)
    const { data: lotteryPool } = useContractRead(
        lotContract,
        "totalLotteryPool"
    )
    const participants = []
    for (
        let i = 0;
        i < parseInt(lotteryPool) / parseInt(registrationAmount);
        i++
    ) {
        participants.push(
            <GetParticipant i={i} lotContractAddress={lotContractAddress} />
        )
    }
    return (
        <div className="flex flex-col items-center justify-center">
            <div className="">
                <h2 className="text-center text-3xl my-2 py-2">Lottery</h2>
                <div className="relative overflow-x-hidden shadow-md sm:rounded-lg">
                    <table className="w-screen text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-center"
                                    colSpan={2}
                                >
                                    Details
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4">Winners</td>
                                <th
                                    scope="row"
                                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center"
                                >
                                    {parseInt(numOfWinners)}
                                </th>
                            </tr>
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4">Tickets Sold</td>
                                <th
                                    scope="row"
                                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center"
                                >
                                    {parseInt(lotteryPool) /
                                        parseInt(registrationAmount)}
                                </th>
                            </tr>
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4">Tickets Remaining</td>
                                <th
                                    scope="row"
                                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center"
                                >
                                    {parseInt(playersLimit) -
                                        parseInt(lotteryPool) /
                                            parseInt(registrationAmount)}
                                </th>
                            </tr>
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4">Total Tickets</td>
                                <th
                                    scope="row"
                                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center"
                                >
                                    {parseInt(playersLimit)}
                                </th>
                            </tr>
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4">Lottery Token</td>
                                <th
                                    scope="row"
                                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center"
                                >
                                    {ticker}
                                </th>
                            </tr>
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4">Ticket Cost</td>
                                <th
                                    scope="row"
                                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center"
                                >
                                    {parseInt(registrationAmount) * 1e-18}{" "}
                                    {ticker}
                                </th>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <h3 className="text-center text-xl m-2 p-2">
                    Approve {ticker}
                </h3>
                <Web3Button
                    contractAddress={ercContractAddress}
                    contractAbi={erc20Abi}
                    action={(contract) =>
                        contract.call("approve", [
                            lotContractAddress,
                            registrationAmount,
                        ])
                    }
                >
                    Approve{" "}
                    {`${(parseInt(registrationAmount) * 10 ** -18).toFixed(
                        2
                    )} ${ticker}`}
                </Web3Button>
                <h2 className="text-center text-xl m-2 p-2">Buy Ticket</h2>
                <Web3Button
                    contractAddress={lotContractAddress}
                    action={(contract) => contract.call("enterLottery")}
                >
                    Enter Lottery
                </Web3Button>
            </div>
            <div className="m-2 p-2">
                <div className="relative shadow-md sm:rounded-lg">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-center"
                                >
                                    Participants Addresses
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {participants.map(
                                (participant: any, index: any) => (
                                    <tr
                                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                                        key={index}
                                    >
                                        {participant}
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function GetParticipant({ i, lotContractAddress }: GetParticipantProps) {
    const { data: lotcontract } = useContract(lotContractAddress)
    const { data: participant } = useContractRead(
        lotcontract,
        "lotteryPlayers",
        [i]
    )
    console.log(participant)
    return (
        <th
            scope="row"
            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center"
        >
            {participant && participant.toString()}
        </th>
    )
}
