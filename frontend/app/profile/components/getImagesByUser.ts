import { chain } from "@/utils/chains";
import { readContracts } from "wagmi";
import ImageABI from "@/utils/abi/Image.abi.json"

export async function getImagesByUser(imageAddresses: `0x${string}`[], userAddress: `0x${string}`) {

    const data: { [key: string]: number[] } = {}

    for (const imageAddress of imageAddresses) {
        const dataBalance = await readContracts({
            contracts: [
                {
                    address: imageAddress,
                    abi: ImageABI as any,
                    functionName: 'getIdsByUser',
                    chainId: chain.id,
                    args: [userAddress]
                },
            ]
        }) as any
        if (dataBalance[0].result?.length > 0) {
            data[imageAddress] = dataBalance[0].result as unknown as number[]
        }
    }
    return data
}