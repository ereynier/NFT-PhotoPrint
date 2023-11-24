"use client"
import React, { useEffect, useState } from 'react'
import { useContractEvent, useContractReads } from 'wagmi'
import ImageABI from "@/utils/abi/Image.abi.json"
import PrinterABI from "@/utils/abi/Printer.abi.json"
import { chain } from '@/utils/chains'
import ImageCard from '@/components/ImageCard'
import LockDialog from './LockDialog'
import UnlockButton from './UnlockButton'
import PrintButton from './PrintButton'
import MintCertificateButton from './MintCertificateButton'

interface LockedData {
    imageAddress: `0x${string}`,
    imageId: number,
    printed: boolean,
    timestampLock: number,
    cryptedOrderId: string,
    owner: `0x${string}`
}

interface Props {
    refreshImages?: () => void
    refreshCertificates?: () => void
    lockedData: LockedData
    refreshLockedData?: () => void
    printerAddress: `0x${string}`
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


const LockedCard = ({ lockedData: { imageAddress, imageId }, lockedData, refreshImages, refreshCertificates, refreshLockedData, printerAddress }: Props) => {

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

    useContractEvent({
        address: printerAddress,
        abi: PrinterABI,
        eventName: 'ImagePrinted',
        listener(log: any) {
            if (log[0]['args']['imageAddress'] == imageAddress && log[0]['args']['imageId'] == imageId) {
                refreshLockedData && refreshLockedData();
            }
        },
    })

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
                        <div className='flex w-full'>
                            {lockedData.cryptedOrderId == "" && (
                                <PrintButton lockedData={lockedData} refreshLockedData={refreshLockedData} />
                            )}
                            {!lockedData.printed && (
                                <UnlockButton refreshImages={refreshImages} lockedData={lockedData} refreshLockedData={refreshLockedData} />
                            )}
                            {lockedData.printed && (
                                <MintCertificateButton lockedData={lockedData} refreshLockedData={refreshLockedData} refreshImages={refreshImages} refreshCertificates={refreshCertificates} />
                            )}
                        </div>
                    </ImageCard>
                </div>
            )}
        </>
    )
}

export default LockedCard