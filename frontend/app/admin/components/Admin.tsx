"use client"

import React, { useEffect, useState } from 'react'
import { useAccount, useContractReads } from 'wagmi'
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"
import { chain } from '@/utils/chains'
import Link from 'next/link'
import CreateNFT from './CreateNFT'
import { Separator } from '@/components/ui/separator'
import SetAdmin from './SetAdmin'


const IMAGE_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`

const Admin = () => {

    const [owner, setOwner] = useState<`0x${string}`>()

    const { isConnected, address } = useAccount()

    const { data, status } = useContractReads({
        contracts: [
            {
                address: IMAGE_MANAGER_ADDRESS,
                abi: ImageManagerABI as any,
                functionName: 'owner',
                chainId: chain.id,
                args: []
            }
        ]
    }) as { data: any, status: 'idle' | 'error' | 'loading' | 'success' }

    useEffect(() => {
        if (data) {
            setOwner(data[0].result)
        }
    }, [data])

    return (
        <div className='flex flex-col items-center justify-center'>
            {isConnected && owner && owner == address && (
                <div className="flex flex-col items-center justify-center w-full">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl w-full text-center p-2">Admin page</h1>
                    <CreateNFT />
                    <div className='flex w-full items-center justify-center my-4'>
                        <Separator className='w-1/3 bg-slate-300' />
                    </div>
                    <SetAdmin />
                </div>
            )}
            {!isConnected && (
                <h2 className="text-md md:text-lg w-full text-center p-2">Connect to view admin page</h2>
            )}
            {isConnected && owner != address && (
                <div className="flex flex-col items-center justify-center">
                    <h2 className="text-md md:text-lg w-full text-center p-2">You are not the owner of this contract</h2>
                    <Link href="/profile" className="text-md md:text-lg w-full text-center p-2">Go to profile</Link>
                </div>
            )}
        </div>
    )
}

export default Admin