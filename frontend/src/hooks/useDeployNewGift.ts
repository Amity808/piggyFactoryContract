import FactoryAbi from "@/contract/Factory.json"
import GiftAbi from "@/contract/GiftAbi.json";
import { useCallback, useState } from "react";
import { Contract } from "ethers";
import { getReadOnlyProvider, isSupportedNetwork } from "@/utils";
import { getEthersSigner } from "@/config/adapter"
import { useAccount, useChainId, useConfig } from "wagmi";
import { toast } from 'sonner';
import { Factory } from "@/constant";
interface Params {
    userContractAddress: string;
    recipient: string;
    amount: number;
    tokenAddress: string;
    mail: string
}
const useDeployNewGift = ({ userContractAddress, recipient, amount, tokenAddress, mail }: Params) => {
    const [isLoading, setIsLoading] = useState(false)
    const { address } = useAccount();
    const chainId = useChainId();
    // console.log(chainId)
    const wagmiConfig = useConfig();

    const handleCreateContract = useCallback(async () => {

        setIsLoading(true);
        if (!address) return toast.error("Please connect your wallet");
        if (!isSupportedNetwork(chainId)) return toast.error("Unsupported network");
        // if(!)

        const signer = await getEthersSigner(wagmiConfig);


        const factoryContract = new Contract(userContractAddress, GiftAbi, signer);

        try {
            const tx = await factoryContract.createGiftcard(recipient, amount, tokenAddress, mail);
            const receipt = await tx.wait();
            if (receipt.status === 0) {
                throw new Error("Transation failed");
            }

            toast.success("Gift card successfully created");

        } catch (error) {
            console.log(error)
            toast.error("Unable to create giftcard")
        } finally {
            setIsLoading(false)
        }

    }, [address, wagmiConfig, chainId,recipient, amount, tokenAddress, mail, userContractAddress]);
    return {
        handleCreateContract, isLoading
    }


}


export default useDeployNewGift;