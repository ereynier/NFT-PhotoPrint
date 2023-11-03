"use client"
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from './Components/Navbar'
import Footer from './Components/Footer'
import { WagmiConfig } from 'wagmi'
import config from '@/utils/wagmiConfig'

const inter = Inter({ subsets: ['latin'] })


export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={`${inter.className}`}>
                <WagmiConfig config={config}>
                    <Navbar />
                    {children}
                    <Footer />
                </WagmiConfig>
            </body>
        </html>
    )
}
