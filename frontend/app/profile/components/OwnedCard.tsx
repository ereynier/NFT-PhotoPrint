"use client"
import React, { useEffect, useState } from 'react'
import { useContractEvent, useContractReads } from 'wagmi'
import ImageABI from "@/utils/abi/Image.abi.json"
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"
import { chain } from '@/utils/chains'
import ImageCard from '@/components/ImageCard'
import LockDialog from './LockDialog'

interface Props {
    imageAddress: `0x${string}`
    imageId: number
    locker?: boolean
    refreshImages?: () => void
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

const IMAGE_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`


const OwnedCard = ({ imageAddress, imageId, locker, refreshImages }: Props) => {

    const [imageData, setImageData] = useState<ImageData>({
        imageAddress: imageAddress,
        imageSrc: '',
        imageId: imageId,
        imageMaxSupply: 0,
        imageTitle: '',
        imageNextId: 0,
        imagePrice: 0
    })

    const { data, status, refetch: refetchImageDatas } = useContractReads({
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
        ]
    }) as {
        data: any, status: 'idle' | 'error' | 'loading' | 'success', refetch: (options: { throwOnError: boolean, cancelRefetch: boolean }) => Promise<any>
    }

    useEffect(() => {
        if (data) {
            if (!isNaN(Number(data[2].result))) {
                setImageData({
                    ...imageData,
                    imageSrc: String(data[0].result),
                    imageTitle: String(data[1].result),
                    imageMaxSupply: Number(data[2].result),
                })
                console.log(data)
            }
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
                    <ImageCard imageData={imageData} displayId={true}>
                        {locker && <LockDialog imageData={imageData} refreshImages={refreshImages}/>}
                    </ImageCard>
                </div>
            )}
        </>
    )
}

export default OwnedCard