import React, { useEffect } from 'react'
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"
import PrinterABI from "@/utils/abi/Printer.abi.json"
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
import { useAccount, useContractEvent, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi'
import { chain } from '@/utils/chains'
import { getImageLockedByUser } from './getNFTsByUser'
import { zeroAddress } from 'viem'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`
const LOCKING_PERIOD = Number(process.env.NEXT_PUBLIC_LOCKING_PERIOD) / 7 / 24 / 3600 || 0

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
    const { isConnected, address } = useAccount()
    const [imageLocked, setImageLocked] = React.useState<boolean>(false)

    // GET PRINTER ADDRESS
    const { data: printerAddressData, status: printerAddressStatus } = useContractRead({
        address: CONTRACT_ADDRESS,
        abi: ImageManagerABI,
        functionName: 'getPrinterAddress',
        chainId: chain.id
    }) as { data: any, status: 'idle' | 'error' | 'loading' | 'success' }

    // GET LOCKED NFT
    const getNFTLocked = async () => {
        const data = await getImageLockedByUser(address as `0x${string}`, printerAddress as `0x${string}`)
        if (data[0] != zeroAddress) {
            setImageLocked(true)
        } else {
            setImageLocked(false)
        }
    }

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

    useContractEvent({
        address: printerAddress as `0x${string}`,
        abi: PrinterABI,
        eventName: 'ImageLocked',
        listener(log: any) {
            console.log(log[0]["args"]["user"], address)
            if (log[0]["args"]["user"] == address) {
                getNFTLocked()
            }
        },
    })

    useContractEvent({
        address: printerAddress as `0x${string}`,
        abi: PrinterABI,
        eventName: 'ImageUnlocked',
        listener(log: any) {
            if (log[0]["args"]["user"] == address) { 
                getNFTLocked()
            }
        },
    })

    useEffect(() => {
        if (printerAddressData && !printerAddress) {
            setPrinterAddress(printerAddressData)
        }
        if (approvedData && printerAddress) {
            setAllowed(approvedData == printerAddress)
        }
        if (isConnected && printerAddress) {
            getNFTLocked()
        }
    }, [approvedData, printerAddressData, printerAddress, isConnected])

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
                <Button disabled={imageLocked} className='w-full mx-4 rounded-t-none'>Lock to Print</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        {`You can only lock one NFT at a time.`}
                        <br />
                        {`Once locked, you can request a physical copy of the NFT and an NFT certificate. The original NFT will be burnt.`}
                        <br />
                        {`You can unlock the NFT if you change your mind before validating the order.`}
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