import { Metadata } from "next"
import Gallery from "./components/Gallery"

export const metadata: Metadata = {
  title: 'NFT Prints | Galleries',
  description: 'All the galleries',
}

export default function Home() {


    return (
      <div className="text-foreground bg-background">
        <Gallery />
      </div>
    )
  }
  