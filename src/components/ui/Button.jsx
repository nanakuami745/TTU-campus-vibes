import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function Button({ className, variant = 'primary', size = 'default', children, ...props }) {
    const baseStyles = 'inline-flex items-center justify-center rounded-full font-display font-bold transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white'

    const variants = {
        primary: 'bg-ttu-blue text-white hover:bg-ttu-blue/90 focus-visible:ring-ttu-blue',
        secondary: 'bg-ttu-sky text-ttu-blue hover:bg-ttu-sky/70 focus-visible:ring-ttu-blue',
        outline: 'border-2 border-ttu-gold text-ttu-blue hover:bg-ttu-gold/10 focus-visible:ring-ttu-gold',
        ghost: 'hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-900',
        link: 'underline-offset-4 hover:underline text-ttu-blue rounded-none',
    }

    const sizes = {
        default: 'h-10 py-2 px-5',
        sm: 'h-9 px-4 rounded-full',
        lg: 'h-11 px-8 rounded-full',
        icon: 'h-10 w-10 rounded-full',
    }

    return (
        <button
            className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
            {...props}
        >
            {children}
        </button>
    )
}
