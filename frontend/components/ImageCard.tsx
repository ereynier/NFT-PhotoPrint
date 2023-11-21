"use client"
import React from 'react'
import ImageContainer from './ImageContainer'

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import Image from 'next/image'

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"


interface ImageData {
    imageAddress: `0x${string}`
    imageSrc: string
    imageNextId: number
    imageId: number
    imageMaxSupply: number
    imageTitle: string
    imagePrice: number
}

interface Props {
    imageData: ImageData
    displayId?: boolean
    children?: React.ReactNode
}

const ImageCard = ({ imageData: { imageAddress, imageSrc, imageMaxSupply, imageTitle, imageNextId, imageId }, displayId, children }: Props) => {

    const [copiedStatus, setCopiedStatus] = React.useState(false)

    const handleCopyAddress = () => {
        navigator.clipboard.writeText(imageAddress)
    }

    const copiedPopoverChanged = () => {
        setCopiedStatus(true)
        setTimeout(() => {
            setCopiedStatus(false)
        }, 1000)
    }

    return (
        <div className='flex flex-col gap-2 items-center justify-center rounded-lg shadow-lg w-fit bg-neutral-50'>
            <ImageContainer src={imageSrc} alt={"NFT Image"} />
            <div className='flex flex-col gap-1 w-64 px-2'>
                <div className='flex items-center justify-between'>
                    {displayId && (
                        <div className='flex flex-row gap-1'>
                            <p># {String(Number(imageId) + 1)}/{String(imageMaxSupply)}</p>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Image src={"/info.svg"} width={20} height={20} alt={"Info"} className='hover:bg-neutral-300 rounded-full' />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>The NFT number {Number(imageId) + 1} corresponds to id {String(imageId)}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                        </div>
                    )}
                    {!displayId && <p>{`${String(imageMaxSupply - imageNextId)}/${String(imageMaxSupply)}`}</p>}
                    <Popover open={copiedStatus} onOpenChange={() => copiedPopoverChanged()}>
                        <PopoverTrigger asChild>
                            <p title={imageAddress} onClick={() => handleCopyAddress()} className=' cursor-pointer hover:bg-neutral-200 rounded-md px-1'>{`${imageAddress.slice(0, 3)}..${imageAddress.slice(-2)}`}</p>
                        </PopoverTrigger>
                        <PopoverContent className='w-fit p-1'>Copied</PopoverContent>
                    </Popover>
                </div>
                <div className='flex items-center justify-center h-14'>
                    <h2 title={imageTitle} className='text-center text-lg sm:text-xl break-words line-clamp-2'>{imageTitle}</h2>
                </div>
            </div>
            {children}
        </div>
    )
}

export default ImageCard