'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar, Footer } from '@/components/layout';
import { Button, Card, Badge, WhatsAppFAB } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface Subcategory {
    id: string;
    title: string;
    category: string;
    price: number;
    description: string;
    countries: string[];
    availableStock: number;
    isOutOfStock: boolean;
}

export default function SubcategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetchSubcategory();
    }, [id]);

    const fetchSubcategory = async () => {
        try {
            const res = await fetch(`/api/assets/${id}`);
            const data = await res.json();
            if (res.ok) setSubcategory(data.subcategory);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async () => {
        if (!subcategory) return;
        setPurchasing(true);

        try {
            const res = await fetch('/api/assets/unlock-batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    purchases: [{ subcategoryId: subcategory.id, quantity }]
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(`Successfully unlocked ${quantity} unit(s)!`);
                router.push('/dashboard');
            } else {
                toast.error(data.error || 'Failed to complete purchase');
            }
        } catch (error) {
            toast.error('Store error. Please try again.');
        } finally {
            setPurchasing(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
        </div>
    );

    if (!subcategory) return (
        <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <h1 className="text-xl font-bold text-white mb-2">Inventory Not Found</h1>
                <p className="text-sm text-slate-500 mb-6 font-medium uppercase tracking-widest">The requested item dose not exist or has been removed.</p>
                <Button onClick={() => router.push('/assets')} variant="outline" className="text-xs uppercase font-bold px-8">Back to Directory</Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-slate-950 font-sans">
            <Navbar />

            <main className="flex-1 pt-24 pb-20 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header Hierarchy */}
                    <div className="flex items-center gap-2 mb-6">
                        <Link href="/assets" className="text-[10px] font-bold text-slate-500 hover:text-cyan-400 uppercase tracking-widest transition-colors">Directory</Link>
                        <span className="text-slate-700 text-[10px]">/</span>
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">{subcategory.category}</span>
                    </div>

                    <div className="grid lg:grid-cols-5 gap-8">
                        {/* LEFT: Metadata */}
                        <div className="lg:col-span-3 space-y-6">
                            <section>
                                <h1 className="text-3xl font-bold text-white tracking-tight mb-2 leading-tight">{subcategory.title}</h1>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {subcategory.countries.map(c => (
                                        <Badge key={c} variant="outline" className="text-[9px] uppercase font-bold border-slate-800 text-slate-400 px-2 py-0">{c}</Badge>
                                    ))}
                                    <Badge variant="outline" className="text-[9px] uppercase font-bold border-cyan-500/30 text-cyan-400 px-2 py-0">Global Delivery</Badge>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Public Information</h2>
                                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl h-full">
                                    <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
                                        {subcategory.description || 'Premium asset units for strategic digital operations. Each unit is unique, sell-once, and contains proprietary locked details revealed only after unlocking.'}
                                    </p>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Security Protocol</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        { title: 'Single Use', desc: 'Each asset reflects 1 unique entity.' },
                                        { title: 'Infinite Access', desc: 'Unlock once, keep forever.' },
                                        { title: 'Privacy First', desc: 'Secure delivery of credentials.' },
                                        { title: 'Verified', desc: 'Pre-vetted for quality and status.' },
                                    ].map(item => (
                                        <div key={item.title} className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                                            <h4 className="text-[10px] font-bold text-white mb-1 uppercase tracking-widest">{item.title}</h4>
                                            <p className="text-[11px] text-slate-500 leading-tight">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* RIGHT: Action Card */}
                        <div className="lg:col-span-2">
                            <Card className="sticky top-24 overflow-hidden border-slate-800/80 bg-slate-900/80 backdrop-blur-md">
                                <div className="p-6 space-y-6">
                                    {/* Price and Stock */}
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Price per unit</p>
                                            <p className="text-3xl font-black text-white">{formatCurrency(subcategory.price)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                                            <Badge variant={subcategory.isOutOfStock ? 'error' : 'success'} className="text-[9px] font-bold px-2 py-0">
                                                {subcategory.isOutOfStock ? 'Sold Out' : `${subcategory.availableStock} Available`}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Interaction */}
                                    <div className="space-y-4">
                                        {!subcategory.isOutOfStock && (
                                            <div className="grid grid-cols-3 items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                                                <button
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    className="h-10 text-xl font-bold text-slate-500 hover:text-white transition-colors"
                                                >-</button>
                                                <div className="text-center">
                                                    <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Qty</p>
                                                    <p className="text-sm font-bold text-white">{quantity}</p>
                                                </div>
                                                <button
                                                    onClick={() => setQuantity(Math.min(subcategory.availableStock, quantity + 1))}
                                                    className="h-10 text-xl font-bold text-slate-500 hover:text-white transition-colors"
                                                >+</button>
                                            </div>
                                        )}

                                        <Button
                                            onClick={handlePurchase}
                                            disabled={subcategory.isOutOfStock || purchasing}
                                            className="w-full h-14 bg-cyan-600 hover:bg-cyan-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-cyan-900/20 disabled:bg-slate-800 disabled:text-slate-600"
                                        >
                                            {purchasing ? 'Processing...' : subcategory.isOutOfStock ? 'Subcategory Sold Out' : 'Unlock Inventory Now'}
                                        </Button>
                                    </div>

                                    <div className="pt-4 border-t border-slate-800">
                                        <p className="text-[10px] text-slate-500 text-center leading-relaxed font-medium italic">
                                            Transaction will be debited from your wallet balance. Unlocked units appear instantly in your dashboard.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
            <WhatsAppFAB phoneNumber="08071400331" />
        </div>
    );
}
