import Link from 'next/link'
import React from 'react'

const HeroSection = () => {
    return (
        <section className="py-12">
            <div className="md:w-5/12 sm:mx-auto mx-2">
                <h1 className="text-5xl font-bold mb-4">
                    Explore the World Through My Lens
                </h1>
                <p className="text-lg mb-8 text-gray-800">
                    Immerse yourself in a world of unique and captivating photography. Each NFT tells a story, capturing moments frozen in time.
                </p>
                <p className="text-lg mb-8 text-gray-800">
                    As a collector, you not only acquire a digital masterpiece but also gain the opportunity to claim a physical print, turning the virtual into reality.
                </p>
                <div className="flex justify-center items-center">
                    <Link href={"/gallery"} className="bg-yellow-400 text-gray-800 px-6 py-3 rounded-full font-semibold hover:bg-yellow-500">
                        Explore NFTs
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default HeroSection