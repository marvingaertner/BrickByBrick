import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Plus, Trash2, ChevronRight, ChevronDown, Edit } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useNotification } from '../context/NotificationContext';

const Management = () => {
    const [categories, setCategories] = useState([]);
    const [phases, setPhases] = useState([]);
    const [tags, setTags] = useState([]);
    const [activeTab, setActiveTab] = useState('categories'); // 'categories', 'phases', 'tags'
    const [expandedCategories, setExpandedCategories] = useState({});

    // Modal State
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: null, // 'CATEGORY', 'SUB_CATEGORY', 'PHASE', 'TAG', 'EDIT_CATEGORY', 'EDIT_SUB_CATEGORY', 'EDIT_PHASE', 'EDIT_TAG'
        data: null, // Holds the item being edited or parent ID
        inputValue: ''
    });

    // Delete Confirmation State
    const [deleteConfig, setDeleteConfig] = useState({
        isOpen: false,
        isOpen: false,
        type: null, // 'CATEGORY', 'SUB_CATEGORY', 'PHASE', 'TAG'
        id: null,
        title: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
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
            console.error('Error fetching data:', error);
        }
    };

    const toggleCategory = (id) => {
        setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    // --- Modal Handlers ---

    const openModal = (type, data = null, initialValue = '') => {
        setModalConfig({
            isOpen: true,
            type,
            data,
            inputValue: initialValue
        });
    };

    const closeModal = () => {
        setModalConfig({ isOpen: false, type: null, data: null, inputValue: '' });
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        const { type, data, inputValue } = modalConfig;
        if (!inputValue.trim()) return;

        try {
            switch (type) {
                case 'CATEGORY':
                    await api.post('/categories/', { title: inputValue });
                    break;
                case 'EDIT_CATEGORY':
                    await api.put(`/categories/${data.id}`, { title: inputValue, description: data.description });
                    break;
                case 'SUB_CATEGORY':
                    await api.post('/sub_categories/', { title: inputValue, category_id: data });
                    break;
                case 'EDIT_SUB_CATEGORY':
                    await api.put(`/sub_categories/${data.id}`, { title: inputValue, category_id: data.category_id });
                    break;
                case 'PHASE':
                    await api.post('/phases/', { title: inputValue });
                    break;
                case 'EDIT_PHASE':
                    await api.put(`/phases/${data.id}`, { title: inputValue });
                    break;
                case 'TAG':
                    await api.post('/tags/', { title: inputValue });
                    break;
                case 'EDIT_TAG':
                    await api.put(`/tags/${data.id}`, { title: inputValue });
                    break;
                default:
                    break;
            }
            fetchData();
            closeModal();
        } catch (error) {
            console.error("Operation failed:", error);
            showNotification("Operation failed. Please try again.", 'error');
        }
    };

    // --- Delete Handlers ---

    const confirmDelete = (type, id, title) => {
        setDeleteConfig({
            isOpen: true,
            type,
            id,
            title
        });
    };

    const { showNotification } = useNotification();

    const handleConfirmDelete = async () => {
        const { type, id } = deleteConfig;
        try {
            if (type === 'CATEGORY') {
                await api.delete(`/categories/${id}`);
            } else if (type === 'SUB_CATEGORY') {
                await api.delete(`/sub_categories/${id}`);
            } else if (type === 'PHASE') {
                await api.delete(`/phases/${id}`);
            } else if (type === 'TAG') {
                await api.delete(`/tags/${id}`);
            }
            fetchData();
            showNotification(`${type.toLowerCase().replace('_', ' ')} deleted successfully`, 'success');
        } catch (error) {
            console.error(`Delete ${type} Error:`, error);
            // This alert captures the 400 bad request from backend (foreign key constraint)
            showNotification(error.response?.data?.detail || `Error deleting ${type.toLowerCase().replace('_', ' ')}`, 'error');
        }
    };

    const [categoryFilter, setCategoryFilter] = useState('');
    const [phaseFilter, setPhaseFilter] = useState('');
    const [tagFilter, setTagFilter] = useState('');

    const filteredCategories = categories.filter(cat =>
        cat.title.toLowerCase().includes(categoryFilter.toLowerCase()) ||
        cat.sub_categories?.some(sub => sub.title.toLowerCase().includes(categoryFilter.toLowerCase()))
    );

    const filteredPhases = phases.filter(phase =>
        phase.title.toLowerCase().includes(phaseFilter.toLowerCase())
    );

    const filteredTags = tags.filter(tag =>
        tag.title.toLowerCase().includes(tagFilter.toLowerCase())
    );

    const getModalTitle = () => {
        switch (modalConfig.type) {
            case 'CATEGORY': return 'Add Category';
            case 'EDIT_CATEGORY': return 'Edit Category';
            case 'SUB_CATEGORY': return 'Add Sub-Category';
            case 'EDIT_SUB_CATEGORY': return 'Edit Sub-Category';
            case 'PHASE': return 'Add Phase';
            case 'EDIT_PHASE': return 'Edit Phase';
            case 'TAG': return 'Add Tag';
            case 'EDIT_TAG': return 'Edit Tag';
            default: return '';
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 border-b border-[var(--color-border)] pb-4">
                    <div className="flex space-x-1 bg-[var(--color-surface-highlight)] p-1 rounded-lg overflow-x-auto max-w-full no-scrollbar">
                        <button
                            onClick={() => setActiveTab('categories')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap flex-shrink-0 ${activeTab === 'categories'
                                ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm'
                                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                                }`}
                        >
                            Categories & Sub-categories
                        </button>
                        <button
                            onClick={() => setActiveTab('phases')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap flex-shrink-0 ${activeTab === 'phases'
                                ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm'
                                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                                }`}
                        >
                            Construction Phases
                        </button>
                        <button
                            onClick={() => setActiveTab('tags')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap flex-shrink-0 ${activeTab === 'tags'
                                ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm'
                                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                                }`}
                        >
                            Tags
                        </button>
                    </div>

                    <div className="w-full md:w-auto md:ml-auto">
                        {activeTab === 'categories' ? (
                            <Input
                                type="text"
                                placeholder="Search Categories..."
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="h-10 w-full md:w-64"
                            />
                        ) : activeTab === 'phases' ? (
                            <Input
                                type="text"
                                placeholder="Search Phases..."
                                value={phaseFilter}
                                onChange={(e) => setPhaseFilter(e.target.value)}
                                className="h-10 w-full md:w-64"
                            />
                        ) : (
                            <Input
                                type="text"
                                placeholder="Search Tags..."
                                value={tagFilter}
                                onChange={(e) => setTagFilter(e.target.value)}
                                className="h-10 w-full md:w-64"
                            />
                        )}
                    </div>
                </div>

                {activeTab === 'categories' ? (
                    <Card>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Categories</h2>
                            <Button onClick={() => openModal('CATEGORY')} size="sm" className="gap-1">
                                <Plus className="w-3 h-3" /> Add Category
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {filteredCategories.map((cat) => (
                                <div key={cat.id} className="border border-[var(--color-border)] rounded-lg overflow-hidden">
                                    <div className="flex items-center justify-between p-3 bg-[var(--color-surface-highlight)] hover:bg-[var(--color-action-hover)] cursor-pointer transition-colors">
                                        <div className="flex items-center gap-3 flex-1" onClick={() => toggleCategory(cat.id)}>
                                            {expandedCategories[cat.id] ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                                            <span className="font-medium text-[var(--color-text-primary)]">{cat.title}</span>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                                                {cat.sub_categories?.length || 0}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => { e.stopPropagation(); openModal('SUB_CATEGORY', cat.id); }}
                                                className="text-[var(--color-primary)] h-8 px-2 text-xs"
                                            >
                                                + Sub-cat
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => { e.stopPropagation(); openModal('EDIT_CATEGORY', cat, cat.title); }}
                                                className="h-8 w-8 text-gray-400 hover:text-[var(--color-primary)]"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => { e.stopPropagation(); confirmDelete('CATEGORY', cat.id, cat.title); }}
                                                className="h-8 w-8 text-gray-400 hover:text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    {expandedCategories[cat.id] && (
                                        <div className="p-3 pl-10 border-t border-[var(--color-border)] bg-[var(--color-background)]">
                                            {cat.sub_categories && cat.sub_categories.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {cat.sub_categories.map((sub) => (
                                                        <li key={sub.id} className="flex items-center justify-between text-sm group">
                                                            <span className="text-[var(--color-text-secondary)]">{sub.title}</span>
                                                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => openModal('EDIT_SUB_CATEGORY', sub, sub.title)}
                                                                    className="p-1 text-gray-400 hover:text-[var(--color-primary)]"
                                                                >
                                                                    <Edit className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    onClick={() => confirmDelete('SUB_CATEGORY', sub.id, sub.title)}
                                                                    className="p-1 text-gray-400 hover:text-red-600"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-gray-400 italic">No sub-categories</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                ) : activeTab === 'phases' ? (
                    <Card>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Phases</h2>
                            <Button onClick={() => openModal('PHASE')} size="sm" className="gap-1">
                                <Plus className="w-3 h-3" /> Add Phase
                            </Button>
                        </div>
                        <ul className="divide-y divide-[var(--color-border)]">
                            {filteredPhases.map((phase) => (
                                <li key={phase.id} className="py-3 flex justify-between items-center group hover:bg-[var(--color-action-hover)] -mx-6 px-6 transition-colors">
                                    <span className="text-[var(--color-text-primary)] font-medium">{phase.title}</span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openModal('EDIT_PHASE', phase, phase.title)}
                                            className="h-8 w-8 text-gray-400 hover:text-[var(--color-primary)]"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => confirmDelete('PHASE', phase.id, phase.title)}
                                            className="h-8 w-8 text-gray-400 hover:text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Card>
                ) : (
                    <Card>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Tags</h2>
                            <Button onClick={() => openModal('TAG')} size="sm" className="gap-1">
                                <Plus className="w-3 h-3" /> Add Tag
                            </Button>
                        </div>
                        <ul className="divide-y divide-[var(--color-border)]">
                            {filteredTags.map((tag) => (
                                <li key={tag.id} className="py-3 flex justify-between items-center group hover:bg-[var(--color-action-hover)] -mx-6 px-6 transition-colors">
                                    <span className="text-[var(--color-text-primary)] font-medium">{tag.title}</span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openModal('EDIT_TAG', tag, tag.title)}
                                            className="h-8 w-8 text-gray-400 hover:text-[var(--color-primary)]"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => confirmDelete('TAG', tag.id, tag.title)}
                                            className="h-8 w-8 text-gray-400 hover:text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Card>
                )}

                {/* Edit/Create Modal */}
                <Modal
                    isOpen={modalConfig.isOpen}
                    onClose={closeModal}
                    title={getModalTitle()}
                >
                    <form onSubmit={handleModalSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Title</label>
                            <Input
                                value={modalConfig.inputValue}
                                onChange={(e) => setModalConfig({ ...modalConfig, inputValue: e.target.value })}
                                autoFocus
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                            <Button type="submit">Save</Button>
                        </div>
                    </form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <ConfirmationModal
                    isOpen={deleteConfig.isOpen}
                    onClose={() => setDeleteConfig({ ...deleteConfig, isOpen: false })}
                    onConfirm={handleConfirmDelete}
                    title="Delete Item?"
                    message={`Are you sure you want to delete "${deleteConfig.title}"? This action cannot be undone.`}
                    variant="danger"
                    confirmText="Delete"
                />
            </div>
        </Layout >
    );
};

export default Management;
