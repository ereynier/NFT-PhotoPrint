import { NextResponse } from "next/server";
import { publicClient } from "@utils/client";
import countries from "@utils/getCountries"
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"
import PrinterABI from "@/utils/abi/Printer.abi.json"
import { zeroAddress, zeroHash } from "viem";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`

interface LockedData {
    imageAddress: `0x${string}`,
    imageId: number,
    printed: boolean,
    timestampLock: number,
    cryptedOrderId: string,
    owner: `0x${string}`
}

export async function POST(req: Request): Promise<NextResponse> {

    let body;
    try {
        body = await req.json();
        console.log(body)
    } catch (error) {
        console.log(error)
        return NextResponse.json({ success: false, status: 400, error: "Invalid JSON data" }, { status: 400 });
    }
    const firstname = String(body.firstname);
    const lastname = String(body.lastname);
    const email = String(body.email);
    const addressLine1 = String(body.addressLine1);
    const addressLine2 = String(body.addressLine2);
    const town = String(body.town);
    const county = String(body.county);
    const postcode = String(body.postcode);
    const country = String(body.country);
    const phone = String(body.phone);
    const address = String(body.address);
    const signedMessage = String(body.signedMessage);

    if (firstname == "" || lastname == "" || email == "" || addressLine1 == "" || town == "" || postcode == "" || country == "" || phone == "" || address == "undefined" || signedMessage == "undefined") {
        return NextResponse.json({ success: false, status: 400, error: "A requiered field is empty" }, { status: 400 });
    }

    if (firstname.length > 50 || lastname.length > 50 || email.length > 50 || addressLine1.length > 50 || addressLine2.length > 50 || town.length > 50 || county.length > 50 || postcode.length > 50 || country.length > 50 || phone.length > 50) {
        return NextResponse.json({ success: false, status: 400, error: "A field is longer than 50 characters" }, { status: 400 });
    }

    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(address) || address == zeroAddress) {
        return NextResponse.json({ success: false, status: 400, error: "Invalid address" }, { status: 400 });
    }

    const signatureRegex = /^0x[a-fA-F0-9]{130}$/;
    if (!signatureRegex.test(signedMessage)) {
        return NextResponse.json({ success: false, status: 400, error: "Invalid signature" }, { status: 400 });
    }

    const exists = countries.some(countryObj => countryObj.value === country);
    if (!exists) {
        return NextResponse.json({ success: false, status: 400, error: "Country not existing" }, { status: 400 });
    }

    //check if NFT locked + not printed + check signature

    const printerAddress = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ImageManagerABI,
        functionName: 'getPrinterAddress',
        args: [],
    })

    if (printerAddress == null) {
        return NextResponse.json({ success: false, status: 500, error: "Internal server error" }, { status: 500 });
    }

    const lockedImageData = await publicClient.readContract({
        address: printerAddress as `0x${string}`,
        abi: PrinterABI,
        functionName: 'getImageLockedByUser',
        args: [address],
    }) as [`0x${string}`, number, boolean, number, `0x${string}`, `0x${string}`]

    if (lockedImageData == null) {
        return NextResponse.json({ success: false, status: 500, error: "Internal server error" }, { status: 500 });
    }

    const lockedData: LockedData = {
        imageAddress: lockedImageData[0],
        imageId: lockedImageData[1],
        printed: lockedImageData[2],
        timestampLock: lockedImageData[3],
        cryptedOrderId: lockedImageData[4],
        owner: lockedImageData[5]
    }

    if (lockedData.imageAddress == zeroAddress) {
        return NextResponse.json({ success: false, status: 400, error: "No NFT locked" }, { status: 400 });
    }

    if (lockedData.printed == true) {
        return NextResponse.json({ success: false, status: 400, error: "NFT already printed" }, { status: 400 });
    }

    if (lockedData.cryptedOrderId != zeroHash) {
        return NextResponse.json({ success: false, status: 400, error: "NFT already ordered" }, { status: 400 });
    }

    console.log(lockedData)
    const message = `${lockedData.imageAddress}${lockedData.imageId}`
    console.log(message)
    const recoveredAddress = await publicClient.verifyMessage({
        address: address as `0x${string}`,
        message: message,
        signature: signedMessage as `0x${string}`,
    })

    if (!recoveredAddress) {
        return NextResponse.json({ success: false, status: 400, error: "Invalid signature" }, { status: 400 });
    }

    // TODO:
    // verifier si commande existante
    // si commande existante embroynic, cancel commande existante
    // creer commande
    // envoyer crypted OrderId au user

    return NextResponse.json({ success: true, data: "datas" });
}