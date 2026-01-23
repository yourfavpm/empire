'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Navbar, Footer } from '@/components/layout';
import { Badge, WhatsAppFAB } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

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

export default function AssetsPage() {
    const searchParams = useSearchParams();
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [search, setSearch] = useState('');
    const [activeCategories, setActiveCategories] = useState<string[]>(['All']);

    useEffect(() => {
        fetchSubcategories();
    }, [category]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            if (response.ok && data.categories) {
                const catNames = data.categories.map((c: any) => c.name);
                setActiveCategories(['All', ...catNames]);
            }
        } catch (error) {
            console.error('Fetch categories error:', error);
        }
    };

    const fetchSubcategories = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (category && category !== 'All') params.set('category', category);
            if (search) params.set('search', search);
            params.set('limit', '40');

            const response = await fetch(`/api/assets?${params}`);
            const data = await response.json();
            if (response.ok) setSubcategories(data.subcategories);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-950 font-sans">
            <Navbar />

            <main className="flex-1 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Compact Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <section>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Marketplace</span>
                            </div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">Browse Directory</h1>
                        </section>

                        <div className="flex flex-wrap gap-2">
                            {activeCategories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat === 'All' ? '' : cat)}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${(cat === 'All' && category === '') || (cat === category)
                                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-900/40'
                                        : 'bg-slate-900 text-slate-500 border border-slate-800 hover:text-white'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="aspect-[4/5] bg-slate-900/50 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : subcategories.length === 0 ? (
                        <div className="text-center py-20 text-slate-600 text-xs italic">Inventory is currently empty.</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {subcategories.map((sub) => (
                                <Link key={sub.id} href={`/assets/${sub.id}`} className="group">
                                    <div className={`flex flex-col h-full bg-slate-900 border border-slate-800/80 rounded-2xl p-4 transition-all hover:border-cyan-500/40 hover:-translate-y-1 ${sub.isOutOfStock ? 'opacity-60' : ''}`}>
                                        <div className="aspect-square bg-slate-950 rounded-xl mb-4 overflow-hidden relative flex items-center justify-center">
                                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent" />
                                            <svg className="w-8 h-8 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7c0-2-1.5-3-3.5-3h-9C5.5 4 4 5 4 7zM9 11h6M9 15h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} /></svg>

                                            {sub.isOutOfStock ? (
                                                <div className="absolute inset-0 backdrop-blur-[2px] bg-black/40 flex items-center justify-center">
                                                    <span className="bg-red-500/80 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-red-500/20">Out of Stock</span>
                                                </div>
                                            ) : (
                                                <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                                                    <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-500/20 backdrop-blur-sm">
                                                        {sub.availableStock} Available
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="text-[9px] font-bold text-cyan-500 uppercase tracking-widest">{sub.category}</div>
                                                    {sub.countries.length > 0 && (
                                                        <div className="text-[8px] text-slate-500 font-mono">{sub.countries[0]}</div>
                                                    )}
                                                </div>
                                                <h3 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">
                                                    {sub.title}
                                                </h3>
                                            </div>

                                            <div className="flex items-center justify-between pt-2">
                                                <span className="text-xs font-black text-white">{formatCurrency(sub.price)}</span>
                                                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">GET NOW</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
            <WhatsAppFAB phoneNumber="08071400331" />
        </div>
    );
}
