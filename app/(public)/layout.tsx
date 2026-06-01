'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, Menu, Facebook, Twitter, Youtube, Calendar, PenTool, ChevronRight, X
} from 'lucide-react';
import { WeatherWidget } from '@/components/weather-widget';
import BreakingTicker from '@/components/public/BreakingTicker';
import Footer from '@/components/public/Footer';
import AdBanner from '@/components/AdBanner';

const STATIC_FALLBACK_CATEGORIES = [
  { value: 'all', label: 'প্রচ্ছদ' },
  { value: 'বিশেষ সংবাদ', label: 'বিশেষ সংবাদ' },
  { value: 'রাজনীতি', label: 'রাজনীতি' },
  { value: 'বাংলাদেশ', label: 'বাংলাদেশ' },
  { value: 'অপরাধ', label: 'অপরাধ' },
  { value: 'বিশ্ব', label: 'বিশ্ব' },
  { value: 'বাণিজ্য', label: 'বাণিজ্য' },
  { value: 'মতামত', label: 'মতামত' },
  { value: 'খেলা', label: 'খেলা' },
  { value: 'বিনোদন', label: 'বিনোদন' }
];

function PublicHeaderAndNav() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentCategory = searchParams.get('category') || 'all';
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>(STATIC_FALLBACK_CATEGORIES);

  // Sync state if search parameter changes externally
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);

  // Dynamically load categories from API
  useEffect(() => {
    let active = true;
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.categories && active) {
          const formatted = data.categories.map((c: any) => ({
            value: c.value,
            label: c.label
          }));
          const hasAll = formatted.some((c: any) => c.value === 'all');
          if (!hasAll) {
            setCategories([{ value: 'all', label: 'প্রচ্ছদ' }, ...formatted]);
          } else {
            setCategories(formatted);
          }
        }
      })
      .catch(err => {
        console.error('Failed to load dynamic categories, using static fallback.', err);
      });
    return () => { active = false; };
  }, []);

  const handleCategorySelect = (val: string) => {
    setMobileMenuOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    if (val === 'all') {
      params.delete('category');
    } else {
      params.set('category', val);
    }
    // Clear search when switching categories for optimal user experience
    params.delete('search');
    setSearchTerm('');
    router.push(`/${params.toString() ? '?' + params.toString() : ''}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
    } else {
      params.delete('search');
    }
    router.push(`/${params.toString() ? '?' + params.toString() : ''}`);
  };

  // Get current date formatted in Bengali
  const [banglaDate, setBanglaDate] = useState('রবিবার, ২৪ মে ২০২৬');
  useEffect(() => {
    const formatBanglaDate = () => {
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const locale = 'bn-BD';
      try {
        const formatter = new Intl.DateTimeFormat(locale, options);
        setBanglaDate(formatter.format(new Date()));
      } catch {
        // fallback
      }
    };
    formatBanglaDate();
  }, []);

  return (
    <>
      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 animate-fade-in flex justify-end no-print md:hidden">
          <div className="w-80 max-w-[85%] bg-white h-full p-5 shadow-2xl flex flex-col gap-6 animate-slide-left overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-4">
              <Link
                href="/"
                onClick={() => {
                  handleCategorySelect('all');
                  setMobileMenuOpen(false);
                }}
                className="cursor-pointer block"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/logo.png" 
                  alt="মানবাধিকার খবর" 
                  className="h-8 w-auto object-contain block"
                />
              </Link>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-all cursor-pointer"
                aria-label="মোবাইল মেনু বন্ধ করুন"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Search Form */}
            <form onSubmit={handleSearchSubmit} className="relative w-full md:hidden">
              <input 
                type="text" 
                placeholder="খুঁজুন..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:border-[#BC1E2D] focus:ring-1 focus:ring-[#BC1E2D] transition-all font-bangla text-sm shadow-xs"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-650 cursor-pointer transition-colors" aria-label="অনুসন্ধান করুন">
                <Search className="w-5 h-5" />
              </button>
            </form>

            <div className="flex flex-col gap-2">
              <Link
                href="/epaper"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between bg-[#BC1E2D] hover:bg-red-800 text-white font-bold px-4 py-3 rounded-lg text-sm transition-all shadow-sm active:scale-95 cursor-pointer font-bangla"
              >
                <span className="font-bangla">আজকের ই-পেপার সংস্করণ</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">ক্যাটেগরি সমূহ</div>
            <ul className="flex flex-col gap-1 font-bangla">
              {categories.map(cat => (
                <li key={cat.value}>
                  <button
                    onClick={() => handleCategorySelect(cat.value)}
                    className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-bold transition-all flex items-center justify-between ${
                      currentCategory === cat.value 
                        ? 'bg-red-50 text-red-700' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {currentCategory === cat.value && <span className="w-1.5 h-1.5 rounded-full bg-red-650" />}
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-auto border-t pt-4 text-[11px] text-gray-500 font-medium font-sans flex flex-col gap-1">
              <div>{banglaDate}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-widest">মানবাধিকার খবর © ২০২৬</div>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar for weather, date, social media icons */}
      <div className="border-b border-gray-200 bg-white no-print">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-between items-center text-sm text-gray-700">
          <div className="flex items-center gap-4">
            <span className="font-bangla font-medium">{banglaDate}</span>
            <WeatherWidget />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 border-l border-gray-300 pl-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <Facebook className="w-4 h-4 cursor-pointer text-gray-500 hover:text-blue-600 transition-colors" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <Twitter className="w-4 h-4 cursor-pointer text-gray-500 hover:text-blue-400 transition-colors" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                <Youtube className="w-4 h-4 cursor-pointer text-gray-500 hover:text-red-600 transition-colors" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header with Logo & search box */}
      <header className="border-b-[3px] border-[#BC1E2D] py-5 bg-white shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-gray-800 hover:text-red-700 transition-colors p-1 cursor-pointer"
              aria-label="মোবাইল বাটন"
            >
              <Menu className="w-7 h-7" />
            </button>
            
            <div className="flex flex-col">
              <Link 
                href="/"
                onClick={() => handleCategorySelect('all')}
                className="cursor-pointer hover:opacity-90 transition-opacity block"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/logo.png" 
                  alt="মানবাধিকার খবর" 
                  className="h-10 sm:h-12 md:h-16 w-auto object-contain block"
                />
              </Link>
              <span className="hidden sm:inline-block text-[11px] text-[#15803d] font-bold font-bangla mt-1 tracking-wide select-none pl-1">
                মানবাধিকার উন্নয়ন ও বস্তুনিষ্ঠ সাংবাদিকতায় প্রতিশ্রুতিবদ্ধ
              </span>
            </div>
            <div className="md:hidden text-gray-800 w-6 h-6" /> {/* Spacer */}
          </div>
          
          {/* Top Header advertisement banner - matches uploaded style exactly */}
          <div className="w-full max-w-[580px] hidden md:block">
            <AdBanner position="below_header" className="w-full" aspectRatio="aspect-[5.5/1]" />
          </div>
        </div>
      </header>

      {/* Navigation & Sticky Category Filter */}
      <nav className="border-b border-gray-200 sticky top-0 bg-white z-50 shadow-sm overflow-x-auto no-print">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center gap-6 text-[16px] font-bold text-gray-800 py-3.5 font-bangla whitespace-nowrap select-none">
            {categories.map(cat => (
              <li 
                key={cat.value}
                onClick={() => handleCategorySelect(cat.value)}
                className={`cursor-pointer transition-all hover:text-red-700 ${currentCategory === cat.value ? 'text-red-700 border-b-[3px] border-red-700 pb-1.5' : ''}`}
              >
                {cat.label}
              </li>
            ))}
            <li className="text-red-700 hover:text-red-850 font-extrabold border-l border-gray-300 pl-4 flex items-center h-5">
              <Link href="/epaper" className="flex items-center gap-1.5 cursor-pointer">
                <span className="w-1.5 h-1.5 rounded-full bg-red-650 animate-ping"></span>
                <span className="font-bangla">ই-পেপার</span>
              </Link>
            </li>
            <li className="ml-auto flex items-center gap-2.5">
              {/* Sleek compact Search form inside Sticky navbar */}
              <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-44 lg:w-56 transition-all duration-300">
                <input 
                  type="text" 
                  placeholder="খুঁজুন..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 bg-gray-50/50 hover:bg-white rounded-full py-1.5 pl-3.5 pr-8 focus:outline-none focus:border-[#BC1E2D] focus:ring-1 focus:ring-[#BC1E2D] focus:bg-white transition-all font-bangla text-xs shadow-xs"
                />
                <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-650 cursor-pointer transition-colors" aria-label="অনুসন্ধান করুন">
                  <Search className="w-3.5 h-3.5" />
                </button>
              </form>

              <Link 
                href="/submit-news" 
                className="flex items-center gap-1.5 bg-[#BC1E2D] text-white hover:bg-red-800 px-4 py-2 rounded-full text-xs font-extrabold transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer"
              >
                <PenTool className="w-3.5 h-3.5 animate-pulse" />
                <span>সংবাদ পাঠান</span>
              </Link>
              
              <Link 
                href="/archive" 
                className="hidden md:flex items-center gap-1.5 bg-red-50 text-[#BC1E2D] hover:bg-[#BC1E2D] hover:text-white px-3.5 py-2 rounded-full text-xs font-bold transition-all shadow-sm border border-red-150 cursor-pointer"
              >
                <span>আর্কাইভ</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}

export default function PublicRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-gray-850">
      <Suspense fallback={
        <div className="h-16 bg-white border-b border-gray-200 animate-pulse w-full"></div>
      }>
        <PublicHeaderAndNav />
      </Suspense>

      {/* Breaking News Ticker Spot */}
      <Suspense fallback={<div className="h-10 bg-gray-50 border-b border-gray-200 w-full"></div>}>
        <BreakingTicker />
      </Suspense>

      {/* Page Contents */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>

      {/* Shared Footer component */}
      <Footer />
    </div>
  );
}
