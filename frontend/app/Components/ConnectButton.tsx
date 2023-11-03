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


const ConnectButton = () => {

    const { address, isConnected } = useAccount()

    return (
        <div>
            {isConnected ? (
                <div className='flex flex-row gap-2'>
                    <p title={`${address}`} className={`break-all text-black font-medium text-lg cursor-default`}>{`${address?.slice(0, 5)}...${address?.slice(-4)}`}</p>
                    <button onClick={() => { navigator.clipboard.writeText(address as string); }} title='Click to copy' className='hover:bg-input rounded-md flex items-center justify-center p-1'>
                        <Image src="/copy.svg" alt="Copy" width={20} height={20} />
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