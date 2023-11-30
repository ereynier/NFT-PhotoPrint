/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/dgi3lqqup/**',
            },
            {
                protocol: 'https',
                hostname: '**.ipfs.nftstorage.link',
                pathname: '/**',
            }
        ],
    }
}

module.exports = nextConfig
