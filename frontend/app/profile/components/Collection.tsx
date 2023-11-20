import React, { useEffect, useState } from 'react'
import { useAccount, useContractReads } from 'wagmi'
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"
import { chain } from '@/utils/chains'
import { getImagesByUser } from './getImagesByUser'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`

interface Props {
    imageAddresses: `0x${string}`[]
}

const Collection = ({ imageAddresses }: Props) => {

    const [loading, setIsLoading] = useState(true)
    const [imagesList, setImagesList] = useState<{[key: string]: number[]}>({})
    const { address, isConnected } = useAccount()

    const getImagesIdByUser = async () => {
        const data = await getImagesByUser(imageAddresses, address as `0x${string}`)
        //setImagesList(data)
        setIsLoading(false)
        console.log(data)
    }

    useEffect(() => {
        if (isConnected) {
            getImagesIdByUser()
        }
    }, [imageAddresses, address])

    return (
        <div>

        </div>
    )
}

export default Collection