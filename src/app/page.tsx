import Link from 'next/link';
import { Navbar, Footer } from '@/components/layout';
import { Button, WhatsAppFAB } from '@/components/ui';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import { CategorySection } from '@/components/CategorySection';

// Fetch all unique categories with their assets
async function getAllCategories() {
  try {
    const assets = await prisma.asset.findMany({
      where: {
        status: 'ACTIVE',
      },
      orderBy: [
        { category: 'asc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        title: true,
        category: true,
        platformType: true,
        price: true,
        shortDescription: true,
      },
    });

    // Group by category
    const grouped: Record<string, typeof assets> = {};
    for (const asset of assets) {
      if (!grouped[asset.category]) {
        grouped[asset.category] = [];
      }
      grouped[asset.category].push(asset);
    }

    return Object.entries(grouped).map(([category, items]) => ({
      category,
      count: items.length,
      assets: items,
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const categories = await getAllCategories();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex items-center overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[150px]" />
            <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px]" />
          </div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                  <span style={{ color: 'var(--text-primary)' }}>Premium</span>
                  <br />
                  <span className="bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-400 bg-clip-text text-transparent">
                    Digital Assets
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-slate-400 mb-6 max-w-md mx-auto lg:mx-0 leading-relaxed">
                  Access exclusive templates, guides, and tools. Fund your wallet and unlock premium content instantly.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                  <Link href="/assets">
                    <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 border-0 text-white font-semibold text-sm px-6">
                      Explore Assets
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="outline" size="lg" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 text-sm px-6">
                      Get Started Free
                    </Button>
                  </Link>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-center lg:justify-start gap-6 mt-8 pt-6 border-t border-slate-800">
                  <div>
                    <div className="text-xl font-bold text-white">100+</div>
                    <div className="text-xs text-slate-500">Assets</div>
                  </div>
                  <div className="w-px h-8 bg-slate-800" />
                  <div>
                    <div className="text-xl font-bold text-white">500+</div>
                    <div className="text-xs text-slate-500">Users</div>
                  </div>
                  <div className="w-px h-8 bg-slate-800" />
                  <div>
                    <div className="text-xl font-bold text-cyan-400">Instant</div>
                    <div className="text-xs text-slate-500">Access</div>
                  </div>
                </div>
              </div>

              {/* Right - Dragon Logo */}
              <div className="hidden lg:flex justify-center items-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-teal-500/20 rounded-full blur-3xl scale-150" />
                  <img
                    src="/dylogo.png"
                    alt="DY Empire"
                    className="relative w-80 h-auto drop-shadow-[0_0_60px_rgba(6,182,212,0.3)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs font-medium mb-4">
                SIMPLE PROCESS
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
                How It Works
              </h2>
              <p className="text-slate-400 max-w-lg mx-auto">
                Get access to premium digital assets in three simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '1',
                  title: 'Create Account',
                  desc: 'Sign up for free and get your personal wallet ready.',
                  icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                },
                {
                  step: '2',
                  title: 'Fund Wallet',
                  desc: 'Add funds via Paystack or Crypto.',
                  icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
                },
                {
                  step: '3',
                  title: 'Unlock Assets',
                  desc: 'Browse and unlock assets instantly.',
                  icon: 'M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z'
                },
              ].map((item, index) => (
                <div key={item.step} className="group relative">
                  {/* Connector Line */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-cyan-500/30 to-transparent" />
                  )}
                  <div className="relative text-center p-8">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-cyan-500/20">
                      <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                      </svg>
                    </div>
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 -translate-y-2 w-6 h-6 bg-cyan-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {item.step}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Payment Methods Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-teal-500/5" />

              <div className="relative p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-10 items-center">
                  <div>
                    <span className="inline-block px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs font-medium mb-4">
                      PAYMENT OPTIONS
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                      Flexible Payment Methods
                    </h2>
                    <p className="text-slate-400 mb-6">
                      Choose from multiple payment methods for a seamless experience worldwide.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-white font-medium">Paystack</span>
                          <p className="text-xs text-slate-400">Instant payments · Nigerian cards</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                        <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-white font-medium">Cryptocurrency</span>
                          <p className="text-xs text-slate-400">BTC, ETH, USDT accepted</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { icon: '🇳🇬', name: 'NGN', label: 'Naira' },
                        { icon: '₿', name: 'BTC', label: 'Bitcoin' },
                        { icon: '⟠', name: 'ETH', label: 'Ethereum' },
                        { icon: '₮', name: 'USDT', label: 'Tether' },
                      ].map((item) => (
                        <div key={item.name} className="bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/30 rounded-2xl p-6 text-center transition-all hover:scale-105">
                          <div className="text-3xl mb-2">{item.icon}</div>
                          <div className="text-sm font-medium text-white">{item.name}</div>
                          <div className="text-xs text-slate-500">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <CategorySection categories={categories} />
      </main>

      <Footer />

      {/* WhatsApp FAB */}
      <WhatsAppFAB phoneNumber="08071400331" />
    </div>
  );
}
