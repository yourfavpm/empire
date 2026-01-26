'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSession, signOut } from 'next-auth/react';

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Assets', href: '/admin/assets', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { name: 'Users', href: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { name: 'Payments', href: '/admin/payments', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { name: 'Messages', href: '/admin/messages', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { name: 'Team', href: '/admin/team', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'Settings', href: '/admin/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

interface NavContentProps {
    navigation: any[];
    pathname: string;
    isCollapsed: boolean;
    mobile?: boolean;
    onClose?: () => void;
    user: any;
}

function NavContent({ navigation, pathname, isCollapsed, mobile, onClose, user }: NavContentProps) {
    return (
        <div className="flex flex-col h-full bg-brand">
            {/* Logo Area */}
            <div className={cn(
                "h-20 flex items-center border-b border-white/10 transition-all duration-300",
                isCollapsed && !mobile ? "px-0 justify-center" : "px-8"
            )}>
                <Link href="/admin" onClick={onClose} className="flex items-center space-x-3 group">
                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-black/20 transition-transform flex-shrink-0">
                        <span className="text-brand font-black text-xs">E</span>
                    </div>
                    {(!isCollapsed || mobile) && (
                        <div className="flex flex-col -space-y-0.5 select-none text-white">
                            <span className="text-[14px] font-bold tracking-widest uppercase whitespace-nowrap">
                                Empire <span className="opacity-60 font-medium">OS</span>
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-widest leading-none mt-1.5 opacity-80">Admin Terminal</span>
                        </div>
                    )}
                </Link>
            </div>

            {/* Navigation Container */}
            <div className="flex-1 overflow-y-auto py-8 custom-scrollbar">
                <div className={cn("px-4 mb-6 transition-all", isCollapsed && !mobile ? "px-2" : "px-5")}>
                    {(!isCollapsed || mobile) && (
                        <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-5 px-3 opacity-40">System Modules</p>
                    )}
                    <nav className="space-y-1.5 font-sans">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    title={isCollapsed && !mobile ? item.name : undefined}
                                    onClick={onClose}
                                    className={cn(
                                        'flex items-center rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 group relative',
                                        isCollapsed && !mobile ? 'p-3.5 justify-center' : 'px-4 py-3',
                                        isActive
                                            ? 'bg-white text-brand shadow-md'
                                            : 'text-white hover:bg-white/10'
                                    )}
                                >
                                    <div className={cn("flex items-center justify-center flex-shrink-0", !isCollapsed || mobile ? "mr-3" : "")}>
                                        <svg className={cn("w-5 h-5", isActive ? "text-brand" : "text-white opacity-70 group-hover:opacity-100")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d={item.icon} />
                                        </svg>
                                    </div>
                                    {(!isCollapsed || mobile) && <span className="truncate flex-1">{item.name}</span>}

                                    {isCollapsed && !mobile && isActive && (
                                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-l-full shadow-[0_0_12px_rgba(255,255,255,0.4)]" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Secondary Actions */}
                <div className={cn("px-4 mt-8 pt-8 border-t border-white/10 transition-all", isCollapsed && !mobile ? "px-2" : "px-5")}>
                    {(!isCollapsed || mobile) && (
                        <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-5 px-3 opacity-40">Terminal Switch</p>
                    )}
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className={cn(
                            "flex items-center w-full rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-colors group",
                            isCollapsed && !mobile ? "p-3.5 justify-center" : "px-4 py-3",
                            "text-white bg-white/5 hover:bg-white/10"
                        )}
                    >
                        <div className={cn("flex items-center justify-center flex-shrink-0", !isCollapsed || mobile ? "mr-3" : "")}>
                            <svg className={cn("w-5 h-5 text-white opacity-70 group-hover:opacity-100 transition-opacity")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                            </svg>
                        </div>
                        {(!isCollapsed || mobile) && <span>Exit Portal</span>}
                    </button>
                </div>
            </div>

            {/* User Profile Summary */}
            <div className={cn("p-6 border-t border-white/10 bg-black/20 transition-all", isCollapsed && !mobile ? "p-4 justify-center" : "p-6")}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center font-black text-white text-xs flex-shrink-0 shadow-inner">
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    {(!isCollapsed || mobile) && (
                        <div className="flex-1 overflow-hidden">
                            <p className="text-[11px] font-black text-white truncate uppercase tracking-tight leading-none mb-1">{user?.name || 'Authorized Admin'}</p>
                            <p className="text-[10px] text-white font-bold truncate opacity-60">{user?.email}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const userRole = session?.user?.role;
    const loading = status === 'loading';

    const filteredNavigation = navigation.filter(item => {
        if (loading) return true;
        if (!userRole) return false;

        if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') return true;
        if (userRole === 'INVENTORY_MANAGER') return ['Dashboard', 'Assets'].includes(item.name);
        if (userRole === 'FINANCE_MANAGER') return ['Dashboard', 'Payments', 'Users'].includes(item.name);
        if (userRole === 'GENERAL_ADMIN') return item.name !== 'Team';
        return false;
    });

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Mobile Header (Fixed) */}
            <div className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 z-[80] md:hidden shadow-sm">
                <Link href="/admin" className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20">
                        <span className="text-white font-black text-[14px]">E</span>
                    </div>
                    <div className="flex flex-col -space-y-1">
                        <span className="text-[15px] font-black text-brand tracking-widest uppercase leading-none">Empire</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Administrative Terminal</span>
                    </div>
                </Link>
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-brand bg-slate-50 border border-slate-100 rounded-2xl"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                </button>
            </div>

            {/* Desktop Sidebar (Fixed) */}
            <aside
                className={cn(
                    "hidden md:block fixed inset-y-0 left-0 bg-brand z-[100] transition-all duration-300 ease-in-out border-r border-white/5",
                    isCollapsed ? "w-20" : "w-64"
                )}
            >
                <NavContent
                    navigation={filteredNavigation}
                    pathname={pathname}
                    isCollapsed={isCollapsed}
                    user={session?.user}
                />

                {/* Collapse Toggle Handle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-24 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-xl text-brand z-[110] transition-all hover:scale-110 active:scale-95 group"
                >
                    <svg className={cn("w-3 h-3 transition-transform duration-500", !isCollapsed ? "" : "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            </aside>

            {/* Mobile Sidebar / Drawer (Fixed Overlay) */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[120] md:hidden">
                    <div className="absolute inset-0 bg-brand/60 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)} />
                    <aside className="absolute inset-y-0 left-0 w-80 bg-brand shadow-2xl animate-in slide-in-from-left duration-500">
                        <NavContent
                            navigation={filteredNavigation}
                            pathname={pathname}
                            isCollapsed={false}
                            mobile
                            onClose={() => setIsMobileMenuOpen(false)}
                            user={session?.user}
                        />
                    </aside>
                </div>
            )}

            {/* Main Content Area */}
            <main
                className={cn(
                    "flex-1 min-h-screen transition-all duration-300 ease-in-out",
                    "pt-20 md:pt-0", // Space for mobile header on mobile
                    isCollapsed ? "md:ml-20" : "md:ml-64"
                )}
            >
                <div className="p-6 md:p-12 lg:p-16 max-w-[1600px] mx-auto min-h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
