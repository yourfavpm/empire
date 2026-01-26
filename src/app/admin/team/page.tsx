
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, StatusBadge } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    lastLogin?: string;
}

export default function AdminTeamPage() {
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInviteForm, setShowInviteForm] = useState(false);

    // Form State
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const res = await fetch('/api/admin/team');
            const data = await res.json();
            if (res.ok) setAdmins(data.admins);
        } catch (error) {
            console.error('Failed to fetch admins');
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/admin/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName, email: newEmail, password: newPassword })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Admin invited successfully');
                setShowInviteForm(false);
                setNewName('');
                setNewEmail('');
                setNewPassword('');
                fetchAdmins();
            } else {
                toast.error(data.error || 'Failed to invite admin');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-brand tracking-tight">Team Management</h1>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-black tracking-widest">Manage internal administrative access</p>
                </div>
                <Button onClick={() => setShowInviteForm(!showInviteForm)} size="sm" className={`h-9 px-4 text-[11px] font-black uppercase tracking-widest ${showInviteForm ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-brand text-white hover:bg-brand-light'}`}>
                    {showInviteForm ? 'Close Directory' : '+ Add Administrator'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Invite Form */}
                {showInviteForm && (
                    <div className="lg:col-span-1">
                        <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
                            <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Invite New Admin</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleInvite} className="space-y-4">
                                    <Input
                                        placeholder="Enter Full Name"
                                        label="Display Name"
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                        className="h-10 text-xs bg-white border-slate-300 font-bold"
                                        required
                                    />
                                    <Input
                                        placeholder="admin@example.com"
                                        label="Official Email"
                                        type="email"
                                        value={newEmail}
                                        onChange={e => setNewEmail(e.target.value)}
                                        className="h-10 text-xs bg-white border-slate-300 font-bold"
                                        required
                                    />
                                    <Input
                                        placeholder="••••••••"
                                        label="Secure Password"
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="h-10 text-xs bg-white border-slate-300 font-bold"
                                        required
                                    />
                                    <Button type="submit" className="w-full h-10 mt-2 bg-brand font-black uppercase tracking-widest text-[10px]" loading={submitting}>
                                        Grant Access
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Team List */}
                <div className={showInviteForm ? 'lg:col-span-2' : 'lg:col-span-3'}>
                    <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
                        <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Internal Directory</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50/50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Administrator</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Position</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Joined On</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Current Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {loading ? (
                                            <tr><td colSpan={4} className="p-12 text-center text-xs font-bold text-slate-400 italic">Accessing database...</td></tr>
                                        ) : admins.length === 0 ? (
                                            <tr><td colSpan={4} className="p-12 text-center text-xs font-bold text-slate-400 italic">No administrative personnel found beyond root.</td></tr>
                                        ) : (
                                            admins.map((admin) => (
                                                <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col">
                                                            <div className="text-sm font-black text-brand tracking-tight">{admin.name}</div>
                                                            <div className="text-[10px] text-slate-500 font-bold">{admin.email}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="bg-brand/5 text-brand text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-brand/10">
                                                            {admin.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="text-[10px] text-slate-400 font-black uppercase">
                                                            {formatDate(admin.createdAt)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Connected</span>
                                                        </div>
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
            </div>
        </div>
    );
}
