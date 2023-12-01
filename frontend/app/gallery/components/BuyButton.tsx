import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import { erc20ABI, useAccount, useContractWrite, useNetwork, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"
import { formatEther } from 'viem'
import { getPriceFromToken } from './getPriceAndAllowance'
import { getAllowanceFromUser } from './getPriceAndAllowance'
import { useToast } from "@/components/ui/use-toast"
import { chain } from '@/utils/chains'


const IMAGE_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`

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
    selectedToken: `0x${string}` | null
    refetchUserBalance: (options: { throwOnError: boolean, cancelRefetch: boolean }) => Promise<any>
    refetchImageDatas: (options: { throwOnError: boolean, cancelRefetch: boolean }) => Promise<any>
}

const BuyButton = ({ imageData: { imageAddress, imagePrice, imageNextId, imageMaxSupply, imageTitle }, selectedToken, refetchUserBalance, refetchImageDatas }: Props) => {

    const [tokenAmount, setTokenAmount] = useState<number>(0)
    const [allowed, setAllowed] = useState<number>(0)
    const { isConnected, address } = useAccount()
    const { toast } = useToast()
    const { chain: currentChain } = useNetwork()


    const getPrice = async () => {
        const data = await getPriceFromToken(selectedToken as `0x${string}`, imagePrice)
        console.log(data)
        setTokenAmount(data.tokenAmount)
    }

    const getAllowance = async () => {
        const data = await getAllowanceFromUser(selectedToken as `0x${string}`, address as `0x${string}`)
        console.log(data)
        setAllowed(data.allowance)
    }

    const { config: approveConfig } = usePrepareContractWrite({
        address: selectedToken as `0x${string}`,
        abi: erc20ABI,
        functionName: 'approve',
        args: [IMAGE_MANAGER_ADDRESS, BigInt(tokenAmount)],
        chainId: chain.id
    })


    const { data: approveData, isLoading: approveIsLoading, write: approveWrite } = useContractWrite({
        ...approveConfig,
        onSuccess(data) {
            console.log(data)
        },
    })

    const { data: txReceiptApprove, isLoading: txReceiptIsLoadingApprove, refetch: txReceiptRefetchApprove } = useWaitForTransaction({
        hash: approveData?.hash,
        chainId: chain.id,
        onSuccess: () => {
            getAllowance()
        }
    }) as { data: any, isLoading: boolean, refetch: (options: { throwOnError: boolean, cancelRefetch: boolean }) => Promise<any> }


    // const { config: buyConfig, isError: isContractBuyError } = usePrepareContractWrite({
    //     address: IMAGE_MANAGER_ADDRESS,
    //     abi: ImageManagerABI,
    //     functionName: 'mint',
    //     args: [imageAddress, address, selectedToken]
    // })

    const { data: buyData, isLoading: buyIsLoading, write: buyWrite } = useContractWrite({
        address: IMAGE_MANAGER_ADDRESS,
        abi: ImageManagerABI,
        functionName: 'mint',
        args: [imageAddress, address, selectedToken],
        chainId: chain.id,
        onSuccess(data) {
            console.log(data)
        }
    })

    const { data: txReceiptBuy, isLoading: txReceiptIsLoadingBuy, refetch: txReceiptRefetchBuy } = useWaitForTransaction({
        hash: buyData?.hash,
        chainId: chain.id,
        onSuccess: () => {
            getAllowance()
            toast({
                title: `Successfully buy ${imageTitle.slice(0, 20)}...`,
                description: "Retrieve your NFT in your profile",
            })
            refetchUserBalance({ throwOnError: false, cancelRefetch: false })
            refetchImageDatas({ throwOnError: false, cancelRefetch: false })
            var audio = new Audio('/audio/success.mp3');
            audio.volume = 0.2;
            audio.play();
        }
    }) as { data: any, isLoading: boolean, refetch: (options: { throwOnError: boolean, cancelRefetch: boolean }) => Promise<any> }


    useEffect(() => {
        if (selectedToken) {
            getPrice()
            getAllowance()
        }
        if (approveData?.hash) {
            txReceiptRefetchApprove({ throwOnError: true, cancelRefetch: true })
        }
        if (buyData?.hash) {
            txReceiptRefetchBuy({ throwOnError: true, cancelRefetch: true })
        }
    }, [selectedToken, approveData, buyData])



    function toFixedIfNecessary(value: string, dp: number) {
        return +parseFloat(value).toFixed(dp);
    }

    const handleBuy = () => {
        if (allowed < tokenAmount) {
            console.log(`Approving ${IMAGE_MANAGER_ADDRESS} for ${tokenAmount} ${selectedToken}`)
            approveWrite?.()
        } else {
            console.log(`Buying ${imageAddress} with ${tokenAmount} ${selectedToken}`)
            buyWrite?.()
        }
    }

    const buttonDisplay = () => {
        if (!isConnected) return "Connect"
        if (currentChain?.id !== chain.id) return "Wrong Network"
        if (imageNextId >= imageMaxSupply) return "Sold Out"
        if (approveIsLoading || buyIsLoading) return "Loading..."
        if (txReceiptIsLoadingApprove || txReceiptIsLoadingBuy) return "Loading..."
        if (selectedToken === null) return "Select Token"
        if (allowed < tokenAmount) return "Approve"
        // if (allowed >= tokenAmount && isContractBuyError) return "Error"
        return "Buy " + toFixedIfNecessary(formatEther(BigInt(tokenAmount)), 5)
    }

    const isDisabled = () => {
        if (!isConnected) return true
        if (selectedToken === null) return true
        if (approveIsLoading || buyIsLoading) return true
        if (imageNextId >= imageMaxSupply) return true
        if (currentChain?.id !== chain.id) return true
        if (txReceiptIsLoadingApprove || txReceiptIsLoadingBuy) return true
        return false
    }

    return (
        <div className='flex flex-row gap-4 items-center'>
            <Button disabled={isDisabled()} size={"lg"} onClick={() => handleBuy()}>{buttonDisplay()}</Button>
        </div>
    )
}

export default BuyButton