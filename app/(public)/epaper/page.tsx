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
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import AdBanner from '@/components/AdBanner';
import BreakingTicker from '@/components/public/BreakingTicker';

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

  const handleCategoryChange = (cat: string) => {
    router.push(`/?category=${encodeURIComponent(cat)}`);
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    if (val.trim()) {
      router.push(`/?search=${encodeURIComponent(val.trim())}`);
    }
  };

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
    return [];
  }, [collections, selectedCollectionIndex]);

  // Safety guard to ensure currentPage is never out of bounds when collection shifts
  useEffect(() => {
    if (activePages && activePages.length > 0 && currentPage >= activePages.length) {
      setCurrentPage(0);
    }
  }, [activePages, currentPage]);

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

  // Current Date in Bengali
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const today = new Intl.DateTimeFormat('bn-BD', dateOptions).format(new Date());

  // Defensive bounds check for currentPage data to prevent runtime crashes
  const activePage = activePages[currentPage] || activePages[0] || { id: 1, title: 'কোনো পাতা নেই', image: '' };

  if (collectionsLoading) {
    return (
      <div className="min-h-screen flex flex-col font-bangla antialiased selection:bg-[#BC1E2D] selection:text-white transition-colors duration-200 bg-white text-[#1A1A1A]">
        <Navbar 
          selectedCategory="" 
          onCategoryChange={handleCategoryChange} 
          searchTerm={searchTerm} 
          onSearchChange={handleSearchChange} 
        />
        <BreakingTicker />
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 bg-[#F6F4EE]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-red-200 border-t-red-700 rounded-full animate-spin"></div>
            <span className="text-sm font-bold text-gray-600 font-sans">ই-পেপার লোড হচ্ছে...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!collectionsLoading && collections.length === 0) {
    return (
      <div className="min-h-screen flex flex-col font-bangla antialiased selection:bg-[#BC1E2D] selection:text-white transition-colors duration-200 bg-white text-[#1A1A1A]">
        <Navbar 
          selectedCategory="" 
          onCategoryChange={handleCategoryChange} 
          searchTerm={searchTerm} 
          onSearchChange={handleSearchChange} 
        />
        <BreakingTicker />
        <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 bg-[#F6F4EE]">
          <div className="bg-white border border-[#E4DFD5] p-8 md:p-12 rounded-2xl max-w-md w-full text-center shadow-lg">
            <div className="w-16 h-16 bg-red-50 text-red-750 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
              <Calendar size={32} className="animate-pulse text-[#BC1E2D]" />
            </div>
            <h3 className="text-xl font-black text-gray-950 mb-2">কোনো সংস্করণ নেই</h3>
            <p className="text-sm text-gray-500 font-sans leading-relaxed mb-6">
              দুঃখিত, বর্তমানে ই-পেপার সংস্করণের কোনো আর্কাইভ বা আজকের সংস্করণ ডাটাবেজে প্রকাশিত হয়নি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।
            </p>
            <Link href="/" className="inline-flex items-center gap-2 bg-[#BC1E2D] hover:bg-red-800 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-all shadow hover:shadow-md cursor-pointer">
              প্রচ্ছদে ফিরে যান
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-bangla antialiased selection:bg-[#BC1E2D] selection:text-white transition-colors duration-200 bg-white text-[#1A1A1A]">
      
      {/* Dynamic Modular Navbar */}
      <Navbar 
        selectedCategory="" 
        onCategoryChange={handleCategoryChange} 
        searchTerm={searchTerm} 
        onSearchChange={handleSearchChange} 
      />

      {/* Dynamic Live Breaking News Ticker */}
      <BreakingTicker />

      {/* Top Banner Ad position */}
      <div className="max-w-[1500px] w-full mx-auto px-4 mt-6">
        <AdBanner position="top_banner" className="w-full" aspectRatio="aspect-[6/1] sm:aspect-[8/1] md:aspect-[10/1]" maxAds={1} />
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
              <div className="flex flex-wrap items-center gap-3">
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

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-500 font-sans">তারিখ খুঁজুন:</span>
                  <input
                    type="date"
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      const idx = collections.findIndex(c => c._id === val);
                      if (idx !== -1) {
                        setSelectedCollectionIndex(idx);
                        setCurrentPage(0);
                        setZoom(1);
                      } else {
                        const monthPrefix = val.substring(0, 7);
                        const matches = collections.filter(c => c._id.startsWith(monthPrefix));
                        if (matches.length > 0) {
                          const mainMatchIndex = collections.findIndex(c => c._id === matches[0]._id);
                          setSelectedCollectionIndex(mainMatchIndex);
                          setCurrentPage(0);
                          setZoom(1);
                          alert(`দুঃখিত, ${val} তারিখের ই-পেপার পাওয়া যায়নি। তবে ওই মাসের (${matches[0].monthName}) ই-পেপার সংস্করণ লোড করা হলো।`);
                        } else {
                          alert(`দুঃখিত, ${val} তারিখের কোনো ই-পেপার সংস্করণ পাওয়া যায়নি।`);
                        }
                      }
                    }}
                    className="bg-white border-2 border-[#E4DFD5] text-gray-950 font-bold py-1.5 px-3 rounded focus:outline-none focus:border-[#BC1E2D] text-sm font-sans"
                  />
                </div>
              </div>
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
                          src={activePage.image} 
                          alt={activePage.title} 
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
                       পাতা {toBengaliDigits(activePage.id)}: {activePage.title}
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

            {/* Right Sidebar Ad Column */}
            <div className="w-full lg:w-72 shrink-0 hidden xl:flex flex-col gap-4">
              <div className="bg-white border border-[#E4DFD5] p-3.5 rounded-lg shadow-xs">
                <span className="text-[9px] font-bold text-gray-400 block mb-2 font-sans text-center uppercase tracking-widest">বিজ্ঞাপন</span>
                <AdBanner position="sidebar" className="w-full" aspectRatio="aspect-[4/5]" maxAds={1} />
              </div>
              <div className="bg-white border border-[#E4DFD5] p-3.5 rounded-lg shadow-xs">
                <AdBanner position="in_article" className="w-full" aspectRatio="aspect-square" maxAds={1} />
              </div>
              <div className="bg-white border border-[#E4DFD5] p-3.5 rounded-lg shadow-xs">
                <AdBanner position="below_header" className="w-full" aspectRatio="aspect-[3/2]" maxAds={1} />
              </div>
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

      {/* Modular Unified Footer */}
      <Footer />

    </div>
  );
}
