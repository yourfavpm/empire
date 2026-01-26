
'use client';

import { ExternalLink } from 'lucide-react';

export function CrossPromoBanner() {
    return (
        <a
            href="https://example-foreign-numbers.com"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-40 hidden md:flex items-center gap-3 bg-amber-500/90 hover:bg-amber-500 text-black px-4 py-3 rounded-full shadow-lg shadow-amber-900/20 backdrop-blur-sm transition-all hover:scale-105 group border border-amber-400/50"
        >
            <div className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center group-hover:bg-black/20 transition-colors">
                <ExternalLink className="w-4 h-4" />
            </div>
            <div>
                <p className="text-xs font-black uppercase tracking-wider opacity-80">Looking for</p>
                <p className="text-xs font-bold -mt-0.5">Foreign Numbers?</p>
            </div>
        </a>
    );
}
