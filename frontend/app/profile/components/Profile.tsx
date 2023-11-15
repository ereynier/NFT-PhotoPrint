"use client"

import React from 'react'
import { useAccount } from "wagmi"

const Profile = () => {
    const { address, isConnected } = useAccount()
  
    return (
        <div className="dark:dark text-foreground bg-background">
          {isConnected ? address : 'Not connected'}
        </div>
      )
}

export default Profile