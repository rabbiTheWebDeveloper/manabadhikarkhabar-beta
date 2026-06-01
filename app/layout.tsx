import type {Metadata, Viewport} from 'next';
import { Inter, Noto_Sans_Bengali, Noto_Serif_Bengali } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const bangla = Noto_Sans_Bengali({ 
  subsets: ['bengali'], 
  weight: ['400', '500', '600', '700'], 
  variable: '--font-bangla' 
});
const banglaSerif = Noto_Serif_Bengali({ 
  subsets: ['bengali'], 
  weight: ['400', '500', '600', '700', '900'], 
  variable: '--font-serif-bangla' 
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#b91c1c',
};

export const metadata: Metadata = {
  title: 'মানবাধিকার খবর | দেশ ও বিদেশের সর্বশেষ অনলাইন নিউজ পোর্টাল',
  description: 'মানবাধিকার খবর (Manabadhikar Khabar) একটি আধুনিক ও নির্ভীক বাংলা নিউজ পোর্টাল। স্থানীয় ও জাতীয় সর্বাধিক ও সর্বশেষ খবরাখবর সবার আগে অত্যন্ত সত্যতার সাথে তুলে ধরাই আমাদের প্রধান অঙ্গিকার।',
  keywords: ['মানবাধিকার খবর', 'Manabadhikar Khabar', 'মানবাধিকার নিউজ', 'বাংলাদেশ খবর', 'সর্বশেষ সংবাদ', 'Bangla News', 'Manabadhikar Khabar Portal', 'দৈনিক মানবাধিকার খবর'],
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: 'https://manabadhikarkhabar.com',
  },
  openGraph: {
    title: 'মানবাধিকার খবর | দেশ ও বিদেশের সর্বাধুনিক অনলাইন নিউজ পোর্টাল',
    description: 'মানবাধিকার খবর দেশ ও বিদেশের স্থানীয় খবর, রাজনীতি, সমাজ, খেলাধুলা ও বস্তুনিষ্ঠ সংবাদের নির্ভরযোগ্য মাধ্যম।',
    siteName: 'মানবাধিকার খবর',
    locale: 'bn_BD',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'মানবাধিকার খবর | দেশ ও বিদেশের সর্বাধুনিক অনলাইন নিউজ পোর্টাল',
    description: 'মানবাধিকার খবর দেশ ও বিদেশের স্থানীয় খবর, রাজনীতি, সমাজ, খেলাধুলা ও বস্তুনিষ্ঠ সংবাদের নির্ভরযোগ্য মাধ্যম।',
  }
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="bn" className={`${inter.variable} ${bangla.variable} ${banglaSerif.variable}`}>
      <body className="bg-white text-gray-900 font-bangla antialiased selection:bg-red-200 selection:text-black min-h-screen flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
