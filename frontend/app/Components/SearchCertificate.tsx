"use client"
import React, { useState } from 'react'
import { useContractRead } from 'wagmi'
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"
import { chain } from '@/utils/chains'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getCertifByImageAddress } from './getCertifByImage'
import { isAddress } from 'viem'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const IMAGE_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`

const SearchCertificate = () => {

    const [imageAddress, setImageAddress] = useState("")
    const [certificateAddress, setCertificateAddress] = useState("")

    const [copiedStatus, setCopiedStatus] = useState(false)

    const copiedPopoverChanged = () => {
        setCopiedStatus(true)
        setTimeout(() => {
            setCopiedStatus(false)
        }, 1000)
    }

    const handleCopyAddress = () => {
        navigator.clipboard.writeText(certificateAddress)
    }

    const getCertificateAddress = async () => {
        const data = await getCertifByImageAddress(imageAddress as `0x${string}`)
        setCertificateAddress(data)
    }

    const handleSearch = () => {
        if (!isAddress(imageAddress)) {
            return
        }
        getCertificateAddress()
    }

    const isDisabled = () => {
        if (!isAddress(imageAddress)) {
            return true
        }
        return false
    }


    return (
        <div className='flex flex-col items-center justify-center gap-2 w-full p-4'>
            <div className='flex flex-row gap-2'>
                <Input type="text" placeholder='address' className='w-fit' onChange={(e) => setImageAddress(e.target.value)} value={imageAddress} />
                <Button disabled={isDisabled()} onClick={() => handleSearch()}>Search</Button>
            </div>
            <p className='text-center'>Certificate address:</p>
            <Popover open={copiedStatus} onOpenChange={() => copiedPopoverChanged()}>
                <PopoverTrigger asChild>
                    <p title={imageAddress} onClick={() => handleCopyAddress()} className=' cursor-pointer hover:bg-neutral-100 rounded-md px-1'>{`${certificateAddress || "..."}`}</p>
                </PopoverTrigger>
                <PopoverContent className='w-fit p-1'>Copied</PopoverContent>
            </Popover>
        </div>
    )
}

export default SearchCertificate