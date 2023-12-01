import Image from 'next/image'
import React from 'react'

interface Props {
    src: string
    alt: string
}


const ImageContainer = ({ src, alt }: Props) => {



    return (
        <div className="h-64 w-64 rounded-t-lg relative overflow-hidden">
            <a href={src} target='_blank'>
                <Image unoptimized alt={alt} src={(src && src != "undefined") ? src : "/image/placeholder.webp"} fill className='object-cover cursor-pointer hover:scale-105 transition-transform' sizes="256px" />
            </a>
        </div>
    )
}

export default ImageContainer