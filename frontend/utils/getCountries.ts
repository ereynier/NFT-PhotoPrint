import baseCountries from "@utils/countries.json"
// const CREATIVEHUB_BASEURL = process.env.CREATIVEHUB_BASEURL
// const CREATIVEHUB_API_KEY = process.env.CREATIVEHUB_API_KEY


const countries: { value: string, label: string }[] = []

// const countrie = await fetch(`${CREATIVEHUB_BASEURL}/api/v1/orders/embryonic`, {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json',
//         'accept': 'application/json',
//         'Authorization': `ApiKey ${CREATIVEHUB_API_KEY}`
//     },
//     body: JSON.stringify({
//         "Page": 1,
//         "PageSize": 350,
//         "Filter": {},
//         "Sorts": [
//             {
//                 "Member": "Name",
//                 "SortDirection": "Ascending"
//             }
//         ]
//     })
// })


baseCountries.forEach((country) => {
    countries.push({
        value: country.Name.toLowerCase(),
        label: country.Name,
    })
})

export default countries