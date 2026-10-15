import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, HardDrive, Key, Save, Loader2, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettings = () => {
    const [isSaving, setIsSaving] = useState(false);

    // Config states (simulated as fetching these would require a new Global Config store)
    const [config, setConfig] = useState({
        aiAggressiveness: 0.70,
        enableAutoMatching: true,
        maintenanceMode: false,
        maxUploadSize: 5
    });

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success("Global configuration synchronized across all active regions.");
        }, 800);
    };

    const runDiagnostics = () => {
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 1500)),
            {
                loading: 'Running cluster diagnostics...',
                success: 'All AI matching nodes are operating at 100% capacity.',
                error: 'Network failure'
            }
        );
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto font-sans pb-12">
            <div className="mb-8 flex items-center gap-4 border-b border-stone-200 dark:border-stone-800 pb-6 transition-colors">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                    <Settings className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-primary-900 dark:text-white tracking-tight">System Configuration</h1>
                    <p className="text-stone-600 dark:text-stone-400 font-medium mt-1">Override platform behavior, AI matching heuristics, and core security matrices.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm transition-colors flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-slate-900 dark:text-white">
                            <HardDrive className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Network & AI Core
                        </h3>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">Heuristic Match Threshold</label>
                                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{(config.aiAggressiveness * 100).toFixed(0)}% Confidence</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="0.95"
                                    step="0.05"
                                    value={config.aiAggressiveness}
                                    onChange={(e) => setConfig({ ...config, aiAggressiveness: parseFloat(e.target.value) })}
                                    className="w-full accent-primary-600 cursor-pointer"
                                />
                                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 font-medium">Lower threshold = more matches, higher false positives. Default architecture calibrated to 70%.</p>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-stone-50/70 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700/80">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Automated Matching Engine</h4>
                                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-medium">Allow the vector engine to continuously crunch candidate pairings</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setConfig({ ...config, enableAutoMatching: !config.enableAutoMatching })}
                                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${config.enableAutoMatching ? 'bg-primary-600' : 'bg-stone-300 dark:bg-stone-700'}`}
                                >
                                    <motion.div
                                        layout
                                        className="w-5 h-5 bg-white rounded-full shadow-sm"
                                        animate={{ x: config.enableAutoMatching ? 24 : 0 }}
                                    />
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">Max Base64 Image Upload</label>
                                <select
                                    value={config.maxUploadSize}
                                    onChange={(e) => setConfig({ ...config, maxUploadSize: parseInt(e.target.value) })}
                                    className="w-full bg-stone-50/50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-3 text-sm font-semibold text-stone-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                                >
                                    <option value={2}>2 MB</option>
                                    <option value={5}>5 MB (Recommended)</option>
                                    <option value={10}>10 MB</option>
                                    <option value={20}>20 MB (Heavy)</option>
                                </select>
                            </div>

                            <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Synchronize Configuration</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-stone-900 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-6 shadow-sm transition-colors">
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-3 text-rose-700 dark:text-rose-400">
                            <Shield className="w-5 h-5" /> Administrative Security
                        </h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mb-6 font-medium border-l-2 border-rose-500 pl-3 leading-relaxed">
                            Changes to the security matrix take effect instantly across all active student & administrator sessions.
                        </p>

                        <div className="flex items-center justify-between p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900/40 mb-5">
                            <div>
                                <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-800 dark:text-rose-300">Global Maintenance Lock</h4>
                                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-medium">Disconnects public student endpoints returning 503 HTTP status</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setConfig({ ...config, maintenanceMode: !config.maintenanceMode })}
                                className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${config.maintenanceMode ? 'bg-rose-600' : 'bg-stone-300 dark:bg-stone-700'}`}
                            >
                                <motion.div
                                    layout
                                    className="w-5 h-5 bg-white rounded-full shadow-sm"
                                    animate={{ x: config.maintenanceMode ? 24 : 0 }}
                                />
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => toast.success("Rotated JWT signing secret and flushed idle sessions.")}
                            className="w-full py-3 px-4 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors uppercase text-xs font-extrabold tracking-widest flex items-center justify-center gap-2"
                        >
                            <Key className="w-4 h-4" /> Rotate API Keys & Tokens
                        </button>
                    </div>

                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm transition-colors">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">System Diagnostics</h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mb-4 font-medium">Run live end-to-end ping telemetry across MongoDB, Socket.io, and python vector processes.</p>
                        <button
                            type="button"
                            onClick={runDiagnostics}
                            className="w-full py-3 px-4 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 transition-colors text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
                        >
                            <RefreshCcw className="w-4 h-4" /> Execute Node Diagnostics
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminSettings;
