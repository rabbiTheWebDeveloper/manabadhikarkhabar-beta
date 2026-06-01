'use client';

import { useState, useRef, useEffect, useMemo } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut,
  Calendar,
  Grid,
  Maximize2,
  Facebook,
  Twitter,
  Youtube,
  Compass,
  Search,
  Menu,
  X,
  PenTool,
  Settings,
  MapPin,
  Mail,
  Phone,
  Smartphone,
  Printer
} from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { WeatherWidget } from '@/components/weather-widget';
import { Article } from '@/lib/types';

// E-paper pages (using High quality layouts)
const PAGES = [
  { id: 1, title: "প্রথম পাতা (প্রচ্ছদ)", image: "https://manabadhikarkhabar.com/epaper/admin/background/22-4-2026-17768674352.jpg" },
  { id: 2, title: "জাতীয় সংবাদ (২য় পাতা)", image: "https://manabadhikarkhabar.com/epaper/admin/background/22-4-2026-17768701711.jpg" },
  { id: 3, title: "আন্তর্জাতিক (৩য় পাতা)", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200" },
  { id: 4, title: "সম্পাদকীয় ও মতামত (৪র্থ পাতা)", image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=1200" },
  { id: 5, title: "সারাদেশ ও বিশেষ প্রতিবেদন (৫ম পাতা)", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=1200" },
  { id: 6, title: "খেলাধুলা (৬ষ্ঠ পাতা)", image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=1200" },
  { id: 7, title: "সাহিত্য ও সংস্কৃতি (৭ম পাতা)", image: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=1200" },
  { id: 8, title: "শেষ পাতা (বিশেষ সংবাদ)", image: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=1200" },
];

const categoriesList = [
  { label: 'সর্বশেষ', value: 'all' },
  { label: 'বিশেষ সংবাদ', value: 'বিশেষ সংবাদ' },
  { label: 'রাজনীতি', value: 'রাজনীতি' },
  { label: 'বাংলাদেশ', value: 'বাংলাদেশ' },
  { label: 'অপরাধ', value: 'অপরাধ' },
  { label: 'বিশ্ব', value: 'বিশ্ব' },
  { label: 'বাণিজ্য', value: 'বাণিজ্য' },
  { label: 'মতামত', value: 'মতামত' },
  { label: 'খেলা', value: 'খেলা' },
  { label: 'বিনোদন', value: 'বিনোদন' }
];

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

function toBengaliDigits(num: number | string): string {
  return num
    .toString()
    .split('')
    .map(char => {
      const idx = parseInt(char, 10);
      return isNaN(idx) ? char : BENGALI_DIGITS[idx];
    })
    .join('');
}

function getLowResPlaceholder(src: string): string {
  if (!src) return '';
  if (src.includes('images.unsplash.com')) {
    let lowRes = src;
    if (lowRes.includes('w=')) {
      lowRes = lowRes.replace(/w=\d+/, 'w=45');
    } else {
      lowRes += '&w=45';
    }
    if (lowRes.includes('q=')) {
      lowRes = lowRes.replace(/q=\d+/, 'q=12');
    } else {
      lowRes += '&q=12';
    }
    return lowRes;
  }
  if (src.includes('cloudinary.com') && src.includes('/upload/')) {
    return src.replace('/upload/', '/upload/w_45,q_12,e_blur:1000/');
  }
  return src;
}

const NEWSPAPER_SVG_PLACEHOLDER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1600" width="1200" height="1600"><rect width="1200" height="1600" fill="%23F6F4EE"/><g opacity="0.1"><rect x="100" y="80" width="1000" height="120" fill="%231A1A1A"/><rect x="100" y="240" width="480" height="30" fill="%231A1A1A"/><rect x="620" y="240" width="480" height="30" fill="%231A1A1A"/><rect x="100" y="300" width="1000" height="450" fill="%231A1A1A"/><rect x="100" y="790" width="310" height="730" fill="%231A1A1A"/><rect x="440" y="790" width="310" height="730" fill="%231A1A1A"/><rect x="780" y="790" width="310" height="730" fill="%231A1A1A"/></g></svg>`;

function ProgressiveImage({ 
  src, 
  alt, 
  width, 
  height, 
  priority = false,
  className = "",
  sizes
}: { 
  src: string; 
  alt: string; 
  width?: number; 
  height?: number; 
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  const [isHighResLoaded, setIsHighResLoaded] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  if (src !== prevSrc) {
    setIsHighResLoaded(false);
    setPrevSrc(src);
  }

  const lowResSrc = useMemo(() => {
    return getLowResPlaceholder(src);
  }, [src]);

  const isFill = !width && !height;

  return (
    <div className={`relative overflow-hidden bg-[#F6F4EE] rounded ${isFill ? 'w-full h-full' : ''}`}>
      {/* 1. Base Newspaper SVG layout (Instant render, 35% opacity) */}
      {!isHighResLoaded && (
        <div className="absolute inset-0 z-0 animate-pulse duration-2000">
          <Image
            src={NEWSPAPER_SVG_PLACEHOLDER}
            alt="Placeholder"
            fill
            className="object-contain opacity-35 select-none pointer-events-none"
            unoptimized
          />
        </div>
      )}

      {/* 2. Low-res Blurred Page Image */}
      {!isHighResLoaded && lowResSrc && (
        <div className="absolute inset-0 z-10 overflow-hidden">
          <Image
            src={lowResSrc}
            alt={alt}
            fill
            className="object-contain blur-[24px] scale-105 opacity-80 select-none pointer-events-none"
            referrerPolicy="no-referrer"
            unoptimized={lowResSrc.startsWith('data:')}
          />
        </div>
      )}

      {/* 3. High-res Target Image */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={isFill}
        sizes={sizes}
        priority={priority}
        onLoad={() => {
          setIsHighResLoaded(true);
        }}
        className={`transition-all duration-700 ease-out ${className} ${
          isFill ? 'absolute inset-0' : 'relative'
        } ${
          isHighResLoaded ? 'opacity-100 blur-0 scale-100 z-20' : 'opacity-0 scale-98 pointer-events-none'
        }`}
        referrerPolicy="no-referrer"
      />

      {/* 4. Spinner circular loading panel */}
      {!isHighResLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none bg-black/5">
          <div className="p-3 py-2 rounded-full bg-white/95 shadow-lg border border-gray-150 flex items-center gap-2 select-none">
            <div className="w-4 h-4 border-2 border-[#BC1E2D] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[11px] font-extrabold text-neutral-800 font-sans tracking-wide">পৃষ্ঠা লোড হচ্ছে...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EPaper() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Dynamic collections
  const [collections, setCollections] = useState<any[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [selectedCollectionIndex, setSelectedCollectionIndex] = useState(0);

  // Fetch articles for live breaking news marquee ticker
  useEffect(() => {
    fetch('/api/articles')
      .then(res => res.json())
      .then(data => {
        setArticles(data.articles || []);
      })
      .catch(err => console.error("Error fetching articles in epaper page:", err));
  }, []);

  // Fetch e-paper collections
  useEffect(() => {
    fetch('/api/epaper')
      .then(res => res.json())
      .then(data => {
        if (data.collections && data.collections.length > 0) {
          setCollections(data.collections);
        }
      })
      .catch(err => console.error("Error fetching epaper collections in public page:", err))
      .finally(() => setCollectionsLoading(false));
  }, []);

  // Dynamic active pages based on active month
  const activePages = useMemo(() => {
    if (collections && collections.length > 0 && collections[selectedCollectionIndex]) {
      const col = collections[selectedCollectionIndex];
      if (col.pages && col.pages.length > 0) {
        return col.pages.map((p: any) => ({
          id: p.pageNumber,
          title: p.title || `${p.pageNumber}নং পাতা`,
          image: p.imgUrl
        }));
      }
    }
    return PAGES;
  }, [collections, selectedCollectionIndex]);

  const nextPage = () => {
    if (currentPage < activePages.length - 1) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  useEffect(() => {
    if (scrollRef.current) {
      const activeThumb = scrollRef.current.children[currentPage] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // Current Date in Bengali
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const today = new Intl.DateTimeFormat('bn-BD', dateOptions).format(new Date());

  return (
    <div className="min-h-screen flex flex-col font-bangla antialiased selection:bg-[#BC1E2D] selection:text-white transition-colors duration-200 bg-white text-[#1A1A1A]">
      
      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex md:hidden" role="dialog" aria-modal="true">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300" 
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Drawer container body */}
          <div className="relative flex w-full max-w-[280px] flex-col bg-white p-5 shadow-2xl transition-all h-full animate-fade-in-left">
            <div className="flex items-center justify-between border-b pb-4 mb-4 border-gray-200">
              <Link 
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xl font-black text-red-700 tracking-tight cursor-pointer font-serif-bangla"
                style={{ fontFamily: 'var(--font-serif-bangla), Georgia, serif' }}
              >
                মানবাধিকার খবর
              </Link>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-950 focus:outline-none transition-colors"
                aria-label="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick action buttons inside sidebar */}
            <div className="flex flex-col gap-2.5 mb-6">
              <Link 
                href="/submit-news" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-red-700 text-white hover:bg-red-800 py-2.5 rounded-lg text-sm font-extrabold transition-all shadow-sm"
              >
                <PenTool className="w-4 h-4" />
                <span>সংবাদ পাঠান</span>
              </Link>
              <Link 
                href="/epaper" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-amber-600 text-white hover:bg-amber-700 py-2.5 rounded-lg text-sm font-extrabold transition-all border border-amber-500 shadow-sm"
              >
                <Compass className="w-4 h-4 text-white animate-pulse" />
                <span>আজকের ই-পেপার</span>
              </Link>
              <Link 
                href="/archive" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-red-50 text-red-700 hover:bg-red-700 hover:text-white py-2.5 rounded-lg text-sm font-bold border border-red-150 transition-all"
              >
                <span>আর্কাইভ</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/admin" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-gray-50 text-gray-750 hover:text-red-750 py-2.5 rounded-lg text-sm font-bold border border-gray-200 transition-all"
              >
                <Settings className="w-4 h-4" />
                <span>পোর্টাল এডমিন</span>
              </Link>
            </div>

            <div className="text-xs font-bold text-gray-400 mb-2.5 uppercase tracking-wider">ক্যাটেগরি সমূহ</div>
            <ul className="flex flex-col gap-1 overflow-y-auto flex-1 font-bangla">
              {categoriesList.map(cat => (
                <li key={cat.value}>
                  <Link
                    href={`/?category=${cat.value}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-left px-3 py-2.5 rounded-md text-sm font-bold transition-all flex items-center justify-between text-gray-700 hover:bg-gray-50"
                  >
                    <span>{cat.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-auto border-t pt-4 border-gray-200 text-[11px] text-gray-500 font-medium">
              <div>{today}</div>
              <div className="mt-1 font-mono text-[10px]">DB: LIVE</div>
            </div>
          </div>
        </div>
      )}

      {/* 1. Top Bar */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-between items-center text-sm text-gray-700">
          <div className="flex items-center gap-4">
            <span className="font-bangla font-medium">{today}</span>
            <WeatherWidget />
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block font-mono text-[11px] font-bold text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
              DB: LIVE
            </span>
            <Link href="/epaper" className="flex items-center gap-1.5 font-bold text-white bg-amber-600 hover:bg-amber-700 cursor-pointer font-bangla transition-all shadow-sm px-2.5 py-1 rounded border border-amber-500 text-xs sm:text-sm animate-pulse">
              <Compass className="w-3.5 h-3.5" />
              <span>আজকের ই-পেপার</span>
            </Link>
            <Link href="/admin" className="flex items-center gap-1.5 font-bold hover:text-red-700 text-red-600 cursor-pointer font-bangla transition-colors border border-red-200 bg-red-50/50 px-2.5 py-1 rounded text-xs sm:text-sm">
              <Settings className="w-3.5 h-3.5" />
              <span>পোর্টাল এডমিন</span>
            </Link>
            <div className="flex items-center gap-3 border-l border-gray-300 pl-4">
              <Facebook className="w-4 h-4 cursor-pointer text-gray-500 hover:text-blue-600 transition-colors" />
              <Twitter className="w-4 h-4 cursor-pointer text-gray-500 hover:text-blue-400 transition-colors" />
              <Youtube className="w-4 h-4 cursor-pointer text-gray-500 hover:text-red-600 transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Header Branding */}
      <header className="border-b-[3px] border-red-700 py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-gray-800 hover:text-red-700 transition-colors p-1"
              aria-label="মোবাইল বাটন"
            >
              <Menu className="w-7 h-7" />
            </button>
            <Link 
              href="/"
              className="text-3xl md:text-4xl lg:text-5xl font-black text-red-700 tracking-tight cursor-pointer" 
              style={{ fontFamily: 'var(--font-serif-bangla), Georgia, serif' }}
            >
              মানবাধিকার খবর
            </Link>
            <div className="md:hidden text-gray-800 w-6 h-6" /> {/* Spacer */}
          </div>
          
          <div className="w-full max-w-sm">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input 
                type="text" 
                placeholder="খুঁজুন..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 bg-white rounded max-h-11 py-2 pl-4 pr-10 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all font-bangla text-sm text-gray-800"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-650">
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* 3. Navigation Bar */}
      <nav className="border-b border-gray-200 sticky top-0 bg-white z-50 shadow-sm overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center gap-6 text-[16px] font-bold text-gray-800 py-3 font-bangla whitespace-nowrap select-none">
            {categoriesList.map(cat => (
              <li 
                key={cat.value}
                className="cursor-pointer transition-all hover:text-red-700"
              >
                <Link href={`/?category=${cat.value}`}>
                  {cat.label}
                </Link>
              </li>
            ))}
            <li className="text-red-700 hover:text-red-850 font-extrabold border-l border-gray-350 pl-4 flex items-center h-5">
              <Link href="/epaper" className="flex items-center gap-1.5 cursor-pointer text-red-700 border-b-[3px] border-red-700 pb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-650 animate-ping"></span>
                <span className="font-bangla">ই-পেপার</span>
              </Link>
            </li>
            <li className="ml-auto flex items-center gap-2.5">
              <Link 
                href="/submit-news" 
                className="flex items-center gap-1.5 bg-red-700 text-white hover:bg-red-850 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer"
              >
                <PenTool className="w-3.5 h-3.5 animate-pulse" />
                <span>সংবাদ পাঠান</span>
              </Link>
              
              <Link 
                href="/archive" 
                className="hidden md:flex items-center gap-1.5 bg-red-50 text-red-700 hover:bg-red-700 hover:text-white px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm border border-red-150 cursor-pointer"
              >
                <span>আর্কাইভ</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* 4. Breaking News Ticker (Live headings) */}
      <div className="bg-gray-100 border-b border-gray-200 block">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center">
          <div className="bg-red-700 text-white px-3 py-1 flex items-center gap-2 text-[15px] font-bold whitespace-nowrap z-10 hidden sm:flex shrink-0">
             <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
             ব্রেকিং নিউজ
          </div>
          <div className="overflow-hidden flex-1 relative flex items-center ml-0 sm:ml-4 group">
             <div className="animate-marquee whitespace-nowrap flex w-max items-center text-[15px] font-medium text-gray-800 font-bangla group-hover:[animation-play-state:paused] cursor-pointer">
                {articles.map((art, idx) => (
                  <span key={art._id + '-' + idx} className="contents">
                    <span className="mx-4 text-red-650">■</span>
                    <span className="hover:text-red-750 transition-colors uppercase leading-none">{art.title}</span>
                  </span>
                ))}
                {articles.length === 0 && (
                  <>
                    <span className="mx-4 text-red-650">■</span>
                    <span>মানবাধিকার খবর ডিজিটাল ই-পেপার সংস্করণে আপনাকে স্বাগতম...</span>
                  </>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* 5. Main E-Paper Display Desk */}
      <div className="bg-[#F6F4EE] text-[#1A1A1A] py-6 border-b border-gray-200">
        
        {/* Dynamic Edition Selector bar */}
        <div className="max-w-[1500px] w-full mx-auto px-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#E4DFD5]/70 pb-5">
          <div className="flex items-center gap-2.5 flex-wrap justify-center md:justify-start">
            <span className="text-sm font-bold text-gray-600 flex items-center gap-1.5 font-sans">
              <Calendar size={15} className="text-red-700" />
              <span>ই-পেপার সংস্করণ নির্বাচন করুন:</span>
            </span>
            {collectionsLoading ? (
              <span className="text-xs text-gray-500 font-sans">সংস্করণ পঞ্জি লোড হচ্ছে...</span>
            ) : collections.length === 0 ? (
              <span className="text-xs bg-red-50 text-red-700 border border-red-150 px-2.5 py-1 rounded font-bold">
                ডিফল্ট লাইভ ডেমো সংস্করণ
              </span>
            ) : (
              <select
                value={selectedCollectionIndex}
                onChange={(e) => {
                  setSelectedCollectionIndex(Number(e.target.value));
                  setCurrentPage(0);
                  setZoom(1);
                }}
                className="bg-white border-2 border-[#E4DFD5] text-gray-900 font-extrabold py-2 px-3.5 rounded focus:outline-none focus:border-[#BC1E2D] focus:ring-1 focus:ring-[#BC1E2D] text-sm cursor-pointer border-neutral-300 font-sans shadow-xs hover:border-red-600 transition-colors"
              >
                {collections.map((col, idx) => (
                  <option key={col._id} value={idx}>
                    {col.monthName} ({(col.pages || []).length} পাতা)
                  </option>
                ))}
              </select>
            )}
          </div>
          
          {collections.length > 0 && selectedCollectionIndex < collections.length && (
            <div className="text-xs text-[#BC1E2D] font-extrabold bg-white border border-[#E4DFD5] px-3.5 py-1.5 rounded-full shadow-xs">
              আর্কাইভ রেফারেন্স কোড: <span className="font-mono">{collections[selectedCollectionIndex]._id}</span>
            </div>
          )}
        </div>

        <div className="max-w-[1500px] mx-auto px-4 flex flex-col lg:flex-row gap-6 relative min-h-[600px]">
          
          {/* Side Toolbar Desk (Vertical) */}
          <aside className="lg:w-20 w-full flex lg:flex-col flex-row gap-4 items-center justify-center lg:py-6 py-3 border border-[#E4DFD5] bg-white rounded-lg shadow-sm">
            <button 
              onClick={() => setZoom(z => Math.min(z + 0.25, 2))}
              className="group flex flex-col items-center gap-1 cursor-pointer bg-transparent border-none outline-none"
              title="জুম ইন"
            >
              <div className="p-3 rounded-lg bg-neutral-50 border border-gray-200 text-neutral-600 group-hover:bg-[#BC1E2D] group-hover:text-white group-hover:border-[#BC1E2D] transition-all duration-200">
                <ZoomIn size={18} />
              </div>
              <span className="text-[10px] uppercase font-bold text-gray-500">জুম</span>
            </button>
            <button 
              onClick={() => setZoom(1)}
              className="group flex flex-col items-center gap-1 cursor-pointer bg-transparent border-none outline-none"
              title="রিসেট"
            >
              <div className="p-3 rounded-lg bg-neutral-50 border border-gray-200 text-neutral-600 group-hover:bg-[#BC1E2D] group-hover:text-white group-hover:border-[#BC1E2D] transition-all duration-200">
                <ZoomOut size={18} />
              </div>
              <span className="text-[10px] uppercase font-bold text-gray-500">রিসেট</span>
            </button>
            <button 
              onClick={() => setViewMode(viewMode === 'single' ? 'grid' : 'single')}
              className="group flex flex-col items-center gap-1 cursor-pointer bg-transparent border-none outline-none"
              title={viewMode === 'single' ? 'গ্রিড ভিউ' : 'রিডার ভিউ'}
            >
              <div className="p-3 rounded-lg bg-neutral-50 border border-gray-200 text-neutral-600 group-hover:bg-[#BC1E2D] group-hover:text-white group-hover:border-[#BC1E2D] transition-all duration-200">
                <Grid size={18} />
              </div>
              <span className="text-[10px] uppercase font-bold text-gray-500">{viewMode === 'single' ? 'গ্রিড' : 'রিডার'}</span>
            </button>
          </aside>
 
           {/* Reader Core Frame */}
           <div className="flex-1 overflow-auto rounded-lg border border-[#E4DFD5] bg-white p-4 md:p-8 flex items-start justify-center shadow-xs">
             {viewMode === 'grid' ? (
               /* Grid layouts */
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 w-full py-4 max-h-[800px] overflow-y-auto w-full">
                 {activePages.map((page: any, index: number) => (
                   <button
                     key={page.id}
                     onClick={() => {
                       setCurrentPage(index);
                       setViewMode('single');
                     }}
                     className="flex flex-col gap-3 group text-left bg-[#FCFCFA] p-3 border border-[#E4DFD5] rounded-lg hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer"
                   >
                     <div className="aspect-[3/4] overflow-hidden rounded border border-neutral-200 relative w-full h-80">
                       <ProgressiveImage 
                          src={page.image} 
                          alt={page.title} 
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover grayscale-[15%] group-hover:grayscale-0 transition-all" 
                        />
                       <span className="absolute top-2 left-2 bg-[#BC1E2D] text-white px-2 py-0.5 text-[10px] font-bold shadow rounded">
                         পাতা {toBengaliDigits(page.id)}
                       </span>
                     </div>
                     <div className="flex items-center justify-between border-t border-neutral-150 pt-2 text-sm">
                       <span className="font-serif-bangla font-bold text-neutral-900 group-hover:text-[#BC1E2D] transition-colors">{page.title}</span>
                       <Maximize2 size={12} className="text-neutral-400" />
                     </div>
                   </button>
                 ))}
               </div>
             ) : (
               /* Single page immersive reader with zoom parameter action */
               <div className="epaper-single-reader-container relative max-w-4xl w-full flex flex-col items-center">
                 
                 {/* Horizontal Navigation Control buttons */}
                 <button 
                   onClick={prevPage}
                   disabled={currentPage === 0}
                   className="absolute left-2 lg:-left-12 top-1/2 -translate-y-1/2 z-20 p-3.5 bg-white/95 border border-[#E4DFD5] rounded-full shadow-lg text-neutral-800 disabled:opacity-0 transition-all hover:bg-neutral-50 active:scale-95 cursor-pointer"
                   aria-label="Previous Page"
                 >
                   <ChevronLeft size={22} />
                 </button>
                 <button 
                   onClick={nextPage}
                   disabled={currentPage === activePages.length - 1}
                   className="absolute right-2 lg:-right-12 top-1/2 -translate-y-1/2 z-20 p-3.5 bg-white/95 border border-[#E4DFD5] rounded-full shadow-lg text-neutral-800 disabled:opacity-0 transition-all hover:bg-neutral-50 active:scale-95 cursor-pointer"
                   aria-label="Next Page"
                 >
                   <ChevronRight size={22} />
                 </button>
 
                 <div className="bg-white p-4 sm:p-6 border-2 border-[#E4DFD5] rounded-lg shadow-xl overflow-hidden mx-auto transition-all duration-300 w-full relative">
                   
                   {/* Detailed Epaper Information Masthead details */}
                   <div className="border-b border-gray-200 pb-3 mb-4 flex items-center justify-between text-xs sm:text-sm text-neutral-500">
                     <span className="text-[#BC1E2D] font-extrabold uppercase select-none">মানবাধিকার খবর ই-পেপার</span>
                     <span className="font-medium flex items-center gap-1">
                       <Calendar size={13} className="text-red-700" />
                       <span>{today}</span>
                     </span>
                   </div>
 
                   {/* Main Newspaper Image Display wrapper with local scroll viewport for zoom */}
                   <div className="w-full overflow-auto max-h-[75vh] md:max-h-[85vh] flex justify-center p-1 border border-neutral-100 rounded-md bg-neutral-50/50">
                     <div 
                       style={{ 
                         transform: `scale(${zoom})`, 
                         transformOrigin: 'top center',
                         minWidth: `${zoom * 100}%`,
                         height: 'auto'
                       }}
                       className="transition-transform duration-300 ease-out flex justify-center items-start origin-top"
                     >
                       <ProgressiveImage 
                          src={activePages[currentPage].image} 
                          alt={activePages[currentPage].title} 
                          width={1200}
                          height={1600}
                          priority
                          className="w-full h-auto rounded border border-neutral-105 max-h-[1400px] object-contain"
                        />
                     </div>
                   </div>
                   
                   {/* Bottom bar inside card */}
                   <div className="mt-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 pt-3 text-xs sm:text-sm font-bold gap-2">
                     <span className="text-neutral-700">
                       পাতা {toBengaliDigits(activePages[currentPage].id)}: {activePages[currentPage].title}
                     </span>
                     <span className="text-[#BC1E2D] flex items-center gap-1 whitespace-nowrap">
                       <span className="w-1.5 h-1.5 bg-[#BC1E2D] rounded-full animate-ping"></span>
                       লাইভ এডিশন
                     </span>
                   </div>
 
                 </div>
 
               </div>
             )}
           </div>
         </div>
       </div>
 
       {/* 6. Strip Thumbnail index menu */}
       <div className="bg-white border-t border-gray-250 py-4 flex flex-col items-center shadow-inner">
         <div className="max-w-[1500px] w-full flex items-center justify-between px-6 pb-2.5 border-b border-gray-150 text-xs text-neutral-500 font-bold font-bangla">
           <span>ই-পেপার সূচিপত্র (পাতা নির্বাচন করুন)</span>
           <div className="flex gap-4 items-center">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const pageStr = formData.get('page') as string;
                  const pageNum = parseInt(pageStr, 10);
                  if (!isNaN(pageNum) && pageNum > 0 && pageNum <= activePages.length) {
                    setCurrentPage(pageNum - 1);
                    if (viewMode === 'grid') setViewMode('single');
                  }
                  e.currentTarget.reset();
                }}
                className="flex items-center border border-gray-300 rounded overflow-hidden bg-[#FAFAF8]"
              >
                <input 
                  type="number" 
                  name="page" 
                  placeholder="পৃষ্ঠা নং" 
                  min={1} 
                  max={activePages.length} 
                  className="w-20 px-2 py-1 text-xs outline-none bg-transparent text-neutral-800 border-none font-sans" 
                />
                <button type="submit" className="bg-neutral-105 px-3 py-1 text-[#BC1E2D] hover:bg-[#BC1E2D] hover:text-white transition-colors border-l border-gray-200 cursor-pointer text-xs font-bold">
                  যান
                </button>
              </form>
           </div>
         </div>
         
         {/* Thumbnail Scrolling list */}
         <div 
           ref={scrollRef}
           className="w-full flex items-center gap-4 px-6 py-4 overflow-x-auto overflow-y-hidden scroll-smooth max-w-[1500px]"
         >
           {activePages.map((page: any, index: number) => (
             <button
               key={page.id}
               onClick={() => {
                 setCurrentPage(index);
                 if (viewMode === 'grid') setViewMode('single');
               }}
               className={`flex-shrink-0 group relative transition-all duration-350 flex items-center justify-center cursor-pointer bg-transparent border-none select-none ${
                 currentPage === index 
                 ? 'w-16 h-20 -translate-y-1 z-10' 
                 : 'w-12 h-16 opacity-55 hover:opacity-100'
               }`}
             >
               <div className="w-full h-full relative">
                 <Image 
                   src={page.image} 
                   alt={page.title} 
                   fill
                   sizes="100px"
                   className={`object-cover rounded border-2 transition-all duration-200 ${
                     currentPage === index ? 'border-[#BC1E2D] shadow-lg brightness-105' : 'border-[#E4DFD5]'
                   }`}
                   referrerPolicy="no-referrer"
                 />
               </div>
               
               <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-neutral-950 text-white text-[9px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none font-sans">
                 {page.title} (পাতা {toBengaliDigits(page.id)})
               </div>
             </button>
           ))}
        </div>
      </div>

      {/* 7. Homepage-wise Brand Footer */}
      <footer className="bg-[#1C1C1E] text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 border-b border-white/10">
           
           {/* Brand & Socials */}
           <div className="col-span-1">
             <div className="text-3xl md:text-4xl font-[900] text-white tracking-tight mb-6" style={{ fontFamily: 'var(--font-serif-bangla), Georgia, serif' }}>
              মানবাধিকার খবর
             </div>
             <p className="text-gray-400 text-[14px] leading-relaxed mb-6 font-medium font-bangla">
               দেশ ও বিদেশের সর্বশেষ সত্য ও বস্তুনিষ্ঠ খবরের নির্ভরযোগ্য অনলাইন নিউজ পোর্টাল।
             </p>
             <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-650 hover:text-white transition-colors text-white">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-400 hover:text-white transition-colors text-white">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-650 hover:text-white transition-colors text-white">
                  <Youtube className="w-5 h-5" />
                </a>
             </div>
           </div>

           {/* Editor & Publisher */}
           <div>
             <h3 className="text-base font-bold mb-6 text-white uppercase tracking-wider font-sans border-b-2 border-white/20 pb-2 inline-block">Editor & Publisher</h3>
             <div className="space-y-2 text-gray-300 font-sans">
               <p className="font-bold text-base text-white">Md Reaz Uddin</p>
               <p className="text-xs text-amber-500 font-bold uppercase tracking-wider">Editor & Publisher</p>
               <p className="text-xs text-gray-400 leading-normal mt-2 font-bangla">
                 মানবাধিকার উন্নয়ন ও বস্তুনিষ্ঠ সাংবাদিকতায় প্রতিশ্রুতিবদ্ধ।
               </p>
             </div>
           </div>

           {/* Editorial Office */}
           <div>
             <h3 className="text-base font-bold mb-6 text-white uppercase tracking-wider font-sans border-b-2 border-white/20 pb-2 inline-block">Editorial Office</h3>
             <div className="space-y-3 text-gray-300 text-sm font-sans leading-relaxed">
               <p className="flex items-start gap-1.5">
                 <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                 <span>
                   <strong>Kabbokosh Bhabon</strong><br />
                   Level-5, Suite#18,<br />
                   Kawran Bazar, Dhaka-1215.
                 </span>
               </p>
             </div>
           </div>

           {/* Column 4 - Contact Info */}
           <div>
             <h3 className="text-base font-bold mb-6 text-white uppercase tracking-wider font-sans border-b-2 border-white/20 pb-2 inline-block">যোগাযোগ ও তথ্য</h3>
             <div className="space-y-2.5 text-gray-300 text-sm font-sans">
               <p className="flex items-center gap-1.5">
                 <Mail className="w-4 h-4 text-red-500 shrink-0" />
                 <span className="text-xs">manabadhikarkhabar11@gmail.com</span>
               </p>
               <p className="flex items-center gap-1.5">
                 <Phone className="w-4 h-4 text-red-500 shrink-0" />
                 <span>+88-02-41010307</span>
               </p>
               <p className="flex items-center gap-1.5">
                 <Smartphone className="w-4 h-4 text-red-500 shrink-0" />
                 <span>+8801978882223</span>
               </p>
               <p className="flex items-center gap-1.5">
                 <Printer className="w-4 h-4 text-red-500 shrink-0" />
                 <span className="text-xs">Fax: +88-02-41010308</span>
               </p>
             </div>
           </div>
        </div>

        {/* Footer Copyright Bottom Strip */}
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center text-gray-500 text-xs gap-4 font-sans">
          <span className="font-bangla">© ২০২৬ মানবাধিকার খবর। সর্বস্বত্ব সংরক্ষিত।</span>
          <div className="flex gap-4 font-bangla">
            <a href="#" className="hover:text-white transition-colors">বিজ্ঞাপন</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors">প্রতিনিধি</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
