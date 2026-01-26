'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

interface TopCustomer {
    name: string;
    email: string;
    country: string;
    total_spent: number;
}

interface Stats {
    totalUsers: number;
    totalBlockedUsers: number;
    totalRevenue: number;
    totalWalletRecharge: number;
    newUsersToday: number;
    rechargedToday: number;
    revenueToday: number;
    topCustomers: TopCustomer[];
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/stats/detailed');
            const data = await response.json();
            if (response.ok) {
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            label: 'Total Revenue',
            value: formatCurrency(stats?.totalRevenue || 0),
            subValue: `Today: ${formatCurrency(stats?.revenueToday || 0)}`,
            icon: '💰',
            color: 'text-brand'
        },
        {
            label: 'Wallet Recharge',
            value: formatCurrency(stats?.totalWalletRecharge || 0),
            subValue: `Today: ${formatCurrency(stats?.rechargedToday || 0)}`,
            icon: '💳',
            color: 'text-emerald-600'
        },
        {
            label: 'Total Users',
            value: stats?.totalUsers || 0,
            subValue: `Today: +${stats?.newUsersToday || 0}`,
            icon: '👥',
            color: 'text-blue-600'
        },
        {
            label: 'Blocked Users',
            value: stats?.totalBlockedUsers || 0,
            subValue: null,
            icon: '🚫',
            color: 'text-red-600'
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-brand tracking-tight">System Overview</h1>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Real-time marketplace analytics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <Card key={index} className="border-slate-200 bg-white shadow-sm overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <p className={`text-2xl font-black ${stat.color} tracking-tight`}>
                                        {loading ? '...' : stat.value}
                                    </p>
                                    {stat.subValue && (
                                        <p className="text-[10px] text-slate-500 mt-1 font-bold">
                                            {loading ? '...' : stat.subValue}
                                        </p>
                                    )}
                                </div>
                                <span className="text-2xl">{stat.icon}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Leaderboard */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Top Customers (Revenue Leaderboard)</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6 space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="animate-pulse h-10 bg-slate-100 rounded-xl" />
                            ))}
                        </div>
                    ) : (stats?.topCustomers || []).length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-12 italic font-light">No customer data available</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-100 bg-white hover:bg-transparent">
                                    <TableHead className="text-[10px] uppercase font-black text-slate-400 pl-6 h-12">User</TableHead>
                                    <TableHead className="text-[10px] uppercase font-black text-slate-400 h-12">Country</TableHead>
                                    <TableHead className="text-right text-[10px] uppercase font-black text-slate-400 pr-6 h-12">Total Spent</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats?.topCustomers.map((customer, index) => (
                                    <TableRow key={index} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="pl-6 py-4">
                                            <div>
                                                <p className="text-xs font-bold text-brand">{customer.name}</p>
                                                <p className="text-[10px] text-slate-400 truncate">{customer.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-500 font-medium">{customer.country || 'N/A'}</TableCell>
                                        <TableCell className="text-right font-bold text-xs text-emerald-600 pr-6">
                                            {formatCurrency(customer.total_spent)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
