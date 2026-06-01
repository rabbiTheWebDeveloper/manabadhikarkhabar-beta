'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search, Bell, Database, Globe, Menu, X
} from 'lucide-react';

interface AdminTopbarProps {
  collapsed: boolean;
  onMobileMenuToggle: () => void;
  mobileMenuOpen: boolean;
  dbSource: string;
  pageTitle?: string;
}

export default function AdminTopbar({ collapsed, onMobileMenuToggle, mobileMenuOpen, dbSource, pageTitle }: AdminTopbarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header
      className={`sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/80 flex items-center justify-between px-4 md:px-6 transition-all duration-300`}
    >
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Page title */}
        {pageTitle && (
          <h2 className="text-lg font-extrabold text-gray-900 hidden sm:block font-bangla">{pageTitle}</h2>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="অনুসন্ধান করুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 w-56 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all font-bangla"
          />
        </div>

        {/* DB Status Badge */}
        <div className={`flex items-center gap-1.5 text-[11px] font-bold font-mono px-2.5 py-1.5 rounded-lg border ${
          dbSource === 'mongodb'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-amber-50 border-amber-200 text-amber-700'
        }`}>
          <Database className="w-3 h-3" />
          <span className="hidden sm:inline">{dbSource === 'mongodb' ? 'MongoDB Live' : 'Local Fallback'}</span>
          <span className="sm:hidden">{dbSource === 'mongodb' ? 'DB' : 'Local'}</span>
        </div>

        {/* Visit Site */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 px-3 py-2 rounded-lg transition-all"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">সাইট দেখুন</span>
        </Link>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  );
}
