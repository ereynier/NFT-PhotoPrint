import { chain } from "@/utils/chains";
import { readContracts } from "wagmi";
import ImageABI from "@/utils/abi/Image.abi.json"
import PrinterABI from "@/utils/abi/Printer.abi.json"
import CertificateABI from "@/utils/abi/Certificate.abi.json"
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"

const IMAGE_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`


export async function getImagesByUser(imageAddresses: `0x${string}`[], userAddress: `0x${string}`) {

    const data: { [key: `0x${string}`]: number[] } = {}

    for (const imageAddress of imageAddresses) {
        const dataBalance = await readContracts({
            contracts: [
                {
                    address: imageAddress,
                    abi: ImageABI as any,
                    functionName: 'getIdsByUser',
                    chainId: chain.id,
                    args: [userAddress]
                },
            ]
        }) as any
        if (dataBalance[0].result?.length > 0) {
            data[imageAddress] = dataBalance[0].result as unknown as number[]
        }
    }
    return data
}

export async function getCertificatesByUser(imageAddresses: `0x${string}`[], userAddress: `0x${string}`) {

    const data: { [key: `0x${string}`]: number[] } = {}

    for (const imageAddress of imageAddresses) {

        const dataCertificateAddress = await readContracts({
            contracts: [
                {
                    address: IMAGE_MANAGER_ADDRESS,
                    abi: ImageManagerABI as any,
                    functionName: 'getCertificateByImage',
                    chainId: chain.id,
                    args: [imageAddress]
                },
            ]
        }) as any

        const certificateAddress = dataCertificateAddress[0].result as `0x${string}`

        const dataBalance = await readContracts({
            contracts: [
                {
                    address: certificateAddress,
                    abi: CertificateABI as any,
                    functionName: 'getIdsByUser',
                    chainId: chain.id,
                    args: [userAddress]
                },
            ]
        }) as any
        if (dataBalance[0].result?.length > 0) {
            data[certificateAddress] = dataBalance[0].result as unknown as number[]
        }
    }
    return data
}

export async function getImageLockedByUser(userAddress: `0x${string}`, printerAddress: `0x${string}`) {
    const data = await readContracts({
        contracts: [
            {
                address: printerAddress as `0x${string}`,
                abi: PrinterABI as any,
                functionName: 'getImageLockedByUser',
                chainId: chain.id,
                args: [userAddress]
            },
        ]
    }) as any
    return data[0].result as unknown as [
        imageAddress: `0x${string}`,
        imageId: number,
        printed: boolean,
        timestampLock: number,
        cryptedOrderId: string,
        owner: `0x${string}`
    ]
}