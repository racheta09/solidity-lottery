import Head from "next/head"
import { useState, useEffect } from "react"

// import Image from "next/image"
// import { Inter } from "@next/font/google"
import { ConnectWallet } from "@thirdweb-dev/react"
import {
    useContractWrite,
    useContractRead,
    useContract,
    Web3Button,
    useAddress,
} from "@thirdweb-dev/react"

import StartLottery from "@/components/startLottery"
import EnterLottery from "@/components/enterLottery"
import ClaimReward from "@/components/claimReward"
import AdminSection from "@/components/adminSection"
import NavBar from "@/components/navBar"
// const inter = Inter({ subsets: ["latin"] })
const erc20abi = [
    {
        constant: true,
        inputs: [],
        name: "name",
        outputs: [
            {
                name: "",
                type: "string",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_spender",
                type: "address",
            },
            {
                name: "_value",
                type: "uint256",
            },
        ],
        name: "approve",
        outputs: [
            {
                name: "",
                type: "bool",
            },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "totalSupply",
        outputs: [
            {
                name: "",
                type: "uint256",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_from",
                type: "address",
            },
            {
                name: "_to",
                type: "address",
            },
            {
                name: "_value",
                type: "uint256",
            },
        ],
        name: "transferFrom",
        outputs: [
            {
                name: "",
                type: "bool",
            },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "decimals",
        outputs: [
            {
                name: "",
                type: "uint8",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_owner",
                type: "address",
            },
        ],
        name: "balanceOf",
        outputs: [
            {
                name: "balance",
                type: "uint256",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "symbol",
        outputs: [
            {
                name: "",
                type: "string",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_to",
                type: "address",
            },
            {
                name: "_value",
                type: "uint256",
            },
        ],
        name: "transfer",
        outputs: [
            {
                name: "",
                type: "bool",
            },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_owner",
                type: "address",
            },
            {
                name: "_spender",
                type: "address",
            },
        ],
        name: "allowance",
        outputs: [
            {
                name: "",
                type: "uint256",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        payable: true,
        stateMutability: "payable",
        type: "fallback",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                name: "spender",
                type: "address",
            },
            {
                indexed: false,
                name: "value",
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
                name: "from",
                type: "address",
            },
            {
                indexed: true,
                name: "to",
                type: "address",
            },
            {
                indexed: false,
                name: "value",
                type: "uint256",
            },
        ],
        name: "Transfer",
        type: "event",
    },
]
export default function Home() {
    const address = useAddress()
    const lotContractAddress = "0x8D89f72AcaF30e022a53Db0A941EDF60210c7C27"
    const { data: lotcontract } = useContract(lotContractAddress)
    const { data: lotStatus } = useContractRead(lotcontract, "lotteryStatus")
    const { data: owner } = useContractRead(lotcontract, "owner")
    const { data: lotData } = useContractRead(lotcontract, "lotteryConfig")
    // const [lotConfig, setLotConfig] = useState({
    //     numberOfWinners: lotData?.numberOfWinners,
    //     playersLimit: lotData?.playersLimit,
    //     registrationAmount: lotData?.registrationAmount,
    //     lotteryTokenAddress: lotData?.lotteryTokenAddress,
    // })
    // useEffect(() => {
    //     setLotConfig({
    //         numberOfWinners: lotData?.numberOfWinners,
    //         playersLimit: lotData?.playersLimit,
    //         registrationAmount: lotData?.registrationAmount,
    //         lotteryTokenAddress: lotData?.lotteryTokenAddress,
    //     })
    // }, [lotData])

    return (
        <>
            <Head>
                <title>BSC Lottery</title>
                <meta
                    name="description"
                    content="Binance Smart Chain Lottery"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <NavBar />
            <main className="flex flex-col m-8 p-8 align-middle justify-center">
                <div className="bg-gray-800 m-8 p-8">
                    <h1 className="text-4xl text-center m-4 p-4">
                        Welcome to The Lottery Dapp
                    </h1>
                    {lotStatus == "0" ? (
                        <h3 className="text-2xl text-center">
                            Lottery Not Started Yet
                        </h3>
                    ) : lotStatus == "1" ? (
                        <EnterLottery
                            ercContractAddress={lotData?.lotteryTokenAddress}
                            lotContractAddress={lotContractAddress}
                            registrationAmount={lotData?.registrationAmount}
                        />
                    ) : (
                        <ClaimReward
                            lotContractAddress={lotContractAddress}
                            numOfWinners={parseInt(lotData?.numberOfWinners)}
                        />
                    )}
                    {owner && owner == address ? (
                        <AdminSection
                            lotContractAddress={lotContractAddress}
                            lotStatus={lotStatus}
                        />
                    ) : (
                        ""
                    )}
                </div>
            </main>
        </>
    )
}
