import React from 'react';
import Navbar from './Navbar';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const UserLayout = () => {
    const location = useLocation();

    // Create breadcrumb array from pathname
    const pathnames = location.pathname.split('/').filter(x => x);
    const isInternalPage = pathnames.length > 0 && !['login', 'register'].includes(pathnames[0]);

    return (
        <div className="min-h-screen flex flex-col bg-stone-50/40 dark:bg-stone-950 text-slate-900 dark:text-stone-100 transition-colors duration-200">
            <Navbar />
            <motion.main
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 w-full relative z-10"
            >
                {isInternalPage && (
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
                        <div className="flex items-center text-xs font-medium text-stone-500 dark:text-stone-400 gap-2">
                            <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Home</Link>
                            {pathnames.map((value, index) => {
                                const last = index === pathnames.length - 1;
                                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                                const displayValue = value.charAt(0).toUpperCase() + value.slice(1);
                                return (
                                    <React.Fragment key={to}>
                                        <span className="text-stone-400 dark:text-stone-600">/</span>
                                        {last ? (
                                            <span className="text-primary-600 dark:text-primary-400 font-semibold">{displayValue}</span>
                                        ) : (
                                            <Link to={to} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{displayValue}</Link>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                )}
                <div className={`${isInternalPage ? 'py-4' : ''} w-full`}>
                    <Outlet />
                </div>
            </motion.main>
        </div>
    );
};

export default UserLayout;
