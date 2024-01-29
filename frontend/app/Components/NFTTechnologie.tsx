import Image from 'next/image'
import React from 'react'

const NFTTechnologie = () => {
    return (
        <section className="py-8 flex items-center flex-col sm:flex-row">
            <Image
                src="/image/nft.webp"  // Make sure to replace with the actual path to your image
                alt="C-Type Paper"
                width={1000}
                height={500}
                className="sm:w-1/2 w-full lg:p-16 p-2"
            />
            <div className="sm:w-5/12 md:w-4/12 sm:mx-auto mx-2 text-center">
                <h2 className="text-4xl font-bold mb-8">
                    Unleashing the Power of NFT Technology
                </h2>
                <p className="text-lg mb-8 text-gray-800 text-left">
                    At the core of this artistic revolution is NFT technology. Non-Fungible Tokens provide a secure and verifiable way to represent ownership of digital assets. Each NFT in my limited collection comes with a unique identifier, making it one-of-a-kind and eternally recorded on the blockchain, ensuring authenticity and scarcity.
                </p>
                <p className="text-lg mb-8 text-gray-800 text-left">
                    By embracing blockchain technology, I aim to redefine the relationship between the creator and the collector. Smart contracts on the Ethereum network govern the issuance and transfer of these limited NFTs, creating a transparent and trustless environment.
                </p>
                <p className="text-lg mb-8 text-gray-800 text-left">
                    Acquiring an NFT from this collection means securing not just a digital image but a piece of art with a distinct identity, a unique representation of creativity etched into the digital realm.
                </p>
            </div>
        </section>
    )
}

export default NFTTechnologie