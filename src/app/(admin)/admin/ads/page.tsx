'use client';

import { useState, useEffect } from 'react';
import {
  Megaphone, Edit2, Trash2, Plus, X, Send,
  ExternalLink, ToggleLeft, ToggleRight
} from 'lucide-react';
import { showAdminNotif } from '@/components/admin/AdminNotification';

export default function AdsManagementPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adTitle, setAdTitle] = useState('');
  const [adImgUrl, setAdImgUrl] = useState('');
  const [adLinkUrl, setAdLinkUrl] = useState('');
  const [adPosition, setAdPosition] = useState<'sidebar' | 'top_banner'>('sidebar');
  const [adIsActive, setAdIsActive] = useState(true);
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
      fd.append('folder', 'ads');
      const r = await fetch('/api/cloudinary/upload', { method: 'POST', body: fd });
      if (r.ok) {
        const d = await r.json();
        setAdImgUrl(d.url);
        setUploadNote('আপলোড সফল!');
        showAdminNotif('বিজ্ঞাপন ব্যানার আপলোড হয়েছে', 'success');
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

  const loadAds = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      const res = await fetch('/api/ads');
      if (res.ok) {
        const data = await res.json();
        setAds(data.ads || []);
      }
    } catch { showAdminNotif('বিজ্ঞাপন লোড ব্যর্থ', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAds(true); }, []);

  const resetForm = () => {
    setEditingId(null);
    setAdTitle('');
    setAdImgUrl('');
    setAdLinkUrl('');
    setAdPosition('sidebar');
    setAdIsActive(true);
    setShowForm(false);
    setUploadNote('');
  };

  const startEdit = (ad: any) => {
    setEditingId(ad._id);
    setAdTitle(ad.title);
    setAdImgUrl(ad.imgUrl);
    setAdLinkUrl(ad.linkUrl);
    setAdPosition(ad.position);
    setAdIsActive(!!ad.isActive);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle || !adImgUrl || !adLinkUrl) {
      showAdminNotif('সব তথ্য পূরণ করুন', 'error');
      return;
    }
    const payload = { title: adTitle, imgUrl: adImgUrl, linkUrl: adLinkUrl, position: adPosition, isActive: adIsActive };
    try {
      let res;
      if (editingId) {
        res = await fetch(`/api/ads/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      } else {
        res = await fetch('/api/ads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      }
      if (res.ok) {
        showAdminNotif(editingId ? 'বিজ্ঞাপন আপডেট হয়েছে' : 'নতুন বিজ্ঞাপন যুক্ত হয়েছে', 'success');
        resetForm();
        loadAds();
      } else {
        const err = await res.json();
        showAdminNotif(err.error || 'সংরক্ষণ ব্যর্থ', 'error');
      }
    } catch { showAdminNotif('সার্ভার ত্রুটি', 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('এই বিজ্ঞাপনটি ডিলিট করতে চান?')) return;
    try {
      const res = await fetch(`/api/ads/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showAdminNotif('বিজ্ঞাপন ডিলিট হয়েছে', 'success');
        loadAds();
        if (editingId === id) resetForm();
      } else showAdminNotif('ডিলিট ব্যর্থ', 'error');
    } catch { showAdminNotif('ডিলিট ত্রুটি', 'error'); }
  };

  const toggleActive = async (ad: any) => {
    try {
      const res = await fetch(`/api/ads/${ad._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !ad.isActive })
      });
      if (res.ok) {
        showAdminNotif('বিজ্ঞাপন স্থিতি পরিবর্তন হয়েছে', 'success');
        loadAds();
      }
    } catch { showAdminNotif('স্থিতি পরিবর্তন ব্যর্থ', 'error'); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">বিজ্ঞাপন প্যানেল</h1>
          <p className="text-sm text-gray-500">মোট {ads.length}টি বিজ্ঞাপন — {ads.filter(a => a.isActive).length}টি সক্রিয়</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-colors cursor-pointer shadow-sm">
          <Plus className="w-4 h-4" /><span>নতুন বিজ্ঞাপন</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 animate-scale-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-red-600" />
              <span>{editingId ? 'বিজ্ঞাপন সংশোধন' : 'নতুন বিজ্ঞাপন'}</span>
            </h2>
            <button onClick={resetForm} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ক্যাম্পেইন নাম *</label>
                <input type="text" placeholder="ওয়ালটন মেগা সেল..." value={adTitle} onChange={e => setAdTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">অবস্থান *</label>
                <select value={adPosition} onChange={e => setAdPosition(e.target.value as any)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer">
                  <option value="sidebar">সাইডবার</option>
                  <option value="top_banner">হেডার ব্যানার</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ব্যানার ইমেজ *</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input 
                      type="url" 
                      placeholder="ইমেজ URL (https://...)" 
                      value={adImgUrl} 
                      onChange={e => setAdImgUrl(e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 text-xs font-mono" 
                      required 
                    />
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
                    <p className={`text-[11px] font-bold ${
                      uploadNote.includes('সফল') ? 'text-emerald-600' : uploadNote.includes('হচ্ছে') ? 'text-blue-500 animate-pulse' : 'text-red-500'
                    }`}>
                      {uploadNote}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ক্লিক লিংক *</label>
                <input type="url" placeholder="https://..." value={adLinkUrl} onChange={e => setAdLinkUrl(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm font-mono" required />
              </div>
            </div>
            {adImgUrl && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-[10px] text-gray-400 font-bold mb-2">ব্যানার প্রিভিউ:</p>
                <div className="w-full max-w-md bg-gray-100 rounded-lg overflow-hidden border shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={adImgUrl} alt="Preview" className="w-full h-auto block object-contain" referrerPolicy="no-referrer"
                    onError={(e) => { (e.target as any).src = 'https://placehold.co/600x400?text=Invalid+URL'; }} />
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <input type="checkbox" id="adActive" checked={adIsActive} onChange={e => setAdIsActive(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer" />
              <label htmlFor="adActive" className="text-sm font-bold text-gray-700 cursor-pointer select-none">এখনই সক্রিয় করুন</label>
            </div>
            <div className="flex gap-3">
              <button type="submit"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                <Send className="w-4 h-4" />
                <span>{editingId ? 'আপডেট করুন' : 'পোস্ট করুন'}</span>
              </button>
              <button type="button" onClick={resetForm}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg cursor-pointer">বাতিল</button>
            </div>
          </form>
        </div>
      )}

      {/* Ads Grid */}
      {loading ? (
        <div className="p-16 text-center">
          <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">লোড হচ্ছে...</p>
        </div>
      ) : ads.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <Megaphone className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-bold text-gray-500 mb-1">কোনো বিজ্ঞাপন নেই</p>
          <p className="text-xs text-gray-400">প্রথম বিজ্ঞাপন তৈরি করুন</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ads.map((ad) => (
            <div key={ad._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
              <div className="relative bg-gray-100 overflow-hidden border-b border-gray-100 flex items-center justify-center min-h-[160px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ad.imgUrl} alt={ad.title} className="w-full h-auto max-h-[220px] object-contain group-hover:scale-[1.02] transition-transform duration-350" referrerPolicy="no-referrer" />
                <div className="absolute top-3 right-3">
                  <button onClick={() => toggleActive(ad)} className="cursor-pointer" title="Toggle active">
                    {ad.isActive ? (
                      <span className="flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> সক্রিয়
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 bg-gray-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">বন্ধ</span>
                    )}
                  </button>
                </div>
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full shadow-lg ${
                    ad.position === 'sidebar' ? 'bg-blue-500 text-white' : 'bg-orange-500 text-white'
                  }`}>{ad.position === 'sidebar' ? 'সাইডবার' : 'হেডার'}</span>
                </div>
              </div>

              {/* Ad Info */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-sm truncate mb-2">{ad.title}</h3>
                <div className="flex items-center justify-between">
                  <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer"
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 transition-colors">
                    <span>লিংক ভিজিট</span><ExternalLink className="w-3 h-3" />
                  </a>
                  <div className="flex gap-1.5">
                    <button onClick={() => startEdit(ad)}
                      className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg border border-gray-200 cursor-pointer transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(ad._id)}
                      className="p-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg border border-red-100 cursor-pointer transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
