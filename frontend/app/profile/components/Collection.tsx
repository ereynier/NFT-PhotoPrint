import React, { useEffect, useState } from 'react'
import { useAccount, useContractReads } from 'wagmi'
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"
import { chain } from '@/utils/chains'
import { getImagesByUser } from './getImagesByUser'
import OwnedCard from './OwnedCard'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`

interface Props {
    imageAddresses: `0x${string}`[]
}

const Collection = ({ imageAddresses }: Props) => {

    const [loading, setIsLoading] = useState(true)
    const [imagesList, setImagesList] = useState<{ [key: `0x${string}`]: number[] }>({})
    const { address, isConnected } = useAccount()

    const getImagesIdByUser = async () => {
        const data = await getImagesByUser(imageAddresses, address as `0x${string}`)
        console.log(data)
        setImagesList(data)
        setIsLoading(false)
    }

    useEffect(() => {
        if (isConnected) {
            getImagesIdByUser()
        }
    }, [imageAddresses, address])

    return (
        <div>
            {loading && <p>Loading...</p>}
            {!loading && Object.keys(imagesList).length === 0 && (
                <p className='flex items-center justify-center text-xl p-10'>{"You don't own any NFTs yet"}</p>
            )}
            {!loading && Object.keys(imagesList).length > 0 && (
                <ul className='flex flex-wrap gap-8 items-center justify-center px-8'>
                    {Object.keys(imagesList).map((imageAddress, index) => {
                        for (let i = 0; i < imagesList[imageAddress as `0x${string}`].length; i++) {
                            return (
                                <li key={index}>
                                    <OwnedCard imageAddress={imageAddress as `0x${string}`} imageId={imagesList[imageAddress as `0x${string}`][i]} />
                                </li>
                            )
                        }
                    })}
                </ul>
            )}
        </div>
    )
}

export default Collection