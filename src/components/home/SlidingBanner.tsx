'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Banner {
    id: string | number;
    content: string; // The Image URL
    link: string;
    active: boolean;
}

interface SlidingBannerProps {
    banners: Banner[];
}

export function SlidingBanner({ banners }: SlidingBannerProps) {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (banners.length <= 1) return;
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % banners.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [banners]);

    if (!banners || banners.length === 0) {
        return null; // Or a fallback white space
    }

    return (
        <div className="w-full bg-white border-b border-slate-100 overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-0 md:px-8 py-4">
                <div className="relative aspect-[21/9] md:aspect-[24/7] overflow-hidden rounded-xl shadow-sm border border-slate-100">
                    {banners.map((banner, index) => (
                        <div
                            key={banner.id}
                            className={`absolute inset-0 transition-opacity duration-1000 ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
                                }`}
                        >
                            <Link href={banner.link || '#'}>
                                <img
                                    src={banner.content}
                                    alt="Promotional Banner"
                                    className="w-full h-full object-cover"
                                />
                            </Link>
                        </div>
                    ))}

                    {/* Progress Indicators */}
                    {banners.length > 1 && (
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                            {banners.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrent(idx)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === current ? 'w-8 bg-brand' : 'w-2 bg-white/50 hover:bg-white'
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
