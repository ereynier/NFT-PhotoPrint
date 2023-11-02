import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from './Components/Navbar'
import Footer from './Components/Footer'

const inter = Inter({ subsets: ['latin'] })

import { foundry, polygon, polygonMumbai } from 'viem/chains'
import { WagmiConfig, configureChains, createConfig } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'



const { chains, publicClient, webSocketPublicClient } = configureChains(
  [foundry, polygonMumbai, polygon],
  [publicProvider()],
)

const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
})


export const metadata: Metadata = {
  title: 'Ereynier | NFT',
  description: 'Esteabn Reynier - Photos NFTs',
}
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
