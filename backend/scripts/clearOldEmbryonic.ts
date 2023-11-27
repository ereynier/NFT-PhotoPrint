const PrinterABI = require('./utils/abi/Printer.abi.json')
require('dotenv').config({ path: __dirname + '/../.env' });

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

const CREATIVEHUB_API_KEY = process.env.CREATIVEHUB_API_KEY
const CREATIVEHUB_BASEURL = process.env.CREATIVEHUB_BASEURL

async function clearOldEmbryonic() {
    const orders = await fetch(`${CREATIVEHUB_BASEURL}/api/v1/orders/query`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'Authorization': `ApiKey ${CREATIVEHUB_API_KEY}`
        },
        body: JSON.stringify({
            "Page": 1,
            "PageSize": 10,
            "Filter": {
                "LogicalOperator": "And",
                "FilterDescriptors": [
                    {
                        "Member": "OrderState",
                        "PredicateOperator": "IsEqualTo",
                        "Value": OrderState.EmbryonicOrder
                    }
                ]
            },
            "Sorts": [
                {
                    "Member": "DateCreated",
                    "SortDirection": "Ascending"
                }
            ]
        })
    })
        .then(response => response.json())
        .then(data => data)
        .catch(err => { console.error(err)}) as { Data: any[], Total: number } // handle error

    console.log(orders)
    // if order older than 7 days, delete it
    for (const order of orders["Data"]) {
        if (new Date(order["DateCreated"]) < new Date(Date.now() - (7 * 24 * 60 * 60 * 1000 + 60_000)) && order["OrderState"] === "EmbryonicOrder") {
            const deleted = await fetch(`${CREATIVEHUB_BASEURL}/api/v1/orders/${order["Id"]}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                    'Authorization': `ApiKey ${CREATIVEHUB_API_KEY}`
                }
            }).catch(err => console.error(err)) // handle error
        }
    }
}

function main() {
    if (!CREATIVEHUB_API_KEY) {
        throw new Error('CREATIVEHUB_API_KEY is not defined')
    }
    if (!CREATIVEHUB_BASEURL) {
        throw new Error('CREATIVEHUB_BASEURL is not defined')
    }
    // interval every day
    setInterval(clearOldEmbryonic, 24 * 60 * 60 * 1000)
}

main()