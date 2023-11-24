import PrinterABI from './utils/abi/Printer.abi.json'
import ImageManagerABI from './utils/abi/ImageManager.abi.json'
import { publicClient } from './utils/client'
import dotenv from "dotenv"
dotenv.config()

const IMAGE_MANAGER_ADDRESS = process.env.IMAGE_MANAGER_ADDRESS

async function print() {
    // vérifie que le NFT n'est pas "printed" (sinon cancel la commande)

    // vérifie que la commande est en "embryonic"

    // passe le NFT en "printed" dans le printer

    // attend que cela soit fait (x blocks) pour passer la commande en confirmé
}

async function main() {
    if (!IMAGE_MANAGER_ADDRESS) {
        throw new Error('IMAGE_MANAGER_ADDRESS is not defined')
    }

    // get printer Address
    const data = await publicClient.readContract({
        address: IMAGE_MANAGER_ADDRESS as `0x${string}`,
        abi: ImageManagerABI,
        functionName: 'getPrinterAddress',
    })
    console.log(data)
    return
    // // watch for ConfirmOrder event
    // const unwatch = publicClient.watchContractEvent({
    //     address: '',
    //     abi: PrinterABI,
    //     eventName: 'ConfirmOrder',
    //     onLogs: logs => console.log(logs) // TODO: call print()
    // })
}

main()


 // const decrypted = CryptoJS.AES.decrypt(clientEncryptedTimestamp, API_KEY).toString(CryptoJS.enc.Utf8);