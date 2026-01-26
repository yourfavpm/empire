'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge, WhatsAppFAB } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface WalletData {
    balance: number;
    transactions: Array<{
        id: string;
        type: 'CREDIT' | 'DEBIT';
        amount: number;
        description: string;
        balanceAfter: number;
        createdAt: string;
        status?: 'PENDING' | 'COMPLETED';
    }>;
}

interface CryptoAddress {
    network: string;
    address: string;
}

function WalletContent() {
    const searchParams = useSearchParams();
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [loading, setLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'crypto' | null>(null);
    const [amount, setAmount] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Crypto specific
    const [cryptoAddresses, setCryptoAddresses] = useState<CryptoAddress[]>([]);
    const [selectedNetwork, setSelectedNetwork] = useState('');
    const [cryptoTxId, setCryptoTxId] = useState('');

    useEffect(() => {
        fetchWallet();
        fetchCryptoInfo();

        // Handle Paystack callback
        const payment = searchParams.get('payment');
        const reference = searchParams.get('reference');

        if (payment === 'callback' && reference) {
            verifyPaystackPayment(reference);
        }
    }, [searchParams]);

    const fetchWallet = async () => {
        try {
            const response = await fetch('/api/wallet');
            const data = await response.json();
            if (response.ok) setWallet(data);
        } catch (error) {
            console.error('Failed to fetch wallet:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCryptoInfo = async () => {
        try {
            const response = await fetch('/api/payments/crypto');
            const data = await response.json();
            if (response.ok) setCryptoAddresses(data.addresses);
        } catch (error) {
            console.error('Failed to fetch crypto info:', error);
        }
    };

    const verifyPaystackPayment = async (reference: string) => {
        setProcessing(true);
        setSuccess('');
        setError('');

        try {
            const response = await fetch('/api/payments/paystack/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference }),
            });

            const data = await response.json();

            if (response.ok && data.status === 'APPROVED') {
                setSuccess('Payment verified! Your wallet has been credited.');
                fetchWallet();
            } else if (data.status === 'PENDING') {
                setError('Payment is still pending. Please wait a moment.');
            } else {
                setError(data.error || 'Payment verification failed');
            }
        } catch (error) {
            setError('Failed to verify payment');
        } finally {
            setProcessing(false);
        }
    };

    const handlePaystackPayment = async () => {
        const amountNum = parseFloat(amount);
        if (!amountNum || amountNum < 100) {
            setError('Minimum amount is ₦100');
            return;
        }

        setProcessing(true);
        setError('');

        try {
            const response = await fetch('/api/payments/paystack/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: amountNum }),
            });

            const data = await response.json();

            if (response.ok) {
                // Redirect to Paystack
                window.location.href = data.authorizationUrl;
            } else {
                setError(data.error || 'Failed to initialize payment');
            }
        } catch (error) {
            setError('Something went wrong');
        } finally {
            setProcessing(false);
        }
    };

    const handleCryptoSubmit = async () => {
        const amountNum = parseFloat(amount);
        if (!amountNum || amountNum < 100) {
            setError('Minimum amount is ₦100 equivalent');
            return;
        }

        if (!selectedNetwork) {
            setError('Please select a crypto network');
            return;
        }

        if (!cryptoTxId || cryptoTxId.length < 10) {
            setError('Please enter a valid transaction ID');
            return;
        }

        setProcessing(true);
        setError('');

        try {
            const response = await fetch('/api/payments/crypto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: amountNum,
                    cryptoTxId,
                    cryptoNetwork: selectedNetwork,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Payment submitted! An admin will verify and credit your wallet within 24 hours.');
                setPaymentMethod(null);
                setAmount('');
                setCryptoTxId('');
                setSelectedNetwork('');
            } else {
                setError(data.error || 'Failed to submit payment');
            }
        } catch (error) {
            setError('Something went wrong');
        } finally {
            setProcessing(false);
        }
    };

    const quickAmounts = [1000, 5000, 10000, 25000, 50000];

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financial Terminal</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-brand tracking-tight mb-8">My Wallet</h1>

                {/* Messages */}
                {success && (
                    <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm font-medium">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-medium">
                        {error}
                    </div>
                )}

                {/* Balance Card */}
                <Card className="mb-10 bg-white border-slate-100 shadow-xl rounded-3xl overflow-hidden">
                    <CardContent className="py-10 md:py-12">
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Available Balance</p>
                            <p className="text-4xl md:text-5xl font-bold text-brand tracking-tighter">
                                {loading ? '...' : formatCurrency(wallet?.balance || 0)}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Fund Wallet Section */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-lg font-bold text-brand tracking-tight">Fund Your Wallet</h2>
                        <div className="h-px flex-1 bg-slate-100" />
                    </div>

                    {!paymentMethod ? (
                        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                            <button
                                onClick={() => setPaymentMethod('paystack')}
                                className="p-6 md:p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md hover:border-brand/30 transition-all text-left group"
                            >
                                <div className="flex items-center mb-4">
                                    <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                        <span className="text-xl">🇳🇬</span>
                                    </div>
                                    <div>
                                        <h3 className="text-brand font-bold text-sm">Paystack</h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Instant · Local</p>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Pay with card, bank transfer, or USSD. Instant wallet credit.
                                </p>
                            </button>

                            <button
                                onClick={() => setPaymentMethod('crypto')}
                                className="p-6 md:p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md hover:border-brand/30 transition-all text-left group"
                            >
                                <div className="flex items-center mb-4">
                                    <div className="w-11 h-11 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                        <span className="text-xl">₿</span>
                                    </div>
                                    <div>
                                        <h3 className="text-brand font-bold text-sm">Cryptocurrency</h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Manual · International</p>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Pay with BTC, ETH, or USDT. Requires admin approval (up to 24h).
                                </p>
                            </button>
                        </div>
                    ) : (
                        <Card className="bg-white border-slate-100 shadow-lg rounded-3xl overflow-hidden">
                            <CardContent className="p-6 md:p-8">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setPaymentMethod(null)}
                                    className="mb-8 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-brand -ml-2"
                                >
                                    ← Back to options
                                </Button>

                                {paymentMethod === 'paystack' ? (
                                    <div className="space-y-8 max-w-lg mx-auto">
                                        <Input
                                            label="Amount (NGN)"
                                            type="number"
                                            placeholder="Enter amount"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            min={100}
                                            className="bg-slate-50 border-slate-100 focus:border-brand/30 text-brand font-bold"
                                        />

                                        <div className="flex flex-wrap gap-2">
                                            {quickAmounts.map((amt) => (
                                                <button
                                                    key={amt}
                                                    onClick={() => setAmount(amt.toString())}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${amount === amt.toString()
                                                        ? 'bg-brand text-white shadow-md'
                                                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                                        }`}
                                                >
                                                    {formatCurrency(amt)}
                                                </button>
                                            ))}
                                        </div>

                                        <Button
                                            className="w-full h-14 bg-brand hover:bg-brand-dark text-white font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-brand/10 transition-all"
                                            onClick={handlePaystackPayment}
                                            loading={processing}
                                            disabled={!amount || parseFloat(amount) < 100}
                                        >
                                            Intialize Paystack Terminal
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-8 max-w-xl mx-auto">
                                        <Input
                                            label="Amount (NGN equivalent)"
                                            type="number"
                                            placeholder="Enter Naira equivalent"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            min={100}
                                            className="bg-slate-50 border-slate-100 text-brand font-bold"
                                        />

                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                                                Select Network
                                            </label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {cryptoAddresses.map((crypto) => (
                                                    <button
                                                        key={crypto.network}
                                                        onClick={() => setSelectedNetwork(crypto.network)}
                                                        className={`p-4 border rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all ${selectedNetwork === crypto.network
                                                            ? 'border-brand bg-brand/5 text-brand shadow-sm'
                                                            : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200 hover:bg-slate-100'
                                                            }`}
                                                    >
                                                        {crypto.network}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {selectedNetwork && (
                                            <div className="p-5 bg-brand/[0.02] border border-brand/10 rounded-2xl">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Deposit Address</p>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-brand font-mono text-xs break-all flex-1">
                                                        {cryptoAddresses.find((c) => c.network === selectedNetwork)?.address || 'Address not available'}
                                                    </p>
                                                    <button
                                                        onClick={() => {
                                                            const addr = cryptoAddresses.find((c) => c.network === selectedNetwork)?.address;
                                                            if (addr) {
                                                                navigator.clipboard.writeText(addr);
                                                                toast.success('Address copied!');
                                                            }
                                                        }}
                                                        className="p-2 hover:bg-brand/10 rounded-lg text-brand transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <Input
                                            label="Transaction ID (TXID)"
                                            type="text"
                                            placeholder="Enter your transaction hash"
                                            value={cryptoTxId}
                                            onChange={(e) => setCryptoTxId(e.target.value)}
                                            className="bg-slate-50 border-slate-100 text-brand font-bold"
                                        />

                                        <Button
                                            className="w-full h-14 bg-brand hover:bg-brand-dark text-white font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-brand/10"
                                            onClick={handleCryptoSubmit}
                                            loading={processing}
                                            disabled={!amount || !selectedNetwork || !cryptoTxId}
                                        >
                                            Submit for Final Verification
                                        </Button>

                                        <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest leading-relaxed">
                                            Credited after network confirmation & admin approval
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Transaction History */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-lg font-bold text-brand tracking-tight">Transaction History</h2>
                        <div className="h-px flex-1 bg-slate-100" />
                    </div>

                    <Card className="bg-white border-slate-100 shadow-xl rounded-3xl overflow-hidden">
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="p-8 space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="animate-pulse flex items-center justify-between">
                                            <div className="h-10 bg-slate-50 rounded-xl w-full" />
                                        </div>
                                    ))}
                                </div>
                            ) : wallet?.transactions.length ? (
                                <div className="divide-y divide-slate-50">
                                    {wallet.transactions.map((tx) => {
                                        const isPending = tx.status === 'PENDING';
                                        const isCredit = tx.type === 'CREDIT';
                                        const colorClass = isPending ? 'text-amber-500' : isCredit ? 'text-emerald-500' : 'text-brand';
                                        const bgClass = isPending ? 'bg-amber-50' : isCredit ? 'bg-emerald-50' : 'bg-slate-50';
                                        const iconPath = isPending
                                            ? 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                                            : isCredit ? 'M12 6v12m6-6H6' : 'M20 12H4';

                                        return (
                                            <div key={tx.id} className="flex items-center justify-between p-5 md:p-6 hover:bg-slate-50/50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm ${bgClass}`}>
                                                        <svg className={`w-5 h-5 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={iconPath} />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <p className="text-xs font-bold text-brand uppercase tracking-tight">{tx.description}</p>
                                                            {isPending && <Badge variant="warning" className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0">PENDING</Badge>}
                                                        </div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatDate(tx.createdAt)}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-sm font-bold tracking-tight ${colorClass}`}>
                                                        {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                                                    </p>
                                                    {!isPending && (
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                            New Bal: {formatCurrency(tx.balanceAfter)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-16 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 italic text-2xl text-slate-200">?</div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No activity recorded yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
            <WhatsAppFAB phoneNumber="08071400331" />
        </div>
    );
}

export default function WalletPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-brand rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accessing Wallet Terminal...</p>
                </div>
            </div>
        }>
            <WalletContent />
        </Suspense>
    );
}
