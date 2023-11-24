"use client"

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from '@/components/ui/label'

import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import { useAccount, useContractWrite, useSignMessage } from 'wagmi'
import React from 'react'

import ImageManagerABI from "@/utils/abi/ImageManager.abi.json"

const BASEURL = process.env.NEXT_PUBLIC_BASEURL || "http://localhost:3000"
const IMAGE_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_IMAGE_MANAGER_ADDRESS as `0x${string}`

interface LockedData {
    imageAddress: `0x${string}`,
    imageId: number,
    printed: boolean,
    timestampLock: number,
    cryptedOrderId: string,
    owner: `0x${string}`
}

import countries from "@utils/getCountries"
import { chain } from '@/utils/chains'
import { stringToHex } from 'viem'
// const frameworks = [
//     {
//       value: "next.js",
//       label: "Next.js",
//     },
//     {
//       value: "sveltekit",
//       label: "SvelteKit",
//     },
//   ]

interface ComoboxProps {
    setExternalValue: (value: string) => void
    disabled?: boolean
}
export function Combobox({ setExternalValue, disabled }: ComoboxProps) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger disabled={disabled} asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {value
                        ? countries.find((country) => country.value === value)?.label
                        : "Select country..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search country..." />
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup className='overflow-scroll max-h-[350px]'>
                        {countries.map((country) => (
                            <CommandItem
                                key={country.value}
                                value={country.value}
                                onSelect={(currentValue) => {
                                    setValue(currentValue === value ? "" : currentValue)
                                    setExternalValue(currentValue === value ? "" : currentValue)
                                    setOpen(false)
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === country.value ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {country.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

interface PrintButtonProps {
    lockedData: LockedData
}

const PrintButton = ({ lockedData }: PrintButtonProps) => {

    const [firstname, setFirstname] = React.useState('')
    const [lastname, setLastname] = React.useState('')
    const [email, setEmail] = React.useState('')
    const [addressLine1, setAddressLine1] = React.useState('')
    const [addressLine2, setAddressLine2] = React.useState('')
    const [town, setTown] = React.useState('')
    const [county, setCounty] = React.useState('')
    const [postcode, setPostcode] = React.useState('')
    const [country, setCountry] = React.useState('')
    const [phone, setPhone] = React.useState('')

    const [embryonicIsLoading, setEmbryonicIsLoading] = React.useState(false)
    const [cryptedOrderId, setCryptedOrderId] = React.useState<string | undefined>(undefined)

    const { isConnected, address } = useAccount()

    const handleLastnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLastname(e.target.value)
    }

    const handleFirstnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFirstname(e.target.value)
    }

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value)
    }

    const handleAddressLine1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAddressLine1(e.target.value)
    }

    const handleAddressLine2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAddressLine2(e.target.value)
    }

    const handleTownChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTown(e.target.value)
    }

    const handleCountyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCounty(e.target.value)
    }

    const handlePostcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPostcode(e.target.value)
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(e.target.value)
    }

    const { data: signData, isError: signIsError, isLoading: signIsLoading, isSuccess: signIsSuccess, signMessage } = useSignMessage({
        message: `${lockedData.imageAddress}${lockedData.imageId}`,
        onSuccess: (data) => {
            sendForm(data)
        },
        onError: (err) => {
            console.log(err)
        }
    })

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        signMessage()
    }

    const sendForm = (signedMessage: `0x${string}`) => {
        console.log('submit')
        if (firstname === '' || lastname === '' || email === '' || addressLine1 === '' || town === '' || postcode === '' || country === '' || phone === '' || address === undefined || signedMessage === undefined) {
            console.log('error')
            return
        }
        if (firstname.length > 50 || lastname.length > 50 || email.length > 50 || addressLine1.length > 50 || addressLine2.length > 50 || town.length > 50 || county.length > 50 || postcode.length > 50 || country.length > 50 || phone.length > 50) {
            console.log('error')
            return
        }
        setEmbryonicIsLoading(true)
        fetch(`${BASEURL}/api/setup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstname,
                lastname,
                email,
                addressLine1,
                addressLine2,
                town,
                county,
                postcode,
                country,
                phone,
                address,
                signedMessage
            })
        })
            .then(res => {
                if (res.status === 200) {
                    return res.json(); // assuming the response is in JSON format
                } else {
                    throw new Error('Failed to fetch data');
                }
            })
            .then(data => {
                if (data.success) {
                    setCryptedOrderId(data.data)
                }
            })
            .catch(err => console.log(err))
            .finally(() => {
                setEmbryonicIsLoading(false);
            });
    }

    const buttonLoader = (text: string, isLoading: boolean) => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                </div>
            )
        } else {
            return (
                <div className="flex items-center justify-center">
                    {text}
                </div>
            )
        }
    }

    const { data: confirmOrderData, isLoading: confirmOrderLoading, write: confirmOrderWrite } = useContractWrite({
        address: IMAGE_MANAGER_ADDRESS,
        abi: ImageManagerABI as any,
        functionName: 'confirmOrder',
        chainId: chain.id,
        args: [cryptedOrderId],
        onSuccess: (data) => {
            console.log(data)
        },
        onError: (err) => {
            console.log(err)
        }

    })

    const resetFields = () => {
        setFirstname('')
        setLastname('')
        setEmail('')
        setAddressLine1('')
        setAddressLine2('')
        setTown('')
        setCounty('')
        setPostcode('')
        setCountry('')
        setPhone('')
        setCryptedOrderId(undefined)
    }

    const isDisabled = () => {
        return cryptedOrderId !== undefined || signIsLoading || embryonicIsLoading || confirmOrderLoading
    }

    return (
        <div className='flex w-full justify-start items-start'>
            <Dialog onOpenChange={(open) => { !open && resetFields() }}>
                <DialogTrigger asChild>
                    <Button className='w-full rounded-t-none rounded-r-none' onClick={() => { console.log('print') }}>Print</Button>
                </DialogTrigger>
                <DialogContent className="max-w-10/12 max-h-screen overflow-scroll">
                    <DialogHeader>
                        <DialogTitle>Shipping informations</DialogTitle>
                        <DialogDescription>
                            {`Enter your shipping informations to receive your print.`}
                            <br />
                            {`(*) Required fields`}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => handleSubmit(e)}>
                        <div className="grid grid-flow-row bg-scroll gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="firstname" className="text-right">
                                    Firstname*
                                </Label>
                                <Input disabled={isDisabled()} type='text' required id="firstname" onChange={(e) => handleFirstnameChange(e)} placeholder='Alice' value={firstname} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="lastname" className="text-right">
                                    Lastname*
                                </Label>
                                <Input disabled={isDisabled()} type="text" required id="lastname" onChange={(e) => handleLastnameChange(e)} placeholder='Jones' value={lastname} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">
                                    Email*
                                </Label>
                                <Input disabled={isDisabled()} type="email" required id="email" onChange={(e) => handleEmailChange(e)} placeholder='Alice.jones@gmail.com' value={email} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="addressLine1" className="text-right">
                                    Address line 1*
                                </Label>
                                <Input disabled={isDisabled()} type="text" required id="addressLine1" onChange={(e) => handleAddressLine1Change(e)} placeholder='1 rue de la paix' value={addressLine1} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="addressLine2" className="text-right">
                                    Address line 2
                                </Label>
                                <Input disabled={isDisabled()} type="text" id="addressLine2" onChange={(e) => handleAddressLine2Change(e)} placeholder='Apartment 1' value={addressLine2} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="town" className="text-right">
                                    Town*
                                </Label>
                                <Input disabled={isDisabled()} type="text" required id="town" onChange={(e) => handleTownChange(e)} placeholder='Paris' value={town} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="county" className="text-right">
                                    County
                                </Label>
                                <Input disabled={isDisabled()} type='text' id="county" onChange={(e) => handleCountyChange(e)} placeholder='Paris' value={county} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="postcode" className="text-right">
                                    Postcode*
                                </Label>
                                <Input disabled={isDisabled()} required type='number' id="postcode" onChange={(e) => handlePostcodeChange(e)} placeholder='75000' value={postcode} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="country" className="text-right">
                                    Country*
                                </Label>
                                <Combobox setExternalValue={setCountry} disabled={isDisabled()} />
                                <Input required onChange={() => { }} id="country" placeholder='France' value={country} className="h-0 w-0 opacity-0" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="phone" className="text-right">
                                    Phone*
                                </Label>
                                <Input disabled={isDisabled()} required type="text" id="phone" onChange={(e) => handlePhoneChange(e)} placeholder='06 12 34 56 78' value={phone} className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                            {cryptedOrderId === undefined && (
                                <Button disabled={signIsLoading || embryonicIsLoading} type="submit">{buttonLoader("Validate", signIsLoading || embryonicIsLoading)}</Button>
                            )}
                        </DialogFooter>
                    </form>
                    {cryptedOrderId !== undefined && (
                        <div className='flex flex-row w-full justify-between'>
                            <Button disabled={signIsLoading || embryonicIsLoading || confirmOrderLoading} variant={"destructive"} onClick={() => { setCryptedOrderId(undefined) }}>Cancel</Button>
                            <Button disabled={signIsLoading || embryonicIsLoading || confirmOrderLoading} onClick={() => { confirmOrderWrite() }}>Confirm</Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default PrintButton