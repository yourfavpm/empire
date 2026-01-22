'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Assets', href: '/admin/assets', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { name: 'Users', href: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { name: 'Payments', href: '/admin/payments', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { name: 'Messages', href: '/admin/messages', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800">
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="h-16 flex items-center px-6 border-b border-slate-800">
                        <Link href="/admin" className="flex items-center space-x-2">
                            <img src="/dylogo.png" alt="Admin Panel" className="h-8 w-auto" />
                            <span className="text-lg font-bold text-white">Admin</span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-cyan-500/20 text-cyan-400'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    )}
                                >
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                    </svg>
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-800">
                        <Link
                            href="/"
                            className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                            </svg>
                            Back to Site
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 flex-1 min-h-screen">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
