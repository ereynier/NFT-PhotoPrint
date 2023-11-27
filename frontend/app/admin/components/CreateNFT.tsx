import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'

const CreateNFT = () => {


    const [title, setTitle] = React.useState('')
    const [symbol, setSymbol] = React.useState('')
    const [supply, setSupply] = React.useState(0)
    const [price, setPrice] = React.useState(0)
    const [uri, setUri] = React.useState('')
    const [printProductId, setPrintProductId] = React.useState('')

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
        setPrintProductId(e.target.value)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log(title, symbol, supply, price, uri, printProductId)
        //TODO: price USD in wei
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
                        <Input required id="supply" type="number" onChange={(e) => handleSupplyChange(e)} placeholder="Image supply" value={supply} className="col-span-3" />
                    </div>
                    <div className="flex flex-col items-start gap-1">
                        <Label htmlFor="price" className="text-right">Price</Label>
                        <Input required id="price" type="number" onChange={(e) => handlePriceChange(e)} placeholder="Image price in USD" value={price} className="col-span-3" />
                    </div>
                    <div className="flex flex-col items-start gap-1">
                        <Label htmlFor="uri" className="text-right">URI</Label>
                        <Input required id="uri" type="text" onChange={(e) => handleUriChange(e)} placeholder="Image URI" value={uri} className="col-span-3" />
                    </div>
                    <div className="flex flex-col items-start gap-1">
                        <Label htmlFor="printProductId" className="text-right">Print product ID</Label>
                        <Input required id="printProductId" type="text" onChange={(e) => handlePrintProductIdChange(e)} placeholder="Print product ID" value={printProductId} className="col-span-3" />
                    </div>
                    <Button type='submit' className="mt-4 w-fit">Create</Button>
                </div>
            </form>
        </>
    )
}

export default CreateNFT