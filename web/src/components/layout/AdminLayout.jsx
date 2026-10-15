import React, { useEffect, useState, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, LogOut, Settings, Database, Tags, MapPin, ShieldCheck, BellRing, BarChart3, ShieldAlert, Menu, X, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../api/axios';
import { ThemeToggle } from '../ui/ThemeToggle';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuthStore();
    const [unreadCount, setUnreadCount] = useState(0);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pollRef = useRef(null);

    const fetchUnreadCount = async () => {
        try {
            const res = await api.get('/notifications/admin/unread-count');
            setUnreadCount(res.data.count || 0);
        } catch {
            // silently ignore — user might not be admin yet
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        pollRef.current = setInterval(fetchUnreadCount, 30000); // poll every 30s
        return () => clearInterval(pollRef.current);
    }, []);

    // Refresh badge count from DB when admin visits the notifications page
    useEffect(() => {
        if (location.pathname === '/admin/notifications') {
            const t = setTimeout(fetchUnreadCount, 800);
            return () => clearTimeout(t);
        }
    }, [location.pathname]);

    // Close mobile nav on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const sidebarLinks = [
        { path: '/admin', icon: <BarChart3 className="w-5 h-5" />, name: 'Analytics' },
        { path: '/admin/users', icon: <Users className="w-5 h-5" />, name: 'Manage Users' },
        { path: '/admin/reports', icon: <Database className="w-5 h-5" />, name: 'Case Control' },
        { path: '/admin/matches', icon: <ShieldAlert className="w-5 h-5" />, name: 'AI Matches' },
        { path: '/admin/categories', icon: <Tags className="w-5 h-5" />, name: 'Categories' },
        { path: '/admin/locations', icon: <MapPin className="w-5 h-5" />, name: 'Locations' },
        { path: '/admin/notifications', icon: <BellRing className="w-5 h-5" />, name: 'Broadcasts', badge: unreadCount },
        { path: '/admin/audit', icon: <ShieldCheck className="w-5 h-5" />, name: 'Audit Logs' },
        { path: '/admin/settings', icon: <Settings className="w-5 h-5" />, name: 'Settings' },
    ];

    const currentTitle = sidebarLinks.find(l => l.path === location.pathname)?.name || location.pathname.split('/').pop() || 'Dashboard';

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-stone-950 text-slate-900 dark:text-stone-100 overflow-hidden font-sans transition-colors duration-200">
            {/* Desktop Sidebar */}
            <aside className="w-72 hidden md:flex flex-col bg-white dark:bg-stone-900 border-r border-slate-200 dark:border-stone-800 relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                <div className="p-6 border-b border-slate-100 dark:border-stone-800 flex items-center justify-between">
                    <Link to="/admin" className="flex items-center gap-3">
                        <div className="bg-primary-600 text-white p-2 rounded-lg shadow-sm">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <span className="font-extrabold text-xl tracking-tight text-primary-900 dark:text-white font-display">
                            Campusमिलन<span className="font-medium text-primary-600 dark:text-primary-400"> Admin</span>
                        </span>
                    </Link>
                    <ThemeToggle />
                </div>

                <div className="p-6 overflow-y-auto flex-1 h-0 scrollbar-hide">
                    <p className="text-[10px] font-extrabold text-slate-400 dark:text-stone-500 uppercase tracking-widest mb-4">Command Center</p>
                    <nav className="space-y-1">
                        {sidebarLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold ${
                                        isActive
                                            ? 'bg-primary-50 dark:bg-stone-800 text-primary-700 dark:text-primary-300 shadow-sm border border-primary-100/50 dark:border-stone-700'
                                            : 'text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-stone-100 hover:bg-slate-100/80 dark:hover:bg-stone-800/60 border border-transparent'
                                    }`}
                                >
                                    {link.icon}
                                    <span className="text-sm flex-1">{link.name}</span>

                                    {/* Notification Badge */}
                                    {link.badge > 0 && (
                                        <motion.span
                                            key={link.badge}
                                            initial={{ scale: 0.6, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm"
                                        >
                                            {link.badge > 99 ? '99+' : link.badge}
                                        </motion.span>
                                    )}

                                    {isActive && (
                                        <motion.div layoutId="sidebar-indicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary-600 dark:bg-primary-400 rounded-r-full" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-5 border-t border-slate-100 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-900/50">
                    <div className="flex items-center gap-3 mb-3 p-3 bg-white dark:bg-stone-800/80 rounded-xl border border-slate-200/80 dark:border-stone-700/80 shadow-sm">
                        <div className="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-950/60 flex items-center justify-center text-primary-700 dark:text-primary-400 font-extrabold text-sm border border-primary-200 dark:border-primary-800">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name || 'Administrator'}</p>
                            <p className="text-[11px] font-semibold text-slate-500 dark:text-stone-400 truncate">{user?.role || 'Super Admin'}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30"
                    >
                        <LogOut className="w-4 h-4" />
                        Terminate Session
                    </button>
                    <Link
                        to="/"
                        className="mt-1.5 flex items-center justify-center gap-2 w-full px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-stone-400 hover:text-slate-900 dark:hover:text-stone-200 hover:bg-slate-100 dark:hover:bg-stone-800/70 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Return to Public App
                    </Link>
                </div>
            </aside>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
                            className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-stone-900 border-r border-slate-200 dark:border-stone-800 z-50 flex flex-col md:hidden shadow-2xl"
                        >
                            <div className="p-5 border-b border-slate-100 dark:border-stone-800 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="bg-primary-600 text-white p-1.5 rounded-lg">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <span className="font-extrabold text-lg text-slate-900 dark:text-white font-display">CampusAdmin</span>
                                </div>
                                <button
                                    onClick={() => setMobileOpen(false)}
                                    className="p-1.5 text-slate-500 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-stone-800 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-4 overflow-y-auto flex-1">
                                <p className="text-[10px] font-extrabold text-slate-400 dark:text-stone-500 uppercase tracking-widest mb-3">Command Center</p>
                                <nav className="space-y-1">
                                    {sidebarLinks.map((link) => {
                                        const isActive = location.pathname === link.path;
                                        return (
                                            <Link
                                                key={link.name}
                                                to={link.path}
                                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm ${
                                                    isActive
                                                        ? 'bg-primary-50 dark:bg-stone-800 text-primary-700 dark:text-primary-300'
                                                        : 'text-slate-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-stone-800'
                                                }`}
                                            >
                                                {link.icon}
                                                <span className="flex-1">{link.name}</span>
                                                {link.badge > 0 && (
                                                    <span className="min-w-[18px] h-4.5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center">
                                                        {link.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>

                            <div className="p-4 border-t border-slate-100 dark:border-stone-800 mt-auto flex flex-col gap-2">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center justify-center gap-2 w-full px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 rounded-xl"
                                >
                                    <LogOut className="w-4 h-4" /> Terminate Session
                                </button>
                                <Link
                                    to="/"
                                    className="flex items-center justify-center gap-2 w-full px-4 py-2 text-xs font-bold text-slate-600 dark:text-stone-400 bg-slate-100 dark:bg-stone-800 rounded-xl"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" /> Return to Public App
                                </Link>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-50/50 dark:bg-stone-950">
                {/* Admin Top Header (Mobile) */}
                <header className="h-16 md:hidden flex items-center justify-between px-4 bg-white dark:bg-stone-900 border-b border-slate-200 dark:border-stone-800 flex-shrink-0 z-10 shadow-sm">
                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="p-2 text-slate-700 dark:text-stone-200 hover:bg-slate-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
                            aria-label="Open sidebar menu"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <span className="font-extrabold text-lg text-slate-900 dark:text-white font-display">CampusAdmin</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <button
                            onClick={handleLogout}
                            className="p-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-xl"
                            title="Log Out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto w-full">
                    {/* Breadcrumbs */}
                    <div className="px-6 md:px-10 pt-6 pb-2 max-w-7xl mx-auto w-full relative z-10">
                        <div className="flex items-center text-xs font-medium text-slate-400 dark:text-stone-500 mb-2 gap-2">
                            <span>Admin Portal</span>
                            <span className="text-slate-300 dark:text-stone-600">/</span>
                            <span className="text-primary-600 dark:text-primary-400 font-semibold">{currentTitle}</span>
                        </div>
                    </div>

                    <div className="px-6 md:px-10 pb-12 max-w-7xl mx-auto w-full relative z-10">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ ease: 'easeOut', duration: 0.18 }}
                        >
                            <Outlet />
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
