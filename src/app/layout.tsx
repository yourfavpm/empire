import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "DY_EMpire - Premium Digital Assets Marketplace",
  description: "Your trusted marketplace for premium digital assets. Buy templates, guides, tools, and more with secure payments.",
  keywords: "digital assets, marketplace, templates, guides, Nigeria, Paystack, crypto",
};

import { CrossPromoBanner } from "@/components/CrossPromoBanner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.className} bg-white text-brand antialiased`}>
        <Providers>
          {children}
          <CrossPromoBanner />
        </Providers>
      </body>
    </html>
  );
}

