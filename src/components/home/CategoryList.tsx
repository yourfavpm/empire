'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { MainCategory } from '@/types'; // Assuming this exists or defining it inline if needed

interface CategoryListProps {
    categories: MainCategory[];
}

export function CategoryList({ categories }: CategoryListProps) {
    // We display all categories stacked

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                <div className="text-left mb-8">
                    <h2 className="text-3xl font-bold text-brand">Marketplace</h2>
                    <p className="text-slate-500 mt-2">Browse our premium collection of digital assets.</p>
                </div>

                {categories.map((cat) => (
                    <div key={cat.category} className="w-full">
                        {/* Category Header */}
                        <div className="flex items-end justify-between border-b border-slate-200 pb-4 mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-brand flex items-center gap-2">
                                    <span className="w-2 h-2 bg-brand rounded-full"></span>
                                    {cat.category}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1 pl-4">
                                    {cat.count} available items
                                </p>
                            </div>
                            <Link
                                href={`/assets?category=${encodeURIComponent(cat.category)}`}
                                className="text-sm font-medium text-brand hover:text-brand-light transition-colors"
                            >
                                View all →
                            </Link>
                        </div>

                        {/* Grid of Subcategories */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {cat.assets.slice(0, 8).map((asset) => (
                                <Link
                                    key={asset.id}
                                    href={`/assets/${asset.id}`}
                                    className={`group block bg-white border border-slate-200 rounded-lg p-4 hover:border-brand hover:shadow-sm transition-all ${asset.availableStock === 0 ? 'opacity-60' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-brand group-hover:text-brand-light transition-colors line-clamp-1">
                                            {asset.title}
                                        </h4>
                                        <span className="text-xs font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded">
                                            {formatCurrency(asset.price)}
                                        </span>
                                    </div>

                                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 h-8">
                                        {asset.shortDescription}
                                    </p>

                                    <div className="flex items-center justify-between text-xs">
                                        <span className={`${asset.availableStock > 0 ? 'text-green-600' : 'text-red-500'} font-medium`}>
                                            {asset.availableStock > 0 ? `${asset.availableStock} in stock` : 'Sold Out'}
                                        </span>
                                        <span className="text-brand font-medium group-hover:underline">
                                            Buy Now
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
