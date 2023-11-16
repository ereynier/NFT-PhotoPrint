"use client"
import React, { useEffect, useState } from 'react'
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

interface Props {
    imageRemaining: number
    title: string
    imageAddress: `0x${string}`
    allowedTokens: `0x${string}`[]
}


const BuyDialog = ({ imageRemaining, title, imageAddress, allowedTokens }: Props) => {

    const [selectedToken, setSelectedToken] = useState<`0x${string}` | undefined>()

    const { isConnected } = useAccount()

    const getTokenInfo = async (tokenAddress: `0x${string}`) => {
        return await getTokens(tokenAddress);
    }

    const handleBuy = () => {
        console.log(`Buying ${imageAddress} with ${selectedToken}`)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button disabled={imageRemaining <= 0 || !isConnected} className={`w-full mx-4 rounded-t-none`}>{!isConnected ? "Not connected" : (imageRemaining > 0 ? "Buy" : "Sold out")}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{`${title.slice(0, 30)}${title.length > 30 ? "..." : ""}`}</DialogTitle>
                    <DialogDescription>
                        This NFT comes with a unique free print of the photo that you can redeem at any time.
                    </DialogDescription>
                </DialogHeader>
                <p className='text-start'>{imageRemaining} NFTs left in this collection.</p>
                <div className='flex flex-row items-center justify-between'>
                    {/* Select through all the tokens available*/}
                    {allowedTokens.map((tokenAddress) => (
                        <div key={tokenAddress} className='flex items-center justify-between gap-2'>
                            <Image src={`/coins/${String(tokensInfo[tokenAddress].symbol).toLowerCase()}.svg`} alt={`${tokensInfo[tokenAddress].symbol} logo`} width={20} height={20} />
                            <p>{tokensInfo[tokenAddress].symbol}</p>
                        </div>
                    ))}
                    <Button size={"lg"} onClick={() => handleBuy()}>Buy</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default BuyDialog