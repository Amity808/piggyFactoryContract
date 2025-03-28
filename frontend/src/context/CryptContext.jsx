import React, { useContext, createContext, useState } from "react";
import { ethers } from "ethers";
import FactoryAbi from "@/contract/Factory.json"
import { Factory } from "@/constant/index";
import { useReadContract, useWriteContract, useAccount } from "wagmi";


const CryptContext = createContext(null);

// : { children: React.ReactNode}

export const AppProvider = ({ children }) => {
    const [userAddress, setUserAddress] = useState('')
    const { address } = useAccount()

    const { data: GiftCardDeployLen } = useReadContract({
        abi: FactoryAbi,
        address: Factory,
        functionName: "giftDeployCount",
        args: [],
    })

    console.log(GiftCardDeployLen, "giftDeployCount")

    const { data: userCreatedAddress } = useReadContract({
        abi: FactoryAbi,
        address: Factory,
        functionName: "GiftCardDeploy",
        args: [address],
        query: {
            enabled: !!address, // Only run if address exists
        }
    })
    

    console.log(userAddress, "userCreatedAddress")



    
    return (
        <CryptContext.Provider value={{userCreatedAddress, userAddress}}>
            {children}
        </CryptContext.Provider>
    )
}


export const useCryptContext = () => {
    const context = useContext(CryptContext)
    if(!context) {
        throw new Error("This must be use within the app provider")
    }
    return context
}