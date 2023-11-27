const PrinterABI = require('./utils/abi/Printer.abi.json')
const ImageManagerABI = require('./utils/abi/ImageManager.abi.json')
import { keccak256, toHex } from 'viem';
import { publicClient, walletClient } from './utils/client' // create public client with the good chain
const CryptoJS = require('crypto-js');
require('dotenv').config({ path: __dirname + '/../.env' });

const IMAGE_MANAGER_ADDRESS = process.env.IMAGE_MANAGER_ADDRESS
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET
const CREATIVEHUB_BASEURL = process.env.CREATIVEHUB_BASEURL
const CREATIVEHUB_API_KEY = process.env.CREATIVEHUB_API_KEY

interface ConfrimationArgs {
    user: `0x${string}`
    cryptedOrderId: string
    imageAddress: `0x${string}`
    imageId: number
}

interface ImageLocked {
    imageAddress: `0x${string}`,
    imageId: number,
    printed: boolean,
    timestampLock: number,
    cryptedOrderId: string,
    owner: `0x${string}`,
}

function checkEnv() {
    if (!IMAGE_MANAGER_ADDRESS) {
        throw new Error('IMAGE_MANAGER_ADDRESS is not defined')
    }
    if (!ENCRYPTION_SECRET) {
        throw new Error('ENCRYPTION_SECRET is not defined')
    }
    if (!CREATIVEHUB_BASEURL) {
        throw new Error('CREATIVEHUB_BASEURL is not defined')
    }
    if (!CREATIVEHUB_API_KEY) {
        throw new Error('CREATIVEHUB_API_KEY is not defined')
    }
}

async function cancelOrder(orderId: string) {
    console.log('cancelOrder', orderId)
    await fetch(`${CREATIVEHUB_BASEURL}/api/v1/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'Authorization': `ApiKey ${CREATIVEHUB_API_KEY}`
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log('cancelOrder', data)
        })
        .catch(err => {
            console.error(err)
        })
}

async function initiatePrint(args: ConfrimationArgs, printerAddress: `0x${string}`) {
    console.log('initiatePrint', args)
    // check that the NFT is not "printed" (otherwise cancel the order)
    const imageLockedData = await publicClient.readContract({
        address: printerAddress as `0x${string}`,
        abi: PrinterABI as any,
        functionName: 'getImageLockedByUser',
        args: [args.user],
    }) as any[]

    const imageLocked: ImageLocked = {
        imageAddress: imageLockedData[0],
        imageId: Number(imageLockedData[1]),
        printed: imageLockedData[2],
        timestampLock: Number(imageLockedData[3]),
        cryptedOrderId: imageLockedData[4],
        owner: imageLockedData[5],
    }

    if (imageLocked.imageAddress !== args.imageAddress) {
        console.error('imageLocked address not matching args', imageLocked, args)
        return
    }
    if (imageLocked.imageId !== Number(args.imageId)) {
        console.error('imageLocked Id not matching args', imageLocked, args)
        return
    }
    if (imageLocked.cryptedOrderId !== args.cryptedOrderId) {
        console.error('imageLocked cryptedOrderId not matching args', imageLocked, args)
        return
    }
    if (imageLocked.owner !== args.user) {
        console.error('imageLocked owner not matching args', imageLocked, args)
        return
    }
    if (imageLocked.printed) {
        console.error('imageLocked already printed', imageLocked)
        try {
            await cancelOrder(args.cryptedOrderId.split(':')[0])
        } catch (e) {
            console.error(e)
        }
        return
    }

    // checks that the order is in "embryonic" mode
    const decrypted = CryptoJS.AES.decrypt(args.cryptedOrderId, ENCRYPTION_SECRET).toString(CryptoJS.enc.Utf8);
    const orderId = decrypted.split(':')[0]
    const shippingId = decrypted.split(':')[1]

    const order = await fetch(`${CREATIVEHUB_BASEURL}/api/v1/orders/${orderId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'Authorization': `ApiKey ${CREATIVEHUB_API_KEY}`
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log('order', data)
            return data as any
        })
        .catch(err => {
            console.error(err)
            return
        })

    if (!order) {
        console.error('order not found', orderId)
        return
    }
    if (String(order['Id']) !== String(orderId)) {
        console.error('order Id not matching', order, orderId)
        return
    }
    if (order['OrderState'] !== 'EmbryonicOrder') {
        console.error('order not in embryonic state', order)
        return
    }
    // externalReference = hash ImageAddress + imageId + userAddress
    const externalReference = keccak256(toHex(`${imageLocked.imageAddress}${Number(imageLocked.imageId)}${args.user}`))
    if (order["ExternalReference"] != externalReference) {
        console.error('order not matching', order, orderId)
        return
    }


    // sets the NFT to "printed" in the printer
    const printedHash = await walletClient.writeContract({
        address: printerAddress as `0x${string}`,
        abi: PrinterABI as any,
        functionName: 'setPrinted',
        args: [args.user]
    })

    // wait until it's done (5 blocks) before confirming the order
    const transaction = await publicClient.waitForTransactionReceipt(
        {
            confirmations: 5,
            hash: printedHash,
            pollingInterval: 15_000,
            timeout: 2 * 60 * 60 * 1_000,
        }
    )
    if (!transaction || transaction.status == 'reverted') {
        console.error('transaction failed', transaction, args)
        return
    } else {
        const confirmation = await fetch(`${CREATIVEHUB_BASEURL}/api/v1/orders/confirmed`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'Authorization': `ApiKey ${CREATIVEHUB_API_KEY}`
            },
            body: JSON.stringify({
                "OrderId": orderId,
                "DeliveryOptionId": shippingId,
                "DeliveryChargeExcludingSalesTax": 0,
                "DeliveryChargeSalesTax": 0,
                "ExternalReference": externalReference,
            })
        })
            .then(response => response.json())
            .then(data => data)
            .catch(err => { console.error(err) }) as any
        if (!confirmation || !confirmation['Id']) {
            console.error('confirmation failed', confirmation)
            return
        }
    }
}

async function main() {
    checkEnv()
    console.log("script started")

    // get printer Address
    const data = await publicClient.readContract({
        address: IMAGE_MANAGER_ADDRESS as `0x${string}`,
        abi: ImageManagerABI as any,
        functionName: 'getPrinterAddress',
        args: [],
    }) as any

    const printerAddress: `0x${string}` = data
    console.log('printerAddress ', printerAddress)

    // watch for ConfirmOrder event
    const unwatch = publicClient.watchContractEvent({
        address: printerAddress as `0x${string}`,
        abi: PrinterABI,
        eventName: 'ConfirmOrder',
        onLogs: (logs: any) => {
            try {
                const args = logs[0].args
                initiatePrint(args, printerAddress)
            } catch (e) {
                console.error(e)
            }
        }
    })
}

main()