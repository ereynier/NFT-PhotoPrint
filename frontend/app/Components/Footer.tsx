import Link from 'next/link'
import React from 'react'
import { Separator } from "@/components/ui/separator"
import { ApertureIcon, Github, Instagram, Linkedin } from "lucide-react"


const Footer = () => {
    return (
        <footer className="mt-10">
            <div className='flex w-full items-center justify-center'>
                <Separator className='w-10/12 bg-slate-300'/>
            </div>
            <div className="container flex md:flex-row flex-col items-center justify-center px-4 py-8 mx-auto w-10/12 md:justify-between">
                <div className="flex flex-wrap justify-center">
                    <ul className="flex flex-wrap gap-4 items-center justify-center whitespace-nowrap">
                        <li><Link href={"/"}>Home</Link></li>
                        <li><Link href={"/contact"}>Contact</Link></li>
                        <li><Link href={"/terms"}>Terms & Condition</Link></li>
                    </ul>
                </div>
                <div className="flex justify-center space-x-4 mt-4 lg:mt-0">
                    {/* <Link href={""}>
                        <Facebook />
                    </Link> */}
                    {/* <Link href={""}>
                        <Twitter />
                    </Link> */}
                    <Link href={"https://instagram.com/esteban.pics"} target='_blank'>
                        <Instagram />
                    </Link>
                    <Link href={"https://photos.ereynier.me"} target='_blank'>
                        <ApertureIcon />
                    </Link>
                    <Link href={"https://www.linkedin.com/in/ereynier/"} target='_blank'>
                        <Linkedin />
                    </Link>
                    <Link href={"https://github.com/ereynier"} target='_blank'>
                        <Github />
                    </Link>
                </div>
            </div>
            <div className="pb-2 flex justify-center">
                <Link href='https://ereynier.me' target='_blank' className=" text-center w-fit">
                    @Estéban Reynier
                </Link>
            </div>
        </footer>
    )
}

export default Footer