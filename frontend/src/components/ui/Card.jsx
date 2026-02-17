import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Card = ({ children, className, ...props }) => {
    return (
        <div
            className={twMerge(clsx(
                'bg-[var(--color-surface)] rounded-xl shadow-sm border border-[var(--color-border)] p-4 sm:p-6',
                className
            ))}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
