"use client"
import { useState, useRef, useEffect } from "react";
import { 
  Menu, 
  Search, 
  Bell, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  Download, 
  ZoomIn, 
  ZoomOut,
  Calendar,
  CloudSun,
  Home,
  Grid,
  Maximize2
} from "lucide-react";
import { FaFacebook as Facebook, FaTwitter as Twitter, FaYoutube as Youtube } from 'react-icons/fa';
import Link from 'next/link';
import ThemeToggle from "@/components/commons/ThemeToggle";

// Mock data for high quality E-paper pages (Beautiful traditional news layouts)
const PAGES = [
  { id: 1, title: "প্রথম পাতা (প্রচ্ছদ)", image: "https://manabadhikarkhabar.com/epaper/admin/background/22-4-2026-17768674352.jpg" },
  { id: 2, title: "জাতীয় সংবাদ (২য় পাতা)", image: "https://manabadhikarkhabar.com/epaper/admin/background/22-4-2026-17768701711.jpg" },
  { id: 3, title: "আন্তর্জাতিক (৩য় পাতা)", image: "https://images.unsplash.com/photo-1529243856184-fd5465488984?auto=format&fit=crop&q=80&w=1200" },
  { id: 4, title: "সম্পাদকীয় ও মতামত (৪র্থ পাতা)", image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=1200" },
  { id: 5, title: "সারাদেশ ও বিশেষ প্রতিবেদন (৫ম পাতা)", image: "https://images.unsplash.com/photo-1611974714151-547a46985c72?auto=format&fit=crop&q=80&w=1200" },
  { id: 6, title: "খেলাধুলা (৬ষ্ঠ পাতা)", image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=1200" },
  { id: 7, title: "সাহিত্য ও সংস্কৃতি (৭ম পাতা)", image: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=1200" },
  { id: 8, title: "শেষ পাতা (বিশেষ সংবাদ)", image: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=1200" },
];

export default function EpaperApp() {
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure dark mode class is completely disabled
    document.documentElement.classList.remove('dark');
  }, []);

  const nextPage = () => {
    if (currentPage < PAGES.length - 1) setCurrentPage(currentPage + 1);
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

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#1A1A1A] font-serif antialiased selection:bg-[#C8102E] selection:text-white">
      
      {/* 1. Header (Premium Newspaper Branding) */}
      <header className="bg-white border-b border-[#D8D3CA] sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Left Nav Actions */}
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors flex items-center gap-1.5 font-sans text-xs font-bold text-neutral-600 hover:text-[#C8102E] border border-neutral-200"
              >
                <Home size={16} />
                <span className="hidden sm:inline">মূল ওয়েবসাইট</span>
              </Link>
              <button 
                onClick={() => setViewMode(viewMode === 'single' ? 'grid' : 'single')}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors flex items-center gap-1.5 font-sans text-xs font-bold text-neutral-600 hover:text-[#C8102E] border border-neutral-200"
              >
                <Grid size={16} />
                <span className="hidden sm:inline">{viewMode === 'single' ? 'গ্রিড ভিউ' : 'রিডার ভিউ'}</span>
              </button>
            </div>

            {/* Premium Logo / Center Branding */}
            <div className="flex items-center justify-center relative py-2">
              <div className="flex items-center gap-4">
                
                {/* SVG Dove & Document Logo */}
                <div className="w-12 h-10 pointer-events-none opacity-95 overflow-visible hidden md:block">
                  <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
                    {/* Secondary Wing (Right) */}
                    <path d="M85,50 C 75,25 90,15 105,25" stroke="#C8102E" strokeWidth="3" fill="none" strokeLinecap="round" />
                    {/* Main Red Dove Path */}
                    <path d="M90,55 C70,30 40,25 20,30 C28,38 35,45 32,55 C22,54 15,50 10,50 C20,60 35,68 45,70 C30,80 15,90 5,100 C35,95 60,80 75,65 C90,80 110,75 120,55 L135,50 L125,42 C115,32 100,35 90,55 Z" 
                          stroke="#C8102E" strokeWidth="3" fill="none" strokeLinejoin="round" strokeLinecap="round" />
                    {/* Dove Eye */}
                    <circle cx="112" cy="46" r="2" fill="#C8102E" />
                    {/* Green Document */}
                    <g transform="translate(122, 45) rotate(15)">
                      <rect x="0" y="0" width="24" height="32" stroke="#10B981" strokeWidth="2.5" fill="white" />
                      <line x1="5" y1="8" x2="19" y2="8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                      <line x1="5" y1="16" x2="19" y2="16" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                    </g>
                  </svg>
                </div>

                <div className="flex flex-col items-center md:items-start">
                  <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-neutral-900 leading-none">
                    মানবাধিকার <span className="text-[#C8102E]">খবর</span>
                  </h1>
                  <span className="text-[9px] uppercase tracking-[0.2em] font-sans font-bold text-[#B8922A] mt-1">
                    ডিজিটাল সংস্করণ • ই-পেপার
                  </span>
                </div>

              </div>
            </div>

            {/* Right Date and Actions */}
            <div className="flex items-center gap-2 sm:gap-4 font-sans">
              <div className="hidden lg:flex flex-col text-right text-[11px] font-bold text-neutral-500">
                <div className="flex items-center gap-1.5 justify-end">
                  <Calendar size={13} className="text-[#C8102E]" />
                  <span>{today}</span>
                </div>
                <div className="flex items-center gap-1.5 justify-end mt-0.5">
                  <CloudSun size={13} />
                  <span>২৪°C ঢাকা, বাংলাদেশ</span>
                </div>
              </div>
              <button className="hidden sm:flex items-center gap-1.5 bg-[#C8102E] text-white px-4 py-2 rounded-sm text-xs font-bold hover:bg-[#9B0B22] transition-colors shadow-sm">
                সাবস্ক্রাইব করুন
              </button>
              <button className="p-2 hover:bg-neutral-100 rounded-full border border-neutral-200">
                <User size={18} className="text-neutral-700" />
              </button>
              <ThemeToggle />
            </div>

          </div>
        </div>
      </header>

      {/* 2. Main E-Paper Desk */}
      <main className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        
        {/* Left Control Desk (Desktop Only) */}
        <aside className="hidden lg:flex flex-col w-20 border-r border-[#D8D3CA] bg-white items-center py-8 gap-8 shadow-xs">
          {[
            { icon: ZoomIn, label: 'জুম ইন' },
            { icon: ZoomOut, label: 'রিসেট' },
            { icon: Download, label: 'ডাউনলোড' },
            { icon: Share2, label: 'শেয়ার' }
          ].map((item, idx) => (
            <button 
              key={idx}
              onClick={() => {
                if (item.label === 'জুম ইন') setZoom(z => Math.min(z + 0.25, 2));
                if (item.label === 'রিসেট') setZoom(1);
              }}
              className="group flex flex-col items-center gap-1.5"
            >
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-500 group-hover:bg-[#C8102E] group-hover:text-white group-hover:border-[#C8102E] transition-all duration-200 shadow-xs">
                <item.icon size={18} />
              </div>
              <span className="text-[9px] font-sans font-bold text-neutral-400 uppercase group-hover:text-neutral-700">{item.label}</span>
            </button>
          ))}
        </aside>

        {/* Paper Display Box */}
        <div className="flex-1 overflow-auto p-4 md:p-8 flex items-start justify-center">
          {viewMode === 'grid' ? (
            /* Grid View of all pages */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl w-full py-4">
              {PAGES.map((page, index) => (
                <button
                  key={page.id}
                  onClick={() => {
                    setCurrentPage(index);
                    setViewMode('single');
                  }}
                  className="flex flex-col gap-3 group text-left bg-white p-3 border border-[#D8D3CA] rounded-sm shadow-xs hover:shadow-md transition-all hover:-translate-y-1"
                >
                  <div className="aspect-[3/4] overflow-hidden rounded-xs border border-neutral-200 relative">
                    <img src={page.image} className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all" alt={page.title} />
                    <span className="absolute top-2 left-2 bg-[#C8102E] text-white px-2 py-0.5 text-[9px] font-sans font-bold shadow-xs">
                      পাতা {page.id}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-neutral-100 pt-2">
                    <span className="text-xs font-serif font-black text-neutral-900 group-hover:text-[#C8102E] transition-colors">{page.title}</span>
                    <Maximize2 size={12} className="text-neutral-400" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            /* Single Page Reader View */
            <div className="relative max-w-4xl w-full flex flex-col items-center">
              
              {/* Pagination Arrows */}
              <button 
                onClick={prevPage}
                disabled={currentPage === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 lg:-ml-12 z-20 p-3 bg-white/95 border border-[#D8D3CA] rounded-full shadow-md text-neutral-800 disabled:opacity-0 transition-all hover:bg-neutral-50 active:scale-95 cursor-pointer"
                aria-label="Previous Page"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={nextPage}
                disabled={currentPage === PAGES.length - 1}
                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 lg:-mr-12 z-20 p-3 bg-white/95 border border-[#D8D3CA] rounded-full shadow-md text-neutral-800 disabled:opacity-0 transition-all hover:bg-neutral-50 active:scale-95 cursor-pointer"
                aria-label="Next Page"
              >
                <ChevronRight size={20} />
              </button>

              {/* The Paper Image wrapper */}
              <div className="bg-white p-3 sm:p-5 border-2 border-[#D8D3CA] rounded-sm shadow-xl overflow-hidden mx-auto transition-all duration-300 w-full relative">
                
                {/* Epaper Header Details */}
                <div className="border-b border-[#D8D3CA] pb-2 mb-3 flex items-center justify-between text-[11px] font-sans font-bold text-neutral-500">
                  <span className="text-[#C8102E] uppercase">মানবাধিকার খবর ই-পেপার</span>
                  <span>{today}</span>
                </div>

                <div 
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
                  className="transition-transform duration-300 w-full"
                >
                  <img 
                    src={PAGES[currentPage].image} 
                    alt={PAGES[currentPage].title} 
                    className="w-full h-auto rounded-[1px] border border-neutral-100"
                  />
                </div>
                
                {/* Info Bar */}
                <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-3 text-[11px] font-sans font-bold text-neutral-400">
                  <span className="text-neutral-700">পাতা {PAGES[currentPage].id}: {PAGES[currentPage].title}</span>
                  <span className="text-[#C8102E] flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#C8102E] rounded-full animate-ping"></span>লাইভ এডিশন</span>
                </div>

              </div>

            </div>
          )}
        </div>
      </main>

      {/* 3. Bottom Thumbnail Strip */}
      <footer className="bg-white border-t border-[#D8D3CA] h-36 flex flex-col items-center shadow-md">
        
        {/* Strip Header */}
        <div className="w-full flex items-center justify-between px-6 py-2 bg-neutral-50 border-b border-neutral-200 font-sans font-bold text-[10px] uppercase tracking-wider text-neutral-500">
          <span>ই-পেপার সূচিপত্র</span>
          <div className="flex gap-4">
             <button className="hover:text-[#C8102E] transition-colors">সকল সংস্করণ</button>
             <span className="text-neutral-300">|</span>
             <button className="hover:text-[#C8102E] transition-colors">আর্কাইভ</button>
          </div>
        </div>
        
        {/* Bottom Thumbnails */}
        <div 
          ref={scrollRef}
          className="flex-1 w-full flex items-center gap-4 px-6 overflow-x-auto hide-scrollbar scroll-smooth"
        >
          {PAGES.map((page, index) => (
            <button
              key={page.id}
              onClick={() => setCurrentPage(index)}
              className={`flex-shrink-0 group relative transition-all duration-300 flex items-center ${
                currentPage === index 
                ? 'w-16 h-20 -translate-y-1' 
                : 'w-12 h-16 opacity-60 hover:opacity-100'
              }`}
            >
              <img 
                src={page.image} 
                alt={page.title} 
                className={`w-full h-full object-cover rounded-xs border-2 transition-all duration-200 ${
                  currentPage === index ? 'border-[#C8102E] shadow-md' : 'border-neutral-200'
                }`}
              />
              
              {/* Tooltip on hover */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[9px] px-2 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 font-sans">
                {page.title}
              </div>
            </button>
          ))}
        </div>

      </footer>

    </div>
  );
}