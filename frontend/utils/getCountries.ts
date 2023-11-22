import baseCountries from "@utils/countries.json"

const countries: {value: string, label: string}[] = []

baseCountries.forEach((country) => {
    countries.push({
        value: country.Name.toLowerCase(),
        label: country.Name,
    })
})

export default countries