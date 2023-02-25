import Head from "next/head"
import { useState } from "react"

// import Image from "next/image"
// import { Inter } from "@next/font/google"
import { ConnectWallet } from "@thirdweb-dev/react"
import {
    useContractWrite,
    useContractRead,
    useContract,
    Web3Button,
} from "@thirdweb-dev/react"

import StartLottery from "@/components/startLottery"
import EnterLottery from "@/components/enterLottery"
import ClaimReward from "@/components/claimReward"
// const inter = Inter({ subsets: ["latin"] })

export default function Home() {
    const erccontractaddress = "0x7c19bC82119F535Ee18b759aAE81d4b5D95E4d3d"
    const lotcontractaddress = "0x69e795F21B5De63914694aEd4994ad5B0198cd4A"
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
            <main className="flex flex-col m-8 p-8 align-middle justify-center">
                <StartLottery />
                <EnterLottery />
                <ClaimReward />
            </main>
        </>
    )
}
