import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { Loader2, BellRing, Send, Volume2, CheckCheck, Bell, FileText, Zap, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [formData, setFormData] = useState({ title: '', message: '' });

    /* ── Fetch + auto-mark-all-read on open ─────────────────────── */
    const fetchAndMarkRead = useCallback(async () => {
        try {
            const res = await api.get('/notifications/admin');
            setNotifications(res.data.data);

            const unread = res.data.data.filter(n => !n.isRead);
            if (unread.length > 0) {
                await api.put('/notifications/admin/mark-all-read');
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            }
        } catch (error) {
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAndMarkRead(); }, [fetchAndMarkRead]);

    /* ── Mark single notification as read on click ──────────────── */
    const markOneRead = async (id) => {
        const target = notifications.find(n => n._id === id);
        if (!target || target.isRead) return;

        try {
            await api.put(`/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch { /* silent */ }
    };

    /* ── Broadcast ───────────────────────────────────────────────── */
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleBroadcast = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.message) return toast.error('Title and Message required');
        setIsBroadcasting(true);
        try {
            const result = await api.post('/notifications/broadcast', formData);
            toast.success(result.data.message || 'Priority broadcast sent successfully.');
            setFormData({ title: '', message: '' });
            fetchAndMarkRead();
        } catch {
            toast.error('Failed to execute broadcast protocol.');
        } finally {
            setIsBroadcasting(false);
        }
    };

    /* ── Type badge ──────────────────────────────────────────────── */
    const TypeBadge = ({ type }) => {
        const map = {
            report_update: { cls: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50', icon: <FileText className="w-3 h-3" />, label: 'New Report' },
            new_report: { cls: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50', icon: <FileText className="w-3 h-3" />, label: 'New Report' },
            potential_match: { cls: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50', icon: <Zap className="w-3 h-3" />, label: 'AI Match' },
            system: { cls: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/50', icon: <Bell className="w-3 h-3" />, label: 'System' },
        };
        const { cls, icon, label } = map[type] || { cls: 'bg-stone-50 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700', icon: <Info className="w-3 h-3" />, label: type };
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-extrabold uppercase tracking-widest ${cls}`}>
                {icon}{label}
            </span>
        );
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto font-sans pb-12">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6 transition-colors">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                        <BellRing className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-primary-900 dark:text-white tracking-tight">Notification Control</h1>
                        <p className="text-stone-600 dark:text-stone-400 font-medium mt-1">Launch global announcements and oversee real-time AI alerting systems.</p>
                    </div>
                </div>
                {unreadCount === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-bold text-emerald-700 dark:text-emerald-400"
                    >
                        <CheckCheck className="w-3.5 h-3.5" /> All caught up
                    </motion.div>
                )}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Broadcast form */}
                <div className="md:col-span-1">
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm relative overflow-hidden transition-colors">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
                        <h3 className="text-base font-extrabold flex items-center gap-2 mb-2 text-slate-800 dark:text-white">
                            <Volume2 className="w-5 h-5 text-indigo-500" /> Global Broadcast
                        </h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mb-5 font-medium leading-relaxed">
                            Push a high-priority system alert to all active student accounts across the university network.
                        </p>

                        <form onSubmit={handleBroadcast} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">Headline</label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full bg-stone-50/50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-3 text-sm font-medium text-stone-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-stone-400 transition-colors"
                                    placeholder="e.g. System Maintenance Window"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full bg-stone-50/50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-3 text-sm font-medium text-stone-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-stone-400 transition-colors"
                                    placeholder="Type announcement details here..."
                                    rows={4}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isBroadcasting}
                                className="w-full py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
                            >
                                {isBroadcasting
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <><Send className="w-4 h-4" /> Execute Broadcast</>
                                }
                            </button>
                        </form>
                    </div>
                </div>

                {/* Notification feed */}
                <div className="md:col-span-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm flex flex-col transition-colors">
                    <div className="p-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 flex items-center justify-between">
                        <p className="font-extrabold text-[11px] uppercase tracking-widest text-stone-500 dark:text-stone-400">
                            Live Network Telemetry ({notifications.length})
                        </p>
                        <div className="flex items-center gap-2 text-xs font-bold text-stone-400 dark:text-stone-500">
                            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Unread
                            <span className="w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-600 inline-block ml-2" /> Read
                        </div>
                    </div>

                    <ul className="divide-y divide-stone-100 dark:divide-stone-800/60 flex-1 overflow-y-auto" style={{ maxHeight: '600px' }}>
                        <AnimatePresence initial={false}>
                            {notifications.map((note) => (
                                <motion.li
                                    key={note._id}
                                    layout
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => markOneRead(note._id)}
                                    className={`flex gap-4 p-4 cursor-pointer transition-colors ${
                                        note.isRead
                                            ? 'bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-850'
                                            : 'bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-50 dark:hover:bg-blue-950/40 border-l-4 border-l-blue-500'
                                    }`}
                                >
                                    {/* Unread dot */}
                                    <div className="mt-1.5 flex-shrink-0">
                                        {note.isRead
                                            ? <span className="w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-600 block" />
                                            : <span className="w-2 h-2 rounded-full bg-blue-500 block animate-pulse" />
                                        }
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <TypeBadge type={note.type} />
                                        </div>
                                        <p className={`text-sm mb-0.5 ${note.isRead ? 'font-semibold text-slate-800 dark:text-stone-200' : 'font-bold text-slate-900 dark:text-white'}`}>
                                            {note.title}
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-stone-400 mb-2 leading-snug">{note.message}</p>
                                        <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-stone-500 font-medium">
                                            <span>→ {note.userId?.name || 'Unknown'}</span>
                                            <span>·</span>
                                            <span>{new Date(note.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>

                                    {/* Read status */}
                                    <div className="flex-shrink-0 flex items-start pt-1">
                                        {note.isRead
                                            ? <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-stone-500 flex items-center gap-1">
                                                <CheckCheck className="w-3 h-3" /> Read
                                            </span>
                                            : <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                                                New
                                            </span>
                                        }
                                    </div>
                                </motion.li>
                            ))}
                        </AnimatePresence>

                        {notifications.length === 0 && (
                            <li className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-stone-500">
                                <BellRing className="w-10 h-10 mb-3 text-slate-300 dark:text-stone-600" />
                                <p className="text-xs font-bold uppercase tracking-widest">No notifications yet</p>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminNotifications;
