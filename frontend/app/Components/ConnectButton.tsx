"use client"
import { chain } from '@/utils/chains'
import Image from 'next/image'
import React from 'react'
import {
    useAccount,
    useConnect,
    useDisconnect,
    useNetwork,
} from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import ConnectDialog from './ConnectDialog'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

const ConnectButton = () => {

    const { address, isConnected } = useAccount()
    const [animation, setAnimation] = React.useState('opacity-0')
    const [copiedStatus, setCopiedStatus] = React.useState(false)
    const { chain: currentChain } = useNetwork()

    const onClickCopy = () => {
        navigator.clipboard.writeText(address as string);
    }

    const copiedPopoverChanged = () => {
        setCopiedStatus(true)
        setTimeout(() => {
            setCopiedStatus(false)
        }, 1000)
    }

    return (
        <>
            {isConnected && (currentChain?.id === chain.id ? (
                <div className='flex flex-col gap-0 items-center'>
                    <Popover open={copiedStatus} onOpenChange={() => copiedPopoverChanged()}>
                        <PopoverTrigger asChild>
                            <button onClick={() => onClickCopy()} title='Click to copy' className='hover:bg-input rounded-md flex items-center justify-center px-1'>
                                <p title={`${address}`} className={`break-all text-black font-medium text-lg cursor-pointer`}>{`${address?.slice(0, 5)}...${address?.slice(-4)}`}</p>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className='w-fit p-1'>Copied</PopoverContent>
                    </Popover>
                    {currentChain?.id === 80001 && (
                        <p className='break-words text-gray-500 text-sm cursor-default'>Testnet</p>
                    )}
                </div>
            ) : (
                <div className='flex flex-row gap-2'>
                    <p className='break-words text-black font-semibold text-lg cursor-default'>Please switch network to {chain.name}</p>
                </div>
            ))}
            {!isConnected && (
                // Dialog with a list of connectors
                <ConnectDialog />
            )}
        </>

    )

}

export default ConnectButton