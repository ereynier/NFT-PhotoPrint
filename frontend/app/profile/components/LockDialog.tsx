import React, { useEffect } from 'react'
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"
import ImageABI from "@/utils/abi/Image.abi.json"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button'
import { useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi'
import { chain } from '@/utils/chains'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`

interface ImageData {
    imageAddress: `0x${string}`
    imageSrc: string
    imageId: number
    imageMaxSupply: number
    imageTitle: string
    imageNextId: number
    imagePrice: number
}

interface Props {
    imageData: ImageData
    refreshImages?: () => void
}

const LockDialog = ({ imageData: { imageAddress, imageId }, refreshImages }: Props) => {

    const [open, setOpen] = React.useState(false)
    const [allowed, setAllowed] = React.useState<boolean>(false)
    const [printerAddress, setPrinterAddress] = React.useState<`0x${string}` | null>(null)

    // GET PRINTER ADDRESS
    const { data: printerAddressData, status: printerAddressStatus } = useContractRead({
        address: CONTRACT_ADDRESS,
        abi: ImageManagerABI,
        functionName: 'getPrinterAddress',
        chainId: chain.id
    }) as { data: any, status: 'idle' | 'error' | 'loading' | 'success' }


    // GET APPROVED FOR NFT
    const { data: approvedData, status: approvedStatus, refetch: refetchApproved } = useContractRead({
        address: imageAddress,
        abi: ImageABI,
        functionName: 'getApproved',
        args: [imageId],
        chainId: chain.id
    }) as { data: any, status: 'idle' | 'error' | 'loading' | 'success', refetch: (options: { throwOnError: boolean, cancelRefetch: boolean }) => Promise<any> }


    // APPROVE PRINTER ADDRESS
    const { config: approveConfig } = usePrepareContractWrite({
        address: imageAddress as `0x${string}`,
        abi: ImageABI,
        functionName: 'approve',
        args: [printerAddress, imageId],
        chainId: chain.id
    })

    const { isLoading: approveIsLoading, write: approveWrite } = useContractWrite({
        ...approveConfig,
        onSuccess(data) {
            console.log(data)
            refetchApproved({ throwOnError: true, cancelRefetch: true })
        },
    })


    // LOCK IMAGE
    const { isLoading: lockIsLoading, write: lockWrite } = useContractWrite({
        address: CONTRACT_ADDRESS,
        abi: ImageManagerABI,
        functionName: 'lockImage',
        args: [imageAddress, imageId],
        chainId: chain.id,
        onSuccess(data) {
            console.log(data)
            if (refreshImages) {
                refreshImages()
            }
            setOpen(false)
        },
    })

    const handleLock = () => {
        if (!allowed) {
            approveWrite?.()
        } else {
            lockWrite()
        }
    }

    useEffect(() => {
        if (printerAddressData && !printerAddress) {
            setPrinterAddress(printerAddressData)
            console.log("Printer address: " + printerAddressData)
        }
        if (approvedData && printerAddress) {
            setAllowed(approvedData == printerAddress)
            console.log(approvedData)
        }
    }, [approvedData, printerAddressData, printerAddress])

    const continueDisplay = () => {
        if (approvedStatus == "success" && printerAddressStatus == "success") {
            if (allowed) {
                return "Lock"
            } else {
                return "Approve"
            }
        } else if (approvedStatus == "error" || printerAddressStatus == "error") {
            return "Error"
        } else {
            return "Loading..."
        }
    }

    return (
        <AlertDialog open={open}>
            <AlertDialogTrigger asChild onClick={() => setOpen(true)}>
                <Button className='w-full mx-4 rounded-t-none'>Lock to Print</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        {`You can only lock one NFT at a time.`}
                        <br />
                        {`Once locked, you can request a physical copy of the NFT and an NFT certificate. The original NFT will be burnt.`}
                        <br />
                        {`If you haven't requested a printout within ${7} days, the NFT will be unlocked.`}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setOpen(false)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction disabled={approvedStatus != "success" || printerAddressStatus != "success" || lockIsLoading || approveIsLoading} onClick={handleLock}>{continueDisplay()}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default LockDialog