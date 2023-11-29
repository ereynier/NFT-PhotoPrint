import React from 'react'
import SearchCertificate from './SearchCertificate'
import HeroSection from './HeroSection'
import MySeparator from '@/utils/MySeparator'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import NFTTechnologie from './NFTTechnologie'
import PrintDetails from './PrintDetails'

const HomePage = () => {
    return (
        <div className='flex flex-col gap-2 text-center'>
            <HeroSection />
            <MySeparator cn='w-2/3 bg-slate-300' />
            <NFTTechnologie />
            <MySeparator cn='w-2/3 bg-slate-300' />
            <PrintDetails />
            <MySeparator cn='w-1/2 bg-slate-300' />
            <SearchCertificate />
        </div>
    )
}

export default HomePage