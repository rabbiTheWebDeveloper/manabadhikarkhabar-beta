"use client"
import { useState, useEffect } from 'react';
import {
  Menu, Search, Map as MapIcon, Tv, FileText, ChevronDown,
  MapPin, Clock,
  PlayCircle, MenuSquare, ArrowRight, User
} from 'lucide-react';
import { FaFacebook as Facebook, FaTwitter as Twitter, FaYoutube as Youtube } from 'react-icons/fa';
import { latestNews, investigations, journalists, videos } from '@/data/mockData';
import Link from 'next/link';
import ThemeToggle from '@/components/commons/ThemeToggle';

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Ensure dark mode class is disabled
    document.documentElement.classList.remove('light');
  }, []);

  // Current Date in Bengali
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const today = new Intl.DateTimeFormat('bn-BD', dateOptions).format(new Date());

  return (
    <div className="min-h-screen bg-[#fdfdfb] text-neutral-900 dark:bg-gray-950 dark:text-gray-100 font-serif transition-colors duration-200">

      {/* 1. Top Bar */}
      <div className="bg-neutral-900 text-white text-[10px] sm:text-xs font-sans tracking-wider uppercase border-b border-neutral-700">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-between items-center">
          <div className="flex items-center gap-4 text-gray-300">
            <span className="font-sans">{today}</span>
            <span className="hidden sm:inline">ঢাকা, বাংলাদেশ</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <a href="#" className="hover:text-red-400 transition-colors"><Facebook size={14} /></a>
              <a href="#" className="hover:text-sky-400 transition-colors"><Twitter size={14} /></a>
              <a href="#" className="hover:text-red-500 transition-colors"><Youtube size={14} /></a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Header (Logo, Name, EPaper, Live TV) */}
      <header className="max-w-7xl mx-auto px-6 py-6 md:py-8 flex justify-between items-end border-b-4 border-black dark:border-white gap-6">
        <div className="w-1/4 hidden md:block">
          <div className="text-xs font-sans uppercase font-bold text-red-700 dark:text-red-500">তদন্তমূলক সাংবাদিকতা</div>
          <div className="text-sm italic text-neutral-500">সত্যের সন্ধানে নির্ভীক</div>
        </div>

        {/* Brand */}
        <div className="flex-1 flex flex-col items-center justify-center relative py-2">
          <a href="/" className="inline-block relative">

            {/* SVG Dove & Document Logo */}
            <div className="absolute -top-8 -left-8 md:-top-10 md:-left-12 lg:-top-14 lg:-left-20 z-0 w-32 h-24 md:w-36 md:h-28 lg:w-48 lg:h-36 pointer-events-none opacity-90 overflow-visible">
              <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">

                {/* Secondary Wing (Right) */}
                <path d="M85,50 C 75,25 90,15 105,25" stroke="#D20000" strokeWidth="2.5" fill="none" strokeLinecap="round" className="dark:stroke-red-500" />

                {/* Main Red Dove Path */}
                <path d="M90,55 C70,30 40,25 20,30 C28,38 35,45 32,55 C22,54 15,50 10,50 C20,60 35,68 45,70 C30,80 15,90 5,100 C35,95 60,80 75,65 C90,80 110,75 120,55 L135,50 L125,42 C115,32 100,35 90,55 Z"
                  stroke="#D20000" strokeWidth="2.5" fill="none" strokeLinejoin="round" strokeLinecap="round" className="dark:stroke-red-500" />

                {/* Dove Eye */}
                <circle cx="112" cy="46" r="1.5" fill="#D20000" className="dark:fill-red-500" />

                {/* Green Document */}
                <g transform="translate(122, 45) rotate(15)">
                  <rect x="0" y="0" width="24" height="32" stroke="#10B981" strokeWidth="2.5" fill="white" className="dark:fill-[#111] dark:stroke-emerald-500" />
                  <line x1="5" y1="8" x2="19" y2="8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" className="dark:stroke-emerald-500" />
                  <line x1="5" y1="16" x2="19" y2="16" stroke="#10B981" strokeWidth="2" strokeLinecap="round" className="dark:stroke-emerald-500" />
                  <line x1="5" y1="24" x2="14" y2="24" stroke="#10B981" strokeWidth="2" strokeLinecap="round" className="dark:stroke-emerald-500" />
                </g>
              </svg>
            </div>

            {/* Text Logo */}
            <div className="relative z-10 flex flex-col items-center">
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none text-neutral-900 dark:text-white mt-4">
                মানবাধিকার <span className="text-red-700 dark:text-red-500">খবর</span>
              </h1>
            </div>
          </a>
        </div>

        {/* Action Buttons / Ad */}
        <div className="w-1/4 hidden md:flex flex-col items-end gap-1 text-right">
          <div className="flex items-center gap-2 text-[11px] font-sans font-bold bg-neutral-100 dark:bg-neutral-800 px-2 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded text-black dark:text-white">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            ২৪°C ঢাকা
          </div>
          <div className="flex gap-2 mt-2">
            <button className="flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white text-[11px] font-sans font-bold uppercase rounded-sm hover:bg-red-700 transition-colors">
              লাইভ টিভি
            </button>
            <Link href="/epaper" className="flex items-center gap-1.5 px-3 py-1 border border-neutral-300 dark:border-neutral-600 text-[11px] font-sans font-bold uppercase rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              ই-পেপার
            </Link>
          </div>
        </div>
      </header>

      {/* 3. Sticky Navbar & Mega Menu */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-sm flex justify-center">
        <div className="max-w-7xl w-full px-4">
          <div className="flex justify-between items-center h-12">

            {/* Mobile menu button */}
            <button
              className="md:hidden text-neutral-800 dark:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu size={20} />
            </button>

            {/* Desktop Nav */}
            <ul className="hidden md:flex justify-center flex-1 items-center h-full gap-8 text-[13px] font-sans font-bold uppercase tracking-tight text-neutral-800 dark:text-neutral-200">
              <li className="h-full flex items-center border-b-2 border-red-700 text-red-700 dark:border-red-500 dark:text-red-500">
                <a href="#">প্রচ্ছদ</a>
              </li>
              <li className="h-full flex items-center border-b-2 border-transparent hover:text-red-700 dark:hover:text-red-500 transition-colors group relative cursor-pointer">
                <span className="flex items-center gap-1">জাতীয় <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" /></span>
                {/* Mega Menu Dropdown */}
                <div className="absolute top-12 left-0 w-[600px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all grid grid-cols-3 p-6 gap-6 z-50 text-left normal-case tracking-normal">
                  <div>
                    <h3 className="text-red-700 dark:text-red-500 font-bold mb-3 border-b pb-1 text-sm uppercase">রাজনীতি</h3>
                    <ul className="space-y-2 text-[14px] font-normal text-neutral-600 dark:text-neutral-400">
                      <li className="hover:text-red-700 dark:hover:text-red-500"><a href="#">আওয়ামী লীগ</a></li>
                      <li className="hover:text-red-700 dark:hover:text-red-500"><a href="#">বিএনপি</a></li>
                      <li className="hover:text-red-700 dark:hover:text-red-500"><a href="#">জাতীয় পার্টি</a></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-red-700 dark:text-red-500 font-bold mb-3 border-b pb-1 text-sm uppercase">অর্থনীতি</h3>
                    <ul className="space-y-2 text-[14px] font-normal text-neutral-600 dark:text-neutral-400">
                      <li className="hover:text-red-700 dark:hover:text-red-500"><a href="#">বাজেট</a></li>
                      <li className="hover:text-red-700 dark:hover:text-red-500"><a href="#">শেয়ার বাজার</a></li>
                      <li className="hover:text-red-700 dark:hover:text-red-500"><a href="#">ব্যাংকিং</a></li>
                    </ul>
                  </div>
                  <div className="col-span-1 border-l border-neutral-200 dark:border-neutral-800 pl-6">
                    <img src="https://images.unsplash.com/photo-1596484552834-6a58f850d0d1?auto=format&fit=crop&q=80&w=300" alt="News feature" className="w-full h-20 object-cover mb-2 rounded" />
                    <p className="text-sm font-bold leading-tight hover:text-red-700 dark:hover:text-red-500">অর্থনৈতিক সংকটে সাধারণ মানুষের জীবনযাত্রা</p>
                  </div>
                </div>
              </li>
              <li className="h-full flex items-center border-b-2 border-transparent hover:text-red-700 dark:hover:text-red-500 transition-colors"><a href="#">আন্তর্জাতিক</a></li>
              <li className="h-full flex items-center border-b-2 border-transparent hover:text-red-700 dark:hover:text-red-500 transition-colors relative"><a href="#">মানবাধিকার <span className="absolute -top-1 -right-3 flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span></a></li>
              <li className="h-full flex items-center border-b-2 border-transparent hover:text-red-700 dark:hover:text-red-500 transition-colors"><a href="#">সারাদেশ</a></li>
              <li className="h-full flex items-center border-b-2 border-transparent hover:text-red-700 text-blue-600 dark:text-blue-400 dark:hover:text-red-500 transition-colors"><a href="#">ভিডিও</a></li>
            </ul>

            {/* Search & Theme Toggle */}
            <div className="flex items-center gap-4">
              <div className="flex items-center text-neutral-600 dark:text-neutral-300 hover:text-red-700 dark:hover:text-red-500 cursor-pointer">
                <Search size={18} />
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-12 left-0 w-full bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 font-sans text-sm font-bold uppercase tracking-tight shadow-md">
            <ul className="flex flex-col">
              <li className="border-b border-neutral-100 dark:border-neutral-800"><a href="#" className="block py-3 px-4 text-red-700 dark:text-red-500">প্রচ্ছদ</a></li>
              <li className="border-b border-neutral-100 dark:border-neutral-800"><a href="#" className="block py-3 px-4 hover:text-red-700 dark:hover:text-red-500">জাতীয়</a></li>
              <li className="border-b border-neutral-100 dark:border-neutral-800"><a href="#" className="block py-3 px-4 hover:text-red-700 dark:hover:text-red-500">আন্তর্জাতিক</a></li>
              <li className="border-b border-neutral-100 dark:border-neutral-800"><a href="#" className="block py-3 px-4 hover:text-red-700 dark:hover:text-red-500">মানবাধিকার</a></li>
              <li className="border-b border-neutral-100 dark:border-neutral-800"><a href="#" className="block py-3 px-4 hover:text-red-700 dark:hover:text-red-500">সারাদেশ</a></li>
            </ul>
          </div>
        )}
      </nav>

      {/* 4. Breaking News Ticker */}
      <div className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 py-0 flex items-center">
        <div className="max-w-7xl mx-auto w-full flex items-center">
          <div className="bg-red-700 text-white px-4 py-2 font-sans font-bold text-xs uppercase shrink-0 flex items-center gap-2">
            সর্বশেষ
          </div>
          <div className="overflow-hidden relative flex-1 px-4 py-2">
            <div className="animate-marquee whitespace-nowrap text-sm font-sans flex items-center text-neutral-800 dark:text-neutral-200">
              {latestNews.map((news, idx) => (
                <span key={news.id} className="inline-block mr-12 text-neutral-800 dark:text-neutral-200">
                  <span className="mr-2 text-red-700 dark:text-red-500 text-[10px]">●</span>
                  <a href="#" className="hover:underline text-[13px]">{news.title}</a>
                </span>
              ))}
            </div>
            {/* Right fade for marquee */}
            <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-neutral-50 dark:from-neutral-900 to-transparent z-10 pointer-events-none"></div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-0 border-x border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111]">

        {/* Social Media Sticky Sidebar - Desktop Only */}
        <aside className="hidden md:flex flex-col gap-4 md:col-span-1 lg:col-span-1 sticky top-32 h-fit items-center border-r border-neutral-200 dark:border-neutral-800 py-6 bg-neutral-50 dark:bg-neutral-900/50">
          <a href="#" className="p-2 text-neutral-500 hover:text-blue-600 bg-white hover:bg-blue-50 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-full transition-all border border-neutral-200 dark:border-neutral-700 shadow-sm"><Facebook size={18} /></a>
          <a href="#" className="p-2 text-neutral-500 hover:text-sky-500 bg-white hover:bg-sky-50 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-full transition-all border border-neutral-200 dark:border-neutral-700 shadow-sm"><Twitter size={18} /></a>
          <a href="#" className="p-2 text-neutral-500 hover:text-red-600 bg-white hover:bg-red-50 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-full transition-all border border-neutral-200 dark:border-neutral-700 shadow-sm"><Youtube size={18} /></a>
          <div className="w-full h-px bg-neutral-200 dark:bg-neutral-700 my-2"></div>
          <p className="writing-vertical-rl transform rotate-180 text-[10px] uppercase font-sans tracking-widest text-neutral-400 dark:text-neutral-500 mt-4">Share</p>
        </aside>

        {/* Center: Lead News & Categories */}
        <div className="col-span-1 md:col-span-8 p-6 border-r border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col gap-8">

          {/* Lead News */}
          <section className="relative group cursor-pointer group">
            <div className="relative overflow-hidden mb-5">
              <div className="w-full h-[360px] bg-neutral-200 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=1200"
                  alt="Lead news"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="bg-red-700 text-white px-2 py-0.5 text-[10px] font-sans font-bold uppercase mb-3 inline-block">
                    প্রধান খবর
                  </span>
                  <h2 className="font-serif font-black tracking-tighter text-3xl md:text-4xl text-white drop-shadow-md leading-[1.2] group-hover:text-red-300 transition-colors">
                    অর্থনেতিক পুনরুদ্ধারে নতুন নীতি: কতটা সুফল পাবে সাধারণ মানুষ?
                  </h2>
                </div>
              </div>
            </div>

            <p className="font-serif text-neutral-700 dark:text-neutral-300 text-lg md:text-xl line-clamp-3 leading-relaxed">
              দেশের ক্রমবর্ধমান মূল্যস্ফীতি এবং অর্থনৈতিক অস্থিতিশীলতা মোকাবিলায় সরকার নতুন অর্থনীতিক নীতি ঘোষণা করেছে। বিশেষজ্ঞদের মতে, এই নীতি দীর্ঘমেয়াদে সহায়ক হলেও স্বল্পমেয়াদে সাধারণ মানুষের ওপর চাপ বাড়াতে পারে।
            </p>
            <div className="flex items-center gap-4 mt-5 text-[11px] uppercase font-sans font-bold text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800 pt-3">
              <span className="flex items-center gap-1.5"><User size={14} /> নিজস্ব প্রতিবেদক</span>
              <span className="flex items-center gap-1.5"><Clock size={14} /> ২ ঘণ্টা আগে</span>
            </div>
          </section>

          <div className="border-t border-neutral-200 dark:border-neutral-800 -mx-6"></div>

          {/* District News Map & Selection */}
          <section className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 relative overflow-hidden rounded-sm">
            <div className="absolute right-[-5%] top-[-20%] opacity-[0.03] dark:opacity-5 pointer-events-none">
              <MapIcon size={250} />
            </div>
            <div className="flex items-center justify-between mb-5 relative z-10 border-b-2 border-black dark:border-neutral-600 pb-1 max-w-[fit-content]">
              <h2 className="text-xs font-sans font-black uppercase flex items-center gap-1.5">
                জেলার খবর
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 relative z-10 font-sans">
              <button className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-2 text-center rounded text-[11px] font-bold hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shadow-sm text-neutral-800 dark:text-neutral-200">ঢাকা</button>
              <button className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-2 text-center rounded text-[11px] font-bold hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shadow-sm text-neutral-800 dark:text-neutral-200">চট্টগ্রাম</button>
              <button className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-2 text-center rounded text-[11px] font-bold hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shadow-sm text-neutral-800 dark:text-neutral-200">সিলেট</button>
              <button className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-2 text-center rounded text-[11px] font-bold hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shadow-sm text-neutral-800 dark:text-neutral-200">রাজশাহী</button>
              <button className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-2 text-center rounded text-[11px] font-bold hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shadow-sm text-neutral-800 dark:text-neutral-200">খুলনা</button>
              <button className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-2 text-center rounded text-[11px] font-bold hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shadow-sm text-neutral-800 dark:text-neutral-200">বরিশাল</button>
              <button className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-2 text-center rounded text-[11px] font-bold hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shadow-sm text-neutral-800 dark:text-neutral-200">রংপুর</button>
              <button className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-2 text-center rounded text-[11px] font-bold hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shadow-sm text-neutral-800 dark:text-neutral-200">ময়মনসিংহ</button>
            </div>
          </section>

          {/* Human Rights Investigation Section */}
          <section className="mt-2">
            <div className="flex items-center justify-between mb-5 border-b-2 border-black dark:border-neutral-600 pb-1">
              <h2 className="text-xs font-sans font-black uppercase tracking-tight">মানবাধিকার <span className="text-red-700 dark:text-red-500">অনুসন্ধান</span></h2>
              <a href="#" className="font-sans text-[10px] font-bold text-red-700 dark:text-red-500 uppercase hover:underline flex items-center gap-1">সবগুলো দেখুন <ArrowRight size={12} /></a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {investigations.map((inv) => (
                <article key={inv.id} className="group cursor-pointer">
                  <div className="overflow-hidden mb-3 aspect-video bg-neutral-200">
                    <img src={inv.image} alt={inv.title} className="w-full h-full object-cover grayscale-[20%] transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <p className="text-[10px] text-red-700 dark:text-red-500 font-bold mb-1 uppercase tracking-wider font-sans">বিশেষ প্রতিবেদন</p>
                  <h3 className="font-serif font-bold text-[17px] leading-snug mb-2 group-hover:text-red-700 dark:group-hover:text-red-500 transition-colors">{inv.title}</h3>
                  <p className="font-serif text-neutral-600 dark:text-neutral-400 text-[13px] line-clamp-2 mb-2 leading-relaxed">{inv.summary}</p>
                  <p className="font-sans text-[10px] text-neutral-500 uppercase font-bold">প্রতিবেদক: {inv.reporter}</p>
                </article>
              ))}
            </div>
          </section>

          {/* Inline Content Ad */}
          <div className="w-full h-[100px] bg-neutral-100 dark:bg-neutral-800 flex flex-col items-center justify-center border border-neutral-300 dark:border-neutral-700 my-2 text-neutral-400">
            <span className="text-[10px] font-sans uppercase mb-1">Advertisement</span>
            <p className="text-xs italic font-serif">বিজ্ঞাপনের জন্য যোগাযোগ করুন</p>
          </div>

          {/* Video News Section */}
          <section className="bg-neutral-900 border-t-4 border-red-700 text-white p-6 rounded-sm">
            <div className="flex items-center justify-between mb-6 border-b border-neutral-700 pb-2">
              <h2 className="text-xs font-sans font-black uppercase flex items-center gap-2">
                <PlayCircle className="text-red-600" size={16} />
                ভিডিও সংবাদ <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse ml-1"></span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Main Video */}
              <div className="md:col-span-8 group cursor-pointer relative">
                <div className="relative aspect-video overflow-hidden border border-neutral-800 bg-neutral-950 rounded-sm">
                  <img src={videos[0].thumbnail} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" alt="Main video" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 text-neutral-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <PlayCircle size={24} className="ml-0.5 text-red-600" />
                    </div>
                  </div>
                  <span className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 text-[10px] font-sans font-bold tracking-wider">{videos[0].duration}</span>
                </div>
                <h3 className="font-serif font-bold text-xl mt-4 group-hover:text-red-400 transition-colors leading-snug">{videos[0].title}</h3>
              </div>

              {/* List of Videos */}
              <div className="md:col-span-4 flex flex-col gap-5">
                {videos.slice(1).map((vid) => (
                  <div key={vid.id} className="group cursor-pointer flex gap-3">
                    <div className="relative w-32 aspect-video flex-shrink-0 border border-neutral-800 rounded-sm overflow-hidden">
                      <img src={vid.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" alt="video thumbnail" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                        <PlayCircle size={16} className="text-white drop-shadow-md" />
                      </div>
                      <span className="absolute bottom-1 right-1 bg-black/80 px-1 text-[9px] font-sans font-bold">{vid.duration}</span>
                    </div>
                    <h4 className="font-serif font-bold text-[13px] leading-tight line-clamp-3 group-hover:text-red-400 transition-colors">{vid.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>

        {/* Right Sidebar */}
        <aside className="col-span-1 md:col-span-3 p-4 bg-neutral-50 dark:bg-neutral-900/40 flex flex-col gap-6">

          {/* Latest News Tabs */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm overflow-hidden">
            <div className="flex border-b border-neutral-200 dark:border-neutral-800 font-sans font-bold text-xs uppercase">
              <button className="flex-1 py-2.5 bg-red-700 text-white text-center">সর্বশেষ</button>
              <button className="flex-1 py-2.5 text-neutral-600 dark:text-neutral-300 hover:text-red-700 text-center">পঠিত</button>
            </div>
            <ul className="flex flex-col">
              {latestNews.map((news, i) => (
                <li key={news.id} className="group relative">
                  <a href="#" className="block p-3 border-b border-neutral-100 dark:border-neutral-800 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                    <div className="flex gap-3 items-start">
                      <span className="font-sans text-lg font-black text-red-700 dark:text-red-500 group-hover:scale-110 transition-transform">{i + 1}</span>
                      <div>
                        <h4 className="font-serif font-bold text-[13px] leading-tight group-hover:underline">{news.title}</h4>
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Sidebar Ad 1 */}
          <div className="w-full aspect-[300/250] bg-neutral-200 dark:bg-neutral-800 flex flex-col items-center justify-center border border-neutral-300 dark:border-neutral-700 text-neutral-400">
            <span className="text-[10px] font-sans uppercase mb-1">Advertisement</span>
            <p className="text-xs italic font-serif">বিজ্ঞাপনের জন্য যোগাযোগ করুন</p>
          </div>

          {/* Journalist Profiles Widget */}
          <div className="bg-white dark:bg-neutral-900 p-4 border border-neutral-200 dark:border-neutral-800 rounded-sm">
            <h3 className="text-xs font-sans font-black border-b border-neutral-300 dark:border-neutral-700 pb-2 mb-4 text-neutral-500 uppercase tracking-wider">
              সাংবাদিক প্রোফাইল
            </h3>
            <div className="flex flex-col gap-4">
              {journalists.map((j) => (
                <div key={j.id} className="flex items-center gap-3 cursor-pointer group">
                  <img src={j.image} alt={j.name} className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-700 bg-neutral-100" />
                  <div>
                    <h4 className="font-sans font-bold text-xs group-hover:text-red-700 transition-colors">{j.name}</h4>
                    <p className="font-sans text-[10px] text-neutral-500">{j.role}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-5 py-1.5 border border-neutral-300 dark:border-neutral-700 text-xs font-sans font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors uppercase cursor-pointer">
              সকল সাংবাদিক
            </button>
          </div>

          {/* Sidebar Ad 2 */}
          <div className="w-full aspect-[300/600] bg-neutral-200 dark:bg-neutral-800 flex flex-col items-center justify-center border border-neutral-300 dark:border-neutral-700 sticky top-32 text-neutral-400 mt-2">
            <span className="text-[10px] font-sans uppercase mb-1">Advertisement</span>
            <p className="text-xs italic font-serif">বিজ্ঞাপনের জন্য যোগাযোগ করুন</p>
          </div>

        </aside>

      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#111] border-t border-neutral-200 dark:border-neutral-800 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-sans font-bold text-neutral-500 uppercase tracking-widest">
            <a href="#" className="hover:text-red-700 transition-colors">আমাদের সম্পর্কে</a>
            <a href="#" className="hover:text-red-700 transition-colors">যোগাযোগ</a>
            <a href="#" className="hover:text-red-700 transition-colors">গোপনীয়তা নীতি</a>
            <a href="#" className="hover:text-red-700 transition-colors">আর্কাইভ</a>
          </div>

          <div className="flex items-center gap-3">
            <a href="#" className="w-7 h-7 bg-blue-900 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"><Facebook size={14} /></a>
            <a href="#" className="w-7 h-7 bg-sky-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"><Twitter size={14} /></a>
            <a href="#" className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"><Youtube size={14} /></a>
          </div>

          <div className="text-[10px] font-sans font-medium text-neutral-400 uppercase tracking-wider">
            &copy; {new Date().getFullYear()} মানবাধিকার খবর | সর্বস্বত্ব সংরক্ষিত
          </div>
        </div>
      </footer>

      {/* Tailwind Marquee Animation CSS added dynamically for demo, normally put in tailwind cong */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 30s linear infinite;
        }
        /* pause on hover */
        .overflow-hidden:hover .animate-marquee {
          animation-play-state: paused;
        }
        .writing-vertical-rl {
          writing-mode: vertical-rl;
        }
      `}</style>
    </div>
  );
}