'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, Button, Input, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

interface User {
    id: string;
    name: string;
    email: string;
    country?: string;
    blocked: boolean;
    createdAt: string;
    walletBalance: number;
    unlockedAssetsCount: number;
    paymentsCount: number;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [countryFilter, setCountryFilter] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [countryFilter]); // Refetch when filter changes

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (countryFilter) params.set('country', countryFilter);
            params.set('limit', '100');

            const response = await fetch(`/api/admin/users?${params}`);
            const data = await response.json();
            if (response.ok) setUsers(data.users);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers();
    };

    const handleBlockToggle = async (id: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/admin/users/${id}/block`, {
                method: 'POST',
                body: JSON.stringify({ blocked: !currentStatus }),
            });
            if (response.ok) {
                // Optimistic update
                setUsers(users.map(u => u.id === id ? { ...u, blocked: !currentStatus } : u));
            }
        } catch (error) {
            console.error('Failed to toggle block status:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-brand tracking-tight">Users</h1>
                    <p className="text-slate-500 mt-1 text-[10px] uppercase font-black tracking-widest">Manage registered accounts, wallet balances, and access.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                <form onSubmit={handleSearch} className="flex-1">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Search by name, email, or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-white border-slate-300 text-xs h-10"
                        />
                        <Button type="submit" variant="outline" className="border-slate-300 text-slate-600 font-bold h-10">
                            Search
                        </Button>
                    </div>
                </form>
                <div className="w-48">
                    <Input
                        placeholder="Filter by Country"
                        value={countryFilter}
                        onChange={(e) => setCountryFilter(e.target.value)}
                        className="bg-white border-slate-300 text-xs h-10"
                    />
                </div>
            </div>

            {/* Users Table */}
            <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                            <TableRow className="border-transparent hover:bg-transparent h-12">
                                <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-widest pl-6">User Details</TableHead>
                                <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Country</TableHead>
                                <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Wallet Balance</TableHead>
                                <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Activity</TableHead>
                                <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Status</TableHead>
                                <TableHead className="text-right text-slate-400 font-black uppercase text-[10px] tracking-widest pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i} className="border-b border-slate-50">
                                        <TableCell colSpan={6} className="py-6">
                                            <div className="h-4 bg-slate-100 rounded animate-pulse w-full" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-20 text-slate-400 italic text-xs font-medium">
                                        No users found matching your search filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-black text-brand text-sm">{user.name}</span>
                                                <span className="text-xs text-slate-500 font-medium">{user.email}</span>
                                                <span className="text-[9px] font-mono font-bold text-slate-400 mt-1 uppercase">ID: {user.id.slice(-12)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="border-slate-200 text-slate-500 text-[10px] font-bold">
                                                {user.country || 'N/A'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-emerald-600 font-black text-sm">
                                                {formatCurrency(user.walletBalance)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] text-brand/60 font-bold uppercase">{user.unlockedAssetsCount} Assets Unlocked</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">{user.paymentsCount} Payments</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user.blocked ? (
                                                <Badge variant="error" className="text-[10px] font-black uppercase bg-red-50 text-red-600 border-red-100">Blocked</Badge>
                                            ) : (
                                                <Badge variant="success" className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 border-emerald-100">Active</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className={`h-8 text-[10px] font-black uppercase border-2 ${user.blocked ? 'border-emerald-100 text-emerald-600 hover:bg-emerald-50' : 'border-red-100 text-red-600 hover:bg-red-50'}`}
                                                    onClick={() => handleBlockToggle(user.id, user.blocked)}
                                                >
                                                    {user.blocked ? 'Unblock' : 'Block'}
                                                </Button>
                                                <Link href={`/admin/users/${user.id}`}>
                                                    <Button size="sm" className="h-8 text-[10px] font-black uppercase bg-brand hover:bg-brand-light shadow-sm">
                                                        Manage
                                                    </Button>
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
