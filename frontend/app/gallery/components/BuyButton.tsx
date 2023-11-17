import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import { erc20ABI, useAccount, useContractReads, useContractWrite, usePrepareContractWrite } from 'wagmi'
import ImageABI from "@/utils/abi/Image.abi.json"
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"
import { chain } from '@/utils/chains'
import { formatEther } from 'viem'
import { getPriceFromToken } from './getPriceAndAllowance'
import { getAllowanceFromUser } from './getPriceAndAllowance'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`

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
}

const BuyButton = ({ imageData: { imageAddress, imagePrice }, selectedToken }: Props) => {

    const [tokenAmount, setTokenAmount] = useState<number>(0)
    const [allowed, setAllowed] = useState<number>(0)
    const { isConnected, address } = useAccount()

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
        args: [CONTRACT_ADDRESS, BigInt(tokenAmount)]
    })

    const { isLoading: approveIsLoading, isSuccess: approveIsSuccess, write: approveWrite } = useContractWrite({
        ...approveConfig,
        onSuccess(data) {
            console.log(data)
            getAllowance()
        }
    })

    useEffect(() => {
        // if (data) {
        //     setTokenAmount(Number(data[0].result))
        //     setAllowed(Number(data[1].result))
        //     console.log(data)
        // }
        if (selectedToken) {
            getPrice()
            getAllowance()
        }
    }, [selectedToken])



    function toFixedIfNecessary(value: string, dp: number) {
        return +parseFloat(value).toFixed(dp);
    }

    const handleBuy = () => {
        if (allowed < tokenAmount) {
            console.log(`Approving ${CONTRACT_ADDRESS} for ${tokenAmount} ${selectedToken}`)
            approveWrite?.()
            // passer le bouton en loading

        } else {
            console.log(`Buying ${imageAddress} with ${tokenAmount} ${selectedToken}`)
        }
    }

    const buttonDisplay = () => {
        if (!isConnected) return "Connect"
        if (selectedToken === null) return "Select Token"
        if (allowed < tokenAmount) return "Approve"
        return "Buy " + toFixedIfNecessary(formatEther(BigInt(tokenAmount)), 5)
    }

    return (
        <div className='flex flex-row gap-4 items-center'>
            <Button disabled={!isConnected || selectedToken == null || status == "loading" || approveIsLoading} size={"lg"} onClick={() => handleBuy()}>{buttonDisplay()}</Button>
        </div>
    )
}

export default BuyButton