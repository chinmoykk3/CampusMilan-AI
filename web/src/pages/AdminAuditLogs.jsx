import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { Loader2, ShieldCheck, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminAuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            const res = await api.get('/admin/audit');
            setLogs(res.data.data);
        } catch (error) {
            toast.error("Failed to load audit logs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleExport = async () => {
        try {
            const res = await api.get('/admin/audit/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'campusमिलन_audit_logs.csv');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            toast.success("Forensic CSV exported.");
        } catch (error) {
            toast.error("Failed to export logs");
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
    );

    const EntityBadge = ({ type }) => {
        switch (type) {
            case 'user':
                return <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 px-2 py-0.5 rounded font-extrabold uppercase tracking-widest text-[10px]">User Node</span>;
            case 'category':
                return <span className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800/60 px-2 py-0.5 rounded font-extrabold uppercase tracking-widest text-[10px]">Category</span>;
            case 'location':
                return <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded font-extrabold uppercase tracking-widest text-[10px]">Location Node</span>;
            case 'report':
                return <span className="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 px-2 py-0.5 rounded font-extrabold uppercase tracking-widest text-[10px]">Report</span>;
            default:
                return <span className="text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-2 py-0.5 rounded font-extrabold uppercase tracking-widest text-[10px]">{type}</span>;
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-12 font-sans px-4 sm:px-6 lg:px-8 pt-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6 transition-colors">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-100 dark:border-purple-900/50 flex-shrink-0">
                        <ShieldCheck className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-primary-900 dark:text-white tracking-tight">System Audit Log</h1>
                        <p className="text-stone-600 dark:text-stone-400 font-medium mt-1">Immutable ledger recording all administrative actions across the platform.</p>
                    </div>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm whitespace-nowrap shadow-sm transition-colors"
                >
                    <Download className="w-4 h-4" /> Download Forensic CSV
                </button>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-max">
                        <thead>
                            <tr className="bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-800 uppercase text-[11px] tracking-widest font-extrabold text-stone-500 dark:text-stone-400">
                                <th className="p-4">Timestamp</th>
                                <th className="p-4">Administrator</th>
                                <th className="p-4">Action Invoked</th>
                                <th className="p-4">Target Resource</th>
                                <th className="p-4 text-right">Sys Info</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                            {logs.map((log) => (
                                <tr key={log._id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40 transition-colors">
                                    <td className="p-4 whitespace-nowrap">
                                        <p className="font-bold text-primary-900 dark:text-white text-sm tracking-tight">{new Date(log.createdAt).toLocaleDateString()}</p>
                                        <p className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold mt-0.5 tracking-tight">{new Date(log.createdAt).toLocaleTimeString()}</p>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-sm font-bold text-primary-900 dark:text-white">{log.actorUserId?.name || 'Unknown'}</p>
                                        <p className="text-[11px] font-semibold text-primary-600 dark:text-primary-400 mt-0.5">{log.actorUserId?.email || 'N/A'}</p>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-[11px] font-bold text-stone-700 dark:text-stone-300">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="mb-1"><EntityBadge type={log.entityType} /></div>
                                        <p className="text-[10px] font-bold text-stone-500 dark:text-stone-400 truncate font-mono bg-stone-50 dark:bg-stone-800/80 px-1.5 py-0.5 rounded inline-block border border-stone-200 dark:border-stone-700">
                                            ID: {log.entityId ? log.entityId.slice(-8) : 'N/A'}
                                        </p>
                                    </td>
                                    <td className="p-4 text-right">
                                        <p className="text-[11px] font-bold text-stone-500 dark:text-stone-400 font-mono" title={log.userAgent}>
                                            {log.ipAddress || 'Internal'}
                                        </p>
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-16 text-center text-stone-500 dark:text-stone-400 font-extrabold tracking-widest text-[11px] uppercase bg-stone-50 dark:bg-stone-900/30">
                                        No administrative actions have been logged yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminAuditLogs;
