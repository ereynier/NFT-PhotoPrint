"use client"
import React from 'react'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useConnect } from 'wagmi'
import { chain } from '@/utils/chains'
import { InjectedConnector } from 'wagmi/connectors/injected'

const ConnectDialog = () => {

    const [open, setOpen] = React.useState(false)
    const buttonText = 'Connect Wallet'

    const { connect } = useConnect({
        connector: new InjectedConnector({
            chains: [chain]
        }),
        chainId: chain.id,
    })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className='bg-purple-600 hover:bg-purple-500'>
                    <p className=''>{buttonText}</p>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Connect you wallet</DialogTitle>
                </DialogHeader>

                <Button onClick={() => connect()} type="button" className="text-gray-900 bg-white bg-opacity-70 hover:bg-opacity-90 hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center mr-2 mb-2">
                    <Image src="/rabby.svg" alt="Rabby" width={60} height={60} className='mr-2' />
                    Connect Wallet
                </Button>
            </DialogContent>
        </Dialog>
    )
}

export default ConnectDialog