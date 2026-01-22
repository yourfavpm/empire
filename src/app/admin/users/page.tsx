'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';

interface User {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    walletBalance: number;
    unlockedAssetsCount: number;
    paymentsCount: number;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
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

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            const response = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Users</h1>
                    <p className="text-slate-400 mt-1">Manage buyer accounts</p>
                </div>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-6">
                <div className="max-w-md">
                    <Input
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        }
                    />
                </div>
            </form>

            {/* Users Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left py-4 px-6 text-slate-400 font-medium">User</th>
                                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Wallet Balance</th>
                                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Assets</th>
                                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Payments</th>
                                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Joined</th>
                                    <th className="text-right py-4 px-6 text-slate-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="border-b border-slate-800">
                                            <td colSpan={6} className="py-4 px-6">
                                                <div className="h-6 bg-slate-700 rounded animate-pulse" />
                                            </td>
                                        </tr>
                                    ))
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-slate-400">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                                            <td className="py-4 px-6">
                                                <p className="text-white font-medium">{user.name}</p>
                                                <p className="text-sm text-slate-400">{user.email}</p>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-emerald-400 font-medium">
                                                    {formatCurrency(user.walletBalance)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-slate-300">
                                                {user.unlockedAssetsCount} unlocked
                                            </td>
                                            <td className="py-4 px-6 text-slate-300">
                                                {user.paymentsCount} payments
                                            </td>
                                            <td className="py-4 px-6 text-slate-400">
                                                {formatDate(user.createdAt)}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-400 hover:text-red-300"
                                                    onClick={() => handleDelete(user.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
