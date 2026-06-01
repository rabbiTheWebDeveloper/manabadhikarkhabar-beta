'use client';

import { useState, useEffect, FormEvent } from 'react';
import { 
  Plus, Pencil, Trash2, FolderOpen, ArrowUpDown, Check, Loader2, RefreshCw, X
} from 'lucide-react';
import { Category } from '@/lib/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [value, setValue] = useState('');
  const [label, setLabel] = useState('');
  const [order, setOrder] = useState('10');

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCategories(data.categories || []);
        }
      }
    } catch (err) {
      console.error('Failed to load categories', err);
      setErrorMessage('ক্যাটেগরি লোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Form Submit Handler (both Create & Update)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!value.trim() || !label.trim()) {
      setErrorMessage('সবগুলো ঘর পূরণ করা আবশ্যক।');
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        value: value.trim(),
        label: label.trim(),
        order: parseInt(order) || 10
      };

      if (editingId) {
        // Update category
        const res = await fetch('/api/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload })
        });
        
        const data = await res.json();
        if (res.ok && data.success) {
          setSuccessMessage('ক্যাটেগরি সফলভাবে আপডেট করা হয়েছে।');
          resetForm();
          fetchCategories();
        } else {
          setErrorMessage(data.error || 'আপডেট করতে ব্যর্থ হয়েছে।');
        }
      } else {
        // Create category
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setSuccessMessage('নতুন ক্যাটেগরি সফলভাবে যোগ করা হয়েছে।');
          resetForm();
          fetchCategories();
        } else {
          setErrorMessage(data.error || 'নতুন ক্যাটেগরি যোগ করতে ব্যর্থ হয়েছে।');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'একটি ত্রুটি ঘটেছে।');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Handler
  const handleDelete = async (id: string, label: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে "${label}" ক্যাটেগরি অপসারণ করতে চান?`)) {
      return;
    }

    try {
      setActionLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      const res = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage('ক্যাটেগরি সফলভাবে ডিলিট করা হয়েছে।');
        if (editingId === id) resetForm();
        fetchCategories();
      } else {
        setErrorMessage(data.error || 'ডিলিট করতে ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'একটি ত্রুটি ঘটেছে।');
    } finally {
      setActionLoading(false);
    }
  };

  // Edit Mode Initiator
  const startEdit = (cat: Category) => {
    if (!cat._id) return;
    setEditingId(cat._id);
    setValue(cat.value);
    setLabel(cat.label);
    setOrder((cat.order ?? 10).toString());
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Reset form helper
  const resetForm = () => {
    setEditingId(null);
    setValue('');
    setLabel('');
    setOrder('10');
  };

  return (
    <div className="space-y-6 font-bangla max-w-7xl mx-auto">
      {/* Upper stats info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">ক্যাটেগরি ব্যবস্থাপনা</h1>
          <p className="text-sm text-slate-500 mt-1">পাবলিক হোমপেজ ও নেভিগেশন বারের ক্যাটেগরি সমূহ নিয়ন্ত্রণ করুন</p>
        </div>
        <button 
          onClick={fetchCategories}
          disabled={loading}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl shadow-xs hover:bg-slate-50 transition-all disabled:opacity-50 cursor-pointer w-fit"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          রিফ্রেশ
        </button>
      </div>

      {/* Message Toasts */}
      {successMessage && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl animate-fade-in shadow-xs">
          <div className="bg-emerald-500 rounded-full p-1 text-white shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold">{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="ml-auto text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl animate-fade-in shadow-xs">
          <div className="bg-rose-500 rounded-full p-1 text-white shrink-0">
            <X className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold">{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="ml-auto text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Grid: Categories List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FolderOpen className="w-5 h-5 text-red-600" />
                <h2 className="font-extrabold text-slate-800">ক্যাটেগরি তালিকা</h2>
              </div>
              <span className="bg-red-50 text-red-650 px-3 py-1 rounded-full text-xs font-black">
                মোট: {categories.length} টি ক্যাটেগরি
              </span>
            </div>

            {loading ? (
              <div className="py-20 flex flex-col justify-center items-center gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                <span className="text-sm font-bold">ক্যাটেগরি লোড করা হচ্ছে...</span>
              </div>
            ) : categories.length === 0 ? (
              <div className="py-20 text-center text-slate-400">
                <FolderOpen className="w-12 h-12 mx-auto stroke-[1.5] mb-3" />
                <p className="font-bold">কোন ক্যাটেগরি পাওয়া যায়নি!</p>
                <p className="text-xs mt-1">ডানপাশের ফর্ম ব্যবহার করে নতুন ক্যাটেগরি যোগ করুন</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-100">
                      <th className="p-4 text-xs font-extrabold text-slate-500 text-center w-16">ক্রম</th>
                      <th className="p-4 text-xs font-extrabold text-slate-500">নাম (বাংলা)</th>
                      <th className="p-4 text-xs font-extrabold text-slate-500">স্ল্যাগ / ভ্যালু</th>
                      <th className="p-4 text-xs font-extrabold text-slate-500 text-center w-24">অর্ডার</th>
                      <th className="p-4 text-xs font-extrabold text-slate-500 text-center w-28">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {categories.map((cat, idx) => (
                      <tr 
                        key={cat._id || idx} 
                        className={`hover:bg-slate-50/50 transition-colors ${
                          editingId === cat._id ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        <td className="p-4 text-slate-400 font-sans text-center font-bold">{idx + 1}</td>
                        <td className="p-4 font-black text-slate-800">{cat.label}</td>
                        <td className="p-4 font-mono text-xs text-slate-500">{cat.value}</td>
                        <td className="p-4 text-center font-sans">
                          <span className="bg-slate-100 text-slate-650 px-2.5 py-1 rounded-lg text-xs font-extrabold border border-slate-200">
                            {cat.order}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => startEdit(cat)}
                              title="সম্পাদনা করুন"
                              className="p-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100/80 transition-colors cursor-pointer"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(cat._id!, cat.label)}
                              title="মুছে ফেলুন"
                              disabled={actionLoading}
                              className="p-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100/80 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Grid: Create/Update Form Card */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-red-650" />
                <h3 className="font-extrabold text-slate-800">
                  {editingId ? 'ক্যাটেগরি সংশোধন করুন' : 'নতুন ক্যাটেগরি যোগ করুন'}
                </h3>
              </div>
              {editingId && (
                <button 
                  onClick={resetForm} 
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  title="সংশোধন বাতিল করুন"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Bengali Name input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600">ক্যাটেগরি নাম (বাংলা)</label>
                <input 
                  type="text" 
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="যেমন: রাজনীতি, খেলা, আন্তর্জাতিক"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-bold text-slate-800 placeholder-slate-400 transition-all bg-slate-50/50"
                  required
                />
              </div>

              {/* Category Slug / English Value input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600">ইউআরএল স্ল্যাগ / ইংরেজী ভ্যালু</label>
                <input 
                  type="text" 
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="যেমন: politics, sports, international"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-mono text-slate-800 placeholder-slate-400 transition-all bg-slate-50/50"
                  required
                />
                <p className="text-[10px] text-slate-450 leading-relaxed pl-1">
                  * এটি হোমপেজে ক্যাটেগরি রিডাইরেক্ট ফিল্টারিং স্ল্যাগ হিসেবে ব্যবহৃত হবে
                </p>
              </div>

              {/* Category sorting order input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-450" />
                  সর্টিং অর্ডার ক্রম
                </label>
                <input 
                  type="number" 
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  placeholder="যেমন: 1, 2, 5"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-sans font-bold text-slate-800 transition-all bg-slate-50/50"
                  min="1"
                  required
                />
                <p className="text-[10px] text-slate-450 leading-relaxed pl-1">
                  * ছোট থেকে বড় ক্রমে নেভিগেশন বারে ক্যাটেগরি সজ্জিত হবে
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex gap-2">
                {editingId && (
                  <button 
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    বাতিল
                  </button>
                )}
                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="flex-3 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingId ? (
                    'হালনাগাদ করুন'
                  ) : (
                    'ক্যাটেগরি যোগ করুন'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
