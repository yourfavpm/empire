'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { AdminRole, ROLE_CONFIGS } from '@/lib/roles';

interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: string;
    blocked: boolean;
    createdAt: string;
    lastLogin?: string;
}

const ADMIN_ROLES = Object.values(ROLE_CONFIGS).filter(r => r.id !== AdminRole.ADMIN);

export default function AdminTeamPage() {
    const { data: session } = useSession();
    const currentUserRole = session?.user?.role;
    const isSuperAdmin = currentUserRole === AdminRole.SUPER_ADMIN || currentUserRole === AdminRole.ADMIN;

    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInviteForm, setShowInviteForm] = useState(false);

    // Form State
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('GENERAL_ADMIN');
    const [submitting, setSubmitting] = useState(false);

    const fetchAdmins = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/team');
            const data = await res.json();
            if (res.ok) {
                setAdmins(data.admins);
            } else {
                toast.error(data.error || 'Failed to fetch directory');
            }
        } catch {
            console.error('Failed to fetch admins');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (currentUserRole && isSuperAdmin) {
            fetchAdmins();
        }
    }, [currentUserRole, isSuperAdmin, fetchAdmins]);

    if (currentUserRole && !isSuperAdmin) {
        return (
            <div className="flex items-center justify-center p-20">
                <Card className="max-w-md w-full border-red-100 bg-red-50/10">
                    <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-600">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h2 className="text-xl font-black text-red-600 uppercase tracking-tight mb-2">Access Denied</h2>
                        <p className="text-sm font-bold text-slate-500 mb-8">This module requires SUPER_ADMIN clearance. Your current authorization level is insufficient.</p>
                        <Button className="w-full bg-red-600 font-black uppercase tracking-widest text-[10px]" onClick={() => window.location.href = '/admin'}>Return to Dashboard</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/admin/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newName,
                    email: newEmail,
                    password: newPassword,
                    role: newRole
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Admin authorized successfully');
                setShowInviteForm(false);
                setNewName('');
                setNewEmail('');
                setNewPassword('');
                fetchAdmins();
            } else {
                toast.error(data.error || 'Failed to authorize admin');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (id: string, currentBlocked: boolean) => {
        if (!isSuperAdmin) return;

        const action = currentBlocked ? 'activate' : 'deactivate';
        if (!confirm(`Are you sure you want to ${action} this administrator?`)) return;

        try {
            const res = await fetch('/api/admin/team', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, blocked: !currentBlocked })
            });

            if (res.ok) {
                toast.success(`Admin ${action}d successfully`);
                fetchAdmins();
            } else {
                const data = await res.json();
                toast.error(data.error || `Failed to ${action} admin`);
            }
        } catch {
            toast.error('Operation failed');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-brand tracking-tight">Team Management</h1>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-black tracking-widest">Internal permissions & operational controls</p>
                </div>
                {isSuperAdmin && (
                    <Button onClick={() => setShowInviteForm(!showInviteForm)} size="sm" className={`h-9 px-4 text-[11px] font-black uppercase tracking-widest ${showInviteForm ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-brand text-white hover:bg-brand-light'}`}>
                        {showInviteForm ? 'Close Directory' : '+ Add Administrator'}
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Invite Form */}
                {showInviteForm && isSuperAdmin && (
                    <div className="lg:col-span-1">
                        <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
                            <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Invite New Personnel</CardTitle>
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
                                        label="Secure Terminal Password"
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="h-10 text-xs bg-white border-slate-300 font-bold"
                                        required
                                    />
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned Privilege</label>
                                        <select
                                            value={newRole}
                                            onChange={e => setNewRole(e.target.value)}
                                            className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-brand outline-none"
                                        >
                                            {ADMIN_ROLES.map(role => (
                                                <option key={role.id} value={role.id}>{role.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <Button type="submit" className="w-full h-10 mt-2 bg-brand font-black uppercase tracking-widest text-[10px]" loading={submitting}>
                                        Grant System Access
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Team List */}
                <div className={(showInviteForm && isSuperAdmin) ? 'lg:col-span-2' : 'lg:col-span-3'}>
                    <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
                        <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Operational Personnel</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50/50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Administrator</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned Privilege</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Joined On</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Access Status</th>
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
                                                        <div className="flex flex-col gap-1">
                                                            <span className="w-fit bg-brand/5 text-brand text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-brand/10">
                                                                {admin.role.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="text-[10px] text-slate-400 font-black uppercase">
                                                            {formatDate(admin.createdAt)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div className="flex items-center gap-2 min-w-[100px]">
                                                                <div className={`w-2 h-2 rounded-full ${admin.blocked ? 'bg-red-500' : 'bg-emerald-500'} shadow-sm`} />
                                                                <span className={`text-[10px] font-black uppercase tracking-widest ${admin.blocked ? 'text-red-500' : 'text-emerald-600'}`}>
                                                                    {admin.blocked ? 'Suspended' : 'Clearance'}
                                                                </span>
                                                            </div>

                                                            {isSuperAdmin && admin.role !== 'SUPER_ADMIN' && admin.role !== 'ADMIN' && (
                                                                <button
                                                                    onClick={() => handleToggleStatus(admin.id, admin.blocked)}
                                                                    className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${admin.blocked
                                                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                                                                            : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                                                                        }`}
                                                                >
                                                                    {admin.blocked ? 'Restore' : 'Revoke'}
                                                                </button>
                                                            )}
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
