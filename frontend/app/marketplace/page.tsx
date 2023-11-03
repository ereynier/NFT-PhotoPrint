import { Metadata } from "next"
import Galleries from "./components/Galleries"

export const metadata: Metadata = {
  title: 'NFT Prints | Galleries',
  description: 'All the galleries',
}

export default function Home() {


    return (
      <div className="text-foreground bg-background">
        <Galleries />
      </div>
    )
  }
  