"use client"
import React, { use, useEffect, useState } from 'react'
import { useContractRead, useContractReads } from 'wagmi'
import ImageABI from "@/utils/abi/Image.json"
import { chain } from '@/utils/chains'
import Image from 'next/image'
import ImageContainer from './ImageContainer'

interface Props {
    imageAddress: `0x${string}`
}

const ImageCard = ({ imageAddress }: Props) => {

    const [imageSrc, setImageSrc] = useState<string>('')
    const [imageId, setImageId] = useState<string>('')
    const [imageMaxSupply, setImageMaxSupply] = useState<string>('')
    const [imageTitle, setImageTitle] = useState<string>('')

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
            console.log(data)
        }
    }, [data])

    const handleCopyAddress = () => {
        navigator.clipboard.writeText(imageAddress)
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
                <div className='flex flex-col gap-2 items-center justify-center rounded-lg shadow-md w-fit bg-neutral-50'>
                    <ImageContainer src={imageSrc} alt={"NFT Image"} />
                    <div className='flex flex-col gap-1 w-64 p-2'>
                        <div className='flex items-center justify-between'>
                            <p>{`${imageId}/${imageMaxSupply} sold`}</p>
                            <p title={imageAddress} onClick={() => handleCopyAddress()} className=' cursor-pointer'>{`${imageAddress.slice(0,3)}..${imageAddress.slice(-2)}`}</p>
                        </div>
                        <h2 title={imageTitle} className='text-center text-lg sm:text-xl break-words'>{imageTitle.slice(0,50)} {imageTitle.length > 50 ? "..." : ""}</h2>
                    </div>
                </div>
            )}
        </>
    )
}

export default ImageCard