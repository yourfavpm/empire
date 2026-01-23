'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

interface Stats {
    totalBuyers: number;
    totalAssets: number;
    activeAssets: number;
    totalPayments: number;
    pendingCryptoPayments: number;
    totalRevenue: number;
}

interface Payment {
    id: string;
    amount: number;
    type: string;
    status: string;
    createdAt: string;
    user: { name: string; email: string };
}

interface AssetAccess {
    grantedAt: string;
    user: { name: string };
    asset: { title: string; price: number };
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
    const [recentUnlocks, setRecentUnlocks] = useState<AssetAccess[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/stats');
            const data = await response.json();
            if (response.ok) {
                setStats(data.stats);
                setRecentPayments(data.recentPayments || []);
                setRecentUnlocks(data.recentUnlocks || []);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Total Revenue', value: formatCurrency(stats?.totalRevenue || 0), icon: '💰', color: 'text-cyan-400' },
        { label: 'Total Buyers', value: stats?.totalBuyers || 0, icon: '👥', color: 'text-blue-400' },
        { label: 'Active Assets', value: stats?.activeAssets || 0, icon: '📦', color: 'text-emerald-400' },
        { label: 'Pending Crypto', value: stats?.pendingCryptoPayments || 0, icon: '⏳', color: 'text-amber-400', link: '/admin/payments?status=PENDING' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">System Overview</h1>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Real-time marketplace analytics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <Card key={index} className="border-slate-200">
                        <CardContent className="py-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                    <p className="text-2xl font-black text-slate-900 tracking-tight">
                                        {loading ? '...' : stat.value}
                                    </p>
                                </div>
                                <span className="text-2xl">{stat.icon}</span>
                            </div>
                            {stat.link && stats?.pendingCryptoPayments ? (
                                <Link href={stat.link} className="flex items-center gap-1 text-[10px] text-amber-600 hover:text-amber-700 mt-3 font-black uppercase tracking-widest transition-colors">
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                                    Action Required
                                </Link>
                            ) : null}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Payments */}
                <Card className="border-slate-800/50">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">Recent Payments</CardTitle>
                        <Link href="/admin/payments" className="text-[10px] text-cyan-400 hover:underline font-bold">
                            View all
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="animate-pulse h-10 bg-slate-800 rounded-xl" />
                                ))}
                            </div>
                        ) : (recentPayments || []).length === 0 ? (
                            <p className="text-xs text-slate-600 text-center py-8 italic font-light">No transaction history</p>
                        ) : (
                            <div className="space-y-3">
                                {recentPayments.map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0 group">
                                        <div>
                                            <p className="text-xs font-medium text-white group-hover:text-cyan-400 transition-colors uppercase">{payment.user?.name || 'Unknown'}</p>
                                            <p className="text-[10px] text-slate-500 font-mono tracking-tighter">{formatDate(payment.createdAt)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-emerald-400">
                                                {formatCurrency(payment.amount)}
                                            </p>
                                            <div className="mt-1">
                                                <Badge variant={payment.type === 'PAYSTACK' ? 'success' : 'warning'} className="text-[8px] px-1.5 py-0">
                                                    {payment.type}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Unlocks */}
                <Card className="border-slate-800/50">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">Latest Unlocks</CardTitle>
                        <Link href="/admin/users" className="text-[10px] text-cyan-400 hover:underline font-bold">
                            Manage Users
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="animate-pulse h-10 bg-slate-800 rounded-xl" />
                                ))}
                            </div>
                        ) : (recentUnlocks || []).length === 0 ? (
                            <p className="text-xs text-slate-600 text-center py-8 italic font-light">No recent activity</p>
                        ) : (
                            <div className="space-y-3">
                                {recentUnlocks.map((unlock, index) => (
                                    <div key={index} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0 group">
                                        <div className="max-w-[180px]">
                                            <p className="text-xs font-medium text-white group-hover:text-cyan-400 transition-colors truncate uppercase">{unlock.asset.title}</p>
                                            <p className="text-[10px] text-slate-500">Buyer: {unlock.user.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-cyan-400">
                                                {formatCurrency(unlock.asset.price)}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-mono tracking-tighter mt-1">{formatDate(unlock.grantedAt)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
