import { chain } from "@/utils/chains";
import { erc20ABI, readContracts } from "wagmi";


export default async function getTokens(tokenAddress: `0x${string}`) {
    const data = await readContracts({
        contracts: [{
            address: tokenAddress,
            abi: erc20ABI as any,
            functionName: 'name',
            chainId: chain.id,
            args: []
        },
        {
            address: tokenAddress,
            abi: erc20ABI as any,
            functionName: 'symbol',
            chainId: chain.id,
            args: []
        }]
    })
    return {
        name: data[0].result,
        symbol: data[1].result
    }
}