import React, { useEffect, useState } from 'react'
import { useAccount, useContractReads } from 'wagmi'
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"
import { chain } from '@/utils/chains'
import { getCertificatesByUser, getImagesByUser } from './getNFTsByUser'
import OwnedCard from './OwnedCard'
import { Button } from '@/components/ui/button'
import { Switch } from "@/components/ui/switch"
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'


const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`

interface Props {
    imageAddresses: `0x${string}`[]
}

const Collection = ({ imageAddresses }: Props) => {

    const [imageIsLoading, setImageIsLoading] = useState(true)
    const [certificateIsLoading, setCertificateIsLoading] = useState(true)
    const [imagesList, setImagesList] = useState<{ [key: `0x${string}`]: number[] }>({})
    const [certificatesList, setCertificatesList] = useState<{ [key: `0x${string}`]: number[] }>({})
    const [display, setDisplay] = useState<'NFTs' | 'Certificates'>('NFTs')
    const { address, isConnected } = useAccount()

    const getImagesIdByUser = async () => {
        const data = await getImagesByUser(imageAddresses, address as `0x${string}`)
        console.log(data)
        setImagesList(data)
        setImageIsLoading(false)
    }

    const getCertificatesIdByUser = async () => {
        const data = await getCertificatesByUser(imageAddresses, address as `0x${string}`)
        console.log(data)
        setCertificatesList(data)
        setCertificateIsLoading(false)
    }

    const handleChangeDisplay = () => {
        if (display == 'NFTs') {
            setDisplay('Certificates')
        } else {
            setDisplay('NFTs')
        }
    }

    useEffect(() => {
        if (isConnected) {
            getImagesIdByUser()
            getCertificatesIdByUser()
        }
    }, [imageAddresses, address])

    return (
        <div>
            {(imageIsLoading || certificateIsLoading) && <p>Loading...</p>}
            {!imageIsLoading && !certificateIsLoading && (
                <div className='flex items-center justify-center p-2 mb-4'>
                    <div className='flex items-center justify-start w-36'>
                        <Switch onCheckedChange={handleChangeDisplay} className='data-[state=checked]:bg-input' />
                        <Label className='ml-2'>{display}</Label>
                    </div>
                </div>
            )}
            <div className='flex w-full items-center justify-center'>
                <Separator className='w-1/3 bg-slate-300'/>
            </div>
            <div className='flex items-center justify-center p-2'>
                {/* TODO: */}
                Locked NFT
            </div>
            <div className='flex w-full items-center justify-center mb-4'>
                <Separator className='w-1/2 bg-slate-300'/>
            </div>
            {!imageIsLoading && !certificateIsLoading && display == "NFTs" && Object.keys(imagesList).length > 0 && (
                <ul className='flex flex-wrap gap-8 items-center justify-center px-8'>
                    {Object.keys(imagesList).map((imageAddress, index) => {
                        let liElements = []
                        for (let i = 0; i < imagesList[imageAddress as `0x${string}`].length; i++) {
                            liElements.push(
                                <li key={index}>
                                    <OwnedCard imageAddress={imageAddress as `0x${string}`} imageId={imagesList[imageAddress as `0x${string}`][i]} locker={true} refreshImages={getImagesIdByUser}/>
                                </li>
                            )
                        }
                        return liElements
                    })}
                </ul>
            )}
            {!imageIsLoading && !certificateIsLoading && display == "NFTs" && Object.keys(imagesList).length == 0 && (
                <p className='flex items-center justify-center text-xl p-10'>{"You don't own any NFTs yet"}</p>
            )}
            {!imageIsLoading && !certificateIsLoading && display == "Certificates" && Object.keys(certificatesList).length > 0 && (
                <ul className='flex flex-wrap gap-8 items-center justify-center px-8'>
                    {Object.keys(certificatesList).map((certificateAddress, index) => {
                        let liElements = []
                        for (let i = 0; i < certificatesList[certificateAddress as `0x${string}`].length; i++) {
                            liElements.push(
                                <li key={index}>
                                    <OwnedCard imageAddress={certificateAddress as `0x${string}`} imageId={certificatesList[certificateAddress as `0x${string}`][i]} />
                                </li>
                            )
                        }
                        return liElements
                    })}
                </ul>
            )}
            {!imageIsLoading && !certificateIsLoading && display == "Certificates" && Object.keys(certificatesList).length == 0 && (
                <p className='flex items-center justify-center text-xl p-10'>{"You don't own any Certificates yet"}</p>
            )}
        </div>
    )
}

export default Collection