"use client"

import React, { useEffect, useState } from 'react'
import { useAccount, useContractReads } from "wagmi"
import Collection from './Collection'
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"
import { chain } from '@/utils/chains'
import Link from 'next/link'

const IMAGE_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`

const Profile = () => {

  const [imageAddresses, setImageAddresses] = useState<`0x${string}`[]>([])
  const [owner, setOwner] = useState<`0x${string}`>()

  const { isConnected, address } = useAccount()

  const { data, status } = useContractReads({
    contracts: [
      {
        address: IMAGE_MANAGER_ADDRESS,
        abi: ImageManagerABI as any,
        functionName: 'getImagesAddresses',
        chainId: chain.id,
        args: []
      },
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
      setImageAddresses(data[0].result)
      setOwner(data[1].result)
    }
  }, [data])

  return (
    <div className="text-foreground bg-background">
      {isConnected && owner && owner == address && (
        <div className="flex flex-col items-center justify-center">
          <Link href="/admin" className="text-md md:text-lg w-full text-center p-2">Admin page</Link>
        </div>
      )}
      <h1 className="text-2xl sm:text-3xl md:text-4xl w-full text-center p-2">Collection</h1>
      {!isConnected && (<h2 className="text-md md:text-lg w-full text-center p-2">Connect to view your collection</h2>)}
      {isConnected && status == "success" && (
        <Collection imageAddresses={imageAddresses} />
      )}
      {isConnected && status == "loading" && (
        <h2 className="text-md md:text-lg w-full text-center p-2">Loading...</h2>
      )}
      {isConnected && status == "error" && (
        <h2 className="text-md md:text-lg w-full text-center p-2">Error loading collection</h2>
      )}
    </div>
  )
}

export default Profile