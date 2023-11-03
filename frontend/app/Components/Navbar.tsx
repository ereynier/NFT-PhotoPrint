"use client"
import React from 'react'
import Link from 'next/link'
import ConnectButton from './ConnectButton'

const Navbar = () => {

    const ref = React.useRef<HTMLDivElement>(null)
    const [hidden, setHidden] = React.useState(true)


    const handleToggleMenu = () => {
        setHidden(!hidden)
    }


    return (
        <nav ref={ref} className={`w-full bg-white bg-opacity-85 border-gray-200 shadow-md top-0 z-50 navbar sticky ${/*translate*/""} transition-transform duration-300`}>
            <div className="flex flex-wrap items-center justify-between mx-4 sm:mx-20 p-2">
                <Link href="/" target='' className="flex flex-col items-start">
                    <span className={` self-start text-3xl font-semibold whitespace-nowrap `}>NFT Prints</span>
                </Link>
                <div className="flex items-center justify-center md:justify-start md:ml-4">
                    <ConnectButton />
                </div>
                <button onClick={handleToggleMenu} data-collapse-toggle="navbar-default" type="button" className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-default" aria-expanded="false">
                    <span className="sr-only">Open main menu</span>
                    <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
                </button>
                <div hidden={hidden} className="w-full md:block md:w-auto" id="navbar-default">
                    <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border rounded-lg bg-transparent md:flex-row md:space-x-8 md:mt-0 md:border-0 ">
                        <li>
                            <Link href="/" className="block py-2 pl-3 pr-4 text-black font-bold hover:text-neutral-700 rounded md:bg-transparent md:p-0" aria-current="page">Home</Link>
                        </li>
                        <li>
                            <Link href="/marketplace" className="block py-2 pl-3 pr-4 text-black font-bold hover:text-neutral-700 rounded md:bg-transparent md:p-0" aria-current="page">NFTs</Link>
                        </li>
                        <li>
                            <Link href="/profile" className="block py-2 pl-3 pr-4 text-black font-bold hover:text-neutral-700 rounded md:bg-transparent md:p-0" aria-current="page">Profile</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Navbar