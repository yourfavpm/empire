'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';

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

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [walletRes, assetsRes] = await Promise.all([
                fetch('/api/wallet'),
                fetch('/api/buyer/assets'),
            ]);

            const walletData = await walletRes.json();
            const assetsData = await assetsRes.json();

            if (walletRes.ok) setWallet(walletData);
            if (assetsRes.ok) setAssets(assetsData.assets);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const balance = wallet?.balance || 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">
                    Welcome, {session?.user?.name?.split(' ')[0] || 'User'}!
                </h1>
                <p className="text-sm text-slate-400 mt-1">Manage your wallet and assets</p>
            </div>

            {/* Wallet Section - Prominent */}
            <div className="mb-8">
                <Card className="bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border-cyan-500/20">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                                    <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Wallet Balance</p>
                                    <p className="text-3xl font-bold text-white">
                                        {loading ? '...' : formatCurrency(balance)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link href="/buyer/wallet">
                                    <Button size="lg" className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 text-white">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Fund Wallet
                                    </Button>
                                </Link>
                                <Link href="/assets">
                                    <Button variant="outline" size="lg" className="w-full sm:w-auto border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
                                        Browse Assets
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Low balance prompt */}
                        {!loading && balance < 5000 && (
                            <div className="mt-4 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                                <p className="text-sm text-cyan-400">
                                    💡 <span className="font-medium">Tip:</span> Fund your wallet to unlock premium assets. Most assets start from ₦5,000.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Stats Row */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {/* Unlocked Assets */}
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">Unlocked Assets</p>
                                <p className="text-2xl font-bold text-white mt-1">
                                    {loading ? '...' : assets.length}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <Link href="/buyer/assets">
                            <Button variant="ghost" size="sm" className="mt-3 w-full text-slate-400 hover:text-white">
                                View All →
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Total Spent */}
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">Total Transactions</p>
                                <p className="text-2xl font-bold text-white mt-1">
                                    {loading ? '...' : wallet?.transactions.length || 0}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                        <Link href="/buyer/wallet">
                            <Button variant="ghost" size="sm" className="mt-3 w-full text-slate-400 hover:text-white">
                                View History →
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardContent className="p-5">
                        <p className="text-sm text-slate-400 mb-3">Quick Actions</p>
                        <div className="space-y-2">
                            <Link href="/assets" className="block">
                                <Button variant="ghost" size="sm" className="w-full justify-start text-slate-300">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Browse Assets
                                </Button>
                            </Link>
                            <Link href="/buyer/messages" className="block">
                                <Button variant="ghost" size="sm" className="w-full justify-start text-slate-300">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                    Contact Support
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Transactions */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="animate-pulse flex items-center justify-between">
                                        <div className="h-4 bg-slate-700 rounded w-1/2" />
                                        <div className="h-4 bg-slate-700 rounded w-1/4" />
                                    </div>
                                ))}
                            </div>
                        ) : wallet?.transactions.length ? (
                            <div className="space-y-3">
                                {wallet.transactions.slice(0, 5).map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                                        <div className="flex items-center">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${tx.type === 'CREDIT' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                                                }`}>
                                                <svg className={`w-4 h-4 ${tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tx.type === 'CREDIT' ? 'M12 6v12m6-6H6' : 'M20 12H4'} />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm text-white">{tx.description}</p>
                                                <p className="text-xs text-slate-400">{formatDate(tx.createdAt)}</p>
                                            </div>
                                        </div>
                                        <span className={`font-medium text-sm ${tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {tx.type === 'CREDIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-center py-6 text-sm">No transactions yet</p>
                        )}
                    </CardContent>
                </Card>

                {/* Recently Unlocked */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Recently Unlocked</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="animate-pulse flex items-center justify-between">
                                        <div className="h-4 bg-slate-700 rounded w-1/2" />
                                        <div className="h-4 bg-slate-700 rounded w-1/4" />
                                    </div>
                                ))}
                            </div>
                        ) : assets.length ? (
                            <div className="space-y-3">
                                {assets.slice(0, 5).map((asset) => (
                                    <Link key={asset.id} href={`/assets/${asset.id}`}>
                                        <div className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0 hover:bg-slate-700/20 -mx-2 px-2 rounded-lg transition-colors">
                                            <div>
                                                <p className="text-sm text-white">{asset.title}</p>
                                                <p className="text-xs text-slate-400">{asset.category}</p>
                                            </div>
                                            <Badge variant="success" className="text-xs">Unlocked</Badge>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-slate-400 mb-3 text-sm">No assets unlocked yet</p>
                                <Link href="/assets">
                                    <Button size="sm">Browse Assets</Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
