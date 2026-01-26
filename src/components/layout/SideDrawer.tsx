
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { X, ExternalLink, Wallet, LayoutDashboard, History, MessageCircle, HelpCircle } from 'lucide-react';

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
                className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`fixed inset-y-0 right-0 w-[85%] max-w-[320px] bg-slate-900 border-l border-slate-800 z-[70] transform transition-transform duration-300 ease-out flex flex-col md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="p-4 flex items-center justify-between border-b border-slate-800/50">
                    <h2 className="text-lg font-bold text-white tracking-tight">Menu</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">

                    {/* Wallet Section */}
                    <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs uppercase font-bold text-slate-500">Wallet Balance</span>
                            <Wallet className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="text-2xl font-black text-white mb-3">
                            {status === 'authenticated' ? formatCurrency(walletBalance) : '₦0.00'}
                        </div>
                        {status === 'authenticated' ? (
                            <Link href="/buyer/wallet" onClick={onClose}>
                                <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-8">Add Funds</Button>
                            </Link>
                        ) : (
                            <Link href="/login" onClick={onClose}>
                                <Button size="sm" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold h-8">Login to Fund</Button>
                            </Link>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-1">
                        <Link href="/" onClick={onClose} className="flex items-center gap-3 p-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
                            <LayoutDashboard className="w-4 h-4" />
                            <span className="font-medium text-sm">Home</span>
                        </Link>
                        <Link href="/assets" onClick={onClose} className="flex items-center gap-3 p-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
                            <LayoutDashboard className="w-4 h-4" />
                            <span className="font-medium text-sm">Browse Assets</span>
                        </Link>

                        {/* External Link */}
                        <a href="https://example.com/foreign-numbers" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 text-amber-300 hover:text-amber-200 hover:bg-amber-900/10 rounded-lg transition-colors">
                            <ExternalLink className="w-4 h-4" />
                            <span className="font-bold text-sm">Buy Foreign Numbers</span>
                        </a>

                        <div className="h-px bg-slate-800/50 my-2" />

                        <Link href="/buyer/messages" onClick={onClose} className="flex items-center gap-3 p-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            <span className="font-medium text-sm">Support</span>
                        </Link>
                        <Link href="/referral" onClick={onClose} className="flex items-center gap-3 p-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            <span className="font-medium text-sm">Referral</span>
                        </Link>
                        <Link href="/logs" onClick={onClose} className="flex items-center gap-3 p-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
                            <History className="w-4 h-4" />
                            <span className="font-medium text-sm">Browse Logs</span>
                        </Link>
                    </nav>

                </div>

                {/* Footer / Logout */}
                {status === 'authenticated' && (
                    <div className="p-4 border-t border-slate-800 bg-slate-900">
                        <button
                            onClick={() => { signOut(); onClose(); }}
                            className="w-full flex items-center justify-center gap-2 p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-bold text-sm"
                        >
                            Log Out
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
