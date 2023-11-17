"use client"
import React, { use, useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { useAccount, useContractReads } from 'wagmi'
import Image from 'next/image'
import getTokens from '@/app/utils/getTokens'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import BuyButton from './BuyButton'

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
    allowedTokens: `0x${string}`[]
}

const BuyDialog = ({imageData: {imageAddress, imageTitle, imageMaxSupply, imageNextId, imagePrice }, allowedTokens } : Props) => {

    const [tokensInfo, setTokensInfo] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [selectedToken, setSelectedToken] = useState<`0x${string}` | null>(null)

    const { isConnected } = useAccount()

    const getTokenInfo = async (tokenAddress: `0x${string}`) => {
        return await getTokens(tokenAddress);
    }
    const getTokensInfo = async () => {
        const tokensInfo = await Promise.all(allowedTokens.map(async (tokenAddress) => await getTokens(tokenAddress)))
        setTokensInfo(tokensInfo)
        setIsLoading(false)
        console.log(tokensInfo)
    }

    useEffect(() => {
        getTokensInfo()
    }, [allowedTokens])

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button disabled={imageMaxSupply - imageNextId <= 0 || !isConnected} className={`w-full mx-4 rounded-t-none`}>{!isConnected ? "Not connected" : (imageMaxSupply - imageNextId > 0 ? `Buy $${imagePrice}` : "Sold out")}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{`${imageTitle.slice(0, 30)}${imageTitle.length > 30 ? "..." : ""}`}</DialogTitle>
                    <DialogDescription>
                        This NFT comes with a unique free print of the photo that you can redeem at any time.
                    </DialogDescription>
                </DialogHeader>
                <p className='text-start'>{imageMaxSupply - imageNextId} NFTs left in this collection.</p>
                <div className='flex flex-row items-center justify-between'>
                    {/* Select through all the tokens available*/}
                    <Select onValueChange={(value: `0x${string}`) => setSelectedToken(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a token" />
                        </SelectTrigger>
                        <SelectContent>
                            {!isLoading && tokensInfo.length == allowedTokens.length && allowedTokens.map((tokenAddress, index) => (
                                <SelectItem key={tokenAddress} value={tokenAddress}>
                                    <div className='flex flex-wrap items-center justify-between gap-2'>
                                        <Image src={`/coins/${String(tokensInfo[index].symbol).toLowerCase()}.svg`} alt={`${tokensInfo[index].symbol} logo`} width={20} height={20} />
                                        <p>{tokensInfo[index].symbol}</p>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <BuyButton imageAddress={imageAddress} selectedToken={selectedToken} />
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default BuyDialog