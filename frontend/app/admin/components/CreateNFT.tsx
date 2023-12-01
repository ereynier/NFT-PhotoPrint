import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useEffect } from 'react'
import { parseEther } from 'viem'
import { useContractWrite, useWaitForTransaction } from 'wagmi'
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"
import { chain } from '@/utils/chains'
import { useToast } from "@/components/ui/use-toast"


const IMAGE_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`

const CreateNFT = () => {
    const [title, setTitle] = React.useState('')
    const [symbol, setSymbol] = React.useState('')
    const [supply, setSupply] = React.useState(0)
    const [price, setPrice] = React.useState(0)
    const [uri, setUri] = React.useState('')
    const [printProductId, setPrintProductId] = React.useState(0)

    const { toast } = useToast()

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value)
    }

    const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSymbol(e.target.value)
    }

    const handleSupplyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSupply(parseInt(e.target.value))
    }

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrice(parseInt(e.target.value))
    }

    const handleUriChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUri(e.target.value)
    }

    const handlePrintProductIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrintProductId(parseInt(e.target.value))
    }

    const clearForm = () => {
        setTitle('')
        setSymbol('')
        setSupply(0)
        setPrice(0)
        setUri('')
        setPrintProductId(0)
    }

    const { data: createImageData, isLoading: createImageIsLoading, write: createImageWrite } = useContractWrite({
        address: IMAGE_MANAGER_ADDRESS,
        abi: ImageManagerABI,
        functionName: 'createImage',
        args: [title, symbol, supply, uri, price, printProductId],
        chainId: chain.id
    })

    const { data: txReceipt, isLoading: txReceiptIsLoading, refetch: txReceiptRefetch } = useWaitForTransaction({
        hash: createImageData?.hash,
        chainId: chain.id,
        onSuccess: () => {
            toast({
                title: 'Image created',
                description: 'Your image has been created',
            })
            var audio = new Audio('/audio/success.mp3');
            audio.volume = 0.2;
            audio.play();
            clearForm();
        }
    }) as { data: any, isLoading: boolean, refetch: (options: { throwOnError: boolean, cancelRefetch: boolean }) => Promise<any> }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log(title, symbol, supply, price, uri, printProductId)
        if (createImageIsLoading) return
        if (!title || !symbol || !supply || !price || !uri || !printProductId) return
        if (price < 0) return
        if (supply < 0) return
        if (printProductId < 0) return
        if (uri.search('https://') === -1) return
        createImageWrite()
    }

    useEffect(() => {
        if (createImageData?.hash) {
            txReceiptRefetch({ throwOnError: true, cancelRefetch: true })
        }
    }, [createImageData])

    const isDisabled = () => {
        return !title || !symbol || !supply || !price || !uri || !printProductId || createImageIsLoading || txReceiptIsLoading
    }

    const buttonDisplay = () => {
        if (createImageIsLoading || txReceiptIsLoading) {
            return 'Creating...'
        } else {
            return 'Create'
        }
    }

    return (
        <>
            <form onSubmit={(e) => handleSubmit(e)} className='flex flex-col items-center justify-center p-4 w-full'>
                <div className="w-full md:w-1/3 flex flex-col gap-2">
                    <div className="flex flex-col items-start gap-1">
                        <Label htmlFor="title" className="text-right">Title</Label>
                        <Input required id="title" type="text" onChange={(e) => handleTitleChange(e)} placeholder="Image title" value={title} className="col-span-3" />
                    </div>
                    <div className="flex flex-col items-start gap-1">
                        <Label htmlFor="symbol" className="text-right">Symbol</Label>
                        <Input required id="symbol" type="text" onChange={(e) => handleSymbolChange(e)} placeholder="Image symbol" value={symbol} className="col-span-3" />
                    </div>
                    <div className="flex flex-col items-start gap-1">
                        <Label htmlFor="supply" className="text-right">Supply</Label>
                        <Input required id="supply" type="number" min={0} onChange={(e) => handleSupplyChange(e)} placeholder="Image supply" value={supply} className="col-span-3" />
                    </div>
                    <div className="flex flex-col items-start gap-1">
                        <Label htmlFor="price" className="text-right">Price in USD Wei</Label>
                        <div className="flex flex-row items-center gap-1 w-full">
                            <Input required id="price" type="number" min={0} onChange={(e) => handlePriceChange(e)} placeholder="Image price in USD" value={price} className="col-span-3 w-" />
                            <Button type='button' className="w-fit" onClick={() => { setPrice(Number(parseEther(price.toString()))) }}>wei</Button>
                        </div>
                    </div>
                    <div className="flex flex-col items-start gap-1">
                        <Label htmlFor="uri" className="text-right">URI</Label>
                        <Input required id="uri" type="text" onChange={(e) => handleUriChange(e)} placeholder="Image URI" value={uri} className="col-span-3" />
                    </div>
                    <div className="flex flex-col items-start gap-1">
                        <Label htmlFor="printProductId" className="text-right">Print product ID</Label>
                        <Input required id="printProductId" type="number" min={0} onChange={(e) => handlePrintProductIdChange(e)} placeholder="Print product ID" value={printProductId} className="col-span-3" />
                    </div>
                    <Button disabled={isDisabled()} type='submit' className="mt-4 w-fit">{buttonDisplay()}</Button>
                </div>
            </form>
        </>
    )
}

export default CreateNFT