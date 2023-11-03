"use client"
import React from 'react'
import { useContractRead } from 'wagmi'
import ImageMangerABI from "@/utils/abi/ImageManagerABI.json"
import { chain } from '@/utils/chains'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`

const Gallery = () => {

    const { data, isError, isLoading } = useContractRead({
        address: CONTRACT_ADDRESS,
        abi: ImageMangerABI,
        functionName: 'getImagesAddresses',
        chainId: chain.id,
      })

      console.log(data)

  return (
    <div>Gallery</div>
  )
}

export default Gallery