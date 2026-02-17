import React, { useMemo } from 'react';
import { formatCurrency } from '../utils';
import Card from './ui/Card';

const SummaryBar = ({ expenses }) => {
    const totalInvested = useMemo(() => {
        return expenses.reduce((sum, item) => sum + item.amount, 0);
    }, [expenses]);

    const categoryBreakdown = useMemo(() => {
        const breakdown = {};
        expenses.forEach((item) => {
            const catTitle = item.category?.title || 'Uncategorized';
            breakdown[catTitle] = (breakdown[catTitle] || 0) + item.amount;
        });
        return Object.entries(breakdown).sort((a, b) => b[1] - a[1]); // Sort by amount desc
    }, [expenses]);

    return (
        <Card className="mb-6 sticky top-[64px] md:top-0 z-10 border-[var(--color-border)] shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center justify-between md:justify-start gap-4 border-b md:border-b-0 md:border-r border-gray-100 pb-2 md:pb-0 md:pr-6">
                    <span className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                        Total Invested
                    </span>
                    <span className="text-2xl font-bold text-[var(--color-primary)]">
                        {formatCurrency(totalInvested)}
                    </span>
                </div>

                <div className="flex flex-wrap gap-2">
                    {categoryBreakdown.map(([category, amount]) => (
                        <div
                            key={category}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                        >
                            <span className="font-semibold mr-1">{category}:</span> {formatCurrency(amount)}
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default SummaryBar;
