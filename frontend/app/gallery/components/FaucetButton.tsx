import { Button } from '@/components/ui/button'
import React, { useEffect } from 'react'
import { useContractWrite, useWaitForTransaction } from 'wagmi'
import MockERC20BI from "@/utils/abi/MockERC20.abi.json"
import { chain } from '@/utils/chains'
import getTokens from '@/app/utils/getTokens'

import { useToast } from "@/components/ui/use-toast"


interface Props {
    token: `0x${string}`
    address: `0x${string}`
}


const FaucetButton = ({ token, address }: Props) => {

    const [tokenSymbol, setTokenSymbol] = React.useState<string>('')
    const [tokenDecimals, setTokenDecimals] = React.useState<number>(0)
    const [isLoading, setIsLoading] = React.useState<boolean>(true)

    const { toast } = useToast()

    const { data: faucetData, isLoading: faucetIsLoading, write: faucetWrite } = useContractWrite({
        address: token,
        abi: MockERC20BI,
        functionName: 'mint',
        chainId: chain.id,
        args: [address, 100 * 10 ** tokenDecimals],
    }) as any

    const { data: txReceipt, isLoading: txReceiptIsLoading, refetch: txReceiptRefetch } = useWaitForTransaction({
        hash: faucetData?.hash,
        chainId: chain.id,
        onSuccess: () => {
            toast({
                title: 'Success',
                description: `You received 100 ${tokenSymbol}`,
            })
            var audio = new Audio('/audio/success.mp3');
            audio.volume = 0.2;
            audio.play();
        }
    }) as { data: any, isLoading: boolean, refetch: (options: { throwOnError: boolean, cancelRefetch: boolean }) => Promise<any> }

    const getTokenInfo = async () => {
        const { symbol, decimals } = await getTokens(token) as any
        setTokenSymbol(symbol)
        setTokenDecimals(decimals)
        setIsLoading(false)
    }

    const handleFaucet = async (token: `0x${string}`) => {
        await faucetWrite()
    }

    const display = () => {
        if (faucetIsLoading || txReceiptIsLoading) {
            return 'Loading...'
        }
        return tokenSymbol
    }

    useEffect(() => {
        if (token) {
            getTokenInfo()
        }
        if (faucetData?.hash) {
            txReceiptRefetch({ throwOnError: true, cancelRefetch: true })
        }
    }, [token, faucetData])

    return (
        <div className='flex flex-row items-center justify-center gap-4'>
            {!isLoading && (
                <Button disabled={isLoading || faucetIsLoading || txReceiptIsLoading} onClick={() => { handleFaucet(token) }} variant={"default"} className=''>{`${display()}`}</Button>
            )}
        </div>
    )
}

export default FaucetButton