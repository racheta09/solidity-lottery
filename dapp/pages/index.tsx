import Head from "next/head"
import { useContractRead, useContract, useAddress } from "@thirdweb-dev/react"

import EnterLottery from "@/components/enterLottery"
import ClaimReward from "@/components/claimReward"
import AdminSection from "@/components/adminSection"
import NavBar from "@/components/navBar"

export default function Home() {
    const address = useAddress()
    const lotContractAddress = "0x098148F5ff6b5D4629E0d6F5604be3FBb0030286"
    const { data: lotcontract } = useContract(lotContractAddress)
    const { data: lotStatus } = useContractRead(lotcontract, "lotteryStatus")
    const { data: owner } = useContractRead(lotcontract, "owner")
    const { data: lotData } = useContractRead(lotcontract, "lotteryConfig")

    return (
        <>
            <Head>
                <title>Solidity Lottery</title>
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
            <main className="flex flex-col items-center w-full">
                <div className="bg-[#041e37]">
                    <h1 className="text-4xl text-center my-2 py-2">
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
                            numOfWinners={lotData?.numOfWinners}
                            playersLimit={lotData?.playersLimit}
                        />
                    ) : lotStatus == "2" ? (
                        <ClaimReward
                            lotContractAddress={lotContractAddress}
                            numOfWinners={parseInt(lotData?.numOfWinners)}
                        />
                    ) : (
                        ""
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
