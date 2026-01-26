
import { UserPlus, CreditCard, Download } from 'lucide-react';

const STEPS = [
    {
        icon: UserPlus,
        title: "Create Account",
        description: "Sign up in seconds. No complex verification for basic access."
    },
    {
        icon: CreditCard,
        title: "Fund Wallet",
        description: "Securely add funds using Paystack or Crypto deposits."
    },
    {
        icon: Download,
        title: "Instant Access",
        description: "Purchase active numbers and tools. Immediate delivery."
    }
];

export function HowItWorks() {
    return (
        <section className="bg-white py-16 border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-3 gap-12 text-center md:text-left">
                    {STEPS.map((step, idx) => (
                        <div key={idx} className="group">
                            <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center mb-4 text-brand group-hover:border-brand transition-colors">
                                <step.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-brand mb-2">
                                {step.title}
                            </h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
