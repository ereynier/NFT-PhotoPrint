"use client"

import { useAccount } from "wagmi"

export default function Home() {
  
  const { address, isConnected } = useAccount()
  
  return (
      <div className="dark:dark text-foreground bg-background">
        {isConnected ? address : 'Not connected'}
      </div>
    )
  }
  