'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { PromotionalBanner } from '@/components/PromotionalBanner';
import { createBrowserClient } from '@supabase/ssr';

    interface Asset {
        id: string;
        title: string;
        price: number;
        shortDescription: string;
        availableStock: number;
    }

    interface Category {
        category: string;
        count: number;
        assets: Asset[];
    }

    interface CategoryListProps {
        categories: Category[];
    }

    export function CategoryList({ categories }: CategoryListProps) {
        const router = useRouter();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleAuthCheck = async (e: React.MouseEvent, href: string) => {
        e.preventDefault();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            router.push('/auth/signin?callbackUrl=' + encodeURIComponent(href));
        } else {
            router.push(href);
        }
    };

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                <div className="text-left mb-8">
                    <h2 className="text-3xl font-bold text-brand uppercase tracking-tighter">Marketplace</h2>
                    <p className="text-slate-500 mt-2 font-medium">Browse our premium collection of digital assets.</p>
                </div>

                {categories.map((cat) => (
                    <div key={cat.category} className="w-full">
                        {/* Category Header */}
                        <div className="flex items-end justify-between border-b border-slate-100 pb-5 mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-brand uppercase tracking-tight flex items-center gap-3">
                                    <div className="w-2 h-2 bg-brand rounded-full animate-pulse"></div>
                                    {cat.category}
                                </h3>
                                <p className="text-[10px] text-slate-400 mt-1 pl-5 font-bold uppercase tracking-[0.2em]">
                                    {cat.count} Available Protocol Units
                                </p>
                            </div>
                            <Link
                                href={`/assets?category=${encodeURIComponent(cat.category)}`}
                                onClick={(e) => handleAuthCheck(e, `/assets?category=${encodeURIComponent(cat.category)}`)}
                                className="text-[10px] font-bold text-brand hover:text-brand-light transition-colors uppercase tracking-widest border border-slate-100 px-4 py-2 rounded-xl bg-slate-50/50"
                            >
                                Expansion View →
                            </Link>
                        </div>

                        {/* Grid of Subcategories */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {cat.assets.slice(0, 8).map((asset) => (
                                <Link
                                    key={asset.id}
                                    href={`/assets/${asset.id}`}
                                    onClick={(e) => handleAuthCheck(e, `/assets/${asset.id}`)}
                                    className={`group block bg-white border border-slate-100 rounded-2xl p-6 hover:border-brand/30 hover:shadow-xl hover:shadow-brand/5 transition-all relative overflow-hidden ${asset.availableStock === 0 ? 'opacity-60' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="font-bold text-brand group-hover:text-brand-light transition-colors line-clamp-1 text-sm uppercase tracking-tight">
                                            {asset.title}
                                        </h4>
                                        <span className="text-[10px] font-bold text-brand bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                                            {formatCurrency(asset.price)}
                                        </span>
                                    </div>

                                    <p className="text-[11px] text-slate-500 line-clamp-2 mb-6 h-8 font-normal leading-relaxed">
                                        {asset.shortDescription}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${asset.availableStock > 0 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-500'}`} />
                                            <span className={`text-[9px] font-bold uppercase tracking-widest ${asset.availableStock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {asset.availableStock > 0 ? `${asset.availableStock} Units Active` : 'Terminated'}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-bold text-brand uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                            Initiate →
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Mobile: Promotional Banner between categories */}
                        <div className="md:hidden mt-16 pt-8 border-t border-slate-50">
                            <PromotionalBanner />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
