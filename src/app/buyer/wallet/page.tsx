'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';

interface WalletData {
    balance: number;
    transactions: Array<{
        id: string;
        type: 'CREDIT' | 'DEBIT';
        amount: number;
        description: string;
        balanceAfter: number;
        createdAt: string;
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

            if (response.ok && data.status === 'VERIFIED') {
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-white mb-8">My Wallet</h1>

            {/* Messages */}
            {success && (
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                    {success}
                </div>
            )}
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                    {error}
                </div>
            )}

            {/* Balance Card */}
            <Card className="mb-8" gradient>
                <CardContent className="py-8">
                    <div className="text-center">
                        <p className="text-slate-400 mb-2">Current Balance</p>
                        <p className="text-5xl font-bold text-white">
                            {loading ? '...' : formatCurrency(wallet?.balance || 0)}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Fund Wallet Section */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Fund Your Wallet</CardTitle>
                </CardHeader>
                <CardContent>
                    {!paymentMethod ? (
                        <div className="grid md:grid-cols-2 gap-4">
                            <button
                                onClick={() => setPaymentMethod('paystack')}
                                className="p-6 border border-slate-700 rounded-xl hover:border-green-500/50 hover:bg-green-500/5 transition-all text-left"
                            >
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                                        <span className="text-green-400 text-lg">🇳🇬</span>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium">Paystack</h3>
                                        <p className="text-sm text-slate-400">Instant · Nigeria</p>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-400">
                                    Pay with card, bank transfer, or USSD. Instant wallet credit.
                                </p>
                            </button>

                            <button
                                onClick={() => setPaymentMethod('crypto')}
                                className="p-6 border border-slate-700 rounded-xl hover:border-orange-500/50 hover:bg-orange-500/5 transition-all text-left"
                            >
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mr-3">
                                        <span className="text-orange-400 text-lg">₿</span>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium">Cryptocurrency</h3>
                                        <p className="text-sm text-slate-400">Manual · International</p>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-400">
                                    Pay with BTC, ETH, or USDT. Requires admin approval.
                                </p>
                            </button>
                        </div>
                    ) : paymentMethod === 'paystack' ? (
                        <div className="space-y-6">
                            <Button variant="ghost" size="sm" onClick={() => setPaymentMethod(null)}>
                                ← Back to options
                            </Button>

                            <Input
                                label="Amount (NGN)"
                                type="number"
                                placeholder="Enter amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min={100}
                            />

                            <div className="flex flex-wrap gap-2">
                                {quickAmounts.map((amt) => (
                                    <Button
                                        key={amt}
                                        variant={amount === amt.toString() ? 'primary' : 'outline'}
                                        size="sm"
                                        onClick={() => setAmount(amt.toString())}
                                    >
                                        {formatCurrency(amt)}
                                    </Button>
                                ))}
                            </div>

                            <Button
                                className="w-full"
                                onClick={handlePaystackPayment}
                                loading={processing}
                                disabled={!amount || parseFloat(amount) < 100}
                            >
                                Pay with Paystack
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <Button variant="ghost" size="sm" onClick={() => setPaymentMethod(null)}>
                                ← Back to options
                            </Button>

                            <Input
                                label="Amount (NGN equivalent)"
                                type="number"
                                placeholder="Enter Naira equivalent"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min={100}
                            />

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Select Network
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {cryptoAddresses.map((crypto) => (
                                        <button
                                            key={crypto.network}
                                            onClick={() => setSelectedNetwork(crypto.network)}
                                            className={`p-3 border rounded-xl text-center transition-all ${selectedNetwork === crypto.network
                                                ? 'border-violet-500 bg-violet-500/10'
                                                : 'border-slate-700 hover:border-slate-600'
                                                }`}
                                        >
                                            <span className="text-white font-medium">{crypto.network}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {selectedNetwork && (
                                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                                    <p className="text-sm text-slate-400 mb-2">Send to this address:</p>
                                    <p className="text-white font-mono text-sm break-all">
                                        {cryptoAddresses.find((c) => c.network === selectedNetwork)?.address || 'Address not available'}
                                    </p>
                                </div>
                            )}

                            <Input
                                label="Transaction ID (TXID)"
                                type="text"
                                placeholder="Enter your transaction hash"
                                value={cryptoTxId}
                                onChange={(e) => setCryptoTxId(e.target.value)}
                            />

                            <Button
                                className="w-full"
                                onClick={handleCryptoSubmit}
                                loading={processing}
                                disabled={!amount || !selectedNetwork || !cryptoTxId}
                            >
                                Submit for Approval
                            </Button>

                            <p className="text-sm text-slate-400 text-center">
                                Your wallet will be credited after admin verification (usually within 24 hours)
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Transaction History */}
            <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="animate-pulse flex items-center justify-between">
                                    <div className="h-4 bg-slate-700 rounded w-1/2" />
                                    <div className="h-4 bg-slate-700 rounded w-1/4" />
                                </div>
                            ))}
                        </div>
                    ) : wallet?.transactions.length ? (
                        <div className="space-y-1">
                            {wallet.transactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-0">
                                    <div className="flex items-center">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${tx.type === 'CREDIT' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                                            }`}>
                                            <svg className={`w-5 h-5 ${tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tx.type === 'CREDIT' ? 'M12 6v12m6-6H6' : 'M20 12H4'} />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-white">{tx.description}</p>
                                            <p className="text-sm text-slate-400">{formatDate(tx.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-semibold ${tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {tx.type === 'CREDIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                                        </p>
                                        <p className="text-sm text-slate-400">
                                            Balance: {formatCurrency(tx.balanceAfter)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400 text-center py-8">No transactions yet</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function WalletPage() {
    return (
        <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-20 text-center text-white">Loading wallet balance...</div>}>
            <WalletContent />
        </Suspense>
    );
}
