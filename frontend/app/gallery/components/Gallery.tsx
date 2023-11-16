"use client"
import React, { useEffect, useState } from 'react'
import { useContractRead } from 'wagmi'
import ImageMangerABI from "@/utils/abi/ImageManager.json"
import { chain } from '@/utils/chains'
import ImageCard from '@/components/ImageCard'


const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`

enum ReadState {
  loading,
  error,
  success
}

const Gallery = () => {

  const [readState, setReadState] = useState<ReadState>(ReadState.loading)

  const { data, isError, isLoading } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: ImageMangerABI,
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
      {readState === ReadState.success && (
        <ul className='flex flex-wrap gap-8 items-center justify-center px-8'>
          {data.map((imageAddress) => (
            <li key={imageAddress}>
              <ImageCard imageAddress={imageAddress} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Gallery