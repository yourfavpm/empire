'use client';

import { useState, useEffect } from 'react';
import { Button } from './Button';

interface InstructionalModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function InstructionalModal({
    isOpen,
    onClose,
}: InstructionalModalProps) {
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // eslint-disable-next-line
            setAgreedToTerms(false); // Reset on open
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleContinue = () => {
        if (agreedToTerms) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop - no click to close, must agree to terms */}
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-fadeIn" />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-cyan-500/10 animate-slideUp overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* Header Gradient */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-cyan-500/10 to-transparent pointer-events-none" />

                <div className="relative p-6 pt-8">
                    {/* Logo & Title */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-cyan-500/20 to-teal-500/20 rounded-2xl mb-4 p-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/dylogo.png" alt="DY Empire" className="w-full h-full object-contain" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">Welcome to DY Empire</h2>
                        <p className="text-sm text-slate-400">Your gateway to premium digital assets</p>
                    </div>

                    {/* How It Works */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            How to Get Started
                        </h3>
                        <div className="space-y-3">
                            {[
                                { step: '1', title: 'Create Account', desc: 'Sign up for free to get started' },
                                { step: '2', title: 'Fund Your Wallet', desc: 'Add funds via Paystack or Crypto' },
                                { step: '3', title: 'Unlock Assets', desc: 'Browse and unlock premium content' },
                            ].map((item) => (
                                <div key={item.step} className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-cyan-500/20 rounded-lg flex items-center justify-center shrink-0">
                                        <span className="text-xs font-bold text-cyan-400">{item.step}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{item.title}</p>
                                        <p className="text-xs text-slate-400">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Community Links */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Join Our Community
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {/* WhatsApp Button */}
                            <a
                                href="https://chat.whatsapp.com/KTgpuPlLlSWCkUKtavZH1j"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 py-3 px-4 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-xl text-green-400 font-medium text-sm transition-all hover:scale-[1.02]"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                WhatsApp
                            </a>

                            {/* Telegram Button */}
                            <a
                                href="https://t.me/dyempire09"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-xl text-blue-400 font-medium text-sm transition-all hover:scale-[1.02]"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                </svg>
                                Telegram
                            </a>
                        </div>
                        <p className="text-xs text-slate-500 text-center mt-2">
                            Get exclusive updates, support & connect with the community
                        </p>
                    </div>

                    {/* Terms & Conditions Checkbox and CTA */}
                    <div className="space-y-4">
                        <label className="flex items-start gap-3 cursor-pointer group p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-cyan-500/30 transition-colors">
                            <input
                                type="checkbox"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="w-5 h-5 mt-0.5 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 cursor-pointer"
                            />
                            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                                I agree to the <a href="/terms" className="text-cyan-400 hover:text-cyan-300 underline">Terms and Conditions</a> and <a href="/privacy" className="text-cyan-400 hover:text-cyan-300 underline">Privacy Policy</a>
                            </span>
                        </label>

                        <Button
                            onClick={handleContinue}
                            className="w-full"
                            disabled={!agreedToTerms}
                        >
                            {agreedToTerms ? "Continue to Site" : "Please Agree to Terms"}
                        </Button>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out forwards;
                }
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
