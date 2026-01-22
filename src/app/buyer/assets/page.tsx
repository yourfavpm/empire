'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Badge, Button } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Asset {
    id: string;
    title: string;
    category: string;
    platformType: string;
    price: number;
    shortDescription: string;
    fullDescription: string;
    images: string[];
    documents: string[];
    unlockedAt: string;
}

export default function BuyerAssetsPage() {
    const [assets, setAssets] = useState<Asset[]>([]);
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

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">My Assets</h1>
                    <p className="text-slate-400 mt-1">Assets you have unlocked</p>
                </div>
                <Link href="/assets">
                    <Button>Browse More</Button>
                </Link>
            </div>

            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <div className="h-40 bg-slate-700 rounded-lg mb-4" />
                            <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
                            <div className="h-4 bg-slate-700 rounded w-1/2" />
                        </Card>
                    ))}
                </div>
            ) : assets.length === 0 ? (
                <Card className="text-center py-16">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Assets Yet</h3>
                    <p className="text-slate-400 mb-6">Start exploring and unlock your first digital asset</p>
                    <Link href="/assets">
                        <Button>Browse Assets</Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assets.map((asset) => (
                        <Link key={asset.id} href={`/assets/${asset.id}`}>
                            <Card hover className="h-full group cursor-pointer">
                                {/* Image */}
                                <div className="relative h-40 bg-gradient-to-br from-violet-600/20 to-indigo-600/20 rounded-lg mb-4 flex items-center justify-center">
                                    {asset.images.length > 0 ? (
                                        <img
                                            src={asset.images[0]}
                                            alt={asset.title}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    ) : (
                                        <svg className="w-12 h-12 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <Badge variant="success">Unlocked</Badge>
                                    </div>
                                </div>

                                {/* Content */}
                                <h3 className="text-lg font-semibold text-white group-hover:text-violet-400 transition-colors mb-2">
                                    {asset.title}
                                </h3>

                                <div className="flex items-center gap-2 mb-3">
                                    <Badge>{asset.category}</Badge>
                                    <span className="text-xs text-slate-500">{asset.platformType}</span>
                                </div>

                                <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                                    {asset.shortDescription}
                                </p>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">
                                        Unlocked {formatDate(asset.unlockedAt)}
                                    </span>
                                    {asset.documents.length > 0 && (
                                        <span className="text-violet-400">
                                            {asset.documents.length} file{asset.documents.length !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
