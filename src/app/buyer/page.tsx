'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, WhatsAppFAB } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface WalletData {
    balance: number;
    transactions: Array<{
        id: string;
        type: 'CREDIT' | 'DEBIT';
        amount: number;
        description: string;
        balanceAfter: number;
        createdAt: string;
    }>;
}

interface UnlockedAsset {
    id: string;
    title: string;
    category: string;
    price: number;
    unlockedAt: string;
}

export default function BuyerDashboard() {
    const { data: session } = useSession();
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [assets, setAssets] = useState<UnlockedAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [referralStats, setReferralStats] = useState({ total_referrals: 0, total_earned: 0 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [walletRes, assetsRes, referralRes] = await Promise.all([
                fetch('/api/wallet'),
                fetch('/api/buyer/assets'),
                fetch('/api/referral/stats')
            ]);

            const walletData = await walletRes.json();
            const assetsData = await assetsRes.json();
            const referralData = await referralRes.json();

            if (walletRes.ok) setWallet(walletData);
            if (assetsRes.ok) setAssets(assetsData.assets);
            if (referralRes.ok) setReferralStats(referralData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const balance = wallet?.balance || 0;
    const referralLink = typeof window !== 'undefined' ? `${window.location.origin}/signup?ref=${session?.user?.id}` : '';

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client Portal</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-brand tracking-tight">
                            Welcome, {session?.user?.name?.split(' ')[0] || 'User'}
                        </h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Operational Overview & Asset Control</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/assets" className="w-full md:w-auto">
                            <Button className="h-11 px-8 bg-brand hover:bg-brand-dark text-white font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-brand/10 transition-all w-full md:w-auto">
                                Marketplace
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-6 mb-10">
                    {/* Wallet Section - Prominent */}
                    <div className="lg:col-span-8">
                        <Card className="bg-white border-slate-100 shadow-lg rounded-3xl overflow-hidden">
                            <div className="bg-brand py-2 px-6">
                                <p className="text-[9px] font-bold text-white uppercase tracking-widest text-center">Financial Terminal</p>
                            </div>
                            <CardContent className="p-6 md:p-8">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                                    <div className="flex items-center gap-4 md:gap-6">
                                        <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 border border-slate-100 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-inner">
                                            <svg className="w-8 h-8 md:w-10 md:h-10 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        </div>
                                        <div className="space-y-0.5 md:space-y-1">
                                            <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Balance</p>
                                            <p className="text-3xl md:text-4xl font-bold text-brand tracking-tight">
                                                {loading ? '...' : formatCurrency(balance)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Link href="/buyer/wallet" className="flex-1">
                                            <Button size="lg" className="w-full h-14 bg-brand hover:bg-brand-dark text-white font-bold text-[10px] md:text-[11px] uppercase tracking-widest shadow-md active:scale-95 transition-all">
                                                Fund Account
                                            </Button>
                                        </Link>
                                    </div>
                                </div>

                                {/* Low balance prompt */}
                                {!loading && balance < 5000 && (
                                    <div className="mt-8 p-4 md:p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                                        <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center shrink-0">
                                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
                                        </div>
                                        <p className="text-[10px] md:text-xs text-slate-500 font-bold leading-relaxed uppercase tracking-wide">
                                            Low Inventory Threshold. Fund your account to continue unlocking premium assets.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Stats Summary Column */}
                    <div className="lg:col-span-4 space-y-4">
                        <Card className="bg-white border-slate-100 shadow-md rounded-3xl p-5 md:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Assets</p>
                                <div className="w-9 h-9 bg-brand/5 text-brand rounded-xl flex items-center justify-center">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-brand tracking-tight">{loading ? '...' : assets.length}</p>
                            <Link href="/buyer/assets" className="block mt-4">
                                <Button variant="ghost" className="w-full h-9 text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-brand bg-slate-50 hover:bg-brand/5 border border-slate-100 rounded-xl">View Inventory</Button>
                            </Link>
                        </Card>

                        <Card className="bg-white border-slate-100 shadow-md rounded-3xl p-5 md:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Record</p>
                                <div className="w-9 h-9 bg-brand/5 text-brand rounded-xl flex items-center justify-center">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-brand tracking-tight">{loading ? '...' : wallet?.transactions.length || 0}</p>
                            <Link href="/buyer/wallet" className="block mt-4">
                                <Button variant="ghost" className="w-full h-9 text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-brand bg-slate-50 hover:bg-brand/5 border border-slate-100 rounded-xl">Transaction Logs</Button>
                            </Link>
                        </Card>
                    </div>
                </div>

                {/* Referral Section - New & Premium */}
                <div className="mb-10">
                    <Card className="bg-white border-slate-100 shadow-lg rounded-3xl overflow-hidden">
                        <div className="bg-emerald-600 py-2 px-6">
                            <p className="text-[9px] font-bold text-white uppercase tracking-widest text-center">Referral Network Terminal</p>
                        </div>
                        <CardContent className="p-6 md:p-8">
                            <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-start">
                                <div className="space-y-6 md:space-y-8">
                                    <div className="space-y-3">
                                        <h2 className="text-2xl font-bold text-brand tracking-tight">Grow the Network</h2>
                                        <p className="text-[11px] md:text-xs text-slate-500 font-medium leading-relaxed">
                                            Earn <span className="text-emerald-600 font-bold">10% commission</span> on every wallet funding completed by your referrals. Direct settlement to your balance.
                                        </p>
                                    </div>

                                    <div className="space-y-2.5">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Your Private Node Link</p>
                                        <div className="flex flex-col sm:flex-row items-stretch gap-2 p-1.5 bg-slate-50 border border-slate-100 rounded-2xl">
                                            <input
                                                readOnly
                                                value={referralLink}
                                                className="flex-1 bg-transparent px-4 py-2.5 text-[11px] font-bold text-brand outline-none"
                                            />
                                            <Button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(referralLink);
                                                    toast.success('Referral link copied!');
                                                }}
                                                className="h-11 px-6 bg-brand hover:bg-brand-dark text-white font-bold text-[10px] uppercase tracking-widest rounded-xl"
                                            >
                                                Copy Link
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 md:p-8 rounded-2xl md:rounded-3xl bg-emerald-50 border border-emerald-100 space-y-1">
                                        <p className="text-[9px] font-bold text-emerald-800/60 uppercase tracking-widest">Active Referrals</p>
                                        <p className="text-3xl font-bold text-emerald-600 tracking-tight">{loading ? '...' : referralStats.total_referrals}</p>
                                    </div>
                                    <div className="p-6 md:p-8 rounded-2xl md:rounded-3xl bg-emerald-600 border border-emerald-700 space-y-1 shadow-lg shadow-emerald-100">
                                        <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest">Net Commissions</p>
                                        <p className="text-3xl font-bold text-white tracking-tight">{loading ? '...' : formatCurrency(referralStats.total_earned)}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity Section */}
                <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
                    {/* Recent Transactions */}
                    <Card className="bg-white border-slate-100 shadow-md rounded-3xl overflow-hidden">
                        <CardHeader className="p-6 border-b border-slate-50">
                            <CardTitle className="text-base font-bold text-brand tracking-tight flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-brand text-xs">📋</div>
                                Financial Ledger
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {loading ? (
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="animate-pulse flex items-center justify-between">
                                            <div className="h-10 bg-slate-50 rounded-xl w-full" />
                                        </div>
                                    ))}
                                </div>
                            ) : wallet?.transactions.length ? (
                                <div className="space-y-3">
                                    {wallet.transactions.slice(0, 5).map((tx) => {
                                        const isCredit = tx.type === 'CREDIT';
                                        return (
                                            <div key={tx.id} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl transition-all hover:bg-white hover:shadow-md">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${isCredit ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'
                                                        }`}>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isCredit ? 'M12 6v12m6-6H6' : 'M20 12H4'} />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-bold text-brand uppercase tracking-tight">{tx.description}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{formatDate(tx.createdAt)}</p>
                                                    </div>
                                                </div>
                                                <span className={`font-bold text-[11px] ${isCredit ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-10 text-center">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 italic text-xl text-slate-300">?</div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">No transaction records found</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recently Unlocked */}
                    <Card className="bg-white border-slate-100 shadow-md rounded-3xl overflow-hidden">
                        <CardHeader className="p-6 border-b border-slate-50">
                            <CardTitle className="text-base font-bold text-brand tracking-tight flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-brand text-xs">📦</div>
                                Inventory Logs
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {loading ? (
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="animate-pulse flex items-center justify-between">
                                            <div className="h-10 bg-slate-50 rounded-xl w-full" />
                                        </div>
                                    ))}
                                </div>
                            ) : assets.length ? (
                                <div className="space-y-3">
                                    {assets.slice(0, 5).map((asset) => (
                                        <Link key={asset.id} href={`/assets/${asset.id}`}>
                                            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl transition-all hover:bg-white hover:shadow-md group">
                                                <div>
                                                    <p className="text-[11px] font-bold text-brand uppercase group-hover:text-brand transition-colors tracking-tight">{asset.title}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{asset.category}</p>
                                                </div>
                                                <Badge variant="success" className="text-[8px] font-bold uppercase tracking-widest px-2.5 py-0.5">SECURE</Badge>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-10 text-center">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 italic text-xl text-slate-300">!</div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">Inventory is currently empty</p>
                                    <Link href="/assets">
                                        <Button className="h-10 px-6 bg-brand text-white text-[9px] font-bold uppercase tracking-widest rounded-xl">Unlock Assets</Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
            <WhatsAppFAB phoneNumber="08071400331" />
        </div>
    );
}
