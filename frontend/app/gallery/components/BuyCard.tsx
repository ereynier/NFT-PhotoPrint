"use client"
import React, { useEffect, useState } from 'react'
import { useContractReads } from 'wagmi'
import ImageABI from "@/utils/abi/Image.abi.json"
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"
import { chain } from '@/utils/chains'
import ImageCard from '@/components/ImageCard'
import BuyDialog from './BuyDialog'

interface Props {
    imageAddress: `0x${string}`
}

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`

const BuyCard = ({ imageAddress }: Props) => {
    const [imageSrc, setImageSrc] = useState<string>('')
    const [imageId, setImageId] = useState<string>('')
    const [imageMaxSupply, setImageMaxSupply] = useState<string>('')
    const [imageTitle, setImageTitle] = useState<string>('')
    const [imageRemaining, setImageRemaining] = useState<number>(0)
    const [allowedTokens, setAllowedTokens] = useState<`0x${string}`[]>([])

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
            functionName: 'getAllowedTokens',
            chainId: chain.id,
            args: []
        }
    ]
    }) as { data: any, status: 'idle' | 'error' | 'loading' | 'success' }

    useEffect(() => {
        if (data) {
            setImageSrc(String(data[0].result))
            setImageId(String(data[1].result))
            setImageTitle(String(data[2].result))
            setImageMaxSupply(String(data[3].result))
            setImageRemaining(Number(data[3].result) - Number(data[1].result))
            setAllowedTokens(data[4].result)
            console.log(data)
        }
    }, [data])

    const handleBuy = () => {

    }

    return (
        <>
            {status === "loading" && (
                <p>Loading...</p>
            )}
            {status === "error" && (
                <p>Error</p>
            )}
            {status === "success" && imageAddress && imageId && imageMaxSupply && imageSrc && imageTitle && (
                <div>
                    <ImageCard imageAddress={imageAddress} imageSrc={imageSrc} imageId={imageId} imageMaxSupply={imageMaxSupply} imageTitle={imageTitle} imageRemaining={imageRemaining}>
                        <BuyDialog imageRemaining={imageRemaining} title={imageTitle} imageAddress={imageAddress} allowedTokens={allowedTokens} />
                    </ImageCard>
                </div>
            )}
        </>
    )
}

export default BuyCard