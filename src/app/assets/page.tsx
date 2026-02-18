'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Navbar, Footer } from '@/components/layout';
import { WhatsAppFAB } from '@/components/ui';
import { PromotionalBanner } from '@/components/PromotionalBanner';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';

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

interface CategoryItem {
    name: string;
}

function AssetsContent() {
    const searchParams = useSearchParams();
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState(searchParams.get('category') || '');
    // const [search, setSearch] = useState('');
    const search = ''; // Temporary fix if search is not implemented yet
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

    const fetchSubcategories = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (category && category !== 'All') params.set('category', category);
            if (search) params.set('search', search);
            params.set('limit', '100');

            const response = await fetch(`/api/assets?${params}`);
            const data = await response.json();
            if (response.ok) setSubcategories(data.subcategories);
        } catch {
            // console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, [category, search]);

    useEffect(() => {
        fetchSubcategories();
    }, [fetchSubcategories]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            if (response.ok && data.categories) {
                const catNames = data.categories.map((c: CategoryItem) => c.name);
                setActiveCategories(['All', ...catNames]);
            }
        } catch {
            // console.error('Fetch categories error:', error);
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
                            <div className="flex items-center gap-6">
                                <h1 className="text-3xl font-bold text-brand tracking-tight">Browse Directory</h1>
                                <Link href="/buyer" className="hidden md:inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-brand transition-colors uppercase tracking-widest">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                                    Back to Dashboard
                                </Link>
                            </div>
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
                                <div key={i} className="aspect-4/5 bg-slate-100 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : subcategories.length === 0 ? (
                        <div className="text-center py-20 text-slate-500 text-xs italic">Inventory is currently empty.</div>
                    ) : (category === '' || category === 'All') ? (
                        <div className="space-y-12">
                            {Object.entries(groupedSubcategories).map(([catName, subs]) => (
                                <div key={catName}>
                                    <div className="w-full bg-[#0ea5e9] px-4 py-3 rounded-t-xl mb-0 mt-8 shadow-sm">
                                        <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                            {catName}
                                        </h2>
                                    </div>

                                    <div className="bg-slate-50/50 border-x border-b border-slate-200 rounded-b-xl p-4 space-y-3">
                                        {/* List View with Limit */}
                                        {subs.slice(0, 5).map((sub) => (
                                            <AssetCard key={sub.id} sub={sub} />
                                        ))}
                                        
                                        {/* View All Button */}
                                        {subs.length > 5 && (
                                            <div className="pt-2">
                                                <button 
                                                    onClick={() => setCategory(catName)}
                                                    className="w-full py-3 text-xs font-bold text-[#0ea5e9] bg-white border border-[#0ea5e9]/20 rounded-xl hover:bg-[#0ea5e9]/5 transition-colors uppercase tracking-widest"
                                                >
                                                    View All {catName} Logs ({subs.length - 5} More)
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Banner after every category */}
                                    <div className="mt-8">
                                        <PromotionalBanner />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
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
        <Link href={`/assets/${sub.id}`} className="group block mb-4 last:mb-0 relative">
            <div className={`flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4 transition-all hover:border-blue-600 hover:shadow-md relative overflow-hidden`}>
                
                {/* Ensure no overlay interferes */}
                <div className="absolute inset-0 bg-white z-0" />

                {/* LEFT: Icon & Title */}
                <div className="flex items-center gap-4 flex-1 min-w-0 relative z-10">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shrink-0 overflow-hidden relative">
                        {sub.logo ? (
                            <Image src={sub.logo} alt={sub.title} fill className="object-contain p-1" />
                        ) : (
                            <span className="text-xl">📦</span>
                        )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 pr-4">
                         <div className="flex items-center gap-2 mb-1">
                            {sub.countries && sub.countries.length > 0 && (
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{sub.countries[0]}</span>
                            )}
                             <span className="text-[10px] text-slate-300">•</span>
                             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{sub.category || 'Directory'}</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors mb-2 truncate">
                            {sub.title}
                        </h3>
                        
                        <div className="flex items-center gap-2">
                             <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-sm">
                                {formatCurrency(sub.price)}
                             </span>
                             <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-sm">
                                {sub.availableStock || 0}pcs
                             </span>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Action Button */}
                <div className="pl-2 shrink-0 relative z-10">
                    {sub.isOutOfStock ? (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-4 py-2 rounded-lg uppercase tracking-wider inline-block shadow-sm">
                            Out of Stock
                        </span>
                    ) : (
                         <div className="bg-blue-500 text-white px-4 py-2.5 rounded-lg hover:bg-blue-600 transition-all shadow-sm shadow-blue-200 flex items-center gap-2 group-hover:shadow-blue-300 transform group-hover:-translate-y-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-bag"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-white">Buy</span>
                         </div>
                    )}
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
