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
        <div>
            {isConnected && (currentChain?.id === chain.id ? (
                <div className='flex flex-row gap-2'>
                    <p title={`${address}`} className={`break-all text-black font-medium text-lg cursor-default`}>{`${address?.slice(0, 5)}...${address?.slice(-4)}`}</p>
                    <Popover open={copiedStatus} onOpenChange={() => copiedPopoverChanged()}>
                        <PopoverTrigger asChild>
                            <button onClick={() => onClickCopy()} title='Click to copy' className='hover:bg-input rounded-md flex items-center justify-center p-1'>
                                <Image src="/copy.svg" alt="Copy" width={20} height={20} />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className='w-fit p-1'>Copied</PopoverContent>
                    </Popover>
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
        </div>

    )

}

export default ConnectButton