"use client"
import React from 'react'
import ImageContainer from './ImageContainer'

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface ImageData {
    imageAddress: `0x${string}`
    imageSrc: string
    imageNextId: number
    imageMaxSupply: number
    imageTitle: string
    imagePrice: number
}

interface Props {
    imageData: ImageData
    children?: React.ReactNode
}

const ImageCard = ({ imageData: { imageAddress, imageSrc, imageMaxSupply, imageTitle, imageNextId }, children }: Props) => {

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
                    <p>{`${imageMaxSupply - imageNextId}/${imageMaxSupply}`}</p>
                    <Popover open={copiedStatus} onOpenChange={() => copiedPopoverChanged()}>
                        <PopoverTrigger asChild>
                            <p title={imageAddress} onClick={() => handleCopyAddress()} className=' cursor-pointer hover:bg-neutral-200 rounded-md px-1'>{`${imageAddress.slice(0, 3)}..${imageAddress.slice(-2)}`}</p>
                        </PopoverTrigger>
                        <PopoverContent className='w-fit p-1'>Copied</PopoverContent>
                    </Popover>
                </div>
                <h2 title={imageTitle} className='text-center text-lg sm:text-xl break-words'>{imageTitle.slice(0, 50)} {imageTitle.length > 50 ? "..." : ""}</h2>
            </div>
            {children}
        </div>
    )
}

export default ImageCard