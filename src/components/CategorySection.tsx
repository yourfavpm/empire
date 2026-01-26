'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { PromotionalBanner } from '@/components/PromotionalBanner';
import { formatCurrency } from '@/lib/utils';

interface Asset {
    id: string;
    title: string;
    category: string;
    price: number;
    shortDescription: string;
    availableStock: number;
}

interface CategoryData {
    category: string;
    count: number;
    assets: Asset[];
}

interface CategorySectionProps {
    categories: CategoryData[];
}

export function CategorySection({ categories }: CategorySectionProps) {
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    if (categories.length === 0) {
        return null;
    }

    const toggleCategory = (category: string) => {
        setExpandedCategory(expandedCategory === category ? null : category);
    };

    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                        Browse by Category
                    </h2>
                    <p className="text-sm text-slate-400">
                        Click on a category to explore premium digital assets
                    </p>
                </div>

                {/* Promotional Banner */}
                <PromotionalBanner />

                {/* Category Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8 mt-8">
                    {categories.map(({ category, count }) => (
                        <button
                            key={category}
                            onClick={() => toggleCategory(category)}
                            className={`group relative text-left p-5 rounded-xl border transition-all duration-200 ${expandedCategory === category
                                ? 'bg-cyan-500/10 border-cyan-500/50 scale-[1.02]'
                                : 'bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/30 hover:bg-slate-800/80'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${expandedCategory === category
                                        ? 'bg-cyan-500/30'
                                        : 'bg-cyan-500/20'
                                        }`}>
                                        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white text-sm">{category}</h3>
                                        <p className="text-xs text-slate-400">{count} item{count !== 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                                <svg
                                    className={`w-5 h-5 text-cyan-400 transition-transform duration-200 ${expandedCategory === category ? 'rotate-180' : ''
                                        }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Expanded Category Assets */}
                {expandedCategory && (
                    <div className="animate-fadeIn">
                        {/* Styled Header matching Browse Page */}
                        <div className="w-full bg-[#5b21b6] px-4 py-2.5 rounded-t-lg shadow-sm border-b-4 border-slate-900 mb-0 flex items-center justify-between">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 bg-white rounded-full" />
                                {expandedCategory}
                            </h3>
                            <Link
                                href={`/assets?category=${encodeURIComponent(expandedCategory)}`}
                                className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded transition-colors"
                            >
                                View All →
                            </Link>
                        </div>

                        <div className="bg-slate-900/50 border-x border-b border-slate-800/60 rounded-b-lg p-4">
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {categories
                                    .find(c => c.category === expandedCategory)
                                    ?.assets.slice(0, 6).map((asset) => (
                                        <div key={asset.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 h-full transition-all hover:border-cyan-500/30">
                                            {/* (Card content remains same...) */}
                                            {/* Asset Name */}
                                            <h4 className="text-white font-semibold mb-2 line-clamp-2">
                                                {asset.title}
                                            </h4>

                                            {/* Description */}
                                            <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                                                {asset.shortDescription}
                                            </p>

                                            {/* Details */}
                                            <div className="space-y-2 mb-4 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Price</span>
                                                    <span className="text-white font-semibold">{formatCurrency(asset.price)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">In Stock</span>
                                                    <span className={`font-medium ${asset.availableStock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {asset.availableStock} available
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Buy Now Button */}
                                            <Link href={`/assets/${asset.id}`}>
                                                <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-slate-800 disabled:text-slate-600" disabled={asset.availableStock === 0}>
                                                    {asset.availableStock > 0 ? 'Buy Now' : 'Sold Out'}
                                                </Button>
                                            </Link>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Browse All Button */}
                <div className="text-center mt-10">
                    <Link href="/assets">
                        <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
                            Browse All Assets →
                        </Button>
                    </Link>
                </div>
            </div>

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out forwards;
                }
            `}</style>
        </section>
    );
}
