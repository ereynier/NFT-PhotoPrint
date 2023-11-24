import { Button } from '@/components/ui/button'
import React from 'react'
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useContractWrite } from 'wagmi'
import { chain } from '@/utils/chains'
import { emptyString } from '@/utils/contant'

const IMAGE_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`
const LOCKING_PERIOD = process.env.NEXT_PUBLIC_LOCKING_PERIOD || 604800

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
    lockedData: LockedData
    refreshLockedData?: () => void
}

const UnlockButton = ({ refreshImages, lockedData, refreshLockedData }: Props) => {
    
    const { data: unlockImageData, isLoading: unlockImageIsLoading, write: unlockImageWrite } = useContractWrite({
        address: IMAGE_MANAGER_ADDRESS,
        abi: ImageManagerABI as any,
        functionName: 'unlockImage',
        chainId: chain.id,
        onSuccess: () => {
            if (refreshImages) {
                refreshImages()
            }
            if (refreshLockedData) {
                refreshLockedData()
            }
        }
    })

    const { data: clearOrderIdData, isLoading: clearOrderIdIsLoading, write: clearOrderIdWrite } = useContractWrite({
        address: IMAGE_MANAGER_ADDRESS,
        abi: ImageManagerABI as any,
        functionName: 'clearOrderId',
        chainId: chain.id,
        onSuccess: () => {
            if (refreshLockedData) {
                refreshLockedData()
            }
        }
    })

    const isDisabled = () => {
        if (Number(lockedData.timestampLock) + Number(LOCKING_PERIOD) > Date.now() / 1000) {
            return true
        }
        if (unlockImageIsLoading) {
            return true
        }
        if (lockedData.printed) {
            return true
        }
        return false
    }

    const getTooltipContent = () => {
        if (lockedData.printed) {
            return `You have already printed this NFT`
        }
        if (isDisabled()) {
            return `You have to wait ${Math.floor(((Number(lockedData.timestampLock) + Number(LOCKING_PERIOD)) - Date.now() / 1000) / 3600)} hours before unlocking this NFT`
        }
        if (lockedData.cryptedOrderId != emptyString) {
            return `You have to clear the embryonic order before unlocking this NFT`
        }
        return `You can unlock this NFT`
    }

    const handleUnlock = async () => {
        console.log('unlock')
        unlockImageWrite()
    }

    const handleClear = async () => {
        console.log('clear')
        clearOrderIdWrite()
    }

    return (
        <div className='flex w-full justify-end items-end'>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        {lockedData.cryptedOrderId == emptyString ? (
                            <Button disabled={isDisabled()} className='w-full rounded-t-none rounded-l-none bg-slate-600 hover:bg-slate-500' onClick={() => handleUnlock()}>Unlock</Button>
                        ) : (
                            <span className='w-full'>
                                <Button disabled={isDisabled()} className='w-full rounded-t-none rounded-l-none bg-slate-600 hover:bg-slate-500' onClick={() => handleClear()}>Clear order</Button>
                            </span>
                        )}
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{getTooltipContent()}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>

    )
}

export default UnlockButton