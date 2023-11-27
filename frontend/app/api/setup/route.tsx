import { NextResponse } from "next/server";
import { publicClient } from "@utils/client";
import countries from "@utils/getCountries"
import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"
import PrinterABI from "@/utils/abi/Printer.abi.json"
import { hexToString, keccak256, stringToHex, toHex, zeroAddress } from "viem";
import CryptoJS from "crypto-js";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`
const CREATIVEHUB_BASEURL = process.env.CREATIVEHUB_BASEURL
const CREATIVEHUB_API_KEY = process.env.CREATIVEHUB_API_KEY
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || "secret"

interface LockedData {
    imageAddress: `0x${string}`,
    imageId: number,
    printed: boolean,
    timestampLock: number,
    cryptedOrderId: string,
    owner: `0x${string}`
}

enum OrderState {
    ProcessingPayment,
    NewOrder,
    ImageFileReceived,
    Printed,
    InFraming,
    InMounting,
    ToBeRedone,
    MountingStarted,
    FramingComplete,
    FramingStarted,
    MountingComplete,
    Dispatched,
    ReadyForCollection,
    Collected,
    Cancelled,
    ForReturn,
    ReturnReceived,
    RefundInitiated,
    PaymentFailed,
    Packed,
    Delivered,
    ShippingFailed,
    OnHold,
    Dispatch,
    ASFFraming,
    DispatchQC,
    CardRequired,
    OrderFailed,
    DuplicateOrder,
    EmbryonicOrder,
    SuspendedOrder,
    NotSet
}

export async function POST(req: Request): Promise<NextResponse> {

    if (ENCRYPTION_SECRET == "secret") {
        return NextResponse.json({ success: false, status: 500, error: "Internal server error" }, { status: 500 });
    }

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

    if (lockedData.cryptedOrderId != "") {
        return NextResponse.json({ success: false, status: 400, error: "NFT already ordered" }, { status: 400 });
    }

    console.log(lockedData)
    const message = `${lockedData.imageAddress}${lockedData.imageId}`

    const recoveredAddress = await publicClient.verifyMessage({
        address: address as `0x${string}`,
        message: message,
        signature: signedMessage as `0x${string}`,
    })

    if (!recoveredAddress) {
        return NextResponse.json({ success: false, status: 400, error: "Invalid signature" }, { status: 400 });
    }



    // // verifier si commande existante
    // const orders = await fetch(`${CREATIVEHUB_BASEURL}/api/v1/orders/query`, {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'accept': 'application/json',
    //         'Authorization': `ApiKey ${CREATIVEHUB_API_KEY}`
    //     },
    //     body: JSON.stringify({
    //         "Page": 1,
    //         "PageSize": 10,
    //         "Filter": {
    //             "LogicalOperator": "And",
    //             "FilterDescriptors": [
    //                 {
    //                     "Member": "Externalreference",
    //                     "PredicateOperator": "IsEqualTo",
    //                     "Value": "string" // hashImageAddress + imageId + userAddress
    //                 },
    //                 {
    //                     "Member": "OrderState",
    //                     "PredicateOperator": "IsNotEqualTo",
    //                     "Value": OrderState.Cancelled
    //                 }
    //             ]
    //         },
    //         "Sorts": [
    //             {
    //                 "Member": "Id",
    //                 "SortDirection": "Ascending"
    //             }
    //         ]
    //     })
    // })
    //     .then(response => response.json())
    //     .then(data => data)
    //     .catch(err => {console.error(err)) as { Data: any[], Total: number } // handle error

    // console.log(orders)
    // // si commande existante embroynic, cancel commande existante
    // for (const order of orders["Data"]) {
    //     if (order["OrderState"] == "EmbryonicOrder") {
    //         const deleted = await fetch(`${CREATIVEHUB_BASEURL}/api/v1/orders/${order["Id"]}`, {
    //             method: 'DELETE',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'accept': 'application/json',
    //                 'Authorization': `ApiKey ${CREATIVEHUB_API_KEY}`
    //             }
    //         }).catch(err => console.error(err)) // handle error
    //     }
    // }


    //get productId
    const productId = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ImageManagerABI,
        functionName: 'getPrintId',
        args: [lockedData.imageAddress],
    })

    //get printOptionId
    const printOptionId = await fetch(`${CREATIVEHUB_BASEURL}/api/v1/products/${productId}`, { // test 35846
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'Authorization': `ApiKey ${CREATIVEHUB_API_KEY}`
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data["PrintOptions"] != undefined && data["PrintOptions"].length > 0) {
                return data["PrintOptions"][0]["Id"]
            } else {
                console.error("PrintOptions array is empty or undefined")
                return NextResponse.json({ success: false, status: 500, error: "Internal server error" }, { status: 500 });
            }
        })
        .catch(err => {
            console.error(err)
            return NextResponse.json({ success: false, status: 500, error: "Internal server error" }, { status: 500 });
        })

    if (typeof printOptionId != "number") {
        console.error("printOptionId is not a number")
        return NextResponse.json({ success: false, status: 500, error: "Internal server error" }, { status: 500 });
    }


    // get country datas
    const countriesFromApi = await fetch(`${CREATIVEHUB_BASEURL}/api/v1/countries/query`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'Authorization': `ApiKey ${CREATIVEHUB_API_KEY}`
        },
        body: JSON.stringify({
            "Page": 1,
            "PageSize": 350,
            "Filter": {},
            "Sorts": [
                {
                    "Member": "Name",
                    "SortDirection": "Ascending"
                }
            ]
        })
    })
        .then(response => response.json())
        .then(data => data["Data"])
        .catch(err => {
            console.error(err)
            return NextResponse.json({ success: false, status: 500, error: "Internal server error" }, { status: 500 });
        }) as { Id: string, Name: string, Code: string }[]


    let countryData;
    try {
        countryData = countriesFromApi.find(countryObj => countryObj["Name"].toLowerCase() === country)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ success: false, status: 500, error: "Internal server error" }, { status: 500 });
    }
    if (countryData == undefined) {
        return NextResponse.json({ success: false, status: 400, error: "Country not existing" }, { status: 400 });
    }

    // externalReference = hash ImageAddress + imageId + userAddress
    const externalReference = keccak256(toHex(`${lockedData.imageAddress}${Number(lockedData.imageId)}${address}`))



    console.log(externalReference)
    console.log(firstname)
    console.log(lastname)
    console.log(email)
    console.log(addressLine1)
    console.log(addressLine2)
    console.log(town)
    console.log(county)
    console.log(postcode)
    console.log(countryData)
    console.log(phone)
    console.log(productId)
    console.log(printOptionId)


    // creer commande
    const embryonic = await fetch(`${CREATIVEHUB_BASEURL}/api/v1/orders/embryonic`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'Authorization': `ApiKey ${CREATIVEHUB_API_KEY}`
        },
        body: JSON.stringify({
            "Id": 0,
            "ExternalReference": externalReference,
            "FirstName": firstname,
            "LastName": lastname,
            "Email": email,
            "MessageToLab": "",
            "ShippingAddress": {
                "FirstName": firstname,
                "LastName": lastname,
                "Line1": addressLine1,
                "Line2": addressLine2,
                "Town": town,
                "County": county,
                "PostCode": postcode,
                "CountryId": countryData.Id,
                "CountryCode": countryData.Code,
                "CountryName": countryData.Name,
                "PhoneNumber": phone
            },
            "OrderItems": [
                {
                    "Id": 1,
                    "ProductId": Number(productId), //test 35846
                    "PrintOptionId": printOptionId,
                    "Quantity": 1,
                    "ExternalReference": "",
                    "ExternalSku": ""
                }
            ]
        })
    })
        .then(response => response.json())
        .then(data => data)
        .catch(err => {
            console.error(err)
            return NextResponse.json({ success: false, status: 500, error: "Internal server error" }, { status: 500 });
        })
    console.log(embryonic);

    if (embryonic == undefined || embryonic["Id"] == undefined) {
        return NextResponse.json({ success: false, status: 500, error: "Internal server error" }, { status: 500 });
    }

    const orderId = embryonic["Id"]
    let deliveryId = 0;
    let lowestPrice = 100000;
    for (const option of embryonic["DeliveryOptions"]) {
        if (option["DeliveryChargeExcludingSalesTax"] < lowestPrice) {
            lowestPrice = option["DeliveryChargeExcludingSalesTax"]
            deliveryId = option["Id"]
        }
    }

    if (deliveryId == 0) {
        console.error("deliveryId is 0")
        return NextResponse.json({ success: false, status: 500, error: "Internal server error" }, { status: 500 });
    }

    // envoyer crypted OrderId au user
    const encrypted = CryptoJS.AES.encrypt(`${orderId}:${deliveryId}`, ENCRYPTION_SECRET).toString();

    return NextResponse.json({ success: true, data: encrypted }, { status: 200 });
}