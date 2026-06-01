'use client';

import Link from 'next/link';
import { Facebook, Twitter, Youtube, MapPin, Mail, Phone, Smartphone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#111113] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 md:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-8 border-b border-white/10">
        {/* Brand */}
        <div>
          <div className="text-2xl sm:text-3xl md:text-4xl font-[900] text-white tracking-tight mb-4 sm:mb-5" style={{ fontFamily: 'var(--font-serif-bangla), Georgia, serif' }}>
            মানবাধিকার খবর
          </div>
          <p className="text-gray-400 text-[14px] leading-relaxed mb-6 font-medium">
            দেশ ও বিদেশের সর্বশেষ সত্য ও বস্তুনিষ্ঠ খবরের নির্ভরযোগ্য অনলাইন নিউজ পোর্টাল।
          </p>
          <div className="flex gap-3">
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 transition-colors"><Facebook className="w-5 h-5" /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-sky-500 transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-600 transition-colors"><Youtube className="w-5 h-5" /></a>
          </div>
        </div>

        {/* Editor */}
        <div>
          <h3 className="text-sm font-bold mb-5 text-white uppercase tracking-wider border-b-2 border-red-600 pb-2 inline-block">Editor & Publisher</h3>
          <div className="space-y-2 text-gray-300">
            <p className="font-bold text-base text-white">Md Reaz Uddin</p>
            <p className="text-xs text-amber-500 font-bold uppercase tracking-wider">Editor & Publisher</p>
            <p className="text-xs text-gray-400 leading-normal mt-2">মানবাধিকার উন্নয়ন ও বস্তুনিষ্ঠ সাংবাদিকতায় প্রতিশ্রুতিবদ্ধ।</p>
          </div>
        </div>

        {/* Office */}
        <div>
          <h3 className="text-sm font-bold mb-5 text-white uppercase tracking-wider border-b-2 border-red-600 pb-2 inline-block">Editorial Office</h3>
          <div className="space-y-3 text-gray-300 text-sm leading-relaxed">
            <p className="flex items-start gap-1.5">
              <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span><strong>Kabbokosh Bhabon</strong><br />Level-5, Suite#18,<br />Kawran Bazar, Dhaka-1215.</span>
            </p>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-bold mb-5 text-white uppercase tracking-wider border-b-2 border-red-600 pb-2 inline-block">যোগাযোগ</h3>
          <div className="space-y-2.5 text-gray-300 text-sm">
            <p className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-red-500 shrink-0" /><span className="text-xs">manabadhikarkhabar11@gmail.com</span></p>
            <p className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-red-500 shrink-0" /><span className="text-xs font-mono">+880 1XXX-XXXXXX</span></p>
            <p className="flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-red-500 shrink-0" /><span className="text-xs font-mono">+880 1XXX-XXXXXX</span></p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-5 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3 text-xs text-gray-500 safe-bottom">
        <p>© ২০২৬ মানবাধিকার খবর। সর্বস্বত্ব সংরক্ষিত।</p>
        <div className="flex gap-4 font-medium">
          <Link href="/archive" className="hover:text-white transition-colors">আর্কাইভ</Link>
          <Link href="/epaper" className="hover:text-white transition-colors">ই-পেপার</Link>
          <Link href="/submit-news" className="hover:text-white transition-colors">সংবাদ পাঠান</Link>
        </div>
      </div>
    </footer>
  );
}
