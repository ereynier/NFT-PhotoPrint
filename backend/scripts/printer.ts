const PrinterABI = require('./utils/abi/Printer.abi.json')
const ImageManagerABI = require('./utils/abi/ImageManager.abi.json')
import { publicClient } from './utils/client' // create public client with the good chain
const CryptoJS = require('crypto-js');
require('dotenv').config({ path: __dirname+'/../.env' });

const IMAGE_MANAGER_ADDRESS = process.env.IMAGE_MANAGER_ADDRESS
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET

interface ConfrimationArgs {
    user: `0x${string}`
    cryptedOrderId: string
    imageAddress: `0x${string}`
    imageId: number
}

async function initiatePrint(args: ConfrimationArgs) {
    // vérifie que le NFT n'est pas "printed" (sinon cancel la commande)
    console.log('initiatePrint', args)
    // vérifie que la commande est en "embryonic"
    const decrypted = CryptoJS.AES.decrypt(args.cryptedOrderId, ENCRYPTION_SECRET).toString(CryptoJS.enc.Utf8);
    const orderId = decrypted.split(':')[0]
    const shippingId = decrypted.split(':')[1]

    
    // passe le NFT en "printed" dans le printer

    // attend que cela soit fait (x blocks) pour passer la commande en confirmé
}

async function main() {
    if (!IMAGE_MANAGER_ADDRESS) {
        throw new Error('IMAGE_MANAGER_ADDRESS is not defined')
    }
    if (!ENCRYPTION_SECRET) {
        throw new Error('ENCRYPTION_SECRET is not defined')
    }
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
                initiatePrint(args)
            } catch (e) {
                console.error(e)
            }
         }
    })
}

main()


// const decrypted = CryptoJS.AES.decrypt(clientEncryptedTimestamp, API_KEY).toString(CryptoJS.enc.Utf8);