
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { signIn } from 'next-auth/react';


export default function AdminUserDetailsPage() {
    const params = useParams();
    const id = params?.id as string;
    const [user, setUser] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Wallet Adjustment State
    const [adjustmentAmount, setAdjustmentAmount] = useState('');
    const [adjustmentReason, setAdjustmentReason] = useState('');
    const [isAdjusting, setIsAdjusting] = useState(false);

    // Impersonation State
    const [impersonating, setImpersonating] = useState(false);

    useEffect(() => {
        if (id) fetchUserDetails();
    }, [id]);

    const fetchUserDetails = async () => {
        setLoading(true);
        try {
            // Fetch basic user info from API (we might need a specific endpoint or just use supabase for now if allowed)
            // Ideally we should have an API endpoint for safety, but for now we reuse the admin implementation logic
            // Since we are client side admin, let's use a new API endpoint we'll create or fetch from existing lists.
            // Actually, we need to creating a specific endpoint for single user fetch or just use supabase client directly if RLS allows admin access
            // Let's assume we need to fetch via a new route or filtered list.
            // For simplicity/speed, let's fetch via the list endpoint with ID filter if supported, or create a specific one.
            // The list endpoint supports search, but not direct ID fetch maybe. 
            // Let's create `GET /api/admin/users/[id]` 

            const response = await fetch(`/api/admin/users/${id}`);
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                setTransactions(data.transactions || []);
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWalletAdjustment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!adjustmentAmount || !adjustmentReason) return;

        setIsAdjusting(true);
        try {
            const response = await fetch('/api/admin/wallet/adjust', {
                method: 'POST',
                body: JSON.stringify({
                    userId: id,
                    amount: parseFloat(adjustmentAmount),
                    adminId: 'current-admin', // In real app, derived from session
                    reason: adjustmentReason
                })
            });

            if (response.ok) {
                setAdjustmentAmount('');
                setAdjustmentReason('');
                fetchUserDetails(); // Refresh data
                alert('Wallet adjusted successfully');
            } else {
                const err = await response.json();
                alert(`Error: ${err.error}`);
            }
        } catch (error) {
            console.error('Adjustment failed', error);
        } finally {
            setIsAdjusting(false);
        }
    };

    const handleImpersonate = async () => {
        if (!confirm(`Are you sure you want to log in as ${user.name}? You will be signed out of Admin.`)) return;

        setImpersonating(true);
        try {
            const res = await fetch('/api/admin/impersonate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: id })
            });

            if (res.ok) {
                const { token } = await res.json();
                await signIn('credentials', {
                    impersonationToken: token,
                    callbackUrl: '/buyer' // Redirect to user dashboard
                });
            } else {
                alert('Failed to generate session');
                setImpersonating(false);
            }
        } catch (error) {
            console.error(error);
            setImpersonating(false);
        }
    };

    if (loading) return <div className="text-brand flex items-center justify-center p-20 font-black uppercase tracking-widest text-xs animate-pulse">Retrieving Entity Profile...</div>;
    if (!user) return <div className="text-red-500 font-black p-20 text-center uppercase tracking-widest text-xs">Entity not found in centralized datastore.</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-brand tracking-tighter uppercase">{user.name}</h1>
                    <p className="text-slate-400 font-mono text-[10px] font-bold uppercase tracking-widest mt-1">UID: {user.id}</p>
                </div>
                <div className="flex gap-3 items-center">
                    <Button
                        onClick={handleImpersonate}
                        disabled={impersonating}
                        variant="outline"
                        size="sm"
                        className="h-9 px-4 text-[10px] font-black uppercase tracking-widest border-brand/20 text-brand hover:bg-brand/5"
                    >
                        {impersonating ? 'Initializing Proxy...' : 'Impersonate User'}
                    </Button>
                    <Badge className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 ${user.blocked ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>
                        {user.blocked ? "Deactivated" : "Operational"}
                    </Badge>
                    <Badge variant="outline" className="border-slate-200 text-slate-500 text-[10px] font-black uppercase px-3 py-1">
                        {user.country || "Intl."}
                    </Badge>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 items-start">
                {/* Wallet Card */}
                <Card className="lg:col-span-1 border-slate-200 bg-white shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Capital Reserve</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="text-4xl font-black text-brand mb-8 tracking-tighter">
                            {formatCurrency(user.balance || 0)}
                        </div>

                        <form onSubmit={handleWalletAdjustment} className="space-y-4 pt-6 border-t border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Manual Ledger Injection</p>
                            <Input
                                type="number"
                                placeholder="Adjustment Amount"
                                value={adjustmentAmount}
                                onChange={e => setAdjustmentAmount(e.target.value)}
                                className="h-10 bg-white border-slate-300 font-black text-brand text-xs"
                            />
                            <Input
                                type="text"
                                placeholder="Audit Reason"
                                value={adjustmentReason}
                                onChange={e => setAdjustmentReason(e.target.value)}
                                className="h-10 bg-white border-slate-300 font-bold text-slate-600 text-[11px]"
                            />
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isAdjusting}
                                className="w-full h-10 bg-brand hover:bg-brand-light text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20 transition-all"
                            >
                                {isAdjusting ? 'Processing Transaction...' : 'Confirm Adjustment'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="lg:col-span-2 border-slate-200 bg-white shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Entity Metadata</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div className="space-y-1">
                                <p className="text-[9px] uppercase text-slate-400 font-black tracking-widest">Primary Email</p>
                                <p className="text-xs text-brand font-black break-all">{user.email}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] uppercase text-slate-400 font-black tracking-widest">Activation Date</p>
                                <p className="text-xs text-slate-600 font-bold">{formatDate(user.createdAt)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] uppercase text-slate-400 font-black tracking-widest">Access Role</p>
                                <p className="text-xs text-slate-600 font-bold uppercase">{user.role}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] uppercase text-slate-400 font-black tracking-widest">Referral Link</p>
                                <p className="text-xs text-slate-600 font-mono font-bold truncate">{user.referrerId || "None Established"}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions History */}
            <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Financial Ledger history</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                            <TableRow className="border-transparent hover:bg-transparent h-12">
                                <TableHead className="px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date/Time</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description of Transaction</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mode</TableHead>
                                <TableHead className="pr-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Value (₦)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-20 text-xs font-bold text-slate-400 italic">No ledger entries detected for this entity.</TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((tx: any) => (
                                    <TableRow key={tx.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">{formatDate(tx.createdAt)}</TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-700 font-bold">{tx.description}</span>
                                                {tx.isTest && <Badge variant="outline" className="text-[8px] font-black border-amber-200 bg-amber-50 text-amber-600 px-1.5 py-0">TEST</Badge>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 ${tx.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                {tx.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className={`pr-6 text-right font-black text-sm tracking-tighter ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {tx.type === 'DEBIT' ? '-' : '+'}{formatCurrency(tx.amount)}
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
