'use client';

import { useState, useEffect } from 'react';
import {
  Settings, Database, Shield, RotateCcw, Info, Plus, X,
  GripVertical, Trash2, ToggleLeft, ToggleRight, Zap, Tag, Send
} from 'lucide-react';
import { showAdminNotif } from '@/components/admin/AdminNotification';

export default function SettingsPage() {
  const [dbSource, setDbSource] = useState('loading');
  const [articleCount, setArticleCount] = useState(0);
  const [adsCount, setAdsCount] = useState(0);
  const [epaperCount, setEpaperCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Categories
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');

  // Breaking News
  const [breakingNews, setBreakingNews] = useState<any[]>([]);
  const [newBreaking, setNewBreaking] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/articles').then(r => r.json()).catch(() => ({ articles: [], source: 'local' })),
      fetch('/api/ads').then(r => r.json()).catch(() => ({ ads: [] })),
      fetch('/api/epaper').then(r => r.json()).catch(() => ({ collections: [] })),
      fetch('/api/auth/me').then(r => r.json()).catch(() => ({})),
      fetch('/api/settings').then(r => r.json()).catch(() => ({ settings: {} })),
    ]).then(([artData, adData, epData, meData, settData]) => {
      setDbSource(artData.source || 'local');
      setArticleCount((artData.articles || []).length);
      setAdsCount((adData.ads || []).length);
      setEpaperCount((epData.collections || []).length);
      if (meData.authenticated) setCurrentUser(meData.user);
      if (settData.settings?.categories) setCategories(settData.settings.categories);
      if (settData.settings?.breakingNews) setBreakingNews(settData.settings.breakingNews);
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

  // Category handlers
  const addCategory = async () => {
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory.trim())) {
      showAdminNotif('এই ক্যাটাগরি আগে থেকেই আছে', 'error');
      return;
    }
    const updated = [...categories, newCategory.trim()];
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: updated }),
      });
      setCategories(updated);
      setNewCategory('');
      showAdminNotif('ক্যাটাগরি যোগ হয়েছে', 'success');
    } catch { showAdminNotif('ত্রুটি', 'error'); }
  };

  const removeCategory = async (cat: string) => {
    const updated = categories.filter(c => c !== cat);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: updated }),
      });
      setCategories(updated);
      showAdminNotif('ক্যাটাগরি মুছে ফেলা হয়েছে', 'success');
    } catch { showAdminNotif('ত্রুটি', 'error'); }
  };

  // Breaking news handlers
  const addBreaking = async () => {
    if (!newBreaking.trim()) return;
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_breaking', text: newBreaking.trim() }),
      });
      if (res.ok) {
        const d = await res.json();
        setBreakingNews(prev => [d.item, ...prev]);
        setNewBreaking('');
        showAdminNotif('ব্রেকিং নিউজ যোগ হয়েছে', 'success');
      }
    } catch { showAdminNotif('ত্রুটি', 'error'); }
  };

  const removeBreaking = async (id: string) => {
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove_breaking', id }),
      });
      setBreakingNews(prev => prev.filter(b => b.id !== id));
      showAdminNotif('মুছে ফেলা হয়েছে', 'success');
    } catch { showAdminNotif('ত্রুটি', 'error'); }
  };

  const toggleBreaking = async (id: string) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_breaking', id }),
      });
      if (res.ok) {
        setBreakingNews(prev => prev.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b));
        showAdminNotif('স্থিতি পরিবর্তন হয়েছে', 'success');
      }
    } catch { showAdminNotif('ত্রুটি', 'error'); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">সেটিংস</h1>
        <p className="text-sm text-gray-500">সিস্টেম কনফিগারেশন, ক্যাটাগরি ও ব্রেকিং নিউজ</p>
      </div>

      {/* Breaking News Management */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-scale-in">
        <div className="p-5 border-b border-gray-100 bg-red-50/30">
          <h3 className="font-extrabold text-gray-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-red-600" /><span>ব্রেকিং নিউজ ম্যানেজমেন্ট</span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">হোম পেজের ব্রেকিং নিউজ টিকারে প্রদর্শিত হবে</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex gap-2">
            <input type="text" value={newBreaking} onChange={e => setNewBreaking(e.target.value)}
              placeholder="ব্রেকিং নিউজ টেক্সট লিখুন..."
              onKeyDown={e => e.key === 'Enter' && addBreaking()}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 text-sm" />
            <button onClick={addBreaking}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-colors cursor-pointer shadow-sm shrink-0">
              <Send className="w-4 h-4" /><span>যোগ করুন</span>
            </button>
          </div>
          {breakingNews.length === 0 ? (
            <p className="text-center text-gray-400 text-xs py-4">কোনো ব্রেকিং নিউজ নেই</p>
          ) : (
            <div className="space-y-2">
              {breakingNews.map(item => (
                <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${item.isActive ? 'bg-red-50/50 border-red-100' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                  <button onClick={() => toggleBreaking(item.id)} className="cursor-pointer shrink-0" title="টগল করুন">
                    {item.isActive
                      ? <ToggleRight className="w-6 h-6 text-red-600" />
                      : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                  <span className="flex-1 text-sm font-medium text-gray-800 line-clamp-1">{item.text}</span>
                  <button onClick={() => removeBreaking(item.id)}
                    className="p-1.5 hover:bg-red-100 text-red-500 rounded-lg cursor-pointer transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Management */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-slide-in-up">
        <div className="p-5 border-b border-gray-100 bg-blue-50/30">
          <h3 className="font-extrabold text-gray-900 flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-600" /><span>ক্যাটাগরি ম্যানেজমেন্ট</span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">নেভিবার ও সংবাদ ফিল্টারে ব্যবহৃত হয়</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex gap-2">
            <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)}
              placeholder="নতুন ক্যাটাগরি নাম..."
              onKeyDown={e => e.key === 'Enter' && addCategory()}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm" />
            <button onClick={addCategory}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-colors cursor-pointer shadow-sm shrink-0">
              <Plus className="w-4 h-4" /><span>যোগ করুন</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <span key={cat} className="flex items-center gap-1.5 bg-gray-100 border border-gray-200 text-gray-800 text-sm font-bold px-3 py-1.5 rounded-lg group">
                <span>{cat}</span>
                <button onClick={() => removeCategory(cat)} className="text-gray-400 hover:text-red-600 cursor-pointer transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Site Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-scale-in">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-extrabold text-gray-900 flex items-center gap-2"><Info className="w-4 h-4 text-blue-500" /><span>সাইট তথ্য</span></h3>
        </div>
        <div className="p-5">
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

      {/* Database */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-extrabold text-gray-900 flex items-center gap-2"><Database className="w-4 h-4 text-emerald-500" /><span>ডাটাবেজ</span></h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <span className={`w-3 h-3 rounded-full ${dbSource === 'mongodb' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">ডাটাবেজ স্থিতি</p>
              <p className="text-xs text-gray-500 font-mono">{dbSource === 'mongodb' ? 'MongoDB Atlas Connected' : 'Local Fallback Active'}</p>
            </div>
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

      {/* Session */}
      {currentUser && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-red-100 bg-red-50/50">
          <h3 className="font-extrabold text-red-700 flex items-center gap-2"><RotateCcw className="w-4 h-4" /><span>ডেঞ্জার জোন</span></h3>
        </div>
        <div className="p-5">
          <p className="text-sm text-gray-600 mb-4">ডেমো ডেটা রিস্টোর করলে সব সংবাদ মুছে ডেমো ডেটা ফিরবে।</p>
          <button onClick={handleResetData}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-colors cursor-pointer shadow-sm">
            <RotateCcw className="w-4 h-4" /><span>ডেমো ডেটা রিস্টোর করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
}
