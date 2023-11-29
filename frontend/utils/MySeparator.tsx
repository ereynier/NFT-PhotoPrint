"use client"

import { Separator } from '@/components/ui/separator'
import React from 'react'

interface Props {
    cn?: string
}

const MySeparator = ({ cn }: Props) => {
    
    cn = cn ? cn : "w-1/3 bg-slate-300"

    return (
        <div className='flex w-full h-full items-center justify-center'>
            <Separator className={cn} />
        </div>
    )
}

export default MySeparator