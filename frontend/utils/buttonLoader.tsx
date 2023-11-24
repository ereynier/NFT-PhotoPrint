import React from 'react'

const buttonLoader = (text: string, isLoading: boolean) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
            </div>
        )
    } else {
        return (
            <div className="flex items-center justify-center">
                {text}
            </div>
        )
    }
}