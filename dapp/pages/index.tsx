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
// const inter = Inter({ subsets: ["latin"] })

export default function Home() {
    const erccontractaddress = "0x7c19bC82119F535Ee18b759aAE81d4b5D95E4d3d"
    const lotcontractaddress = "0xab3148C540c8791d290C6e5C12643298D4f68a7b"
    const { data: erccontract } = useContract(erccontractaddress)
    const { data: lotcontract } = useContract(lotcontractaddress)
    // const { data, isLoading, error } = useContractRead(
    //     erccontract,
    //     "totalSupply"
    // )
    const { mutateAsync, isLoading, error } = useContractWrite(
        lotcontract,
        "setLotteryRules"
    )
    const [lotteryRules, setLotteryRules] = useState({
        numOfWinners: "",
        playersLimit: "",
        registrationAmount: "",
        adminFee: "",
        tokenAddress: "",
    })

    const formHandler = (e: any, values: any) => {
        setLotteryRules({ ...lotteryRules, [values]: e.target.value })
    }

    const startLottery = () => {}
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
                <div>
                    <StartLottery />
                    <EnterLottery />
                </div>
            </main>
        </>
    )
}
