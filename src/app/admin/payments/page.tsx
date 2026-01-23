'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, StatusBadge } from '@/components/ui';
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
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Payments</h1>
                    <p className="text-slate-400 mt-1">
                        Manage payments and approve crypto transactions
                        {pendingCount > 0 && (
                            <span className="ml-2 text-amber-400">({pendingCount} pending)</span>
                        )}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <div className="flex gap-2">
                    <Button
                        variant={typeFilter === '' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setTypeFilter('')}
                    >
                        All Types
                    </Button>
                    <Button
                        variant={typeFilter === 'PAYSTACK' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setTypeFilter('PAYSTACK')}
                    >
                        Paystack
                    </Button>
                    <Button
                        variant={typeFilter === 'CRYPTO' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setTypeFilter('CRYPTO')}
                    >
                        Crypto
                    </Button>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={statusFilter === '' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => setStatusFilter('')}
                    >
                        All Status
                    </Button>
                    <Button
                        variant={statusFilter === 'PENDING' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => setStatusFilter('PENDING')}
                    >
                        Pending
                    </Button>
                    <Button
                        variant={statusFilter === 'VERIFIED' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => setStatusFilter('VERIFIED')}
                    >
                        Verified
                    </Button>
                </div>
            </div>

            {/* Payments Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left py-4 px-6 text-slate-400 font-medium">User</th>
                                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Amount</th>
                                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Type</th>
                                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Status</th>
                                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Reference</th>
                                    <th className="text-left py-4 px-6 text-slate-400 font-medium">Date</th>
                                    <th className="text-right py-4 px-6 text-slate-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="border-b border-slate-800">
                                            <td colSpan={7} className="py-4 px-6">
                                                <div className="h-6 bg-slate-700 rounded animate-pulse" />
                                            </td>
                                        </tr>
                                    ))
                                ) : payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-slate-400">
                                            No payments found
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((payment) => (
                                        <tr key={payment.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                                            <td className="py-4 px-6">
                                                <p className="text-white">{payment.user.name}</p>
                                                <p className="text-sm text-slate-400">{payment.user.email}</p>
                                            </td>
                                            <td className="py-4 px-6 text-white font-medium">
                                                {formatCurrency(payment.amount)}
                                            </td>
                                            <td className="py-4 px-6">
                                                <Badge variant={payment.type === 'PAYSTACK' ? 'success' : 'warning'}>
                                                    {payment.type}
                                                    {payment.cryptoNetwork && ` (${payment.cryptoNetwork})`}
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-6">
                                                <StatusBadge status={payment.status} type="payment" />
                                            </td>
                                            <td className="py-4 px-6 text-slate-400 text-sm">
                                                <p className="font-mono">{payment.reference}</p>
                                                {payment.cryptoTxId && (
                                                    <p className="font-mono text-xs truncate max-w-[150px]" title={payment.cryptoTxId}>
                                                        TXID: {payment.cryptoTxId}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-slate-400">
                                                {formatDate(payment.createdAt)}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                {payment.type === 'CRYPTO' && payment.status === 'PENDING' && (
                                                    <div className="flex gap-2 justify-end">
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            loading={processing === payment.id}
                                                            onClick={() => handleApprove(payment.id, 'approve')}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            loading={processing === payment.id}
                                                            onClick={() => handleApprove(payment.id, 'reject')}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>
                                                )}
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

export default function AdminPaymentsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center p-20 text-white">Loading payments...</div>}>
            <AdminPaymentsContent />
        </Suspense>
    );
}
