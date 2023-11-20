"use client"
import React, { useEffect, useState } from 'react'
import { useContractEvent, useContractReads } from 'wagmi'
import ImageABI from "@/utils/abi/Image.abi.json"
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"
import { chain } from '@/utils/chains'
import ImageCard from '@/components/ImageCard'
import BuyDialog from './BuyDialog'
import { formatEther } from 'viem'

interface Props {
    imageAddress: `0x${string}`
}

interface ImageData {
    imageAddress: `0x${string}`
    imageSrc: string
    imageId: number
    imageMaxSupply: number
    imageTitle: string
    imageNextId: number
    imagePrice: number
}

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`


const BuyCard = ({ imageAddress }: Props) => {

    const [imageData, setImageData] = useState<ImageData>({
        imageAddress: imageAddress,
        imageSrc: '',
        imageId: 0,
        imageMaxSupply: 0,
        imageTitle: '',
        imageNextId: 0,
        imagePrice: 0
    })
    const [allowedTokens, setAllowedTokens] = useState<`0x${string}`[]>([])

    const { data, status, refetch: refetchImageDatas } = useContractReads({
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
    }) as {
        data: any, status: 'idle' | 'error' | 'loading' | 'success', refetch: (options: { throwOnError: boolean, cancelRefetch: boolean }) => Promise<any>
    }

    useContractEvent({
        address: imageAddress as `0x${string}`,
        abi: ImageABI,
        eventName: 'minted',
        listener(log: any) {
            console.log(log)
            refetchImageDatas({ throwOnError: false, cancelRefetch: true })
        }
    })

    useEffect(() => {
        if (data) {
            setImageData({
                ...imageData,
                imageSrc: String(data[0].result),
                imageNextId: Number(data[1].result),
                imageTitle: String(data[2].result),
                imageMaxSupply: Number(data[3].result),
                imagePrice: Number(data[4].result)
            })
            setAllowedTokens(data[5].result)
            console.log(data)
        }
    }, [data])

    return (
        <>
            {status === "loading" && (
                <p>Loading...</p>
            )}
            {status === "error" && (
                <p>Error</p>
            )}
            {status === "success" && imageAddress && (
                <div>
                    <ImageCard imageData={imageData}>
                        <BuyDialog imageData={imageData} allowedTokens={allowedTokens} refetchImageDatas={refetchImageDatas} />
                    </ImageCard>
                </div>
            )}
        </>
    )
}

export default BuyCard