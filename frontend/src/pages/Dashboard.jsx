import React, { useState, useEffect } from 'react';
import api from '../api/api';
import ExpenseTable from '../components/ExpenseTable';
import SummaryBar from '../components/SummaryBar';
import ExpenseForm from '../components/ExpenseFormModal';
import { LayoutGrid, List, Plus } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useNotification } from '../context/NotificationContext';

const Dashboard = () => {
    const [expenses, setExpenses] = useState([]);
    const [viewMode, setViewMode] = useState('timeline'); // 'timeline', 'category', 'phase'
    const [loading, setLoading] = useState(true);
    const [editingExpense, setEditingExpense] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Delete Confirmation State
    const [deleteConfig, setDeleteConfig] = useState({
        isOpen: false,
        id: null,
        title: ''
    });

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const response = await api.get('/expenses/');
            // Sort by date desc by default
            const sorted = response.data.sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date));
            setExpenses(sorted);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (id) => {
        const expense = expenses.find(e => e.id === id);
        setDeleteConfig({
            isOpen: true,
            id,
            title: expense ? expense.title : 'Expense'
        });
    };

    const { showNotification } = useNotification();

    const handleConfirmDelete = async () => {
        const id = deleteConfig.id;
        try {
            await api.delete(`/expenses/${id}`);
            setExpenses(expenses.filter(e => e.id !== id));
            showNotification("Expense deleted successfully", 'success');
        } catch (error) {
            console.error("Error deleting expense:", error);
            showNotification(error.response?.data?.detail || "Failed to delete expense", 'error');
        }
    };

    const handleEdit = (expense) => {
        setEditingExpense(expense);
        setIsFormOpen(true);
    };

    const groupedExpenses = (groupBy) => {
        const groups = {};
        expenses.forEach((expense) => {
            const key = groupBy === 'category'
                ? (expense.category?.title || 'Uncategorized')
                : (expense.phase?.title || 'No Phase');
            if (!groups[key]) groups[key] = [];
            groups[key].push(expense);
        });
        return groups;
    };

    const renderContent = () => {
        // Pass confirmDelete instead of handleConfirmDelete directly to ExpenseTable
        if (viewMode === 'timeline') {
            return <ExpenseTable expenses={expenses} onDelete={confirmDelete} onEdit={handleEdit} />;
        }

        const groups = groupedExpenses(viewMode);
        return (
            <div className="space-y-8">
                {Object.entries(groups).map(([groupTitle, groupExpenses]) => {
                    const groupTotal = groupExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
                    return (
                        <Card key={groupTitle} className="p-0 overflow-hidden">
                            <div className="bg-gray-50 p-4 border-b border-[var(--color-border)] flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                                    {groupTitle} <span className="text-sm font-normal text-[var(--color-text-secondary)]">({groupExpenses.length} items)</span>
                                </h3>
                                <span className="text-[var(--color-primary)] font-bold">
                                    {groupTotal.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                </span>
                            </div>
                            <div className="p-4">
                                <ExpenseTable expenses={groupExpenses} onDelete={confirmDelete} onEdit={handleEdit} />
                            </div>
                        </Card>
                    );
                })}
            </div>
        );
    };

    if (loading) return (
        <Layout>
            <div className="p-8 text-center text-[var(--color-text-secondary)]">
                Loading...
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="space-y-6">
                <SummaryBar expenses={expenses} />

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Expenses</h2>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                            <div className="inline-flex rounded-md shadow-sm isolate">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('timeline')}
                                    className={`relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium border border-[var(--color-border)] rounded-l-lg hover:bg-gray-50 focus:z-10 transition-colors flex-1 sm:flex-none ${viewMode === 'timeline'
                                        ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] z-10 border-[var(--color-primary)]'
                                        : 'bg-white text-[var(--color-text-secondary)]'
                                        }`}
                                >
                                    <List className="w-4 h-4 mr-2" />
                                    <span className="md:inline">Timeline</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('category')}
                                    className={`relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium border-t border-b border-[var(--color-border)] hover:bg-gray-50 focus:z-10 transition-colors -ml-px flex-1 sm:flex-none ${viewMode === 'category'
                                        ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] z-10 border-[var(--color-primary)]'
                                        : 'bg-white text-[var(--color-text-secondary)]'
                                        }`}
                                >
                                    <LayoutGrid className="w-4 h-4 mr-2" />
                                    <span className="md:inline">Category</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('phase')}
                                    className={`relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium border border-[var(--color-border)] rounded-r-lg hover:bg-gray-50 focus:z-10 transition-colors -ml-px flex-1 sm:flex-none ${viewMode === 'phase'
                                        ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] z-10 border-[var(--color-primary)]'
                                        : 'bg-white text-[var(--color-text-secondary)]'
                                        }`}
                                >
                                    <LayoutGrid className="w-4 h-4 mr-2" />
                                    <span className="md:inline">Phase</span>
                                </button>
                            </div>

                            <Button
                                onClick={() => setIsFormOpen(true)}
                                variant="primary"
                                className="gap-2 w-full sm:w-auto justify-center"
                            >
                                <Plus className="w-4 h-4" /> Add <span className="hidden sm:inline">Expense</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {renderContent()}

                <ExpenseForm
                    isOpen={isFormOpen}
                    onClose={() => {
                        setIsFormOpen(false);
                        setEditingExpense(null);
                    }}
                    onSuccess={fetchExpenses}
                    expense={editingExpense}
                />

                <ConfirmationModal
                    isOpen={deleteConfig.isOpen}
                    onClose={() => setDeleteConfig({ ...deleteConfig, isOpen: false })}
                    onConfirm={handleConfirmDelete}
                    title="Delete Expense?"
                    message={`Are you sure you want to delete "${deleteConfig.title}"? This action cannot be undone.`}
                    variant="danger"
                    confirmText="Delete"
                />
            </div>
        </Layout>
    );
};

export default Dashboard;

