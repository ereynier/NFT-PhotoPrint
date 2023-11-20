import { chain } from "@/utils/chains"
import { readContracts } from "wagmi"
import ImageABI from "@/utils/abi/Image.abi.json"

export async function getBalanceOfUser(imageAddress: `0x${string}`, address: `0x${string}`) {

    const data = await readContracts({
        contracts: [
            {
                address: imageAddress,
                abi: ImageABI as any,
                functionName: 'balanceOf',
                chainId: chain.id,
                args: [address as `0x${string}`]
            }
        ]
    })
    return {
        balance: data[0].result as unknown as number
    }
}