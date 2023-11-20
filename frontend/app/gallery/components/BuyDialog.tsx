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
import { useAccount, useContractEvent, useContractReads } from 'wagmi'
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
import { formatEther } from 'viem'
import { getBalanceOfUser } from './getBalanceOfUser'
import ImageABI from "@/utils/abi/Image.abi.json"
import { chain } from '@/utils/chains'

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
    refetchImageDatas: (options: { throwOnError: boolean, cancelRefetch: boolean }) => Promise<any>
}

const BuyDialog = ({ imageData: { imageAddress, imageTitle, imageMaxSupply, imageNextId, imagePrice }, imageData, allowedTokens, refetchImageDatas }: Props) => {

    const [tokensInfo, setTokensInfo] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [selectedToken, setSelectedToken] = useState<`0x${string}` | null>(null)
    const [open, setOpen] = useState<boolean>(false)
    const [imageBalance, setImageBalance] = useState<number>(0)

    const { isConnected, address } = useAccount()

    const getTokensInfo = async () => {
        const tokensInfo = await Promise.all(allowedTokens.map(async (tokenAddress) => await getTokens(tokenAddress)))
        setTokensInfo(tokensInfo)
        setIsLoading(false)
        console.log(tokensInfo)
    }

    const { data, status, refetch: refetchUserBalance } = useContractReads({
        contracts: [
            {
                address: imageAddress,
                abi: ImageABI as any,
                functionName: 'balanceOf',
                chainId: chain.id,
                args: [address as `0x${string}`]
            }
        ]
    }) as { data: any, status: 'idle' | 'error' | 'loading' | 'success', refetch: (options: { throwOnError: boolean, cancelRefetch: boolean }) => Promise<any> }


    // useContractEvent({
    //     address: imageAddress as `0x${string}`,
    //     abi: ImageABI,
    //     eventName: 'minted',
    //     listener(log: any) {
    //         console.log(log[0]["args"]["to"], address)
    //         if (log[0]["args"]["to"] == address) {
    //             // CA MARCHE PAS
    //         }
    //     },
    // })

    useEffect(() => {
        if (!isConnected) {
            setOpen(false)
        }
        if (data) {
            setImageBalance(data[0].result)
        }
        getTokensInfo()
    }, [allowedTokens, isConnected, data])

    return (
        <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
            <DialogTrigger asChild>
                <Button disabled={imageMaxSupply - imageNextId <= 0 || !isConnected} className={`w-full mx-4 rounded-t-none`}>{!isConnected ? "Not connected" : (imageMaxSupply - imageNextId > 0 ? `Buy $${formatEther(BigInt(imagePrice))}` : "Sold out")}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{`${imageTitle.slice(0, 30)}${imageTitle.length > 30 ? "..." : ""}`}</DialogTitle>
                    <DialogDescription>
                        This NFT comes with a unique free print of the photo that you can claim at any time.
                    </DialogDescription>
                </DialogHeader>
                <div className='flex flex-col items-start justify-start'>
                    <p className='text-start'>There are <span className=' font-bold'>{String(imageMaxSupply - imageNextId)}</span> NFTs left in this collection at a price of <span className=' font-bold'>${formatEther(BigInt(imagePrice))}</span>.</p>
                    <p className='text-start'>You have <span className=' font-bold'>{String(imageBalance)}</span> NFTs from this collection.</p>
                </div>
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
                    <BuyButton imageData={imageData} selectedToken={selectedToken} refetchUserBalance={refetchUserBalance} refetchImageDatas={refetchImageDatas} />
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default BuyDialog