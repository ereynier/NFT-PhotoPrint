import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useEffect } from 'react'
import { isAddress } from 'viem'
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"
import { useContractWrite, useWaitForTransaction } from 'wagmi'
import { chain } from '@/utils/chains'
import { useToast } from "@/components/ui/use-toast"

const IMAGE_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`

const EditPrintId = () => {

    const [imageAddress, setImageAddress] = React.useState('')
    const [printId, setPrintId] = React.useState<number>(0)

    const { toast } = useToast()

    const { data, isLoading, write } = useContractWrite({
        address: IMAGE_MANAGER_ADDRESS,
        abi: ImageManagerABI,
        functionName: 'editPrintId',
        chainId: chain.id,
        args: [imageAddress, printId],
        onError: () => {
            toast({
                title: 'Error',
                description: 'Error',
                variant: 'destructive'
            })
        }
    })

    const { data: txReceipt, isLoading: txReceiptIsLoading, refetch: txReceiptRefetch } = useWaitForTransaction({
        hash: data?.hash,
        chainId: chain.id,
        onSuccess: () => {
            toast({
                title: "Success",
                description: `New printId set as ${printId} for ${imageAddress}`,
            })
            var audio = new Audio('/audio/success.mp3');
            audio.volume = 0.2;
            audio.play();
            setImageAddress('')
            setPrintId(0)
        },
        onError: () => {
            toast({
                title: 'Error',
                description: 'Error',
                variant: 'destructive'
            })
        }
    }) as { data: any, isLoading: boolean, refetch: (options: { throwOnError: boolean, cancelRefetch: boolean }) => Promise<any> }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        write()
    }

    const isDisabled = () => {
        if (isAddress(imageAddress) == false || printId == 0 || isLoading || txReceiptIsLoading) {
            return true
        } else {
            return false
        }
    }

    useEffect(() => {
        if (data?.hash) {
            txReceiptRefetch({ throwOnError: true, cancelRefetch: true })
        }
    }, [data])

    return (
        <>
            <form onSubmit={(e) => { handleSubmit(e) }} className='flex flex-col items-center justify-center p-2 w-full'>
                <div className="flex flex-col items-start gap-1 w-full md:w-1/3">
                    <Label htmlFor="title" className="text-right">New printId</Label>
                    <div className="flex flex-row items-center gap-1 w-full">
                        <Input type="text" placeholder="Image address" onChange={(e) => setImageAddress(e.target.value)} value={imageAddress} className="col-span-3" />
                        <Input type="number" min={0} placeholder="Print ID" onChange={(e) => setPrintId(parseInt(e.target.value))} value={printId} className="col-span-3" />
                        <Button disabled={isDisabled()} type='submit' className="w-fit">{"Edit"}</Button>
                    </div>
                </div>
            </form>
        </>
    )
}

export default EditPrintId