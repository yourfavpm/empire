import { Navbar, Footer } from '@/components/layout';
import { WhatsAppFAB } from '@/components/ui';
import { supabaseAdmin } from '@/lib/supabase';
import { PromotionalBanner } from '@/components/PromotionalBanner';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

// New Homepage Components
import { SlidingBanner } from "@/components/home/SlidingBanner";
import { TrustTicker } from "@/components/home/TrustTicker";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ReviewSection } from "@/components/home/ReviewSection";

// Fetch banners
async function getBanners() {
  try {
    const { data } = await supabaseAdmin
      .from('Banner')
      .select('*')
      .eq('active', true)
      .order('createdAt', { ascending: false });
    return data || [];
  } catch (err) {
    console.error('Fetch banners error:', err);
    return [];
  }
}

export default async function HomePage() {
  const session = await auth();

    if (session?.user) {
        if (session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') {
             redirect('/admin');
        } else {
             redirect('/buyer');
        }
    }

  const dbBanners = await getBanners();

  // Merge DB banners with local ones from public folder
  const localBanners = [
    { id: 'l1', content: '/banner1.jpeg', link: '/assets', active: true },
    { id: 'l2', content: '/banner2.jpeg', link: '/assets', active: true },
    { id: 'l3', content: '/banner3.jpeg', link: '/assets', active: true },
  ];

  const allBanners = [...localBanners, ...dbBanners];
  const slidingBanners = allBanners.filter(b => {
    const content = b.content.toLowerCase();
    const isImage = content.match(/\.(jpg|jpeg|png|webp|gif|svg)/) || content.includes('/storage/v1/object/public/');
    return isImage;
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 pt-24 md:pt-28">
        {/* Section 1: Sliding Banner */}
        <section className="mb-8">
          <SlidingBanner banners={slidingBanners} />

          <div className="max-w-7xl mx-auto px-4 mt-12 mb-8 text-center animate-fade-in-up">
            <h2 className="text-2xl md:text-3xl font-bold text-brand tracking-tight">
              Purchase verified social logs and updates with <span className="text-brand">DY Empire</span>
            </h2>
            <div className="w-20 h-1 bg-brand/10 mx-auto mt-4 rounded-full" />
          </div>
        </section>


        {/* Section 2: Trust Ticker (Payment & Socials) */}
        <TrustTicker />

        {/* Section 3: How It Works */}
        <HowItWorks />

        {/* Optional Interstitial Banner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <PromotionalBanner />
        </div>

        {/* Section 5: Reviews */}
        <ReviewSection />
      </main>

      <Footer />
      <WhatsAppFAB phoneNumber="08071400331" />
    </div>
  );
}
