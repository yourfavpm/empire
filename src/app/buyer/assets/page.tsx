'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Badge, Button, WhatsAppFAB } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface AssetUnit {
    id: string;
    title: string;
    category: string;
    price: number;
    lockedDescription: string;
    orderId?: string;
    unlockedAt: string;
}

export default function BuyerAssetsPage() {
    const [assets, setAssets] = useState<AssetUnit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            const response = await fetch('/api/buyer/assets');
            const data = await response.json();
            if (response.ok) setAssets(data.assets);
        } catch (error) {
            console.error('Failed to fetch assets:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Credentials copied to clipboard');
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client Inventory</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-brand tracking-tight">Purchased Assets</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Operational records of your unique digital items</p>
                    </div>
                    <Link href="/assets" className="w-full md:w-auto">
                        <Button className="w-full md:w-auto bg-brand hover:bg-brand-dark text-white text-[10px] font-bold uppercase tracking-widest px-8 h-11 shadow-lg shadow-brand/10 transition-all">
                            Explore Marketplace
                        </Button>
                    </Link>
                </div>

                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="animate-pulse bg-slate-50 border-slate-100 h-56 rounded-2xl" />
                        ))}
                    </div>
                ) : assets.length === 0 ? (
                    <div className="text-center py-24 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                        <div className="text-4xl mb-4 opacity-20 italic">🛒</div>
                        <h3 className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-widest">No Purchases Yet</h3>
                        <p className="text-xs text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
                            Items you unlock from the marketplace will appear here with their high-security private credentials.
                        </p>
                        <Link href="/assets">
                            <Button variant="outline" className="text-[10px] border-brand/20 text-brand font-bold uppercase tracking-widest hover:bg-brand/5 px-8 h-10 rounded-xl">
                                Start Shopping
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {assets.map((asset) => (
                            <Card key={asset.id} className="bg-white border-slate-100 shadow-md hover:shadow-xl hover:border-brand/20 transition-all rounded-2xl overflow-hidden group">
                                <div className="p-6 space-y-5">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-[9px] font-bold text-brand uppercase tracking-widest mb-1.5">{asset.category}</div>
                                            <h3 className="text-sm font-bold text-brand group-hover:text-brand-dark transition-colors line-clamp-1 tracking-tight">{asset.title}</h3>
                                        </div>
                                        <Badge variant="success" className="text-[8px] font-bold uppercase px-2 py-0.5 tracking-tighter">SECURED</Badge>
                                    </div>

                                    <div className="space-y-2.5">
                                        <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            <span>Credentials Terminal</span>
                                            <button
                                                onClick={() => copyToClipboard(asset.lockedDescription)}
                                                className="hover:text-brand flex items-center gap-1 transition-colors"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
                                                Copy
                                            </button>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 group-hover:border-brand/10 transition-all font-mono text-[11px] text-brand break-all select-all leading-relaxed shadow-inner">
                                            {asset.lockedDescription}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end pt-4 border-t border-slate-50">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tight">Ref: {asset.id.slice(-8)}</span>
                                            {asset.orderId && <span className="text-[8px] text-brand/40 font-bold uppercase tracking-tighter">Order: #{asset.orderId.slice(-6)}</span>}
                                        </div>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{formatDate(asset.unlockedAt)}</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
            <WhatsAppFAB phoneNumber="08071400331" />
        </div>
    );
}
