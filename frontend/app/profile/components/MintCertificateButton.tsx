import { Button } from '@/components/ui/button'
import React from 'react'
import { zeroAddress } from 'viem'
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"
import { chain } from '@/utils/chains'
import { useContractWrite } from 'wagmi'
import { useToast } from "@/components/ui/use-toast"

interface LockedData {
    imageAddress: `0x${string}`,
    imageId: number,
    printed: boolean,
    timestampLock: number,
    cryptedOrderId: string,
    owner: `0x${string}`
}

interface Props {
    refreshImages?: () => void
    refreshCertificates?: () => void
    refreshLockedData?: () => void
    lockedData: LockedData
}

const IMAGE_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`

const MintCertificateButton = ({ refreshImages, refreshCertificates, refreshLockedData, lockedData }: Props) => {

    const { toast } = useToast()

    const { data: mintCertificateData, isLoading: mintCertificateLoading, write: mintCertificateWrite } = useContractWrite({
        address: IMAGE_MANAGER_ADDRESS,
        abi: ImageManagerABI as any,
        functionName: 'mintCertificate',
        chainId: chain.id,
        args: [],
        onSuccess: (data) => {
            toast({
                title: "Mint successfull",
                description: "Your certificate has been minted",
            })
            var audio = new Audio('/audio/success.mp3');
            audio.volume = 0.2;
            audio.play();
            refreshLockedData && refreshLockedData();
            refreshCertificates && refreshCertificates();
            refreshImages && refreshImages();
        },
        onError: (err) => {
            console.log(err)
            // toast({
            //     title: "Mint failed",
            //     description: "An error occured, please try again",
            //     variant: "destructive"
            // })
        }

    })

    const handleMintCertificate = async () => {
        mintCertificateWrite()
    }


    return (
        <div className='flex w-full justify-start items-start'>
            <Button disabled={lockedData.imageAddress == zeroAddress || lockedData.cryptedOrderId == "" || !lockedData.printed || mintCertificateLoading} className='w-full rounded-t-none' onClick={() => handleMintCertificate()}>Mint Certificate</Button>
        </div>
    )
}

export default MintCertificateButton