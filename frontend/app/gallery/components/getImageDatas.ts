import { chain } from "@/utils/chains";
import { readContracts } from "wagmi";
import ImageABI from "@/utils/abi/Image.abi.json"
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`

export async function getImageDatas(imageAddress: `0x${string}`) {
    const data = await readContracts({
        contracts: [
            {
                address: imageAddress,
                abi: ImageABI as any,
                functionName: 'getUri',
                chainId: chain.id,
                args: []
            },
            {
                address: imageAddress,
                abi: ImageABI as any,
                functionName: 'getNextId',
                chainId: chain.id,
                args: []
            },
            {
                address: imageAddress,
                abi: ImageABI as any,
                functionName: 'name',
                chainId: chain.id,
                args: []
            },
            {
                address: imageAddress,
                abi: ImageABI as any,
                functionName: 'getMaxSupply',
                chainId: chain.id,
                args: []
            },
            {
                address: CONTRACT_ADDRESS,
                abi: ImageManagerABI as any,
                functionName: 'getImagePriceInUsdInWei',
                chainId: chain.id,
                args: [imageAddress]
            },
            {
                address: CONTRACT_ADDRESS,
                abi: ImageManagerABI as any,
                functionName: 'getAllowedTokens',
                chainId: chain.id,
                args: []
            }
        ]
    })
    return {
        uri: data[0].result as unknown as string,
        nextId: data[1].result as unknown as number,
        name: data[2].result as unknown as string,
        maxSupply: data[3].result as unknown as number,
        priceInUsdInWei: data[4].result as unknown as number,
        allowedTokens: data[5].result as unknown as `0x${string}`[]
    }
}