'use client';

import { Send } from 'lucide-react';
import { Button } from '@/components/ui';

export function PromotionalBanner() {
    return (
        <div className="relative w-full overflow-hidden rounded-2xl bg-[#1e3a8a] min-h-[250px] md:min-h-[300px] flex items-center justify-center my-8 shadow-sm border border-slate-200">
            {/* Background */}
            <div className="absolute inset-0 bg-brand opacity-100" />

            <div className="relative z-10 grid md:grid-cols-3 gap-8 items-center w-full max-w-6xl px-6 md:px-12 py-8">
                {/* Left Icon (Phone) */}
                <div className="hidden md:flex justify-center md:justify-end">
                    <div className="w-16 h-24 border-4 border-white/30 rounded-2xl flex flex-col items-center justify-between p-2 opacity-80 rotate-12 -translate-y-4">
                        <div className="w-8 h-1 bg-white/40 rounded-full" />
                        <div className="w-4 h-4 rounded-full border-2 border-white/40" />
                    </div>
                </div>

                {/* Center Content */}
                <div className="text-center space-y-4 col-span-3 md:col-span-1">
                    <h3 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                        Get Virtual Numbers
                    </h3>

                    <p className="text-xs md:text-sm text-slate-200 font-medium uppercase tracking-widest border-b border-white/20 pb-4 inline-block px-4">
                        For all Types of Verifications
                    </p>

                    <h2 className="text-2xl md:text-3xl font-black text-white drop-shadow-sm">
                        Try TWorldVerify.com.ng
                    </h2>

                    <p className="text-xs text-slate-200">
                        Virtual Numbers For Verifications
                    </p>

                    <div className="flex justify-center gap-3 text-[10px] md:text-xs text-slate-200 font-mono">
                        <span>WhatsApp</span> • <span>Telegram</span> • <span>SMS</span> • <span>OTP</span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 pt-2">
                        {['WhatsApp', 'Telegram', 'SMS', 'OTP'].map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-white/10 text-white text-[10px] font-bold rounded border border-white/20">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <div className="pt-4">
                        <a href="https://tworldverify.com.ng" target="_blank" rel="noopener noreferrer">
                            <Button className="bg-white text-brand hover:bg-slate-100 font-bold rounded-full px-8 gap-2 border-none">
                                <Send className="w-4 h-4" />
                                Visit Now
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
