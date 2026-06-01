'use client';

import { useState, useEffect } from 'react';
import { Settings, Database, Shield, Globe, Server, RotateCcw, Info, Clock } from 'lucide-react';
import { showAdminNotif } from '@/components/admin/AdminNotification';

export default function SettingsPage() {
  const [dbSource, setDbSource] = useState('loading');
  const [articleCount, setArticleCount] = useState(0);
  const [adsCount, setAdsCount] = useState(0);
  const [epaperCount, setEpaperCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/articles').then(r => r.json()).catch(() => ({ articles: [], source: 'local' })),
      fetch('/api/ads').then(r => r.json()).catch(() => ({ ads: [] })),
      fetch('/api/epaper').then(r => r.json()).catch(() => ({ collections: [] })),
      fetch('/api/auth/me').then(r => r.json()).catch(() => ({})),
    ]).then(([artData, adData, epData, meData]) => {
      setDbSource(artData.source || 'local');
      setArticleCount((artData.articles || []).length);
      setAdsCount((adData.ads || []).length);
      setEpaperCount((epData.collections || []).length);
      if (meData.authenticated) setCurrentUser(meData.user);
    });
  }, []);

  const handleResetData = async () => {
    if (!confirm('সব ডেটা রিসেট হবে। নিশ্চিত?')) return;
    try {
      const res = await fetch('/api/articles/reset', { method: 'POST' });
      if (res.ok) showAdminNotif('ডেমো ডেটা রিস্টোর হয়েছে', 'success');
      else showAdminNotif('রিসেট ব্যর্থ', 'error');
    } catch { showAdminNotif('সংযোগ ত্রুটি', 'error'); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">সেটিংস</h1>
        <p className="text-sm text-gray-500">সিস্টেম কনফিগারেশন ও তথ্য</p>
      </div>

      {/* Site Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-scale-in">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-extrabold text-gray-900 flex items-center gap-2"><Info className="w-4 h-4 text-blue-500" /><span>সাইট তথ্য</span></h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">পোর্টাল নাম</p>
              <p className="text-sm font-extrabold text-gray-900">মানবাধিকার খবর</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">ফ্রেমওয়ার্ক</p>
              <p className="text-sm font-extrabold text-gray-900">Next.js 15 + React 19</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">ডোমেইন</p>
              <p className="text-sm font-bold text-blue-600">manabadhikarkhabar.com</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">ভার্সন</p>
              <p className="text-sm font-extrabold text-gray-900">v2.0 Beta</p>
            </div>
          </div>
        </div>
      </div>

      {/* Database & Storage */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-slide-in-up">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-extrabold text-gray-900 flex items-center gap-2"><Database className="w-4 h-4 text-emerald-500" /><span>ডাটাবেজ ও স্টোরেজ</span></h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <span className={`w-3 h-3 rounded-full ${dbSource === 'mongodb' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">ডাটাবেজ স্থিতি</p>
              <p className="text-xs text-gray-500 font-mono">{dbSource === 'mongodb' ? 'MongoDB Atlas Connected' : 'Local Fallback Active'}</p>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${dbSource === 'mongodb' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
              {dbSource === 'mongodb' ? 'Online' : 'Fallback'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-red-50 rounded-lg border border-red-100 text-center">
              <p className="text-2xl font-black text-red-700">{articleCount}</p>
              <p className="text-[10px] font-bold text-red-600 uppercase">সংবাদ</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 text-center">
              <p className="text-2xl font-black text-purple-700">{adsCount}</p>
              <p className="text-[10px] font-bold text-purple-600 uppercase">বিজ্ঞাপন</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-center">
              <p className="text-2xl font-black text-blue-700">{epaperCount}</p>
              <p className="text-[10px] font-bold text-blue-600 uppercase">ই-পেপার</p>
            </div>
          </div>
        </div>
      </div>

      {/* Session Info */}
      {currentUser && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-slide-in-up" style={{ animationDelay: '50ms' }}>
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-extrabold text-gray-900 flex items-center gap-2"><Shield className="w-4 h-4 text-red-500" /><span>সেশন তথ্য</span></h3>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-xs font-bold text-gray-500">ব্যবহারকারী</span>
              <span className="text-sm font-bold text-gray-900">{currentUser.name || currentUser.username}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-xs font-bold text-gray-500">ইমেইল</span>
              <span className="text-sm font-bold text-gray-900">{currentUser.email || '—'}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-xs font-bold text-gray-500">Auth মেথড</span>
              <span className="text-sm font-bold text-gray-900">JWT (24h Session)</span>
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden animate-slide-in-up" style={{ animationDelay: '100ms' }}>
        <div className="p-5 border-b border-red-100 bg-red-50/50">
          <h3 className="font-extrabold text-red-700 flex items-center gap-2"><RotateCcw className="w-4 h-4" /><span>ডেঞ্জার জোন</span></h3>
        </div>
        <div className="p-5">
          <p className="text-sm text-gray-600 mb-4">ডেমো ডেটা রিস্টোর করলে সব বর্তমান সংবাদ মুছে গিয়ে মূল ডেমো ডেটা ফিরে আসবে।</p>
          <button onClick={handleResetData}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-colors cursor-pointer shadow-sm">
            <RotateCcw className="w-4 h-4" /><span>ডেমো ডেটা রিস্টোর করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
}
