"use client"

import React, { useEffect, useState } from 'react'
import { useAccount, useContractReads } from "wagmi"
import Collection from './Collection'
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"
import { chain } from '@/utils/chains'

const IMAGE_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`

const Profile = () => {

  const [imageAddresses, setImageAddresses] = useState<`0x${string}`[]>([])

  const { isConnected } = useAccount()

  const { data, status } = useContractReads({
    contracts: [
      {
        address: IMAGE_MANAGER_ADDRESS,
        abi: ImageManagerABI as any,
        functionName: 'getImagesAddresses',
        chainId: chain.id,
        args: []
      }
    ]
  }) as { data: any, status: 'idle' | 'error' | 'loading' | 'success' }

  useEffect(() => {
    if (data) {
      setImageAddresses(data[0].result)
    }
  }, [data])

  return (
    <div className="text-foreground bg-background">
      <h1 className="text-2xl sm:text-3xl md:text-4xl w-full text-center p-2">Collection</h1>
      {!isConnected && (<h2 className="text-md md:text-lg w-full text-center p-2">Connect to view your collection</h2>)}
      {isConnected && status == "success" && (
        <Collection imageAddresses={imageAddresses} />
      )}
      {isConnected && status == "loading" && (
        <h2 className="text-md md:text-lg w-full text-center p-2">Loading...</h2>
      )}
    </div>
  )
}

export default Profile