import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-slate-900 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center space-x-2 mb-4">
                            <img src="/dylogo.png" alt="DY_EMpire" className="h-10 w-auto" />
                        </div>
                        <p className="text-slate-400 max-w-md">
                            Your trusted marketplace for premium digital assets. Buy templates, guides, tools, and more with secure payments.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/assets" className="text-slate-400 hover:text-white transition-colors">
                                    Browse Assets
                                </Link>
                            </li>
                            <li>
                                <Link href="/login" className="text-slate-400 hover:text-white transition-colors">
                                    Sign In
                                </Link>
                            </li>
                            <li>
                                <Link href="/signup" className="text-slate-400 hover:text-white transition-colors">
                                    Create Account
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Support</h3>
                        <ul className="space-y-3">
                            <li>
                                <span className="text-slate-400">dyempiremarketplace@gmail.com</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <span className="text-slate-400">Payment Methods:</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Paystack</span>
                                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded">Crypto</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-slate-500 text-sm">
                        © {new Date().getFullYear()} DY_EMpire. All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <span className="text-slate-500 text-sm hover:text-slate-400 cursor-pointer">
                            Privacy Policy
                        </span>
                        <span className="text-slate-500 text-sm hover:text-slate-400 cursor-pointer">
                            Terms of Service
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
