"use client"
import React, { useEffect, useState } from 'react'
import { useContractRead } from 'wagmi'
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"
import { chain } from '@/utils/chains'
import BuyCard from './BuyCard'


const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`

enum ReadState {
  loading,
  error,
  success
}

const Gallery = () => {

  const [readState, setReadState] = useState<ReadState>(ReadState.loading)
  const [imageAddresses, setImageAddresses] = useState<`0x${string}`[]>([])

  const { data, isError, isLoading } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: ImageManagerABI,
    functionName: 'getImagesAddresses',
    chainId: chain.id,
    args: []
  }) as { data: `0x${string}`[], isError: boolean, isLoading: boolean }

  useEffect(() => {
    if (isError) {
      setReadState(ReadState.error)
    }
    if (isLoading) {
      setReadState(ReadState.loading)
    }
    if (data && !isError && !isLoading) {
      setReadState(ReadState.success)
      console.log(data)
      setImageAddresses([...data].reverse())
    }

  }, [data, isLoading, isError])

  return (
    <div>
      <h1 className='text-2xl sm:text-3xl md:text-4xl w-full text-center p-2'>Gallery</h1>
      {readState === ReadState.loading && (
        <p>Loading...</p>
      )}
      {readState === ReadState.error && (
        <p>Error</p>
      )}
      {readState === ReadState.success && imageAddresses && (
        <ul className='flex flex-wrap gap-8 items-center justify-center px-8'>
          {imageAddresses.map((imageAddress) => (
            <li key={imageAddress}>
              <BuyCard imageAddress={imageAddress} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Gallery