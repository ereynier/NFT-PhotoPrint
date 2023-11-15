import { Metadata } from "next"
import Profile from "./components/Profile"

export const metadata: Metadata = {
  title: 'NFT Prints | Profile',
  description: 'User profile page for NFT Prints',
}

export default function Home() {
  
  return (
    <div className="text-foreground bg-background">
      <Profile />
    </div>
  )
  }
  