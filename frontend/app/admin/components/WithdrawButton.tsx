"use client"
import React, { useEffect } from 'react'
import { erc20ABI, useAccount, useContractRead, useContractWrite } from 'wagmi'
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"
import { chain } from '@/utils/chains'
import { useToast } from "@/components/ui/use-toast"
import { Button } from '@/components/ui/button'
import { formatEther, isAddress } from 'viem'

const IMAGE_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`

interface Props {
    address: `0x${string}`
    symbol: string
    userAddress: string
}

const WithdrawButton = ({ address, symbol, userAddress }: Props) => {

    const [balance, setBalance] = React.useState(0)
    const { toast } = useToast()

    const { isLoading, write } = useContractWrite({
        address: IMAGE_MANAGER_ADDRESS,
        abi: ImageManagerABI,
        functionName: 'withdrawToken',
        args: [address, userAddress],
        chainId: chain.id,
        onSuccess: () => {
            toast({
                title: 'Withdrawn',
                description: `${formatEther(BigInt(balance))} ${symbol} withdrawn`,
            })
            var audio = new Audio('/audio/success.mp3');
            audio.volume = 0.2;
            audio.play();
            refetch({ throwOnError: true, cancelRefetch: true })
        },
        onError: () => {
            toast({
                title: 'Error',
                description: 'Error',
                variant: 'destructive'
            })
        }
    })

    const { data: balanceData, isLoading: balanceIsLoading, refetch } = useContractRead({
        address: address,
        abi: erc20ABI,
        functionName: 'balanceOf',
        chainId: chain.id,
        args: [IMAGE_MANAGER_ADDRESS]
    }) as { data: any, isLoading: boolean, refetch: (options: { throwOnError: boolean, cancelRefetch: boolean }) => Promise<any> }

    useEffect(() => {
        if (address && balanceData != undefined && balanceIsLoading == false) {
            setBalance(Number(balanceData))
        }
    }, [balanceData, address])

    return (
        <div className='flex flex-row gap-2 items-center'>
            <p>{`Balance: ${formatEther(BigInt(balance))}`}</p>
            <Button disabled={isLoading || !isAddress(userAddress) || balance == 0} onClick={() => { write() }} className='text-center'>{`Withdraw`}</Button>
        </div>
    )
}

export default WithdrawButton