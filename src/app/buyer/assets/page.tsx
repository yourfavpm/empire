'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Badge, Button } from '@/components/ui';
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Purchased Assets</h1>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Your inventory of unique digital items</p>
                </div>
                <Link href="/assets">
                    <Button className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase tracking-widest px-6">Explore Marketplace</Button>
                </Link>
            </div>

            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="animate-pulse bg-slate-900 border-slate-800 h-48">
                            <div className="p-5" />
                        </Card>
                    ))}
                </div>
            ) : assets.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
                    <div className="text-4xl mb-4 opacity-20">🛒</div>
                    <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-widest">No Purchases Yet</h3>
                    <p className="text-xs text-slate-500 mb-8 max-w-xs mx-auto">Items you unlock from the marketplace will appear here with their private credentials.</p>
                    <Link href="/assets">
                        <Button variant="outline" className="text-xs border-cyan-500/30 text-cyan-400 font-bold uppercase tracking-widest">Start Shopping</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assets.map((asset) => (
                        <Card key={asset.id} className="bg-slate-900 border-slate-800/80 hover:border-cyan-500/30 transition-all group">
                            <div className="p-5 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-[9px] font-bold text-cyan-500 uppercase tracking-widest mb-1">{asset.category}</div>
                                        <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">{asset.title}</h3>
                                    </div>
                                    <Badge variant="success" className="text-[8px] px-2 py-0">Unlocked</Badge>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                        <span>Credentials</span>
                                        <button
                                            onClick={() => copyToClipboard(asset.lockedDescription)}
                                            className="hover:text-cyan-400 flex items-center gap-1 transition-colors"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
                                            Copy
                                        </button>
                                    </div>
                                    <div className="bg-slate-950 p-3 rounded-xl border border-white/5 group-hover:border-cyan-500/20 transition-all font-mono text-[11px] text-cyan-100 break-all select-all">
                                        {asset.lockedDescription}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t border-slate-800/50">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Ref: {asset.id.slice(-8)}</span>
                                        {asset.orderId && <span className="text-[8px] text-cyan-500/50 font-mono tracking-tighter">Order: #{asset.orderId.slice(-6)}</span>}
                                    </div>
                                    <span className="text-[9px] text-slate-600 font-medium italic">{formatDate(asset.unlockedAt)}</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
