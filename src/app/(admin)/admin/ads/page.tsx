'use client';

import { useState, useEffect } from 'react';
import {
  Megaphone, Edit2, Trash2, Plus, X, Send,
  ExternalLink, Loader2
} from 'lucide-react';
import { showAdminNotif } from '@/components/admin/AdminNotification';

import { 
  getAdsAction, 
  createAdAction, 
  updateAdAction, 
  deleteAdAction 
} from '@/app/actions/ad';

export default function AdsManagementPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adTitle, setAdTitle] = useState('');
  const [adImgUrl, setAdImgUrl] = useState('');
  const [adLinkUrl, setAdLinkUrl] = useState('');
  const [adPosition, setAdPosition] = useState<'sidebar' | 'top_banner'>('sidebar');
  const [adIsActive, setAdIsActive] = useState(false); // Default to off (inactive)
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
      const data = await getAdsAction();
      setAds(data.ads || []);
    } catch (err: any) { 
      showAdminNotif(err.message || 'বিজ্ঞাপন লোড ব্যর্থ', 'error'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { loadAds(true); }, []);

  const resetForm = () => {
    setEditingId(null);
    setAdTitle('');
    setAdImgUrl('');
    setAdLinkUrl('');
    setAdPosition('sidebar');
    setAdIsActive(false); // Default to off (inactive) on reset/new ad
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
      setIsSubmitting(true);
      if (editingId) {
        await updateAdAction(editingId, payload);
        showAdminNotif('বিজ্ঞাপন আপডেট হয়েছে', 'success');
      } else {
        await createAdAction(payload);
        showAdminNotif('নতুন বিজ্ঞাপন যুক্ত হয়েছে', 'success');
      }
      resetForm();
      loadAds();
    } catch (err: any) { 
      showAdminNotif(err.message || 'সংরক্ষণ ব্যর্থ', 'error'); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('এই বিজ্ঞাপনটি ডিলিট করতে চান?')) return;
    try {
      await deleteAdAction(id);
      showAdminNotif('বিজ্ঞাপন ডিলিট হয়েছে', 'success');
      loadAds();
      if (editingId === id) resetForm();
    } catch (err: any) { 
      showAdminNotif(err.message || 'ডিলিট ব্যর্থ', 'error'); 
    }
  };

  const toggleActive = async (ad: any) => {
    try {
      await updateAdAction(ad._id, { isActive: !ad.isActive });
      showAdminNotif('বিজ্ঞাপন স্থিতি পরিবর্তন হয়েছে', 'success');
      loadAds();
    } catch (err: any) { 
      showAdminNotif(err.message || 'স্থিতি পরিবর্তন ব্যর্থ', 'error'); 
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Dashboard Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 rounded-2xl p-6 md:p-8 text-white shadow-[0_10px_30px_-5px_rgba(225,29,72,0.3)]">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 rounded-full bg-white/10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-32 h-32 rounded-full bg-black/10 blur-xl"></div>
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Megaphone className="w-8 h-8 animate-bounce" />
              <span>বিজ্ঞাপন নিয়ন্ত্রণ প্যানেল</span>
            </h1>
            <p className="text-white/80 text-sm max-w-xl font-medium">
              পোর্টালের বিভিন্ন সেকশনের বিজ্ঞাপনগুলি এখান থেকে নিয়ন্ত্রণ করুন। নতুন ক্যাম্পেইন তৈরি করুন অথবা বিদ্যমান বিজ্ঞাপনটির অবস্থান পরিবর্তন করুন।
            </p>
            <div className="flex gap-4 pt-1">
              <div className="bg-white/15 backdrop-blur-md rounded-lg px-3 py-1.5 text-xs font-bold border border-white/10">
                মোট বিজ্ঞাপন: {ads.length}টি
              </div>
              <div className="bg-emerald-500/30 backdrop-blur-md rounded-lg px-3 py-1.5 text-xs font-bold border border-emerald-500/20 text-emerald-100 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                সক্রিয়: {ads.filter(a => a.isActive).length}টি
              </div>
            </div>
          </div>
          <button 
            onClick={() => { resetForm(); setShowForm(true); }}
            disabled={showForm}
            className="flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-red-600 font-extrabold text-sm px-6 py-3.5 rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:pointer-events-none self-start md:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন বিজ্ঞাপন যুক্ত করুন</span>
          </button>
        </div>
      </div>

      {/* Form Container */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.08)] p-6 md:p-8 animate-scale-in">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900">
                  {editingId ? 'বিজ্ঞাপন তথ্য সংশোধন' : 'নতুন বিজ্ঞাপন ক্যাম্পেইন'}
                </h2>
                <p className="text-xs text-gray-400">তারকা চিহ্নিত (*) ঘরগুলো অবশ্যই পূরণ করুন</p>
              </div>
            </div>
            <button 
              onClick={resetForm} 
              disabled={isSubmitting}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer disabled:opacity-40 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Campaign Title */}
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">ক্যাম্পেইন নাম *</label>
                <input 
                  type="text" 
                  disabled={isSubmitting}
                  placeholder="যেমন: ওয়ালটন মেগা অফার..." 
                  value={adTitle} 
                  onChange={e => setAdTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all text-sm font-semibold disabled:bg-gray-50 placeholder:text-gray-300" 
                  required 
                />
              </div>

              {/* Campaign Position */}
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">বিজ্ঞাপনের অবস্থান *</label>
                <select 
                  value={adPosition} 
                  disabled={isSubmitting}
                  onChange={e => setAdPosition(e.target.value as any)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all text-sm font-semibold cursor-pointer disabled:bg-gray-50"
                >
                  <option value="sidebar">সাইডবার ব্যানার</option>
                  <option value="top_banner">শীর্ষ হেডার ব্যানার</option>
                  <option value="in_article">আর্টিকেলের ভেতরে</option>
                  <option value="below_header">হেডারের নিচে</option>
                  <option value="footer_banner">ফুটার ব্যানার</option>
                </select>
              </div>

              {/* Banner Image URL & Upload */}
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">ব্যানার ইমেজ লিংক *</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input 
                      type="url" 
                      disabled={isSubmitting}
                      placeholder="ইমেজ লিংক (https://...)" 
                      value={adImgUrl} 
                      onChange={e => setAdImgUrl(e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all text-xs font-mono disabled:bg-gray-50 placeholder:text-gray-300" 
                      required 
                    />
                    <label className={`relative flex items-center justify-center gap-1.5 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl border border-gray-200 text-xs font-extrabold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 ${isUploading || isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="hidden" 
                      />
                      <span>{isUploading ? 'আপলোড হচ্ছে...' : 'ফাইল আপলোড'}</span>
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

              {/* Click URL */}
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">ক্লিক ডেস্টিনেশন লিংক *</label>
                <input 
                  type="url" 
                  disabled={isSubmitting}
                  placeholder="ইউজার যে লিংকে যাবে (https://...)" 
                  value={adLinkUrl} 
                  onChange={e => setAdLinkUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all text-xs font-mono disabled:bg-gray-50 placeholder:text-gray-300" 
                  required 
                />
              </div>
            </div>

            {/* Preview Banner */}
            {adImgUrl && (
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-2.5">ব্যানার ইমেজ প্রিভিউ</p>
                <div className="w-full max-w-lg bg-white rounded-xl overflow-hidden border border-gray-200/60 shadow-inner flex items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={adImgUrl} 
                    alt="Preview" 
                    className="w-full h-auto max-h-[220px] block object-contain rounded-lg" 
                    referrerPolicy="no-referrer"
                    onError={(e) => { (e.target as any).src = 'https://placehold.co/600x400?text=Invalid+Banners+URL'; }} 
                  />
                </div>
              </div>
            )}

            {/* Active Status Toggle */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <input 
                type="checkbox" 
                id="adActive" 
                disabled={isSubmitting}
                checked={adIsActive} 
                onChange={e => setAdIsActive(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500 w-5 h-5 cursor-pointer disabled:cursor-not-allowed border-gray-300" 
              />
              <div>
                <label htmlFor="adActive" className="text-sm font-black text-gray-700 cursor-pointer select-none disabled:opacity-50">বিজ্ঞাপনটি এখনই সক্রিয় করুন</label>
                <p className="text-[11px] text-gray-400">সক্রিয় না করলে এটি পোর্টালের কোথাও প্রদর্শিত হবে না</p>
              </div>
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="flex gap-3 pt-2">
              <button 
                type="submit"
                disabled={isSubmitting || isUploading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{isSubmitting ? 'সংরক্ষণ করা হচ্ছে...' : editingId ? 'বিজ্ঞাপন আপডেট করুন' : 'বিজ্ঞাপন পাবলিশ করুন'}</span>
              </button>
              <button 
                type="button" 
                onClick={resetForm}
                disabled={isSubmitting}
                className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 font-extrabold rounded-xl cursor-pointer disabled:cursor-not-allowed transition-all"
              >
                বাতিল
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ads Grid Grid Section */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-20 text-center shadow-sm">
          <Loader2 className="w-10 h-10 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500 font-semibold">বিজ্ঞাপন লোড হচ্ছে, দয়া করে অপেক্ষা করুন...</p>
        </div>
      ) : ads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-20 text-center shadow-sm">
          <Megaphone className="w-14 h-14 text-gray-300 mx-auto mb-4 animate-pulse" />
          <p className="font-black text-gray-600 mb-1">কোনো বিজ্ঞাপন ক্যাম্পেইন পাওয়া যায়নি</p>
          <p className="text-xs text-gray-400">ড্যাশবোর্ডের উপরে "নতুন বিজ্ঞাপন যুক্ত করুন" বাটনে ক্লিক করে প্রথম বিজ্ঞাপন যুক্ত করুন।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div 
              key={ad._id} 
              className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between"
            >
              {/* Media Preview Box */}
              <div className="relative bg-gray-50 overflow-hidden border-b border-gray-100 flex items-center justify-center min-h-[180px] p-4">
                {/* Subtle checkered overlay for transparent images */}
                <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={ad.imgUrl} 
                  alt={ad.title} 
                  className="w-full h-auto max-h-[190px] object-contain group-hover:scale-[1.03] transition-all duration-500 rounded-lg drop-shadow-sm" 
                  referrerPolicy="no-referrer" 
                />
                
                {/* Badges Box */}
                <div className="absolute top-3.5 right-3.5">
                  <button 
                    onClick={() => toggleActive(ad)} 
                    className="cursor-pointer transition-transform active:scale-90" 
                    title="ক্লিক করে স্থিতি পরিবর্তন করুন"
                  >
                    {ad.isActive ? (
                      <span className="flex items-center gap-1.5 bg-emerald-500 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-[0_4px_10px_rgba(16,185,129,0.3)]">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span> সক্রিয়
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 bg-gray-400 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-[0_4px_10px_rgba(156,163,175,0.3)]">
                        বন্ধ
                      </span>
                    )}
                  </button>
                </div>
                <div className="absolute top-3.5 left-3.5">
                  <span className={`text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.03)] border border-white/20 ${
                    ad.position === 'sidebar' ? 'bg-blue-600 text-white' : ad.position === 'top_banner' ? 'bg-orange-500 text-white' : 'bg-purple-600 text-white'
                  }`}>
                    {ad.position === 'sidebar' ? 'সাইডবার' : ad.position === 'top_banner' ? 'শীর্ষ ব্যানার' : ad.position === 'in_article' ? 'আর্টিকেলের ভেতরে' : ad.position === 'below_header' ? 'হেডারের নিচে' : 'ফুটার ব্যানার'}
                  </span>
                </div>
              </div>

              {/* Content Box */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-extrabold text-gray-800 text-sm group-hover:text-red-600 transition-colors line-clamp-1 mb-1" title={ad.title}>
                    {ad.title}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">পজিশন: {
                    ad.position === 'sidebar' ? 'সাইডবার উইজেট' : 
                    ad.position === 'top_banner' ? 'হেডার সেকশন' :
                    ad.position === 'in_article' ? 'আর্টিকেলের ভেতরে' :
                    ad.position === 'below_header' ? 'হেডারের নিচে' : 'ফুটার ব্যানার'
                  }</p>
                </div>

                <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                  <a 
                    href={ad.linkUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-extrabold flex items-center gap-1 transition-colors group/link"
                  >
                    <span>লিংক ভিজিট</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </a>
                  
                  {/* Actions Buttons */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => startEdit(ad)}
                      title="বিজ্ঞাপন সংশোধন"
                      className="p-2 bg-gray-50 hover:bg-gray-100 hover:text-red-600 text-gray-500 rounded-xl border border-gray-100 cursor-pointer transition-all duration-200"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(ad._id)}
                      title="বিজ্ঞাপন ডিলিট করুন"
                      className="p-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl border border-red-100/60 cursor-pointer transition-all duration-200"
                    >
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
