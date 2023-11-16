"use client"
import React, { use, useEffect, useState } from 'react'
import { useContractReads } from 'wagmi'
import ImageABI from "@/utils/abi/Image.json"
import { chain } from '@/utils/chains'
import { Button } from "@/components/ui/button"
import ImageCard from '@/components/ImageCard'

interface Props {
    imageAddress: `0x${string}`
}

const BuyCard = ({ imageAddress }: Props) => {
    const [imageSrc, setImageSrc] = useState<string>('')
    const [imageId, setImageId] = useState<string>('')
    const [imageMaxSupply, setImageMaxSupply] = useState<string>('')
    const [imageTitle, setImageTitle] = useState<string>('')
    const [imageRemaining, setImageRemaining] = useState<number>(0)

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
        }]
    }) as { data: any, status: 'idle' | 'error' | 'loading' | 'success' }

    useEffect(() => {
        if (data) {
            setImageSrc(String(data[0].result))
            setImageId(String(data[1].result))
            setImageTitle(String(data[2].result))
            setImageMaxSupply(String(data[3].result))
            setImageRemaining(Number(data[3].result) - Number(data[1].result))
            console.log(data)
        }
    }, [data])

    const handleCopyAddress = () => {
        navigator.clipboard.writeText(imageAddress)
    }

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
                    <ImageCard imageAddress={imageAddress} imageSrc={imageSrc} imageId={imageId} imageMaxSupply={imageMaxSupply} imageTitle={imageTitle} imageRemaining={imageRemaining} />
                    {/* <Button disabled={imageRemaining <= 0} className={`w-full mx-4`} onClick={() => handleBuy()}>{imageRemaining > 0 ? "Buy" : "Sold out"}</Button> */}
                </div>
            )}
        </>
    )
}

export default BuyCard