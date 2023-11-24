import { erc20ABI, readContracts } from "wagmi"
import ImageABI from "@/utils/abi/Image.abi.json"
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"
import { chain } from "@/utils/chains"

const IMAGE_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`

export async function getPriceFromToken(selectedToken: `0x${string}`, imagePrice: number) {
    const data = await readContracts({
        contracts: [
            {
                address: IMAGE_MANAGER_ADDRESS,
                abi: ImageManagerABI as any,
                functionName: 'getTokenAmountFromUsd',
                chainId: chain.id,
                args: [selectedToken, imagePrice]
            }
        ]
    })
    return {
        tokenAmount: data[0].result as unknown as number,
    }
}

export async function getAllowanceFromUser(selectedToken: `0x${string}`, address: `0x${string}`) {
    const data = await readContracts({
        contracts: [
            {
                address: selectedToken as `0x${string}`,
                abi: erc20ABI,
                functionName: 'allowance',
                chainId: chain.id,
                args: [address as `0x${string}`, IMAGE_MANAGER_ADDRESS]
            }
        ]
    })
    return{
        allowance: data[0].result as unknown as number
    }
}