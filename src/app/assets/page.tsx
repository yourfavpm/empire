'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Navbar, Footer } from '@/components/layout';
import { Button, Card, Badge, Input, WhatsAppFAB } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

interface Asset {
    id: string;
    title: string;
    category: string;
    platformType: string;
    price: number;
    shortDescription: string;
    images: string[];
    status: string;
    isUnlocked: boolean;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function AssetsPage() {
    const searchParams = useSearchParams();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [page, setPage] = useState(1);

    const categories = ['Web Templates', 'Marketing', 'Business', 'Design', 'Development', 'Software', 'Courses'];

    useEffect(() => {
        fetchAssets();
    }, [page, category]);

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', page.toString());
            params.set('limit', '12');
            if (category) params.set('category', category);
            if (search) params.set('search', search);

            const response = await fetch(`/api/assets?${params}`);
            const data = await response.json();

            if (response.ok) {
                setAssets(data.assets);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch assets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchAssets();
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-950">
            <Navbar />

            <main className="flex-1 pt-20 pb-16">
                {/* Hero Header */}
                <div className="relative py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent" />
                    <div className="relative max-w-7xl mx-auto text-center">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                            Digital Assets
                        </h1>
                        <p className="text-sm text-slate-400 max-w-lg mx-auto">
                            Premium templates, guides, and tools. Unlock with your wallet balance.
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Search and Filters */}
                    <div className="mb-8">
                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="mb-4">
                            <div className="relative max-w-md">
                                <input
                                    type="text"
                                    placeholder="Search assets..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                                />
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </form>

                        {/* Category Pills */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => { setCategory(''); setPage(1); }}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${category === ''
                                        ? 'bg-cyan-600 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                                    }`}
                            >
                                All
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => { setCategory(cat); setPage(1); }}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${category === cat
                                            ? 'bg-cyan-600 text-white'
                                            : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results Count */}
                    {pagination && !loading && (
                        <p className="text-sm text-slate-500 mb-4">
                            Showing {assets.length} of {pagination.total} assets
                            {category && <span> in <span className="text-cyan-400">{category}</span></span>}
                        </p>
                    )}

                    {/* Assets Grid */}
                    {loading ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-slate-800/50 rounded-xl p-4 animate-pulse">
                                    <div className="h-32 bg-slate-700 rounded-lg mb-3" />
                                    <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-slate-700 rounded w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : assets.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">No Assets Found</h3>
                            <p className="text-sm text-slate-400 mb-4">Try adjusting your search or filters</p>
                            <Button variant="outline" onClick={() => { setCategory(''); setSearch(''); setPage(1); }}>
                                Clear Filters
                            </Button>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {assets.map((asset) => (
                                <Link key={asset.id} href={`/assets/${asset.id}`}>
                                    <div className="bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/30 rounded-xl overflow-hidden transition-all hover:-translate-y-1 group h-full">
                                        {/* Image/Placeholder */}
                                        <div className="relative h-32 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 flex items-center justify-center">
                                            {asset.images.length > 0 ? (
                                                <img
                                                    src={asset.images[0]}
                                                    alt={asset.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <svg className="w-10 h-10 text-cyan-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            )}
                                            {asset.isUnlocked && (
                                                <div className="absolute top-2 right-2">
                                                    <span className="bg-emerald-500/90 text-white text-xs px-2 py-0.5 rounded-full">
                                                        Unlocked
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">
                                                    {asset.category}
                                                </span>
                                                <span className="text-xs text-slate-500">{asset.platformType}</span>
                                            </div>

                                            <h3 className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors line-clamp-2 mb-2">
                                                {asset.title}
                                            </h3>

                                            <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                                                {asset.shortDescription}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <span className="text-cyan-400 font-semibold text-sm">
                                                    {formatCurrency(asset.price)}
                                                </span>
                                                <svg className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="mt-10 flex justify-center items-center gap-4">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="border-slate-700"
                            >
                                ← Previous
                            </Button>
                            <div className="flex items-center gap-2">
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === pageNum
                                                    ? 'bg-cyan-600 text-white'
                                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                {pagination.totalPages > 5 && (
                                    <>
                                        <span className="text-slate-600">...</span>
                                        <button
                                            onClick={() => setPage(pagination.totalPages)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === pagination.totalPages
                                                    ? 'bg-cyan-600 text-white'
                                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                                                }`}
                                        >
                                            {pagination.totalPages}
                                        </button>
                                    </>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === pagination.totalPages}
                                onClick={() => setPage(page + 1)}
                                className="border-slate-700"
                            >
                                Next →
                            </Button>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
            <WhatsAppFAB phoneNumber="08071400331" />
        </div>
    );
}
