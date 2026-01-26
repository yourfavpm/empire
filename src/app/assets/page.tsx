'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Navbar, Footer } from '@/components/layout';
import { Badge, WhatsAppFAB } from '@/components/ui';
import { PromotionalBanner } from '@/components/PromotionalBanner';
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
    logo?: string;
}

function AssetsContent() {
    const searchParams = useSearchParams();
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [search, setSearch] = useState('');
    const [activeCategories, setActiveCategories] = useState<string[]>(['All']);
    const [groupedSubcategories, setGroupedSubcategories] = useState<Record<string, Subcategory[]>>({});

    useEffect(() => {
        if (category === '' || category === 'All') {
            const grouped = subcategories.reduce((acc, sub) => {
                const cat = sub.category || 'Other';
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(sub);
                return acc;
            }, {} as Record<string, Subcategory[]>);
            setGroupedSubcategories(grouped);
        }
    }, [subcategories, category]);

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
            params.set('limit', '100');

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
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            <main className="flex-1 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Compact Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <section>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Marketplace</span>
                            </div>
                            <h1 className="text-3xl font-bold text-brand tracking-tight">Browse Directory</h1>
                        </section>

                        <div className="flex flex-wrap gap-2">
                            {activeCategories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat === 'All' ? '' : cat)}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${(cat === 'All' && category === '') || (cat === category)
                                        ? 'bg-brand text-white shadow-none'
                                        : 'bg-white text-slate-500 border border-slate-300 hover:text-brand hover:border-brand'
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
                                <div key={i} className="aspect-[4/5] bg-slate-100 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : subcategories.length === 0 ? (
                        <div className="text-center py-20 text-slate-500 text-xs italic">Inventory is currently empty.</div>
                    ) : (category === '' || category === 'All') ? (
                        <div className="space-y-12">
                            {Object.entries(groupedSubcategories).map(([catName, subs], index) => (
                                <div key={catName}>
                                    {index === 1 && <PromotionalBanner />}

                                    <div className="w-full bg-brand px-4 py-2.5 rounded-t-lg border-b border-brand-dark mb-0 mt-8">
                                        <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-2 h-2 bg-white rounded-full" />
                                            {catName}
                                        </h2>
                                    </div>

                                    <div className="bg-white border-x border-b border-slate-300 rounded-b-lg p-4">
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                            {subs.map((sub) => (
                                                <AssetCard key={sub.id} sub={sub} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {subcategories.map((sub) => (
                                <AssetCard key={sub.id} sub={sub} />
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

function AssetCard({ sub }: { sub: Subcategory }) {
    return (
        <Link href={`/assets/${sub.id}`} className="group">
            <div className={`flex flex-col h-full bg-white border border-slate-200 rounded-2xl p-4 transition-all hover:border-brand hover:shadow-xl hover:-translate-y-1 ${sub.isOutOfStock ? 'opacity-60' : ''}`}>
                <div className="aspect-square bg-slate-50 rounded-xl mb-4 overflow-hidden relative flex items-center justify-center border border-slate-100 p-3">
                    {sub.logo ? (
                        <img src={sub.logo} alt={sub.title} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                        <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7c0-2-1.5-3-3.5-3h-9C5.5 4 4 5 4 7zM9 11h6M9 15h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} /></svg>
                    )}

                    {sub.isOutOfStock ? (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-white text-slate-900 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-slate-200 shadow-sm">SOLD OUT</span>
                        </div>
                    ) : (
                        <div className="absolute top-2 right-2">
                            <Badge variant="outline" className="bg-white/80 backdrop-blur-md border-slate-200 text-brand text-[8px] font-black px-2 py-0.5">
                                {sub.availableStock} IN STOCK
                            </Badge>
                        </div>
                    )}
                </div>

                <div className="space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-1.5">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">{sub.category}</span>
                            {sub.countries.length > 0 && (
                                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{sub.countries[0]}</span>
                            )}
                        </div>
                        <h3 className="text-[13px] font-black text-brand line-clamp-2 leading-tight group-hover:text-brand-dark transition-colors">
                            {sub.title}
                        </h3>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                        <span className="text-sm font-black text-brand">{formatCurrency(sub.price)}</span>
                        <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-brand group-hover:bg-brand group-hover:text-white transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} /></svg>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function AssetsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-brand">Loading...</div>}>
            <AssetsContent />
        </Suspense>
    );
}
