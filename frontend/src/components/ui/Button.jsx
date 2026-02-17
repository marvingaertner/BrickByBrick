import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

    const variants = {
        primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] focus:ring-[var(--color-primary)]',
        secondary: 'bg-[var(--color-primary-light)] text-[var(--color-primary)] hover:bg-[#D1E4F9] focus:ring-[var(--color-primary)]',
        ghost: 'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-action-hover)] focus:ring-gray-500',
        outline: 'bg-transparent border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-action-hover)]',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600'
    };

    const sizes = {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10 p-2'
    };

    return (
        <button
            className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
