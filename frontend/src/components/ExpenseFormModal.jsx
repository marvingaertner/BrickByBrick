import React, { useState, useEffect } from 'react';
import api, { uploadAttachment, deleteAttachment } from '../api/api';
import { X, FileText, Trash2, Download } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';
import FileUploader from './ui/FileUploader';

const ExpenseForm = ({ isOpen, onClose, onSuccess, expense = null }) => {
    const [categories, setCategories] = useState([]);
    const [phases, setPhases] = useState([]);
    const [tags, setTags] = useState([]);
    const [files, setFiles] = useState([]);
    const [existingAttachments, setExistingAttachments] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        vendor: '',
        amount: '',
        purchase_date: new Date().toISOString().split('T')[0],
        category_id: '',
        sub_category_id: '',
        phase_id: '',
        tags: [],
        notes: '',
    });

    useEffect(() => {
        if (isOpen) {
            fetchOptions();
            setFiles([]);
            if (expense) {
                setFormData({
                    title: expense.title,
                    vendor: expense.vendor || '',
                    amount: expense.amount,
                    purchase_date: expense.purchase_date,
                    category_id: expense.category?.id || '',
                    sub_category_id: expense.sub_category?.id || '',
                    phase_id: expense.phase?.id || '',
                    tags: expense.tags ? expense.tags.map(t => t.id) : [],
                    notes: expense.notes || '',
                });
                setExistingAttachments(expense.attachments || []);
            } else {
                setFormData({
                    title: '',
                    vendor: '',
                    amount: '',
                    purchase_date: new Date().toISOString().split('T')[0],
                    category_id: '',
                    sub_category_id: '',
                    phase_id: '',
                    tags: [],
                    notes: '',
                });
                setExistingAttachments([]);
            }
        }
    }, [isOpen, expense]);

    const fetchOptions = async () => {
        try {
            const [catsRes, phasesRes, tagsRes] = await Promise.all([
                api.get('/categories/'),
                api.get('/phases/'),
                api.get('/tags/'),
            ]);
            setCategories(catsRes.data);
            setPhases(phasesRes.data);
            setTags(tagsRes.data);
        } catch (error) {
            console.error('Error fetching options:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            // Reset sub-category if category changes
            ...(name === 'category_id' ? { sub_category_id: '' } : {}),
        }));
    };

    const toggleTag = (tagId) => {
        setFormData(prev => {
            const currentTags = prev.tags || [];
            if (currentTags.includes(tagId)) {
                return { ...prev, tags: currentTags.filter(id => id !== tagId) };
            } else {
                return { ...prev, tags: [...currentTags, tagId] };
            }
        });
    };

    const handleDeleteAttachment = async (attachmentId) => {
        if (window.confirm('Are you sure you want to delete this attachment?')) {
            try {
                await deleteAttachment(attachmentId);
                setExistingAttachments(prev => prev.filter(a => a.id !== attachmentId));
            } catch (error) {
                console.error('Error deleting attachment:', error);
                alert('Failed to delete attachment.');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                amount: parseFloat(formData.amount),
                category_id: parseInt(formData.category_id),
                sub_category_id: formData.sub_category_id ? parseInt(formData.sub_category_id) : null,
                phase_id: formData.phase_id ? parseInt(formData.phase_id) : null,
                tags: formData.tags,
            };

            let expenseId;
            if (expense) {
                await api.put(`/expenses/${expense.id}`, payload);
                expenseId = expense.id;
            } else {
                const res = await api.post('/expenses/', payload);
                expenseId = res.data.id;
            }

            // Upload files
            if (files.length > 0 && expenseId) {
                await Promise.all(files.map(file => uploadAttachment(expenseId, file)));
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving expense:', error);
            alert('Failed to save expense. Please try again.');
        }
    };

    if (!isOpen) return null;

    const selectedCategory = categories.find((c) => c.id === parseInt(formData.category_id));
    const subCategories = selectedCategory ? selectedCategory.sub_categories : [];

    // Helper class for selects
    const selectClassName = "flex h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 text-[var(--color-text-primary)]";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-lg mx-auto p-0 overflow-hidden shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)] bg-[var(--color-surface-highlight)]">
                    <h2 className="text-xl font-bold text-[var(--color-primary)]">
                        {expense ? 'Edit Expense' : 'Add New Expense'}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Title</label>
                        <Input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Concrete mix"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Vendor</label>
                        <Input
                            type="text"
                            name="vendor"
                            value={formData.vendor}
                            onChange={handleChange}
                            placeholder="e.g. Bauhaus"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Amount (€)</label>
                            <Input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Date</label>
                            <Input
                                type="date"
                                name="purchase_date"
                                value={formData.purchase_date}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Category</label>
                            <select
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                                required
                                className={selectClassName}
                            >
                                <option value="">Select...</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Sub-Category</label>
                            <select
                                name="sub_category_id"
                                value={formData.sub_category_id}
                                onChange={handleChange}
                                disabled={!selectedCategory}
                                className={selectClassName}
                            >
                                <option value="">Select...</option>
                                {subCategories.map((sub) => (
                                    <option key={sub.id} value={sub.id}>
                                        {sub.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Phase</label>
                        <select
                            name="phase_id"
                            value={formData.phase_id}
                            onChange={handleChange}
                            required
                            className={selectClassName}
                        >
                            <option value="">Select...</option>
                            {phases.map((phase) => (
                                <option key={phase.id} value={phase.id}>
                                    {phase.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Tags</label>
                        <div className="flex flex-wrap gap-2">
                            {tags.map(tag => (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => toggleTag(tag.id)}
                                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors border ${formData.tags?.includes(tag.id)
                                        ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                                        : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]'
                                        }`}
                                >
                                    {tag.title}
                                </button>
                            ))}
                            {tags.length === 0 && <span className="text-xs text-gray-400 italic">No tags available</span>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="2"
                            className="flex w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent placeholder:text-gray-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Attachments</label>

                        {/* Existing Attachments */}
                        {existingAttachments.length > 0 && (
                            <div className="mb-4 space-y-2">
                                <p className="text-xs text-[var(--color-text-secondary)] font-medium">Existing Files:</p>
                                {existingAttachments.map(att => (
                                    <div key={att.id} className="flex items-center justify-between p-2 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)]">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <FileText className="w-4 h-4 text-[var(--color-primary)]" />
                                            <a
                                                href={`http://localhost:8000${att.file_path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm truncate text-[var(--color-text-primary)] hover:underline"
                                            >
                                                {att.filename}
                                            </a>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteAttachment(att.id)}
                                            className="p-1 hover:bg-red-100 hover:text-red-500 rounded-full transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* File Uploader */}
                        <FileUploader files={files} onFilesChange={setFiles} />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                        >
                            {expense ? 'Update Expense' : 'Add Expense'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div >
    );
};

export default ExpenseForm;
