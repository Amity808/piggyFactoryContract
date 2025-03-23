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
    const wagmiConfig = useConfig();

    const handleCreateContract = useCallback(async () => {

        setIsLoading(true);
        if (!address) return toast.error("Please connect your wallet");
        if (!isSupportedNetwork(chainId)) return toast.error("Unsupported network");

        const signer = await getEthersSigner(wagmiConfig);


        const factoryContract = new Contract(userContractAddress, GiftAbi, signer);

        try {
            const tx = await factoryContract.createGiftcard(recipient, amount, tokenAddress, mail);
            const receipt = await tx.wait();
            if (receipt.status === 0) {
                throw new Error("Transation failed");
            }

            toast.success("Account created Successfully");

        } catch (error) {
            console.log(error)
            toast.error("No reward to claim")
        } finally {
            setIsLoading(false)
        }

    }, [address, wagmiConfig, chainId]);
    return {
        handleCreateContract, isLoading
    }


}


export default useDeployNewGift;