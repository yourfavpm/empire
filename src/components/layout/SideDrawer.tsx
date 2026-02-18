
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { X, ExternalLink, Wallet, LayoutDashboard, History, MessageCircle } from 'lucide-react';

interface SideDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SideDrawer({ isOpen, onClose }: SideDrawerProps) {
    const { data: session, status } = useSession();
    const [walletBalance, setWalletBalance] = useState(0);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            if (status === 'authenticated') {
                fetch('/api/wallet')
                    .then(res => res.json())
                    .then(data => setWalletBalance(Number(data.balance || 0)))
                    .catch(() => setWalletBalance(0));
            }
        } else {
            document.body.style.overflow = 'unset';
            // Reset balance display if needed or keep cache
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, status]);

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-60 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`fixed inset-y-0 right-0 w-[85%] max-w-[320px] bg-white border-l border-slate-100 shadow-2xl z-70 transform transition-transform duration-300 ease-out flex flex-col md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="p-5 flex items-center justify-between border-b border-slate-50">
                    <h2 className="text-sm font-bold text-brand uppercase tracking-widest">Navigation</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-brand transition-colors p-2 bg-slate-50 rounded-full">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-8">

                    {/* Wallet Section - Premium Card */}
                    <div className="bg-linear-to-br from-slate-50 to-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Wallet className="w-12 h-12 text-brand" />
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Available Funds</span>
                        </div>
                        <div className="text-2xl font-bold text-brand mb-6 tracking-tight">
                            {status === 'authenticated' ? formatCurrency(walletBalance) : '₦0.00'}
                        </div>
                        {status === 'authenticated' ? (
                            <Link href="/buyer/wallet" onClick={onClose} className="block">
                                <Button className="w-full bg-brand hover:bg-brand-light text-white font-bold text-[10px] uppercase tracking-widest h-10 shadow-lg shadow-brand/10 transition-all">
                                    Top Up Capital
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/login" onClick={onClose} className="block">
                                <Button className="w-full bg-brand hover:bg-brand-light text-white font-bold text-[10px] uppercase tracking-widest h-10 shadow-lg shadow-brand/10 transition-all">
                                    Sign In
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-4">
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-4">Main Menu</p>

                        {status === 'authenticated' && (
                            <Link
                                href={session.user.role === 'ADMIN' || session.user.role.includes('_ADMIN') ? '/admin' : '/buyer'}
                                onClick={onClose}
                                className="flex items-center gap-4 p-4 text-brand bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all group"
                            >
                                <LayoutDashboard className="w-4 h-4 text-brand" />
                                <span className="font-bold text-xs uppercase tracking-widest">Dashboard</span>
                            </Link>
                        )}

                        {status !== 'authenticated' && (
                            <Link href="/login" onClick={onClose} className="flex items-center gap-4 p-4 text-slate-600 hover:text-brand hover:bg-slate-50 rounded-2xl transition-all group">
                                <LayoutDashboard className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                                <span className="font-bold text-xs uppercase tracking-widest">Dashboard</span>
                            </Link>
                        )}

                        <Link href="/assets" onClick={onClose} className="flex items-center gap-4 p-4 text-slate-600 hover:text-brand hover:bg-slate-50 rounded-2xl transition-all group">
                            <History className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                            <span className="font-bold text-xs uppercase tracking-widest">Logs</span>
                        </Link>

                        <div className="h-px bg-slate-100 my-4" />
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-4">Support & Tools</p>

                        <Link href="/buyer/messages" onClick={onClose} className="flex items-center gap-4 p-4 text-slate-600 hover:text-brand hover:bg-slate-50 rounded-2xl transition-all group">
                            <MessageCircle className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                            <span className="font-bold text-xs uppercase tracking-widest">Help Center</span>
                        </Link>

                        <Link href="/buyer/referral" onClick={onClose} className="flex items-center gap-4 p-4 text-slate-600 hover:text-brand hover:bg-slate-50 rounded-2xl transition-all group">
                            <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                            <span className="font-bold text-xs uppercase tracking-widest">Referral Program</span>
                        </Link>

                        <a href="https://tworldverify.com.ng" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl transition-all group">
                            <ExternalLink className="w-4 h-4" />
                            <span className="font-bold text-xs uppercase tracking-widest">Foreign Numbers</span>
                        </a>
                    </nav>

                </div>

                {/* Footer / Logout */}
                {status === 'authenticated' && (
                    <div className="p-6 border-t border-slate-50 pb-10">
                        <button
                            onClick={() => { signOut(); onClose(); }}
                            className="w-full flex items-center justify-center gap-2 p-4 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest"
                        >
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
