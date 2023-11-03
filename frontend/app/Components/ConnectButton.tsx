"use client"
import { chain } from '@/utils/chains'
import Image from 'next/image'
import React from 'react'
import {
    useAccount,
    useConnect,
    useDisconnect,
} from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import ConnectDialog from './ConnectDialog'
import { Badge } from '@/components/ui/badge'

const ConnectButton = () => {

    const { address, isConnected } = useAccount()
    const [animation, setAnimation] = React.useState('opacity-0')

    const onClickCopy = () => {
        navigator.clipboard.writeText(address as string);
        setAnimation('opacity-0 translate-y-0');
        setAnimation('opacity-100 translate-y-8 transition-all duration-1000');
        setTimeout(() => {
            setAnimation('opacity-0 translate-y-0');
        }, 1000)
    }

    return (
        <div>
            {isConnected ? (
                <div className='flex flex-row gap-2'>
                    <p title={`${address}`} className={`break-all text-black font-medium text-lg cursor-default`}>{`${address?.slice(0, 5)}...${address?.slice(-4)}`}</p>
                    <button onClick={() => onClickCopy()} title='Click to copy' className='hover:bg-input rounded-md flex items-center justify-center p-1'>
                        <Image src="/copy.svg" alt="Copy" width={20} height={20} />
                        <Badge variant={"outline"} className={`absolute ${animation}`}>Copied</Badge>
                    </button>
                </div>
            ) : (
                // Dialog with a list of connectors
                <ConnectDialog />
            )}
        </div>

    )

}

export default ConnectButton