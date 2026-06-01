'use client';

import { useState, useEffect } from 'react';
import { Cpu, RefreshCw, Loader2, Globe, Trash2, Clock, Activity, Database } from 'lucide-react';
import { showAdminNotif } from '@/components/admin/AdminNotification';
import StatsCard from '@/components/admin/StatsCard';

export default function CrawlerControlPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [scraperStatus, setScraperStatus] = useState<any>({ isRunning: false, lastRun: 0, count: 0, message: '' });
  const [scraperLoading, setScraperLoading] = useState(false);

  const fetchStatus = async () => { 
    try { 
      const r = await fetch('/api/scraper/scrape'); 
      if (r.ok) { 
        const d = await r.json(); 
        if (d.status) {
          const pAlo = d.status.prothomAlo || { isRunning: false, lastRun: 0, count: 0 };
          const mKhb = d.status.manabadhikar || { isRunning: false, lastRun: 0, count: 0 };
          
          setScraperStatus({
            isRunning: pAlo.isRunning || mKhb.isRunning,
            lastRun: Math.max(pAlo.lastRun, mKhb.lastRun),
            count: pAlo.count + mKhb.count,
            message: pAlo.message + ' | ' + mKhb.message
          });
        } 
      } 
    } catch {} 
  };
  const loadArticles = async () => { try { const r = await fetch('/api/articles'); if (r.ok) { const d = await r.json(); setArticles(d.articles || []); } } catch {} };

  useEffect(() => { fetchStatus(); loadArticles(); }, []);

  const handleScrape = async () => {
    if (scraperLoading || scraperStatus.isRunning) return;
    setScraperLoading(true);
    setScraperStatus((p: any) => ({ ...p, isRunning: true }));
    try {
      const r = await fetch('/api/scraper/scrape', { method: 'POST' });
      if (r.ok) { showAdminNotif('খবর সফলভাবে স্ক্র্যাপ হয়েছে!', 'success'); await loadArticles(); }
      else showAdminNotif('স্ক্র্যাপিং ত্রুটি', 'error');
    } catch { showAdminNotif('সংযোগ ত্রুটি', 'error'); }
    finally { setScraperLoading(false); await fetchStatus(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ডিলিট করতে চান?')) return;
    try { const r = await fetch(`/api/articles/${id}`, { method: 'DELETE' }); if (r.ok) { showAdminNotif('ডিলিট হয়েছে', 'success'); loadArticles(); } } catch {}
  };

  const crawled = articles.filter(a => ['প্রথম আলো','কুরিয়ার নিউজ','রয়টার্স','এএফপি','মানবাধিকার খবর'].includes(a.author)).slice(0, 12);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Cpu className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">ক্রলার কন্ট্রোল সেন্টার</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black">প্রথম আলো অটোমেটেড নিউজ ক্রলার</h1>
            <p className="text-sm text-slate-400 max-w-xl">আরএসএস ফিড + Gemini Flash AI ক্লাসিফিকেশন সক্রিয়।</p>
          </div>
          <button onClick={handleScrape} disabled={scraperLoading || scraperStatus.isRunning}
            className={`px-8 py-4 rounded-xl text-white font-extrabold text-sm flex items-center gap-2.5 shadow-lg active:scale-95 cursor-pointer shrink-0 transition-all ${scraperLoading || scraperStatus.isRunning ? 'bg-emerald-800/80 cursor-wait' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
            {scraperLoading || scraperStatus.isRunning ? <><Loader2 className="w-5 h-5 animate-spin" /><span>স্ক্র্যাপ হচ্ছে...</span></> : <><RefreshCw className="w-5 h-5" /><span>এখনই স্ক্র্যাপ করুন</span></>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-grid">
        <StatsCard icon={<Activity className="w-5 h-5" />} label="ক্রলার স্থিতি" value={scraperStatus.isRunning ? 'চলমান' : 'অনলাইন'} sublabel="৩০ মিনিট ইন্টারভাল" accentColor={scraperStatus.isRunning ? 'amber' : 'emerald'} />
        <StatsCard icon={<Clock className="w-5 h-5" />} label="সর্বশেষ রান" value={scraperStatus.lastRun > 0 ? new Date(scraperStatus.lastRun).toLocaleString('bn-BD', { hour12: true }) : 'হয়নি'} accentColor="blue" />
        <StatsCard icon={<Database className="w-5 h-5" />} label="সংগৃহীত" value={`${scraperStatus.count || 0}টি`} accentColor="red" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-extrabold text-gray-900 flex items-center gap-2"><Globe className="w-4 h-4 text-red-500" /><span>কনসোল আউটপুট</span></h3>
          <span className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${scraperStatus.isRunning ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span><span className="text-[10px] font-mono text-gray-400 font-bold">{scraperStatus.isRunning ? 'RUNNING' : 'STANDBY'}</span></span>
        </div>
        <div className="p-5 bg-[#0F172A] text-green-400 font-mono text-xs overflow-y-auto max-h-[220px] space-y-2 terminal-text admin-scrollbar">
          <div className="text-slate-500">[{new Date().toISOString()}] INITIALIZING CRAWLER ENGINE...</div>
          {scraperStatus.lastRun > 0 && <div className="text-emerald-300">[{new Date(scraperStatus.lastRun).toISOString()}] SUCCESS: {scraperStatus.count} elements crawled.</div>}
          {scraperStatus.isRunning ? <div className="text-amber-300 animate-pulse">[{new Date().toISOString()}] RUNNING: Downloading + classifying...</div> : <div className="text-slate-400">[{new Date().toISOString()}] STANDBY: Awaiting trigger.</div>}
          <div className="text-slate-600">{'>'} <span className="animate-pulse">_</span></div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-extrabold text-gray-900">ক্রলকৃত সংবাদ</h3>
        </div>
        {crawled.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">কোনো ক্রলকৃত খবর নেই।</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
            {crawled.map(art => (
              <div key={art._id} className="p-3 rounded-xl border border-gray-200 hover:border-red-200 transition-all flex gap-3 bg-gray-50/30">
                <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={art.imgUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-gray-900 line-clamp-2">{art.title}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5"><span className="text-red-600 font-bold">{art.category}</span></p>
                  <button onClick={() => handleDelete(art._id)} className="text-[10px] bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 px-2 py-0.5 rounded font-bold cursor-pointer mt-1">ডিলিট</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
