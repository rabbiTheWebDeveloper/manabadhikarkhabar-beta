'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Edit2, Trash2, Send, FileText, Search, Filter,
  ChevronLeft, ChevronRight, Image as ImageIcon, X, RotateCcw, Eye
} from 'lucide-react';
import { showAdminNotif } from '@/components/admin/AdminNotification';
import { generateSlug } from '@/lib/utils';

interface Article {
  _id: string;
  title: string;
  content: string;
  category: string;
  imgUrl: string;
  time: string;
  author: string;
  isLead: boolean;
  isSub: boolean;
  publishDate?: string;
}

const CATEGORIES = [
  'বিশেষ সংবাদ', 'রাজনীতি', 'বাংলাদেশ', 'অপরাধ', 'বিশ্ব', 'বাণিজ্য', 'মতামত', 'খেলা', 'বিনোদন'
];

const PER_PAGE = 10;

export default function NewsManagementPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('বিশেষ সংবাদ');
  const [imgUrl, setImgUrl] = useState('');
  const [author, setAuthor] = useState('নিজস্ব প্রতিবেদক');
  const [isLead, setIsLead] = useState(false);
  const [isSub, setIsSub] = useState(false);
  const [publishDate, setPublishDate] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadNote, setUploadNote] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      setUploadNote('আপলোড হচ্ছে...');
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'news');
      const r = await fetch('/api/cloudinary/upload', { method: 'POST', body: fd });
      if (r.ok) {
        const d = await r.json();
        setImgUrl(d.url);
        setUploadNote('আপলোড সফল!');
        showAdminNotif('সংবাদ ছবি আপলোড হয়েছে', 'success');
      } else {
        showAdminNotif('আপলোড ব্যর্থ', 'error');
        setUploadNote('আপলোড ব্যর্থ হয়েছে');
      }
    } catch {
      showAdminNotif('সংযোগ ত্রুটি', 'error');
      setUploadNote('সংযোগ ত্রুটি ঘটেছে');
    } finally {
      setIsUploading(false);
    }
  };

  // Search/Filter/Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadArticles = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      const res = await fetch('/api/articles');
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      }
    } catch {
      showAdminNotif('সংবাদ লোড করতে ত্রুটি ঘটেছে', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles(true);
    // Get current user name for author
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.authenticated && d.user?.name) setAuthor(d.user.name);
    }).catch(() => {});
  }, []);

  const filteredArticles = useMemo(() => {
    return articles.filter(art => {
      const matchSearch = !searchQuery || art.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = !filterCategory || art.category === filterCategory;
      return matchSearch && matchCat;
    });
  }, [articles, searchQuery, filterCategory]);

  const totalPages = Math.ceil(filteredArticles.length / PER_PAGE);
  const paginatedArticles = filteredArticles.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterCategory]);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setCategory('বিশেষ সংবাদ');
    setImgUrl('');
    setAuthor('নিজস্ব প্রতিবেদক');
    setIsLead(false);
    setIsSub(false);
    setPublishDate('');
    setShowForm(false);
    setIsUploading(false);
    setUploadNote('');
  };

  const startEdit = (art: Article) => {
    setEditingId(art._id);
    setTitle(art.title);
    setContent(art.content);
    setCategory(art.category);
    setImgUrl(art.imgUrl);
    setAuthor(art.author);
    setIsLead(!!art.isLead);
    setIsSub(!!art.isSub);
    if (art.publishDate) {
      try {
        const d = new Date(art.publishDate);
        const tzoffset = d.getTimezoneOffset() * 60000;
        setPublishDate((new Date(d.getTime() - tzoffset)).toISOString().slice(0, 16));
      } catch { setPublishDate(''); }
    } else { setPublishDate(''); }
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !category) {
      showAdminNotif('দয়া করে সব তথ্য পূরণ করুন', 'error');
      return;
    }
    const staticSeedSuffix = title.length.toString();
    const payload = {
      title, content, category,
      imgUrl: imgUrl || `https://picsum.photos/seed/news-${staticSeedSuffix}/600/400`,
      author, isLead, isSub,
      publishDate: publishDate ? new Date(publishDate).toISOString() : new Date().toISOString()
    };
    try {
      let res;
      if (editingId) {
        res = await fetch(`/api/articles/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      } else {
        res = await fetch('/api/articles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      }
      if (res.ok) {
        showAdminNotif(editingId ? 'সংবাদটি আপডেট করা হয়েছে' : 'নতুন সংবাদ প্রকাশ করা হয়েছে', 'success');
        resetForm();
        loadArticles();
      } else {
        const errData = await res.json();
        showAdminNotif(errData.error || 'সংরক্ষণ ব্যর্থ', 'error');
      }
    } catch { showAdminNotif('সার্ভার ত্রুটি', 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই সংবাদটি ডিলিট করতে চান?')) return;
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showAdminNotif('সংবাদটি ডিলিট করা হয়েছে', 'success');
        loadArticles();
        if (editingId === id) resetForm();
      } else { showAdminNotif('ডিলিট ব্যর্থ', 'error'); }
    } catch { showAdminNotif('ডিলিট করতে ত্রুটি', 'error'); }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`আপনি কি ${selectedIds.size}টি সংবাদ ডিলিট করতে চান?`)) return;
    for (const id of selectedIds) {
      try {
        await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      } catch { /* continue */ }
    }
    showAdminNotif(`${selectedIds.size}টি সংবাদ ডিলিট করা হয়েছে`, 'success');
    setSelectedIds(new Set());
    loadArticles();
  };

  const handleRestoreDefaults = async () => {
    if (!confirm('রিস্টোর করলে সব সংবাদ মুছে ডেমো ডেটা ফিরবে। আপনি কি নিশ্চিত?')) return;
    try {
      const res = await fetch('/api/articles/reset', { method: 'POST' });
      if (res.ok) {
        showAdminNotif('ডেমো ডেটা রিস্টোর করা হয়েছে', 'success');
        loadArticles();
      }
    } catch { showAdminNotif('রিস্টোর ব্যর্থ', 'error'); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedArticles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedArticles.map(a => a._id)));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">সংবাদ ব্যবস্থাপনা</h1>
          <p className="text-sm text-gray-500">মোট {articles.length}টি সংবাদ প্রকাশিত</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRestoreDefaults}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-3 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>রিসেট ডেমো</span>
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন সংবাদ</span>
          </button>
        </div>
      </div>

      {/* Slide-over Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 animate-scale-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-600" />
              <span>{editingId ? 'সংবাদ সংশোধন' : 'নতুন সংবাদ লিখুন'}</span>
            </h2>
            <button onClick={resetForm} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">শিরোনাম *</label>
                <input type="text" placeholder="সংবাদের শিরোনাম লিখুন..." value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ক্যাটাগরি *</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 cursor-pointer">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">লেখক</label>
                <input type="text" value={author} onChange={e => setAuthor(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">সংবাদ ছবি *</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ImageIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="url" placeholder="ছবির লিঙ্ক লিখুন বা আপলোড করুন..." value={imgUrl} onChange={e => setImgUrl(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 text-sm font-mono" required />
                  </div>
                  <label className={`relative flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-200 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                    <span>{isUploading ? 'আপলোড হচ্ছে...' : 'আপলোড ফাইল'}</span>
                  </label>
                </div>
                {uploadNote && (
                  <p className={`text-[11px] font-bold mt-1.5 ${
                    uploadNote.includes('সফল') ? 'text-emerald-600' : uploadNote.includes('ব্যর্থ') || uploadNote.includes('ত্রুটি') ? 'text-rose-600' : 'text-amber-600'
                  }`}>
                    {uploadNote}
                  </p>
                )}
              </div>
              {imgUrl && (
                <div className="md:col-span-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-[10px] text-gray-400 font-bold mb-2">সংবাদ ছবি প্রিভিউ:</p>
                  <div className="w-full max-w-md bg-gray-100 rounded-lg overflow-hidden border shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgUrl} alt="Preview" className="w-full h-auto block object-contain max-h-[260px]" referrerPolicy="no-referrer"
                      onError={(e) => { (e.target as any).src = 'https://placehold.co/600x400?text=Invalid+URL'; }} />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">প্রকাশের সময়</label>
                <input type="datetime-local" value={publishDate} onChange={e => setPublishDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 text-sm font-sans" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">বিস্তারিত *</label>
                <textarea rows={5} placeholder="সংবাদের বিস্তারিত লিখুন..." value={content} onChange={e => setContent(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 text-[15px] leading-relaxed" required />
              </div>
            </div>

            <div className="flex items-center gap-6 py-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold select-none">
                <input type="checkbox" checked={isLead} onChange={e => { setIsLead(e.target.checked); if (e.target.checked) setIsSub(false); }}
                  className="rounded text-red-600 focus:ring-red-500 w-4 h-4" />
                <span>প্রধান খবর (Lead)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold select-none">
                <input type="checkbox" checked={isSub} onChange={e => { setIsSub(e.target.checked); if (e.target.checked) setIsLead(false); }}
                  className="rounded text-red-600 focus:ring-red-500 w-4 h-4" />
                <span>উপ-প্রধান খবর (Sub)</span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                <Send className="w-4 h-4" />
                <span>{editingId ? 'আপডেট করুন' : 'প্রকাশ করুন'}</span>
              </button>
              <button type="button" onClick={resetForm}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors cursor-pointer">
                বাতিল
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="শিরোনাম দিয়ে অনুসন্ধান..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400" />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/20">
            <option value="">সব ক্যাটাগরি</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {selectedIds.size > 0 && (
          <button onClick={handleBulkDelete}
            className="flex items-center gap-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-bold text-xs px-3 py-2 rounded-lg transition-colors cursor-pointer">
            <Trash2 className="w-3.5 h-3.5" />
            <span>{selectedIds.size}টি মুছুন</span>
          </button>
        )}
        <span className="text-xs text-gray-400 font-bold shrink-0">{filteredArticles.length}টি ফলাফল</span>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">ডেটা লোড হচ্ছে...</p>
          </div>
        ) : paginatedArticles.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="font-bold mb-1">কোনো সংবাদ পাওয়া যায়নি</p>
            <p className="text-xs">ফিল্টার পরিবর্তন করুন বা নতুন সংবাদ তৈরি করুন</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80 text-gray-500 text-xs font-bold uppercase select-none">
                    <th className="py-3 px-4 w-10">
                      <input type="checkbox" checked={selectedIds.size === paginatedArticles.length && paginatedArticles.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer" />
                    </th>
                    <th className="py-3 px-4">শিরোনাম</th>
                    <th className="py-3 px-4">ক্যাটাগরি</th>
                    <th className="py-3 px-4">অবস্থান</th>
                    <th className="py-3 px-4">লেখক</th>
                    <th className="py-3 px-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedArticles.map((art) => (
                    <tr key={art._id} className={`hover:bg-gray-50/50 transition-colors ${selectedIds.has(art._id) ? 'bg-red-50/30' : ''}`}>
                      <td className="py-3 px-4">
                        <input type="checkbox" checked={selectedIds.has(art._id)} onChange={() => toggleSelect(art._id)}
                          className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {art.imgUrl && (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={art.imgUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <a href={`/${generateSlug(art.title)}`} target="_blank" rel="noopener noreferrer" 
                              className="font-bold text-gray-900 hover:text-red-650 truncate max-w-[300px] block transition-colors" title={art.title}>
                              {art.title}
                            </a>
                            <p className="text-[11px] text-gray-400">{art.time}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{art.category}</span>
                      </td>
                      <td className="py-3 px-4">
                        {art.isLead && <span className="text-[11px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200 font-bold">Lead</span>}
                        {art.isSub && <span className="text-[11px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 font-bold">Sub</span>}
                        {!art.isLead && !art.isSub && <span className="text-gray-300">—</span>}
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs font-medium">{art.author}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <a href={`/${generateSlug(art.title)}`} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 px-2.5 bg-sky-50 hover:bg-sky-600 hover:text-white text-sky-600 rounded-lg border border-sky-100 transition-all flex items-center gap-1 cursor-pointer text-xs font-bold">
                            <Eye className="w-3.5 h-3.5" /><span className="hidden sm:inline">দেখুন</span>
                          </a>
                          <button onClick={() => startEdit(art)}
                            className="p-1.5 px-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 rounded-lg border border-gray-200 transition-all flex items-center gap-1 cursor-pointer text-xs font-bold">
                            <Edit2 className="w-3.5 h-3.5" /><span className="hidden sm:inline">সম্পাদনা</span>
                          </button>
                          <button onClick={() => handleDelete(art._id)}
                            className="p-1.5 px-2.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg border border-red-100 transition-all flex items-center gap-1 cursor-pointer text-xs font-bold">
                            <Trash2 className="w-3.5 h-3.5" /><span className="hidden sm:inline">মুছুন</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                <span className="text-xs text-gray-500 font-medium">
                  পৃষ্ঠা {currentPage} / {totalPages} (মোট {filteredArticles.length}টি)
                </span>
                <div className="flex gap-1">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 cursor-pointer transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button key={page} onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                          page === currentPage ? 'bg-red-600 text-white border-red-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}>
                        {page}
                      </button>
                    );
                  })}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 cursor-pointer transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
