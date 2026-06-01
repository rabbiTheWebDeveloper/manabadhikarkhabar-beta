'use client';

import { useState, useEffect } from 'react';
import { Search, Menu, X, ChevronRight, PenTool, Compass } from 'lucide-react';
import Link from 'next/link';

interface NavbarProps {
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  searchTerm: string;
  onSearchChange: (v: string) => void;
}

export default function Navbar({ selectedCategory, onCategoryChange, searchTerm, onSearchChange }: NavbarProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        if (d.settings?.categories?.length) setCategories(d.settings.categories);
        else setCategories(['বিশেষ সংবাদ','রাজনীতি','বাংলাদেশ','অপরাধ','বিশ্ব','বাণিজ্য','মতামত','খেলা','বিনোদন']);
      })
      .catch(() => setCategories(['বিশেষ সংবাদ','রাজনীতি','বাংলাদেশ','অপরাধ','বিশ্ব','বাণিজ্য','মতামত','খেলা','বিনোদন']));
  }, []);

  const allCats = [{ label: 'সর্বশেষ', value: 'all' }, ...categories.map(c => ({ label: c, value: c }))];

  return (
    <>
      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] flex md:hidden" role="dialog">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <div className="relative flex w-full max-w-[280px] flex-col bg-white p-5 shadow-2xl h-full animate-fade-in-left">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div onClick={() => { onCategoryChange('all'); setMobileOpen(false); }}
                className="text-2xl font-black text-red-700 tracking-tight cursor-pointer" style={{ fontFamily: 'var(--font-serif-bangla)' }}>
                মানবাধিকার খবর
              </div>
              <button onClick={() => setMobileOpen(false)} className="rounded-full p-2 text-gray-500 hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-col gap-2.5 mb-6">
              <Link href="/submit-news" onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 bg-red-700 text-white hover:bg-red-800 py-2.5 rounded-lg text-sm font-extrabold transition-all shadow-sm">
                <PenTool className="w-4 h-4" /><span>সংবাদ পাঠান</span>
              </Link>
              <Link href="/epaper" onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 bg-amber-50 text-amber-800 hover:bg-amber-100 py-2.5 rounded-lg text-sm font-extrabold border border-amber-200 shadow-sm">
                <Compass className="w-4 h-4 text-amber-600" /><span>আজকের ই-পেপার</span>
              </Link>
              <Link href="/archive" onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 bg-red-50 text-red-700 py-2.5 rounded-lg text-sm font-bold border border-red-100 transition-all">
                <span>আর্কাইভ</span><ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="text-xs font-bold text-gray-400 mb-2.5 uppercase tracking-wider">ক্যাটেগরি সমূহ</div>
            <ul className="flex flex-col gap-1 overflow-y-auto flex-1 font-bangla">
              {allCats.map(cat => (
                <li key={cat.value}>
                  <button onClick={() => { onCategoryChange(cat.value); setMobileOpen(false); }}
                    className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-bold transition-all flex items-center justify-between ${
                      selectedCategory === cat.value ? 'bg-red-50 text-red-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}>
                    <span>{cat.label}</span>
                    {selectedCategory === cat.value && <span className="w-1.5 h-1.5 rounded-full bg-red-600" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b-[3px] border-red-700 py-5 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-gray-800 hover:text-red-700 p-1"><Menu className="w-7 h-7" /></button>
            <div onClick={() => onCategoryChange('all')}
              className="text-3xl md:text-4xl lg:text-5xl font-black text-red-700 tracking-tight cursor-pointer"
              style={{ fontFamily: 'var(--font-serif-bangla), Georgia, serif' }}>
              মানবাধিকার খবর
            </div>
            <div className="md:hidden w-6 h-6" />
          </div>
          <div className="w-full max-w-sm">
            <div className="relative w-full">
              <input type="text" placeholder="খুঁজুন..." value={searchTerm} onChange={e => onSearchChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg max-h-11 py-2.5 pl-4 pr-10 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all font-bangla text-sm" />
              <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Category Nav */}
      <nav className="border-b border-gray-200 sticky top-0 bg-white z-50 shadow-sm overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center gap-5 text-[15px] font-bold text-gray-800 py-3 font-bangla whitespace-nowrap select-none">
            {allCats.map(cat => (
              <li key={cat.value} onClick={() => onCategoryChange(cat.value)}
                className={`cursor-pointer transition-all hover:text-red-700 ${selectedCategory === cat.value ? 'text-red-700 border-b-[3px] border-red-700 pb-1.5' : ''}`}>
                {cat.label}
              </li>
            ))}
            <li className="text-red-700 font-extrabold border-l border-gray-300 pl-4 flex items-center h-5">
              <Link href="/epaper" className="flex items-center gap-1.5 cursor-pointer">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" /><span>ই-পেপার</span>
              </Link>
            </li>
            <li className="ml-auto flex items-center gap-2.5">
              <Link href="/submit-news"
                className="flex items-center gap-1.5 bg-red-700 text-white hover:bg-red-800 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all shadow-sm cursor-pointer">
                <PenTool className="w-3.5 h-3.5" /><span>সংবাদ পাঠান</span>
              </Link>
              <Link href="/archive"
                className="hidden md:flex items-center gap-1.5 bg-red-50 text-red-700 hover:bg-red-700 hover:text-white px-3 py-1.5 rounded-full text-xs font-bold border border-red-100 cursor-pointer transition-all">
                <span>আর্কাইভ</span><ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
