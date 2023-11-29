import { Metadata } from "next"
import HomePage from "./Components/HomePage"

export const metadata: Metadata = {
  title: 'NFT Prints | Home',
  description: 'NFT Prints Home by Esteban Reynier',
}

export default function Home() {
  
  return (
    <div className="text-foreground bg-background">
      <HomePage />
    </div>
  )
}
