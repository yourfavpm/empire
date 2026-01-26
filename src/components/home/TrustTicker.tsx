'use client';

export function TrustTicker() {
    return (
        <section className="bg-slate-50 border-y border-slate-200 py-4 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">

                {/* Payment Options (Static on Desktop, Scroll on Mobile ideally but keeping simple grid for now per request "Grid on desktop") */}
                <div className="flex items-center gap-6 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">Secured By</span>
                    {/* Replace with actual SVGs or text if images not available */}
                    <div className="flex gap-4 items-center">
                        <span className="font-bold text-slate-600">Paystack</span>
                        <span className="w-px h-4 bg-slate-300"></span>
                        <span className="font-bold text-slate-600">Crypto</span>
                        <span className="w-px h-4 bg-slate-300"></span>
                        <span className="font-bold text-slate-600">Bank Transfer</span>
                    </div>
                </div>

                {/* Social Availability Ticker */}
                <div className="flex items-center gap-2 overflow-hidden w-full md:w-auto mask-linear-fade">
                    <div className="flex gap-8 items-center animate-scroll-text whitespace-nowrap">
                        <span className="flex items-center gap-2 text-xs font-medium text-brand">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            WhatsApp Available
                        </span>
                        <span className="flex items-center gap-2 text-xs font-medium text-brand">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Telegram Available
                        </span>
                        <span className="flex items-center gap-2 text-xs font-medium text-brand">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Facebook Available
                        </span>
                        <span className="flex items-center gap-2 text-xs font-medium text-brand">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Instagram Available
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
