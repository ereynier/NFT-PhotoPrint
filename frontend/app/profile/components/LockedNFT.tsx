import React, { useEffect } from 'react'
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"
import ImageABI from "@/utils/abi/Image.abi.json"
import PrinterABI from "@/utils/abi/Printer.abi.json"
import { useAccount, useContractRead } from 'wagmi'
import { chain } from '@/utils/chains'
import { getImageLockedByUser } from './getNFTsByUser'
import LockedCard from './LockedCard'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { zeroAddress } from 'viem'

const IMAGE_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`
const LOCKING_PERIOD = process.env.NEXT_PUBLIC_LOCKING_PERIOD || 604800

interface ImageLockedData {
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
}

const LockedNFT = ({refreshImages, refreshCertificates}: Props) => {

    const [printerAddress, setPrinterAddress] = React.useState<`0x${string}` | null>(null)
    const [imageLocked, setImageLocked] = React.useState<ImageLockedData | null>(null)
    const [imageLockedIsLoading, setImageLockedIsLoading] = React.useState(true)
    const { isConnected, address } = useAccount()

    // GET PRINTER ADDRESS
    const { data: printerAddressData, status: printerAddressStatus } = useContractRead({
        address: IMAGE_MANAGER_ADDRESS,
        abi: ImageManagerABI,
        functionName: 'getPrinterAddress',
        chainId: chain.id
    }) as { data: any, status: 'idle' | 'error' | 'loading' | 'success' }

    // GET NFT
    const getNFTLocked = async () => {
        const data = await getImageLockedByUser(address as `0x${string}`, printerAddress as `0x${string}`)
        console.log(data)
        const imageLockedData = {
            imageAddress: data[0],
            imageId: data[1],
            printed: data[2],
            timestampLock: data[3],
            cryptedOrderId: data[4],
            owner: data[5]
        }
        setImageLocked(imageLockedData)
        setImageLockedIsLoading(false)
    }

    const handleUpdate = () => {
        setImageLockedIsLoading(true)
        getNFTLocked()
    }

    useEffect(() => {
        if (printerAddressData && !printerAddress) {
            setPrinterAddress(printerAddressData)
        }
        if (isConnected && printerAddress && imageLockedIsLoading) {
            getNFTLocked()
        }
    }), [printerAddressData, isConnected, printerAddress]

    return (
        <div>
            {imageLockedIsLoading && <p>Loading...</p>}
            {!imageLockedIsLoading && imageLocked && imageLocked["imageAddress"] == zeroAddress && (
                <div className='flex flex-row items-center justify-center'>
                    <p className='flex items-center justify-center text-sm text-neutral-700 p-2'>{"No NFT locked"}</p>
                    <Image onClick={() => handleUpdate()} src="/update.svg" alt="update" width="20" height="20" className='p-1 border-[1px] border-neutral-200 cursor-pointer w-fit h-fit rounded-lg hover:bg-neutral-200' />
                </div>
            )}
            {!imageLockedIsLoading && imageLocked && imageLocked["imageAddress"] != zeroAddress && printerAddress != null && (
                <div>
                    <LockedCard
                        lockedData={imageLocked}
                        refreshImages={refreshImages}
                        refreshCertificates={refreshCertificates}
                        refreshLockedData={getNFTLocked}
                        printerAddress={printerAddress}
                    />
                </div>
            )}
        </div>
    )
}

export default LockedNFT