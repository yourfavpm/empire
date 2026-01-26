
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Banner {
    content: string;
    link?: string;
}

export function HeaderBanner() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        fetch('/api/banners')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const textBanners = data.filter(b => {
                        const content = b.content.toLowerCase();
                        const isImage = content.match(/\.(jpg|jpeg|png|webp|gif|svg)/) || content.includes('/storage/v1/object/public/');
                        return !isImage;
                    });
                    setBanners(textBanners);
                }
            })
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (banners.length > 1) {
            const timer = setInterval(() => {
                setCurrentIndex(prev => (prev + 1) % banners.length);
            }, 5000); // 5 seconds per slide
            return () => clearInterval(timer);
        }
    }, [banners]);

    if (banners.length === 0) return null;

    const currentBanner = banners[currentIndex];

    return (
        <div className="bg-cyan-950 text-cyan-200 text-xs py-2 text-center relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 flex justify-center items-center">
                {currentBanner.link ? (
                    <Link href={currentBanner.link} className="hover:text-white transition-colors underline decoration-cyan-700 underline-offset-2">
                        {currentBanner.content}
                    </Link>
                ) : (
                    <span>{currentBanner.content}</span>
                )}
            </div>
            {/* Dots */}
            {banners.length > 1 && (
                <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
                    {banners.map((_, i) => (
                        <div
                            key={i}
                            className={`w-1 h-1 rounded-full text-[0px] ${i === currentIndex ? 'bg-cyan-400' : 'bg-cyan-900'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
