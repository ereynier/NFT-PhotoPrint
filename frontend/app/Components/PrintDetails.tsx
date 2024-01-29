/* eslint-disable react/no-unescaped-entities */
import Image from 'next/image'
import React from 'react'

const PrintDetails = () => {
    return (
        <div>
            <section className="py-8 flex items-center flex-col sm:flex-row">
                <div className="sm:w-5/12 md:w-4/12 sm:mx-auto mx-2 text-center">
                    <h2 className="text-4xl font-bold mb-8">
                        Bringing Digital to Life: Fine Art Prints
                    </h2>
                    <p className="text-lg mb-8 text-gray-800 text-left">
                        Your journey with my NFTs doesn't end in the digital realm. Each collector has the opportunity to claim a physical manifestation of their chosen piece. The magic happens in London, where a state-of-the-art printer meticulously transforms the digital into tangible art.
                    </p>
                    <p className="text-lg mb-8 text-gray-800 text-left">
                        Our choice of "C-Type" paper ensures museum-quality prints. This archival printing process guarantees not only the longevity of your art piece but also the preservation of its vivid colors and intricate details. The synergy between digital art and traditional printing brings a new dimension to your collection.
                    </p>
                    <p className="text-lg mb-8 text-gray-800 text-left">
                        Your print, like the NFT it mirrors, is a limited edition, stamped with authenticity. The journey from pixel to print is a celebration of artistry, craftsmanship, and the harmonious blend of the digital and physical worlds.
                    </p>
                </div>
                {/* Add the image element here */}
                <Image
                    src="/image/print.jpg"  // Make sure to replace with the actual path to your image
                    alt="C-Type Paper"
                    width={1000}
                    height={500}
                    className="sm:w-1/2 w-full lg:p-16 p-2"
                />
            </section>
        </div>
    )
}

export default PrintDetails