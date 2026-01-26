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
    logo?: string;
    previewLink?: string;
    tutorialLink?: string;
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
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
        </div>
    );

    if (!subcategory) return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100 italic text-4xl">?</div>
                <h1 className="text-2xl font-black text-brand mb-2 uppercase tracking-tight">Record Not Found</h1>
                <p className="text-xs text-slate-400 mb-8 font-black uppercase tracking-widest text-center max-w-xs leading-relaxed">The requested asset has been decommissioned or does not exist in our active directory.</p>
                <Button onClick={() => router.push('/assets')} className="text-[10px] uppercase font-black px-10 h-11 bg-brand shadow-lg">Return to Marketplace</Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-white font-sans text-brand">
            <Navbar />

            <main className="flex-1 pt-20 md:pt-24 pb-20 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header Breadcrumbs */}
                    <div className="flex items-center gap-3 mb-6 md:mb-8 overflow-hidden">
                        <Link href="/assets" className="text-[10px] font-bold text-slate-400 hover:text-brand uppercase tracking-widest transition-colors whitespace-nowrap">Marketplace</Link>
                        <span className="text-slate-200">/</span>
                        <span className="text-[10px] font-bold text-brand uppercase tracking-widest truncate">{subcategory.title}</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                        {/* LEFT: Meta & Description */}
                        <div className="lg:col-span-8 space-y-8 md:space-y-10">
                            <section className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center p-4 shadow-sm flex-shrink-0">
                                    {subcategory.logo ? (
                                        <img src={subcategory.logo} alt={subcategory.title} className="w-full h-full object-contain" />
                                    ) : (
                                        <span className="text-3xl md:text-4xl text-slate-200">📦</span>
                                    )}
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline" className="text-[9px] font-bold uppercase border-brand/20 text-brand bg-brand/5 px-3">
                                            {subcategory.category}
                                        </Badge>
                                        <Badge variant="outline" className="text-[9px] font-bold uppercase border-slate-200 text-slate-500 bg-white px-3">
                                            Primary Sector
                                        </Badge>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-brand tracking-tight leading-tight break-words">{subcategory.title}</h1>
                                    <div className="flex flex-wrap gap-3 items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Secure Protocol</span>
                                        <span className="text-slate-200">•</span>
                                        <span className="flex items-center gap-1.5">Instant Provisioning</span>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-3">
                                    Product Specification
                                    <div className="h-px bg-slate-100 flex-1" />
                                </h2>
                                <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm">
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                                        {subcategory.description || 'Global premium asset. High-priority delivery and verified uptime. Full metadata available post-unlock.'}
                                    </p>
                                </div>
                            </section>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-6 rounded-2xl md:rounded-3xl bg-slate-50 border border-slate-100 space-y-1.5">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Regional Node</p>
                                    <p className="text-xs font-bold text-brand uppercase tracking-tight">{subcategory.countries?.join(', ') || 'Global Distribution'}</p>
                                </div>
                                <div className="p-6 rounded-2xl md:rounded-3xl bg-slate-50 border border-slate-100 space-y-1.5">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Asset Integrity</p>
                                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-tight">100% Verified & Active</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                {subcategory.previewLink && (
                                    <Button variant="outline" onClick={() => window.open(subcategory.previewLink, '_blank')} className="flex-1 h-12 text-[10px] font-bold uppercase tracking-widest border-slate-200 hover:border-brand hover:text-brand bg-white rounded-xl transition-all">
                                        View Resource Preview
                                    </Button>
                                )}
                                {subcategory.tutorialLink && (
                                    <Button variant="outline" onClick={() => window.open(subcategory.tutorialLink, '_blank')} className="flex-1 h-12 text-[10px] font-bold uppercase tracking-widest border-slate-200 hover:border-brand hover:text-brand bg-white rounded-xl transition-all">
                                        Access User Guide
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Fulfillment Card */}
                        <div className="lg:col-span-4">
                            <Card className="sticky top-24 overflow-hidden border-slate-100 shadow-xl bg-white rounded-3xl">
                                <div className="bg-brand py-2.5 px-6">
                                    <p className="text-[9px] font-bold text-white uppercase tracking-widest text-center">Checkout Terminal</p>
                                </div>
                                <div className="p-6 md:p-8 space-y-8">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pricing</p>
                                            <p className="text-3xl md:text-4xl font-bold text-brand tracking-tight">{formatCurrency(subcategory.price)}</p>
                                        </div>
                                        <div className="text-right space-y-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stock</p>
                                            <Badge variant={subcategory.isOutOfStock ? 'error' : 'success'} className="px-3 py-1 font-bold uppercase text-[8px] tracking-tight">
                                                {subcategory.isOutOfStock ? 'Depleted' : `${subcategory.availableStock} Units`}
                                            </Badge>
                                        </div>
                                    </div>

                                    {!subcategory.isOutOfStock && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-1.5 bg-slate-50 border border-slate-100 rounded-2xl">
                                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-brand font-bold hover:bg-white rounded-xl transition-all">-</button>
                                                <div className="text-center px-4">
                                                    <span className="text-sm font-bold text-brand">{quantity}</span>
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">UNITS</p>
                                                </div>
                                                <button onClick={() => setQuantity(Math.min(subcategory.availableStock, quantity + 1))} className="w-10 h-10 flex items-center justify-center text-brand font-bold hover:bg-white rounded-xl transition-all">+</button>
                                            </div>

                                            <Button
                                                onClick={handlePurchase}
                                                disabled={subcategory.isOutOfStock || purchasing}
                                                className="w-full h-15 bg-brand hover:bg-brand-dark text-white font-bold text-[10px] md:text-[11px] uppercase tracking-widest shadow-lg shadow-brand/10 transition-all active:scale-[0.98] rounded-xl"
                                            >
                                                {purchasing ? 'Encrypting Order...' : 'Authorize Unlock'}
                                            </Button>
                                        </div>
                                    )}

                                    {subcategory.isOutOfStock && (
                                        <div className="bg-red-50 border border-red-100 p-5 rounded-2xl text-center">
                                            <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1.5">Stock Exhausted</p>
                                            <p className="text-[11px] text-red-500 font-medium">Please verify again later or browse other active sectors.</p>
                                        </div>
                                    )}

                                    <div className="pt-6 border-t border-slate-50 text-center">
                                        <p className="text-[10px] text-slate-400 font-bold italic leading-relaxed px-2">
                                            Balances are settled via secure wallet authentication. Check your dashboard for unlocked credentials.
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
