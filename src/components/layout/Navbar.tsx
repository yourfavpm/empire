'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button, ThemeToggle } from '@/components/ui';
import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';

export function Navbar() {
    const { data: session, status } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [walletBalance, setWalletBalance] = useState<number>(0);

    // Fetch wallet balance
    useEffect(() => {
        if (status === 'authenticated') {
            fetch('/api/wallet')
                .then(res => res.json())
                .then(data => {
                    if (data.balance !== undefined) {
                        setWalletBalance(Number(data.balance));
                    }
                })
                .catch(() => setWalletBalance(0));
        }
    }, [status]);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <img src="/dylogo.png" alt="DigiMarket" className="h-10 w-auto" />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/assets" className="text-slate-300 hover:text-white transition-colors">
                            Browse Assets
                        </Link>

                        {status === 'authenticated' ? (
                            <>
                                {session.user.role === 'ADMIN' ? (
                                    <Link href="/admin" className="text-slate-300 hover:text-white transition-colors">
                                        Admin Dashboard
                                    </Link>
                                ) : (
                                    <Link href="/buyer" className="text-slate-300 hover:text-white transition-colors">
                                        My Dashboard
                                    </Link>
                                )}
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-slate-400">
                                        {session.user.name}
                                    </span>
                                    <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                                        Sign Out
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">Sign In</Button>
                                </Link>
                                <Link href="/signup">
                                    <Button size="sm">Get Started</Button>
                                </Link>
                            </div>
                        )}

                        {/* Theme Toggle */}
                        <ThemeToggle />
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center gap-2">
                        <ThemeToggle />
                        <button
                            className="text-slate-400 hover:text-white p-2"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-slate-800">
                        {/* Wallet Balance Card */}
                        <div className="mb-4 p-4 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border border-cyan-500/20 rounded-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400">Wallet Balance</p>
                                        <p className="text-lg font-bold text-white">
                                            {status === 'authenticated' ? formatCurrency(walletBalance) : formatCurrency(0)}
                                        </p>
                                    </div>
                                </div>
                                <Link href={status === 'authenticated' ? '/buyer/wallet' : '/login'}>
                                    <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                                        {status === 'authenticated' ? 'Fund' : 'Login'}
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="space-y-1">
                            <Link
                                href="/assets"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                Browse Assets
                            </Link>

                            {status === 'authenticated' && session.user.role !== 'ADMIN' && (
                                <Link
                                    href="/buyer/wallet"
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Fund Wallet
                                </Link>
                            )}

                            {status === 'authenticated' ? (
                                <>
                                    <Link
                                        href={session.user.role === 'ADMIN' ? '/admin' : '/buyer'}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                        {session.user.role === 'ADMIN' ? 'Admin Dashboard' : 'Dashboard'}
                                    </Link>

                                    {/* User Profile */}
                                    <div className="px-4 py-3 border-t border-slate-700/50 mt-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                                                <span className="text-white font-medium">
                                                    {session.user.name?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-white">{session.user.name}</p>
                                                <p className="text-xs text-slate-400">{session.user.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setMobileMenuOpen(false);
                                            signOut({ callbackUrl: '/' });
                                        }}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-2 pt-2 border-t border-slate-700/50">
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="outline" className="w-full border-amber-500/30 text-amber-400">
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                                        <Button className="w-full">
                                            Get Started Free
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
