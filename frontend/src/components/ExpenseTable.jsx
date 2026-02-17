import React, { useState, useMemo, useRef, useEffect } from 'react';
import { formatCurrency } from '../utils';
import { Trash2, Edit, ChevronUp, ChevronDown, Filter } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';


const MultiSelectFilter = ({ options, selected, onChange, placeholder = "Select..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (option) => {
        const newSelected = selected.includes(option)
            ? selected.filter(item => item !== option)
            : [...selected, option];
        onChange(newSelected);
    };

    return (
        <div className="relative min-w-[140px]" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-9 w-full items-center justify-between rounded-md border border-[var(--color-border)] bg-gray-50 px-3 py-2 text-xs text-left focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-primary)]"
            >
                <span className="truncate block">
                    {selected.length === 0 ? placeholder : `${selected.length} selected`}
                </span>
                <ChevronDown className="h-3 w-3 opacity-50 flex-shrink-0 ml-1" />
            </button>

            {isOpen && (
                <div className="absolute z-20 mt-1 max-h-60 w-48 overflow-auto rounded-md border border-[var(--color-border)] bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {options.length === 0 ? (
                        <div className="py-2 px-3 text-gray-500 italic">No items</div>
                    ) : (
                        options.map((option) => (
                            <div
                                key={option}
                                className="relative flex cursor-pointer select-none items-center py-2 px-3 hover:bg-gray-100 transition-colors"
                                onClick={() => toggleOption(option)}
                            >
                                <input
                                    type="checkbox"
                                    className="h-3 w-3 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] pointer-events-none"
                                    checked={selected.includes(option)}
                                    readOnly
                                />
                                <span className="ml-2 block truncate font-medium text-[var(--color-text-primary)]">{option}</span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

const ExpenseTable = ({ expenses, onDelete, onEdit }) => {
    const [filters, setFilters] = useState({
        dateFrom: '',
        dateTo: '',
        title: '',
        category: '',
        sub_category: '',
        phase: '',
        sub_category: '',
        phase: '',
        tags: [],
        amountFrom: '',
        amountFrom: '',
        amountTo: ''
    });

    const [sortConfig, setSortConfig] = useState({ key: 'purchase_date', direction: 'desc' });

    const uniqueValues = useMemo(() => {
        const getUnique = (key, nestedKey, filterFn) => {
            const values = new Set();
            expenses.forEach(e => {
                if (filterFn && !filterFn(e)) return;
                const val = nestedKey ? e[key]?.[nestedKey] : e[key];
                if (val) values.add(val);
            });
            return Array.from(values).sort();
        };

        return {
            categories: getUnique('category', 'title'),
            // Sub-categories depend on selected category
            subCategories: getUnique('sub_category', 'title', (e) => !filters.category || e.category?.title === filters.category),
            subCategories: getUnique('sub_category', 'title', (e) => !filters.category || e.category?.title === filters.category),
            phases: getUnique('phase', 'title'),
            tags: (() => {
                const values = new Set();
                expenses.forEach(e => {
                    e.tags?.forEach(t => values.add(t.title));
                });
                return Array.from(values).sort();
            })()
        };
    }, [expenses, filters.category]);

    const filteredExpenses = useMemo(() => {
        return expenses.filter(expense => {
            const expenseDate = new Date(expense.purchase_date);
            const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
            const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

            const matchDateFrom = fromDate ? expenseDate >= fromDate : true;
            const matchDateTo = toDate ? expenseDate <= toDate : true;

            const matchTitle = expense.title.toLowerCase().includes(filters.title.toLowerCase());
            const matchCategory = filters.category ? expense.category?.title === filters.category : true;
            const matchSub = filters.sub_category ? expense.sub_category?.title === filters.sub_category : true;
            const matchPhase = filters.phase ? expense.phase?.title === filters.phase : true;
            const matchTags = filters.tags.length > 0
                ? expense.tags?.some(tag => filters.tags.includes(tag.title))
                : true;

            const amount = Number(expense.amount);
            const amountFrom = filters.amountFrom ? Number(filters.amountFrom) : null;
            const amountTo = filters.amountTo ? Number(filters.amountTo) : null;

            const matchAmountFrom = amountFrom !== null ? amount >= amountFrom : true;
            const matchAmountTo = amountTo !== null ? amount <= amountTo : true;


            return matchDateFrom && matchDateTo && matchTitle && matchCategory && matchSub && matchPhase && matchTags && matchAmountFrom && matchAmountTo;
        });
    }, [expenses, filters]);

    const sortedExpenses = useMemo(() => {
        let sortableItems = [...filteredExpenses];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle Amount
                if (sortConfig.key === 'amount') {
                    aValue = Number(aValue);
                    bValue = Number(bValue);
                }
                // Handle Date
                if (sortConfig.key === 'purchase_date') {
                    aValue = new Date(aValue);
                    bValue = new Date(bValue);
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredExpenses, sortConfig]);

    const handleFilterChange = (key, value) => {
        // Reset sub_category if category changes
        if (key === 'category') {
            setFilters(prev => ({ ...prev, [key]: value, sub_category: '' }));
        } else {
            setFilters(prev => ({ ...prev, [key]: value }));
        }
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <div className="w-4 h-4" />;
        return sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
    };

    // Helper to style select inputs consistently with the new Input component
    const selectClassName = "flex h-10 w-full rounded-md border border-[var(--color-border)] bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50";

    const MobileExpenseCard = ({ expense, onEdit, onDelete }) => (
        <div className="bg-white p-4 rounded-lg border border-[var(--color-border)] shadow-sm space-y-3">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-medium text-[var(--color-text-primary)]">{expense.title}</h3>
                    <div className="flex flex-col">
                        <p className="text-xs text-[var(--color-text-secondary)]">{expense.purchase_date}</p>
                        {expense.vendor && <p className="text-xs text-[var(--color-text-secondary)]">Via: {expense.vendor}</p>}
                    </div>
                </div>
                <span className="font-bold text-[var(--color-primary)]">
                    {formatCurrency(expense.amount)}
                </span>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                    {expense.category?.title}
                </span>
                {expense.sub_category && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {expense.sub_category.title}
                    </span>
                )}
                {expense.phase && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {expense.phase.title}
                    </span>
                )}
            </div>

            {expense.tags && expense.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {expense.tags.map(tag => (
                        <span key={tag.id} className="text-[10px] px-1.5 py-0.5 rounded border border-gray-200 text-gray-500">
                            #{tag.title}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(expense)}
                    className="text-gray-500 hover:text-[var(--color-primary)] h-8 px-2"
                >
                    <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(expense.id)}
                    className="text-gray-500 hover:text-red-600 h-8 px-2"
                >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                </Button>
            </div>
        </div>
    );

    return (
        <Card className="overflow-hidden p-0 border-0 shadow-none md:border md:shadow-sm md:rounded-lg bg-transparent md:bg-white">
            {/* Filters Section - Collapsible or Stacked on Mobile */}
            <div className="p-4 bg-white md:bg-gray-50 md:border-b border-[var(--color-border)] space-y-4 mb-4 md:mb-0 rounded-lg md:rounded-none border md:border-0 shadow-sm md:shadow-none">
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-3">
                    {/* Date Range */}
                    <div className="col-span-1 md:col-span-1 space-y-2">
                        <Input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                            className="h-9 text-xs"
                            placeholder="From"
                        />
                        <Input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                            className="h-9 text-xs"
                            placeholder="To"
                        />
                    </div>

                    {/* Title Search */}
                    <div className="col-span-1 md:col-span-1">
                        <Input
                            type="text"
                            placeholder="Search..."
                            value={filters.title}
                            onChange={(e) => handleFilterChange('title', e.target.value)}
                            className="h-9 text-xs"
                        />
                    </div>

                    {/* Category Select */}
                    <div className="col-span-1 md:col-span-1">
                        <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className={`${selectClassName} h-9 text-xs`}
                        >
                            <option value="">All Categories</option>
                            {uniqueValues.categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {/* Sub Category Select */}
                    <div className="col-span-1 md:col-span-1">
                        <select
                            value={filters.sub_category}
                            onChange={(e) => handleFilterChange('sub_category', e.target.value)}
                            className={`${selectClassName} h-9 text-xs`}
                            disabled={!filters.category}
                        >
                            <option value="">{filters.category ? 'All Sub-Cats' : 'Select Cat First'}</option>
                            {uniqueValues.subCategories.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    {/* Phase Select */}
                    <div className="col-span-1 md:col-span-1">
                        <select
                            value={filters.phase}
                            onChange={(e) => handleFilterChange('phase', e.target.value)}
                            className={`${selectClassName} h-9 text-xs`}
                        >
                            <option value="">All Phases</option>
                            {uniqueValues.phases.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    {/* Tags MultiSelect */}
                    <div className="col-span-1 md:col-span-1">
                        <MultiSelectFilter
                            options={uniqueValues.tags}
                            selected={filters.tags}
                            onChange={(newTags) => handleFilterChange('tags', newTags)}
                            placeholder="All Tags"
                        />
                    </div>

                    {/* Amount Range */}
                    <div className="col-span-1 md:col-span-2 flex gap-2">
                        <Input
                            type="number"
                            placeholder="Min €"
                            value={filters.amountFrom}
                            onChange={(e) => handleFilterChange('amountFrom', e.target.value)}
                            className="h-9 text-xs text-right w-full"
                        />
                        <Input
                            type="number"
                            placeholder="Max €"
                            value={filters.amountTo}
                            onChange={(e) => handleFilterChange('amountTo', e.target.value)}
                            className="h-9 text-xs text-right w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Mobile View: Cards */}
            <div className="md:hidden space-y-4">
                {sortedExpenses.length === 0 ? (
                    <div className="p-8 text-center text-[var(--color-text-secondary)]">
                        <Filter className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>No expenses found.</p>
                    </div>
                ) : (
                    sortedExpenses.map(expense => (
                        <MobileExpenseCard
                            key={expense.id}
                            expense={expense}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))
                )}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left text-[var(--color-text-secondary)]">
                    <thead className="text-xs text-[var(--color-text-primary)] uppercase bg-gray-50 border-b border-[var(--color-border)]">
                        <tr>
                            <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => requestSort('purchase_date')}>
                                <div className="flex items-center gap-1">
                                    Date <SortIcon columnKey="purchase_date" />
                                </div>
                            </th>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Vendor</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Sub-Category</th>
                            <th className="px-6 py-4">Phase</th>
                            <th className="px-6 py-4">Tags</th>
                            <th className="px-6 py-4 text-right cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => requestSort('amount')}>
                                <div className="flex items-center justify-end gap-1">
                                    Amount <SortIcon columnKey="amount" />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                        {sortedExpenses.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-6 py-8 text-center text-[var(--color-text-secondary)]">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Filter className="w-8 h-8 text-gray-300" />
                                        <p>No expenses found matching filters.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            sortedExpenses.map((expense) => (
                                <tr key={expense.id} className="bg-white hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">{expense.purchase_date}</td>
                                    <td className="px-6 py-4 font-medium text-[var(--color-text-primary)]">
                                        {expense.title}
                                    </td>
                                    <td className="px-6 py-4 text-[var(--color-text-secondary)]">
                                        {expense.vendor || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                                            {expense.category?.title}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{expense.sub_category?.title || '-'}</td>
                                    <td className="px-6 py-4">{expense.phase?.title || '-'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {expense.tags && expense.tags.map(tag => (
                                                <span key={tag.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                    {tag.title}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-semibold text-[var(--color-text-primary)]">
                                        {formatCurrency(expense.amount)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEdit(expense)}
                                                className="h-8 w-8 text-gray-500 hover:text-[var(--color-primary)]"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onDelete(expense.id)}
                                                className="h-8 w-8 text-gray-500 hover:text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default ExpenseTable;
