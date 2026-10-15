import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { Loader2, Tags, Plus, Edit2, Archive, ArchiveRestore } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({ name: '', slug: '', description: '', icon: '' });
    const [editingId, setEditingId] = useState(null);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data.data);
        } catch (error) {
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.slug) return toast.error("Name and Slug are required.");

        setIsSubmitting(true);
        try {
            if (editingId) {
                await api.patch(`/categories/${editingId}`, formData);
                toast.success("Category updated.");
            } else {
                await api.post('/categories', formData);
                toast.success("Category created.");
            }
            setFormData({ name: '', slug: '', description: '', icon: '' });
            setEditingId(null);
            fetchCategories();
        } catch (error) {
            toast.error("Failed to save category.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            await api.patch(`/categories/${id}`, { isActive: !currentStatus });
            toast.success(`Category ${!currentStatus ? 'activated' : 'disabled'}.`);
            fetchCategories();
        } catch (error) {
            toast.error("Failed to update status.");
        }
    };

    const handleEdit = (cat) => {
        setFormData({ name: cat.name, slug: cat.slug, description: cat.description, icon: cat.icon || '' });
        setEditingId(cat._id);
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto font-sans pb-12">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6 transition-colors">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                        <Tags className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-primary-900 dark:text-white tracking-tight">Category Control</h1>
                        <p className="text-stone-600 dark:text-stone-400 font-medium mt-1">Manage global semantic tagging classes for the AI matching engine.</p>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm transition-colors">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                            {editingId ? 'Edit Category' : 'New Category'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">Category Name</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-stone-50/50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-3 text-sm text-stone-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                                    placeholder="e.g. Electronics"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">Identifier Slug</label>
                                <input
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    className="w-full bg-stone-50/50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-3 text-sm font-mono text-stone-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                                    placeholder="e.g. electronics"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">Semantic Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full bg-stone-50/50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-3 text-sm text-stone-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                                    placeholder="Devices, laptops, phones, chargers..."
                                    rows={3}
                                />
                            </div>
                            <div className="pt-2 flex gap-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Save</>}
                                </button>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={() => { setEditingId(null); setFormData({ name: '', slug: '', description: '', icon: '' }); }}
                                        className="px-4 py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl border border-stone-200 dark:border-stone-700 transition-colors text-sm font-semibold text-stone-700 dark:text-stone-300"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                <div className="md:col-span-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
                    <table className="w-full text-left border-collapse min-w-max">
                        <thead>
                            <tr className="bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-800 uppercase text-[11px] tracking-widest font-extrabold text-stone-500 dark:text-stone-400">
                                <th className="p-4">Category Node</th>
                                <th className="p-4">Slug</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                            {categories.map((cat) => (
                                <tr key={cat._id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40 transition-colors">
                                    <td className="p-4">
                                        <p className="font-bold text-primary-900 dark:text-white">{cat.name}</p>
                                        <p className="text-xs text-stone-500 dark:text-stone-400 truncate max-w-[220px] mt-0.5">{cat.description || 'No description'}</p>
                                    </td>
                                    <td className="p-4 text-xs font-mono text-stone-600 dark:text-stone-300">{cat.slug}</td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 text-[10px] uppercase font-extrabold tracking-wider rounded-md border ${
                                            cat.isActive
                                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                                        }`}>
                                            {cat.isActive ? 'Active' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(cat)}
                                                className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                                                title="Edit Category"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => toggleActive(cat._id, cat.isActive)}
                                                className={`p-2 rounded-lg transition-colors ${
                                                    cat.isActive
                                                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50'
                                                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                                                }`}
                                                title={cat.isActive ? 'Disable Category' : 'Activate Category'}
                                            >
                                                {cat.isActive ? <Archive className="w-4 h-4" /> : <ArchiveRestore className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminCategories;
