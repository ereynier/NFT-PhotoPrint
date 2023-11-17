import { Button } from '@/components/ui/button'
import React from 'react'
import { useContractReads } from 'wagmi'
import ImageABI from "@/utils/abi/Image.abi.json"
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"
import { chain } from '@/utils/chains'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`

interface Props {
    imageAddress: `0x${string}`
    selectedToken: `0x${string}` | null
}

const BuyButton = ({ imageAddress, selectedToken }: Props) => {

    const { data, status } = useContractReads({
        contracts: [{
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
    }) as { data: any, status: 'idle' | 'error' | 'loading' | 'success' }

    const handleBuy = () => {
        console.log(`Buying ${imageAddress} with ${selectedToken}`)
    }

    return (
        <Button size={"lg"} onClick={() => handleBuy()}>Buy</Button>
    )
}

export default BuyButton