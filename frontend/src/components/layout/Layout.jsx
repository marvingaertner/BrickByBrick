import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { Home, CreditCard, FileText, Grid, User } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

const SidebarItem = ({ icon: Icon, label, to, active }) => {
    return (
        <Link
            to={to}
            className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1',
                active
                    ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-action-hover)]'
            )}
        >
            <Icon size={20} />
            <span>{label}</span>
        </Link>
    );
};

const BottomNav = ({ navItems }) => {
    const location = useLocation();

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] z-50 px-6 py-2 flex justify-between items-center safe-area-bottom">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={clsx(
                            'flex flex-col items-center justify-center p-2 rounded-lg transition-colors',
                            isActive
                                ? 'text-[var(--color-primary)]'
                                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-action-hover)]'
                        )}
                    >
                        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                    </Link>
                );
            })}
        </div>
    );
};

const Layout = ({ children }) => {
    const location = useLocation();

    const navItems = [
        { label: 'Dashboard', icon: Home, to: '/' },
        { label: 'Management', icon: Grid, to: '/management' },
        { label: 'Status', icon: FileText, to: '/status' },
    ];

    return (
        <div className="flex min-h-screen bg-[var(--color-background)]">
            {/* Sidebar - Desktop */}
            <aside className="w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)] fixed h-full hidden md:flex flex-col z-20">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-[var(--color-primary)]">BrickByBrick</h1>
                    <p className="text-xs text-[var(--color-text-secondary)]">House Finance Tracker</p>
                </div>

                <nav className="flex-1 px-4 py-4">
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.to}
                            {...item}
                            active={location.pathname === item.to}
                        />
                    ))}
                </nav>
            </aside>

            {/* Mobile Bottom Navigation */}
            <BottomNav navItems={navItems} />

            {/* Main Content */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen pb-20 md:pb-0">
                {/* Top Bar */}
                <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] h-16 flex items-center justify-between md:justify-end px-4 md:px-8 sticky top-0 z-10">
                    <div className="md:hidden flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold">
                            B
                        </div>
                        <span className="font-bold text-[var(--color-text-primary)]">BrickByBrick</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <span className="text-sm font-medium text-[var(--color-text-primary)] hidden sm:block">Marvin Gärtner</span>
                        <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)]">
                            <User size={18} />
                        </div>
                    </div>
                </header>

                <main className="p-4 md:p-8">
                    {children}
                </main>
            </div >
        </div >
    );
};

export default Layout;
