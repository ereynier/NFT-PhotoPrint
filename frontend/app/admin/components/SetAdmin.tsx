import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"
import { chain } from '@/utils/chains'
import { useContractWrite } from 'wagmi'
import { isAddress } from 'viem'
import { useToast } from "@/components/ui/use-toast"


const IMAGE_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`

const SetAdmin = () => {

    const [address, setAddress] = React.useState<string>('')
    
    const { toast } = useToast()

    const {data: setAdminData, isLoading: setAdminIsLoading, write: setAdminWrite} = useContractWrite({
        address: IMAGE_MANAGER_ADDRESS,
        abi: ImageManagerABI,
        functionName: 'setAdmin',
        chainId: chain.id,
        args: [address],
        onSuccess: () => {
            toast({
                title: "Success",
                description: `New admin set as ${address}`,
            })
            var audio = new Audio('/audio/success.mp3');
            audio.volume = 0.2;
            audio.play();
            setAddress('')
        }
    })
    
        const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            setAdminWrite()
        }
    
    const isDisabled = () => {
        return address.length == 0 || setAdminIsLoading || isAddress(address) == false
    }

    const displayButton = () => {
        if (setAdminIsLoading) {
            return ("Loading...")
        } else {
            return ("Set admin")
        }
    }

    return (
        <>
            <form onSubmit={(e) => { handleSubmit(e) }} className='flex flex-col items-center justify-center p-2 w-full'>
                <div className="flex flex-col items-start gap-1 w-full md:w-1/3">
                    <Label htmlFor="title" className="text-right">New admin</Label>
                    <div className="flex flex-row items-center gap-1 w-full">
                        <Input type="text" placeholder="Address" onChange={(e) => setAddress(e.target.value)} value={address} className="col-span-3" />
                        <Button disabled={isDisabled()} type='submit' className="w-fit">{displayButton()}</Button>
                    </div>
                </div>
            </form>
        </>
    )
}

export default SetAdmin