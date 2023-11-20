"use client"

import React from 'react'
import { useAccount } from "wagmi"

const Profile = () => {
  const { address, isConnected } = useAccount()

  return (
    <div className="text-foreground bg-background">
      <h1 className="text-2xl sm:text-3xl md:text-4xl w-full text-center p-2">Collection</h1>
      {isConnected ? (
        address
      ) : <h2 className="text-md md:text-lg w-full text-center p-2">Connect to view your collection</h2>}
    </div>
  )
}

export default Profile