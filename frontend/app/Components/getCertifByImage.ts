import { readContracts } from "wagmi";
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"
import { chain } from "@/utils/chains";
const IMAGE_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`

export const getCertifByImageAddress = async (imageAddress: `0x${string}`) => {
    const data = await readContracts({
        contracts: [
            {
                address: IMAGE_MANAGER_ADDRESS,
                abi: ImageManagerABI as any,
                functionName: "getCertificateByImage",
                chainId: chain.id,
                args: [imageAddress]
            }
        ]
    })
    return (data[0].result as unknown as `0x${string}`)
}