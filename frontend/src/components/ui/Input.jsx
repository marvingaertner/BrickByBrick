import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Input = ({ className, error, ...props }) => {
    return (
        <div className="w-full">
            <input
                className={twMerge(clsx(
                    'flex h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 text-[var(--color-text-primary)]',
                    error && 'border-red-500 focus:ring-red-500',
                    className
                ))}
                {...props}
            />
            {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
        </div>
    );
};

export default Input;
