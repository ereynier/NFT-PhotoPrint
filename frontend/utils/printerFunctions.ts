const CREATIVEHUB_API_KEY = process.env.CREATIVEHUB_API_KEY
const CREATIVEHUB_BASEURL = process.env.CREATIVEHUB_BASEURL
const MAX_INT32 = 2147483647

interface IAddress {
    firstName: string;
    lastName: string;
    email: string;
    addressLine1: string;
    addressLine2: string;
    town: string;
    county: string;
    postCode: string;
    countryId: number;
    countryCode: string;
    countryName: string;
    phoneNumber: string;
}

interface IProduct {
    productId: number;
    printOptionId: number;
}

export const listProducts = async () => {
    fetch(`${CREATIVEHUB_BASEURL}/api/v1/products/query`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'Authorization': `ApiKey ${CREATIVEHUB_API_KEY}`
        },
        body: JSON.stringify({
            "Page": 1,
            "PageSize": 10,
            "Filter": {},
            "Sorts": [
                {
                    "Member": "Id",
                    "SortDirection": "Ascending"
                }
            ]
        })
    })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(err => console.error(err))
}

export const ordersList = async (filter={}, sorts=[{"Member": "Id", "SortDirection": "Ascending"}], page: number = 1, pageSize: number = 10) => {
    fetch(`${CREATIVEHUB_BASEURL}/api/v1/orders/query`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'Authorization': `ApiKey ${CREATIVEHUB_API_KEY}`
        },
        body: JSON.stringify({
            "Page": page,
            "PageSize": pageSize,
            "Filter": filter, //{"Member": "OrderState", "PredicateOperator": "IsNotEqualTo", "Value": 14},
            "Sorts": sorts //[{"Member": "Id", "SortDirection": "Ascending"}]
        })
    })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(err => console.error(err))
}

export const buyProduct = async ({ firstName, lastName, email, addressLine1, addressLine2, town, county, postCode, countryId, countryCode, countryName, phoneNumber }: IAddress, { productId, printOptionId }: IProduct) => {
    const data = await fetch(`${CREATIVEHUB_BASEURL}/api/v1/orders/embryonic`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'Authorization': `ApiKey ${CREATIVEHUB_API_KEY}`
        },
        body: JSON.stringify({
            "Id": Math.floor(Math.random() * MAX_INT32),
            "ExternalReference": "string",
            "FirstName": firstName,
            "LastName": lastName,
            "Email": email,
            "MessageToLab": "",
            "ShippingAddress": {
                "FirstName": firstName,
                "LastName": lastName,
                "Line1": addressLine1,
                "Line2": addressLine2,
                "Town": town,
                "County": county,
                "PostCode": postCode,
                "CountryId": countryId,
                "CountryCode": countryCode,
                "CountryName": countryName,
                "PhoneNumber": phoneNumber
            },
            "OrderItems": [
                {
                    "Id": 1,
                    "ProductId": productId,
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
        .catch(err => console.error(err))
    console.log(data);
    return data;
}

export const confirmOrder = async (orderId: number, deliveryOptionId: number) => {
    fetch(`${CREATIVEHUB_BASEURL}/api/v1/orders/confirmed`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'Authorization': `ApiKey ${CREATIVEHUB_API_KEY}`
        },
        body: JSON.stringify({
            "OrderId": orderId,
            "DeliveryOptionId": deliveryOptionId,
            "DeliveryChargeExcludingSalesTax": 0,
            "DeliveryChargeSalesTax": 0,
            "ExternalReference": ""
        })
    })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(err => console.error(err))
}

export const cancelOrder = async (orderId: number) => {
    fetch(`${CREATIVEHUB_BASEURL}/api/v1/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
            'accept': 'application/json',
            'Authorization': `ApiKey ${CREATIVEHUB_API_KEY}`
        }
    })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(err => console.error(err))
}