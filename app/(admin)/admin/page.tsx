'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText, Megaphone, Cpu, BookOpen, Eye, Database,
  TrendingUp, Plus, RefreshCw, ArrowRight, Clock, Sparkles
} from 'lucide-react';
import StatsCard from '@/components/admin/StatsCard';
import { getTotalPageViews } from '@/lib/analytics';

interface Article {
  _id: string;
  title: string;
  category: string;
  author: string;
  isLead: boolean;
  isSub: boolean;
  publishDate?: string;
  time: string;
}

export default function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [epapers, setEpapers] = useState<any[]>([]);
  const [scraperStatus, setScraperStatus] = useState<any>({ isRunning: false, lastRun: 0, count: 0 });
  const [dbSource, setDbSource] = useState('loading');
  const [totalPageViews, setTotalPageViews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTotalPageViews(getTotalPageViews());

    Promise.all([
      fetch('/api/articles').then(r => r.json()).catch(() => ({ articles: [], source: 'local' })),
      fetch('/api/ads').then(r => r.json()).catch(() => ({ ads: [] })),
      fetch('/api/epaper').then(r => r.json()).catch(() => ({ collections: [] })),
      fetch('/api/scraper/scrape').then(r => r.json()).catch(() => ({ status: {} })),
    ]).then(([artData, adData, epData, scrData]) => {
      setArticles(artData.articles || []);
      setDbSource(artData.source || 'local');
      setAds(adData.ads || []);
      setEpapers(epData.collections || []);
      if (scrData.status) setScraperStatus(scrData.status);
      setLoading(false);
    });
  }, []);

  const recentArticles = articles.slice(0, 5);
  const categories = articles.reduce((acc: Record<string, number>, art) => {
    acc[art.category] = (acc[art.category] || 0) + 1;
    return acc;
  }, {});
  const categoryEntries = Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCatCount = categoryEntries.length > 0 ? categoryEntries[0][1] : 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-gray-500">ড্যাশবোর্ড ডেটা লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-red-400" />
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">অ্যাডমিন ড্যাশবোর্ড</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-2">স্বাগতম, মানবাধিকার খবর প্যানেলে!</h1>
          <p className="text-sm text-slate-400 max-w-xl">সংবাদ, বিজ্ঞাপন, ক্রলার এবং ই-পেপার — সবকিছু এক জায়গা থেকে পরিচালনা করুন।</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 stagger-grid">
        <StatsCard
          icon={<FileText className="w-5 h-5" />}
          label="মোট সংবাদ"
          value={articles.length}
          sublabel="ডাটাবেজে সংরক্ষিত"
          accentColor="red"
        />
        <StatsCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="লিড স্টোরি"
          value={articles.filter(a => a.isLead).length}
          sublabel={articles.find(a => a.isLead) ? 'প্রধান খবর সক্রিয়' : 'নির্ধারিত নেই'}
          accentColor="orange"
        />
        <StatsCard
          icon={<Megaphone className="w-5 h-5" />}
          label="সক্রিয় বিজ্ঞাপন"
          value={ads.filter(a => a.isActive).length}
          sublabel={`মোট ${ads.length}টি বিজ্ঞাপন`}
          accentColor="purple"
        />
        <StatsCard
          icon={<Cpu className="w-5 h-5" />}
          label="ক্রলার স্থিতি"
          value={scraperStatus.isRunning ? 'চলমান' : 'সক্রিয়'}
          sublabel={`${scraperStatus.count || 0}টি স্ক্র্যাপকৃত`}
          accentColor={scraperStatus.isRunning ? 'amber' : 'emerald'}
        />
        <StatsCard
          icon={<BookOpen className="w-5 h-5" />}
          label="ই-পেপার সংস্করণ"
          value={epapers.length}
          sublabel="প্রকাশিত সংস্করণ"
          accentColor="blue"
        />
        <StatsCard
          icon={<Eye className="w-5 h-5" />}
          label="পেজ ভিউ"
          value={totalPageViews}
          sublabel="সর্বমোট ভিজিট"
          accentColor="slate"
        />
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Articles */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-slide-in-up">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-extrabold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-500" />
              <span>সাম্প্রতিক সংবাদ</span>
            </h3>
            <Link href="/admin/news" className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors">
              <span>সব দেখুন</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentArticles.length === 0 && (
              <div className="p-12 text-center text-gray-400 text-sm">কোনো সংবাদ নেই</div>
            )}
            {recentArticles.map((art, idx) => (
              <div key={art._id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors" style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-xs font-black shrink-0 border border-red-100">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-900 truncate">{art.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-gray-400 font-medium">{art.category}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-[11px] text-gray-400">{art.author}</span>
                    {art.isLead && (
                      <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded-full border border-red-100 font-bold">Lead</span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 font-mono shrink-0">{art.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-slide-in-up" style={{ animationDelay: '100ms' }}>
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-extrabold text-gray-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-500" />
              <span>ক্যাটাগরি বিন্যাস</span>
            </h3>
          </div>
          <div className="p-5 space-y-3.5">
            {categoryEntries.length === 0 && (
              <p className="text-center text-gray-400 text-xs py-6">ক্যাটাগরি ডেটা নেই</p>
            )}
            {categoryEntries.map(([cat, count]) => (
              <div key={cat} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-700">{cat}</span>
                  <span className="text-[11px] font-bold text-gray-500">{count}টি</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max((count / maxCatCount) * 100, 8)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-in-up" style={{ animationDelay: '150ms' }}>
        <Link
          href="/admin/news"
          className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-red-300 hover:shadow-md transition-all flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-100 transition-colors">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">নতুন সংবাদ লিখুন</p>
            <p className="text-[11px] text-gray-400">সংবাদ ব্যবস্থাপনায় যান</p>
          </div>
        </Link>
        <Link
          href="/admin/crawler"
          className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-emerald-300 hover:shadow-md transition-all flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">ক্রলার চালু করুন</p>
            <p className="text-[11px] text-gray-400">স্বয়ংক্রিয় খবর সংগ্রহ</p>
          </div>
        </Link>
        <Link
          href="/admin/epaper"
          className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">ই-পেপার যুক্ত করুন</p>
            <p className="text-[11px] text-gray-400">নতুন সংস্করণ তৈরি করুন</p>
          </div>
        </Link>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-slide-in-up" style={{ animationDelay: '200ms' }}>
        <h3 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-500" />
          <span>সিস্টেম স্বাস্থ্য</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className={`w-2.5 h-2.5 rounded-full ${dbSource === 'mongodb' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <div>
              <p className="text-xs font-bold text-gray-700">ডাটাবেজ</p>
              <p className="text-[11px] text-gray-500 font-mono">{dbSource === 'mongodb' ? 'MongoDB Connected' : 'Local Fallback'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className={`w-2.5 h-2.5 rounded-full ${scraperStatus.isRunning ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
            <div>
              <p className="text-xs font-bold text-gray-700">ক্রলার</p>
              <p className="text-[11px] text-gray-500 font-mono">{scraperStatus.isRunning ? 'Running...' : 'Idle / Online'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <div>
              <p className="text-xs font-bold text-gray-700">API সার্ভার</p>
              <p className="text-[11px] text-gray-500 font-mono">Operational</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <div>
              <p className="text-xs font-bold text-gray-700">Auth সিস্টেম</p>
              <p className="text-[11px] text-gray-500 font-mono">JWT Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
