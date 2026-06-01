'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Send, Calendar, RotateCcw, UploadCloud, Loader2, HelpCircle, X } from 'lucide-react';
import { showAdminNotif } from '@/components/admin/AdminNotification';

const BANGLA_MONTHS = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];

export default function EPaperManagementPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [epId, setEpId] = useState('');
  const [epMonthName, setEpMonthName] = useState('');
  const [epYear, setEpYear] = useState(2026);
  const [epMonth, setEpMonth] = useState(6);
  const [epPages, setEpPages] = useState<any[]>([]);
  const [subPageNum, setSubPageNum] = useState(1);
  const [subPageTitle, setSubPageTitle] = useState('');
  const [subPageImgUrl, setSubPageImgUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadNote, setUploadNote] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

  const filteredCollections = collections.filter(col => {
    if (!searchQuery) return true;
    return (
      (col.monthName && col.monthName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (col._id && col._id.includes(searchQuery))
    );
  });

  const loadEpapers = async (showLoader = false) => {
    try { if (showLoader) setLoading(true); const r = await fetch('/api/epaper'); if (r.ok) { const d = await r.json(); setCollections(d.collections || []); } }
    catch { showAdminNotif('ই-পেপার লোড ত্রুটি', 'error'); } finally { setLoading(false); }
  };

  useEffect(() => { loadEpapers(true); }, []);

  const toBengaliNumber = (num: number | string): string => {
    return num
      .toString()
      .split('')
      .map(char => {
        const idx = parseInt(char, 10);
        return isNaN(idx) ? char : ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'][idx];
      })
      .join('');
  };

  const handleDateChange = (val: string) => {
    if (!val) return;
    setEpId(val);
    const parts = val.split('-');
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = parts[2] ? Number(parts[2]) : 1;
    setEpYear(y); 
    setEpMonth(m);
    if (m >= 1 && m <= 12) {
      const formatted = parts[2] 
        ? `${toBengaliNumber(d)} ${BANGLA_MONTHS[m - 1]} ${toBengaliNumber(y)}`
        : `${BANGLA_MONTHS[m - 1]} ${toBengaliNumber(y)}`;
      setEpMonthName(formatted);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      setIsUploading(true); setUploadNote('আপলোড হচ্ছে...');
      const fd = new FormData(); fd.append('file', file); fd.append('folder', epId || 'general');
      const r = await fetch('/api/cloudinary/upload', { method: 'POST', body: fd });
      if (r.ok) { const d = await r.json(); setSubPageImgUrl(d.url); setUploadNote('আপলোড সফল!'); showAdminNotif('ছবি আপলোড হয়েছে', 'success'); }
      else { showAdminNotif('আপলোড ব্যর্থ', 'error'); setUploadNote('ব্যর্থ'); }
    } catch { showAdminNotif('সংযোগ ত্রুটি', 'error'); } finally { setIsUploading(false); }
  };

  const addPage = () => {
    if (!subPageImgUrl) { showAdminNotif('ছবি দিন', 'error'); return; }
    const title = subPageTitle || `${subPageNum}নং পাতা`;
    let pages = [...epPages];
    const idx = pages.findIndex(p => p.pageNumber === subPageNum);
    if (idx !== -1) { pages[idx] = { pageNumber: subPageNum, title, imgUrl: subPageImgUrl }; }
    else { pages.push({ pageNumber: subPageNum, title, imgUrl: subPageImgUrl }); }
    pages.sort((a, b) => a.pageNumber - b.pageNumber);
    setEpPages(pages);
    setSubPageNum(pages.length + 1); setSubPageTitle(''); setSubPageImgUrl(''); setUploadNote('');
    showAdminNotif(`${subPageNum}নং পাতা যুক্ত হয়েছে`, 'success');
  };

  const removePage = (num: number) => { setEpPages(epPages.filter(p => p.pageNumber !== num)); showAdminNotif('পাতা বাদ দেওয়া হয়েছে', 'success'); };

  const saveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!epId || !epMonthName) { showAdminNotif('তথ্য পূরণ করুন', 'error'); return; }
    if (epPages.length === 0) { showAdminNotif('পাতা যোগ করুন', 'error'); return; }
    try {
      const r = await fetch('/api/epaper', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: epId, monthName: epMonthName, year: epYear, month: epMonth, pages: epPages }) });
      if (r.ok) { showAdminNotif('সংস্করণ সংরক্ষিত', 'success'); loadEpapers(); resetForm(); }
      else { const d = await r.json(); showAdminNotif(d.error || 'ব্যর্থ', 'error'); }
    } catch { showAdminNotif('সংযোগ ত্রুটি', 'error'); }
  };

  const startEdit = (col: any) => {
    setEpId(col._id); setEpMonthName(col.monthName); setEpYear(col.year); setEpMonth(col.month);
    setEpPages(col.pages || []); setSubPageNum((col.pages || []).length + 1);
    setSubPageTitle(''); setSubPageImgUrl(''); setUploadNote('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteCollection = async (id: string) => {
    if (!confirm('সংস্করণটি মুছে ফেলতে চান?')) return;
    try { const r = await fetch(`/api/epaper/${id}`, { method: 'DELETE' }); if (r.ok) { showAdminNotif('ডিলিট হয়েছে', 'success'); loadEpapers(); if (epId === id) resetForm(); } }
    catch { showAdminNotif('ডিলিট ত্রুটি', 'error'); }
  };

  const resetForm = () => { setEpId(''); setEpMonthName(''); setEpPages([]); setSubPageNum(1); setSubPageTitle(''); setSubPageImgUrl(''); setUploadNote(''); };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-black text-gray-900">ই-পেপার ব্যবস্থাপনা</h1><p className="text-sm text-gray-500">{collections.length}টি সংস্করণ প্রকাশিত</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-fit">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2"><BookOpen className="w-5 h-5 text-red-600" /><span>সংস্করণ তৈরি / সংশোধন</span></h2>
            {epId && <button onClick={resetForm} className="text-xs text-gray-500 hover:text-red-600 font-bold cursor-pointer flex items-center gap-1"><RotateCcw className="w-3 h-3" /><span>নতুন</span></button>}
          </div>
          <form onSubmit={saveCollection} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1"><Calendar className="w-4 h-4 text-red-500" /><span>তারিখ *</span></label>
                <input type="date" value={epId} onChange={e => handleDateChange(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 text-sm font-sans" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">নাম *</label>
                <input type="text" placeholder="১ জুন ২০২৬" value={epMonthName} onChange={e => setEpMonthName(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20" required />
              </div>
            </div>

            {/* Page Subform */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <h3 className="text-xs font-bold text-gray-600 uppercase flex items-center gap-1"><Plus className="w-3.5 h-3.5 text-red-600" /><span>পাতা যুক্ত করুন</span></h3>
                <span className="text-[10px] font-mono text-gray-400 bg-white border border-gray-200 px-1.5 py-0.5 rounded font-bold">ড্রাফট: {epPages.length}</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">পৃষ্ঠা # *</label>
                  <input type="number" min={1} max={100} value={subPageNum} onChange={e => setSubPageNum(Math.max(1, Number(e.target.value) || 1))} className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-sm font-semibold focus:outline-none focus:border-red-600" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-600 mb-1">শিরোনাম</label>
                  <input type="text" placeholder="ঐচ্ছিক..." value={subPageTitle} onChange={e => setSubPageTitle(e.target.value)} className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-red-600" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">ছবি *</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-red-500 transition-colors bg-white cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleFileChange} disabled={isUploading} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <UploadCloud className={`w-6 h-6 mx-auto ${isUploading ? 'text-red-600 animate-bounce' : 'text-gray-400'}`} />
                  <p className="text-[10px] font-bold text-gray-600 mt-1">ফাইল নির্বাচন করুন</p>
                </div>
                {isUploading && <div className="p-2 bg-red-50 border border-red-100 rounded flex items-center gap-2 mt-2"><Loader2 className="w-3 h-3 text-red-600 animate-spin" /><span className="text-[10px] font-bold text-red-800">{uploadNote}</span></div>}
                {!isUploading && uploadNote && <div className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 p-1.5 rounded mt-2 text-center">{uploadNote}</div>}
                <div className="flex items-center gap-2 text-[10px] mt-2 text-gray-400 font-bold"><span className="h-px bg-gray-200 flex-1"></span><span>অথবা URL</span><span className="h-px bg-gray-200 flex-1"></span></div>
                <input type="url" placeholder="https://..." value={subPageImgUrl} onChange={e => setSubPageImgUrl(e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs font-mono focus:outline-none focus:border-red-600 mt-1" />
              </div>
              {subPageImgUrl && (
                <div className="p-2 border border-gray-200 bg-white rounded flex gap-3 items-center">
                  <div className="w-10 h-14 border rounded overflow-hidden shrink-0 bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={subPageImgUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-700 truncate">{subPageTitle || `${subPageNum}নং পাতা`}</p>
                    <p className="text-[9px] font-mono text-gray-400 truncate">{subPageImgUrl}</p>
                  </div>
                  <button type="button" onClick={() => setSubPageImgUrl('')} className="text-xs text-red-500 font-bold cursor-pointer">মুছুন</button>
                </div>
              )}
              <button type="button" onClick={addPage} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 rounded text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors">
                <Plus className="w-3.5 h-3.5" /><span>{epPages.some(p => p.pageNumber === subPageNum) ? 'সংস্কার করুন' : 'যুক্ত করুন'}</span>
              </button>
            </div>

            <button type="submit" disabled={epPages.length === 0} className="w-full bg-red-600 disabled:opacity-40 hover:bg-red-700 text-white font-extrabold py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-sm">
              <Send className="w-4 h-4" /><span>সংরক্ষণ করুন ({epPages.length} পাতা)</span>
            </button>
          </form>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Draft Pages */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-extrabold text-gray-800 text-sm pb-3 border-b border-gray-150 flex justify-between items-center">
              <span>ড্রাফট পাতা ({epPages.length})</span>
              {epId && <span className="text-[10px] bg-red-50 text-red-700 font-black border border-red-150 px-2 py-0.5 rounded-full font-sans animate-pulse">{epId}</span>}
            </h3>
            {epPages.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-xs"><HelpCircle className="w-8 h-8 text-gray-200 mx-auto mb-2" /><p className="font-bold">কোনো পাতা নেই</p></div>
            ) : (
              <div className="max-h-[340px] overflow-y-auto divide-y divide-gray-100 mt-2 admin-scrollbar-light">
                {epPages.map(p => (
                  <div key={p.pageNumber} className="py-3 flex gap-3 items-center justify-between hover:bg-gray-50/50 px-1 rounded">
                    <div className="flex gap-3 items-center min-w-0">
                      <span className="w-6 h-6 rounded-full bg-red-700 text-white font-extrabold text-xs flex items-center justify-center shrink-0">{p.pageNumber}</span>
                      <div className="w-8 h-11 bg-gray-100 border border-gray-200 rounded overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.imgUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <p className="text-xs font-bold text-gray-900 truncate">{p.title}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => { setSubPageNum(p.pageNumber); setSubPageTitle(p.title); setSubPageImgUrl(p.imgUrl); }} className="text-[10px] bg-gray-50 border border-gray-200 text-gray-700 px-2 py-1 rounded font-bold cursor-pointer">সম্পাদনা</button>
                      <button onClick={() => removePage(p.pageNumber)} className="text-[10px] bg-red-50 text-red-600 border border-red-100 px-2 py-1 rounded font-bold cursor-pointer hover:bg-red-100">বাদ</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Published Collections */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-150 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="font-extrabold text-base text-gray-900">প্রকাশিত সংস্করণ ({filteredCollections.length})</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="খুঁজুন..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>
            </div>
            {loading ? (
              <div className="p-12 text-center"><Loader2 className="w-7 h-7 text-red-600 animate-spin mx-auto" /></div>
            ) : filteredCollections.length === 0 ? (
              <div className="p-12 text-center text-gray-400"><BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" /><p className="font-bold">কোনো সংস্করণ পাওয়া যায়নি</p></div>
            ) : (
              <div className="divide-y divide-gray-150">
                {filteredCollections.map(col => (
                  <div key={col._id} className="p-5 hover:bg-gray-50/40 transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-extrabold text-slate-900 flex items-center gap-2">
                          <span className="text-lg">{col.monthName}</span>
                          <span className="text-xs font-mono bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded">{col._id}</span>
                        </h4>
                        <p className="text-[11px] text-gray-400 mt-1">পাতা: <strong className="text-slate-700">{(col.pages || []).length}টি</strong> · {new Date(col.updatedAt).toLocaleDateString('bn-BD')}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => startEdit(col)} className="p-1.5 px-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-200 flex items-center gap-1 cursor-pointer text-xs font-bold"><Edit2 className="w-3.5 h-3.5" /><span>সম্পাদনা</span></button>
                        <button onClick={() => deleteCollection(col._id)} className="p-1.5 px-2.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg border border-red-100 flex items-center gap-1 cursor-pointer text-xs font-bold transition-all"><Trash2 className="w-3.5 h-3.5" /><span>মুছুন</span></button>
                      </div>
                    </div>
                    <div className="flex gap-2 overflow-x-auto mt-3 py-1 select-none">
                      {(col.pages || []).map((p: any, i: number) => (
                        <div key={i} className="relative shrink-0 w-10 h-14 bg-gray-50 border border-gray-200 rounded overflow-hidden hover:border-red-500 transition-all">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.imgUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <span className="absolute bottom-0 inset-x-0 bg-black/75 text-white text-[7px] text-center font-bold font-mono py-px">{p.pageNumber}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
