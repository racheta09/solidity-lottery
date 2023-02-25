import { useEffect, useState } from "react"
import {
    useContractWrite,
    useContractRead,
    useContract,
    Web3Button,
} from "@thirdweb-dev/react"

export default function GetWinner(props: any) {
    const erccontractaddress = "0x7c19bC82119F535Ee18b759aAE81d4b5D95E4d3d"
    const lotcontractaddress = "0x69e795F21B5De63914694aEd4994ad5B0198cd4A"
    const { data: lotcontract } = useContract(lotcontractaddress)
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
    return <>
        <div className="text-xl">{winner && winner.toString()}</div>
        
    </>
}
