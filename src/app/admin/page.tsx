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
                setRecentPayments(data.recentPayments);
                setRecentUnlocks(data.recentUnlocks);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Total Revenue', value: formatCurrency(stats?.totalRevenue || 0), icon: '💰', color: 'cyan' },
        { label: 'Total Buyers', value: stats?.totalBuyers || 0, icon: '👥', color: 'blue' },
        { label: 'Active Assets', value: stats?.activeAssets || 0, icon: '📦', color: 'emerald' },
        { label: 'Pending Crypto', value: stats?.pendingCryptoPayments || 0, icon: '⏳', color: 'amber', link: '/admin/payments?status=PENDING' },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-400 mt-1">Overview of your marketplace</p>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <Card key={index} gradient>
                        <CardContent className="py-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm">{stat.label}</p>
                                    <p className="text-3xl font-bold text-white mt-1">
                                        {loading ? '...' : stat.value}
                                    </p>
                                </div>
                                <div className="text-4xl">{stat.icon}</div>
                            </div>
                            {stat.link && stats?.pendingCryptoPayments ? (
                                <Link href={stat.link} className="text-sm text-cyan-400 hover:underline mt-2 inline-block">
                                    Review pending →
                                </Link>
                            ) : null}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Recent Payments */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Payments</CardTitle>
                        <Link href="/admin/payments" className="text-sm text-cyan-400 hover:underline">
                            View all
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="animate-pulse h-12 bg-slate-700 rounded" />
                                ))}
                            </div>
                        ) : recentPayments.length === 0 ? (
                            <p className="text-slate-400 text-center py-8">No payments yet</p>
                        ) : (
                            <div className="space-y-4">
                                {recentPayments.map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                                        <div>
                                            <p className="text-white">{payment.user.name}</p>
                                            <p className="text-sm text-slate-400">{formatDate(payment.createdAt)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-emerald-400">
                                                {formatCurrency(payment.amount)}
                                            </p>
                                            <Badge variant={payment.type === 'PAYSTACK' ? 'success' : 'warning'}>
                                                {payment.type}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Unlocks */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Unlocks</CardTitle>
                        <Link href="/admin/users" className="text-sm text-cyan-400 hover:underline">
                            View users
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="animate-pulse h-12 bg-slate-700 rounded" />
                                ))}
                            </div>
                        ) : recentUnlocks.length === 0 ? (
                            <p className="text-slate-400 text-center py-8">No unlocks yet</p>
                        ) : (
                            <div className="space-y-4">
                                {recentUnlocks.map((unlock, index) => (
                                    <div key={index} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                                        <div>
                                            <p className="text-white">{unlock.asset.title}</p>
                                            <p className="text-sm text-slate-400">by {unlock.user.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-cyan-400">
                                                {formatCurrency(unlock.asset.price)}
                                            </p>
                                            <p className="text-xs text-slate-400">{formatDate(unlock.grantedAt)}</p>
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
