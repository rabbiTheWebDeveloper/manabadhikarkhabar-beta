'use client';

import { useState, useEffect } from 'react';

interface BreakingTickerProps {
  fallbackHeadlines?: string[];
}

const DEFAULT_FALLBACKS = [
  "মানবাধিকার হরণকারীদের বিরুদ্ধে সোচ্চার হোন — মানবাধিকার খবর",
  "সত্য ও বস্তুনিষ্ঠ সাংবাদিকতায় সর্বদা পাশে আছে মানবাধিকার খবর",
  "দেশ ও বিদেশের সর্বশেষ সত্য খবরের নির্ভরযোগ্য অনলাইন নিউজ পোর্টাল",
  "সবার আগে সঠিক ও নির্ভরযোগ্য সংবাদ পেতে চোখ রাখুন মানবাধিকার খবরের পাতায়"
];

export default function BreakingTicker({ fallbackHeadlines }: BreakingTickerProps) {
  const finalFallbacks = fallbackHeadlines && fallbackHeadlines.length > 0 ? fallbackHeadlines : DEFAULT_FALLBACKS;
  const [items, setItems] = useState<string[]>(finalFallbacks);

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        const active = (d.settings?.breakingNews || [])
          .filter((b: any) => b.isActive)
          .map((b: any) => b.text);
        if (active.length > 0) setItems(active);
      })
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-1.5 sm:py-2 flex items-center">
        <div className="bg-red-700 text-white px-2 sm:px-3 py-0.5 sm:py-1 flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[14px] font-bold whitespace-nowrap z-10 shrink-0 rounded-sm">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white animate-pulse" />
          <span className="hidden sm:inline">ব্রেকিং নিউজ</span>
          <span className="sm:hidden">ব্রেকিং</span>
        </div>
        <div className="overflow-hidden flex-1 relative flex items-center ml-2 sm:ml-4 group">
          <div className="animate-marquee whitespace-nowrap flex w-max items-center text-[12px] sm:text-[14px] font-medium text-gray-800 font-bangla group-hover:[animation-play-state:paused] cursor-pointer">
            {items.map((text, idx) => (
              <span key={idx} className="contents">
                <span className="mx-4 text-red-600">■</span>
                <span className="hover:text-red-700 transition-colors">{text}</span>
              </span>
            ))}
            {/* Duplicate for seamless loop */}
            {items.map((text, idx) => (
              <span key={`dup-${idx}`} className="contents">
                <span className="mx-4 text-red-600">■</span>
                <span className="hover:text-red-700 transition-colors">{text}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
