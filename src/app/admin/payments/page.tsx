'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Payment {
    id: string;
    amount: number;
    type: 'PAYSTACK' | 'CRYPTO';
    status: string;
    reference: string;
    cryptoTxId?: string;
    cryptoNetwork?: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

function AdminPaymentsContent() {
    const searchParams = useSearchParams();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '');
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        fetchPayments();
    }, [typeFilter, statusFilter]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (typeFilter) params.set('type', typeFilter);
            if (statusFilter) params.set('status', statusFilter);

            const response = await fetch(`/api/admin/payments?${params}`);
            const data = await response.json();
            if (response.ok) {
                setPayments(data.payments);
                setPendingCount(data.pendingCryptoCount);
            }
        } catch (error) {
            console.error('Failed to fetch payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (paymentId: string, action: 'approve' | 'reject') => {
        if (!confirm(`Are you sure you want to ${action} this payment?`)) return;

        setProcessing(paymentId);
        try {
            const response = await fetch(`/api/payments/crypto/${paymentId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });

            if (response.ok) {
                fetchPayments();
            }
        } catch (error) {
            console.error('Failed to process payment:', error);
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-brand tracking-tight">Payment Transactions</h1>
                    <p className="text-slate-500 mt-1 text-[10px] uppercase font-black tracking-widest">
                        Monitor wallet recharges and purchase history across the platform.
                        {pendingCount > 0 && (
                            <span className="ml-2 text-brand animate-pulse">({pendingCount} PENDING)</span>
                        )}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex gap-2">
                    <Button
                        variant={typeFilter === '' ? 'primary' : 'outline'}
                        size="sm"
                        className="h-8 text-[10px] font-black uppercase"
                        onClick={() => setTypeFilter('')}
                    >
                        All Types
                    </Button>
                    <Button
                        variant={typeFilter === 'PAYSTACK' ? 'primary' : 'outline'}
                        size="sm"
                        className="h-8 text-[10px] font-black uppercase"
                        onClick={() => setTypeFilter('PAYSTACK')}
                    >
                        Paystack
                    </Button>
                    <Button
                        variant={typeFilter === 'CRYPTO' ? 'primary' : 'outline'}
                        size="sm"
                        className="h-8 text-[10px] font-black uppercase"
                        onClick={() => setTypeFilter('CRYPTO')}
                    >
                        Crypto
                    </Button>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={statusFilter === '' ? 'primary' : 'outline'}
                        size="sm"
                        className="h-8 text-[10px] font-black uppercase"
                        onClick={() => setStatusFilter('')}
                    >
                        All Status
                    </Button>
                    <Button
                        variant={statusFilter === 'PENDING' ? 'primary' : 'outline'}
                        size="sm"
                        className="h-8 text-[10px] font-black uppercase"
                        onClick={() => setStatusFilter('PENDING')}
                    >
                        Pending
                    </Button>
                    <Button
                        variant={statusFilter === 'VERIFIED' ? 'primary' : 'outline'}
                        size="sm"
                        className="h-8 text-[10px] font-black uppercase"
                        onClick={() => setStatusFilter('VERIFIED')}
                    >
                        Verified
                    </Button>
                </div>
            </div>

            {/* Payments Table */}
            <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                            <TableRow className="border-transparent hover:bg-transparent h-12">
                                <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-widest pl-6">Transaction</TableHead>
                                <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-widest">User</TableHead>
                                <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Amount</TableHead>
                                <TableHead className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Type</TableHead>
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
                            ) : payments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-20 text-slate-400 italic text-xs font-medium">
                                        No payment records found matching your filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                payments.map((payment) => (
                                    <TableRow key={payment.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-[10px] font-black text-brand uppercase">#{payment.id.slice(-8)}</span>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Ref: {payment.reference.slice(-8)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-black text-brand text-xs">{payment.user.name}</span>
                                                <span className="text-[10px] text-slate-500 truncate max-w-[150px]">{payment.user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-black text-brand text-sm">
                                                {formatCurrency(payment.amount)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <Badge variant="outline" className="text-[10px] font-black uppercase border-slate-200 text-slate-500 w-fit">
                                                    {payment.type}
                                                </Badge>
                                                {payment.cryptoNetwork && <span className="text-[9px] text-brand/60 font-bold uppercase">{payment.cryptoNetwork}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={(payment.status === 'APPROVED' || payment.status === 'VERIFIED' || payment.status === 'COMPLETED') ? 'success' : payment.status === 'PENDING' ? 'outline' : 'error'}
                                                className={`text-[10px] font-black uppercase ${(payment.status === 'APPROVED' || payment.status === 'VERIFIED' || payment.status === 'COMPLETED') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    payment.status === 'PENDING' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                        'bg-red-50 text-red-600 border-red-100'
                                                    }`}
                                            >
                                                {payment.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="pr-6 text-right">
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="text-[10px] text-slate-400 font-bold">{formatDate(payment.createdAt)}</span>
                                                {payment.type === 'CRYPTO' && payment.status === 'PENDING' && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 text-[9px] font-black uppercase border-emerald-100 text-emerald-600 hover:bg-emerald-50"
                                                            loading={processing === payment.id}
                                                            onClick={() => handleApprove(payment.id, 'approve')}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 text-[9px] font-black uppercase border-red-100 text-red-600 hover:bg-red-50"
                                                            loading={processing === payment.id}
                                                            onClick={() => handleApprove(payment.id, 'reject')}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>
                                                )}
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

export default function AdminPaymentsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center p-20 text-white">Loading payments...</div>}>
            <AdminPaymentsContent />
        </Suspense>
    );
}
