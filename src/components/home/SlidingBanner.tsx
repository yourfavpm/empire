'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
        <div className="w-full bg-white overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
                <div className="relative aspect-21/9 md:aspect-24/7 overflow-hidden rounded-2xl shadow-xl shadow-black/5 border border-slate-100 group">
                    {/* Sliding Container */}
                    <div
                        className="flex h-full transition-transform duration-700 ease-out"
                        style={{ transform: `translateX(-${current * 100}%)` }}
                    >
                        {banners.map((banner) => (
                            <div
                                key={banner.id}
                                className="w-full h-full shrink-0 relative"
                            >
                                <Link href={banner.link || '#'} className="block h-full w-full">
                                    <Image
                                        src={banner.content}
                                        alt="Promotional Banner"
                                        fill
                                        className="object-cover select-none"
                                    />
                                </Link>
                            </div>
                        ))}
                    </div>

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
