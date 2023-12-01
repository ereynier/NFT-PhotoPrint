import { chain } from '@/utils/chains'
import React, { useEffect, useState } from 'react'
import { useAccount, useContractRead } from 'wagmi'
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"


import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import FaucetButton from './FaucetButton'

const IMAGE_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`

const TokenFaucet = () => {

    const [tokens, setTokens] = useState<`0x${string}`[]>([]);

    const { isConnected, address } = useAccount()

    const { data, isLoading } = useContractRead({
        address: IMAGE_MANAGER_ADDRESS,
        abi: ImageManagerABI,
        functionName: 'getAllowedTokens',
        chainId: chain.id,
        args: []
    }) as { data: `0x${string}`[], isError: boolean, isLoading: boolean }


    useEffect(() => {
        if (data && !isLoading) {
            setTokens(data)
        }
    }, [data, isLoading])


    return (
        <div className='flex flex-col items-center justify-center p-6'>
            {!isLoading && tokens.length > 0 && isConnected && (
                <div className='flex flex-row items-center justify-center gap-4'>
                    <p className='text-lg'>Tokens faucet:</p>
                    {tokens.map((token, index) => (
                        <TooltipProvider key={index}>
                            <Tooltip>
                                <TooltipTrigger>
                                    <FaucetButton token={token} address={address as `0x${string}`} />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{token}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </div>
            )}
        </div>
    )
}

export default TokenFaucet