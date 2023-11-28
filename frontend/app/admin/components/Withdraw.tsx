"use client"
import React, { useEffect } from 'react'
import { useContractRead, useContractWrite } from 'wagmi'
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"
import { chain } from '@/utils/chains'
import { useToast } from "@/components/ui/use-toast"
import { Button } from '@/components/ui/button'
import getTokens from '@/app/utils/getTokens'
import Image from 'next/image'
import WithdrawButton from './WithdrawButton'
import { Input } from '@/components/ui/input'

const IMAGE_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`


const Withdraw = () => {

    const [tokensInfo, setTokensInfo] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState<boolean>(true)
    const [userAddress, setUserAddress] = React.useState('')

    const { data: getTokensData, status: getTokensStatus } = useContractRead({
        address: IMAGE_MANAGER_ADDRESS,
        abi: ImageManagerABI as any,
        functionName: 'getAllowedTokens',
        chainId: chain.id,
        args: []
    })


    const getTokensInfo = async (tokensAddresses: `0x${string}`[]) => {
        const tokensInfo = await Promise.all(tokensAddresses.map(async (tokenAddress) => await getTokens(tokenAddress)))
        setTokensInfo(tokensInfo)
        setIsLoading(false)
        console.log(tokensInfo)
    }



    useEffect(() => {
        if (getTokensData && getTokensStatus == 'success') {
            getTokensInfo(getTokensData)
        }
    }, [getTokensData])

    return (
        <div className="flex flex-col items-center justify-center w-full">
            <h3 className="text-lg sm:text-xl md:text-2xl w-full text-center p-2">Withdraw</h3>
            {isLoading || getTokensStatus == 'loading' && (
                <p className="text-xl text-center">Loading...</p>
            )}
            {getTokensStatus == 'error' && (
                <p className="text-xl text-center">Error</p>
            )}
            {!isLoading && getTokensStatus == 'success' && (
                <div className="flex flex-col items-center justify-center w-full gap-2">
                    <Input className='w-full md:w-1/3' onChange={(e) => { setUserAddress(e.target.value) }} placeholder="Enter your address" />
                    <div className="flex flex-col items-center justify-center w-full gap-2">
                        {tokensInfo.map((tokenAddress, index) => (
                            <div key={index} className='flex flex-wrap items-center justify-between gap-2'>
                                <Image src={`/coins/${String(tokensInfo[index].symbol).toLowerCase()}.svg`} alt={`${tokensInfo[index].symbol} logo`} width={20} height={20} />
                                <p>{tokensInfo[index].symbol}</p>
                                <WithdrawButton address={tokensInfo[index].address} symbol={tokensInfo[index].symbol} userAddress={userAddress} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Withdraw