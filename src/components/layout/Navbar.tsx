'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui';
import { useState } from 'react';
import { HeaderBanner } from './HeaderBanner';
import { SideDrawer } from './SideDrawer';
import { Menu } from 'lucide-react';

export function Navbar() {
    const { data: session, status } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
            {/* Scrolling Banner */}
            <HeaderBanner />

            {/* Main Navbar */}
            <nav className="bg-brand border-b border-brand-dark w-full relative shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-2">
                             <Image src="/dylogo.png" alt="DY Empire" width={40} height={40} className="h-10 w-auto object-contain" />
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="/assets" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
                                Browse Logs
                            </Link>

                            {status === 'authenticated' ? (
                                <>
                                    {session.user.role === 'ADMIN' ? (
                                        <Link href="/admin" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
                                            Admin Dashboard
                                        </Link>
                                    ) : (
                                        <Link href="/buyer" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
                                            Dashboard
                                        </Link>
                                    )}
                                    <div className="flex items-center space-x-4">
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-bold text-white leading-none">
                                                {session.user.name}
                                            </span>
                                            <span className="text-[10px] text-white/70 leading-none mt-1">
                                                {session.user.email}
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => signOut({ callbackUrl: '/' })}
                                            className="text-xs text-white hover:bg-white/10"
                                        >
                                            Sign Out
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <Link href="/login">
                                        <Button variant="ghost" size="sm" className="text-white hover:bg-brand-dark">Sign In</Button>
                                    </Link>
                                    <Link href="/signup">
                                        <Button size="sm" className="bg-white hover:bg-slate-100 text-brand font-bold border-none">Get Started</Button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center gap-4">
                            <button
                                className="text-white hover:text-slate-200 transition-colors"
                                onClick={() => setMobileMenuOpen(true)}
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Side Drawer */}
            <SideDrawer isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        </div>
    );
}

