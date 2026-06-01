'use client';

import { useState, useEffect } from 'react';

interface BreakingTickerProps {
  fallbackHeadlines?: string[];
}

export default function BreakingTicker({ fallbackHeadlines = [] }: BreakingTickerProps) {
  const [items, setItems] = useState<string[]>(fallbackHeadlines);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        const active = (d.settings?.breakingNews || [])
          .filter((b: any) => b.isActive)
          .map((b: any) => b.text);
        if (active.length > 0) setItems(active);
      })
      .catch(() => {});
  }, []);

  if (items.length === 0 && fallbackHeadlines.length === 0) return null;

  const displayItems = items.length > 0 ? items : fallbackHeadlines;

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center">
        <div className="bg-red-700 text-white px-3 py-1 flex items-center gap-2 text-[14px] font-bold whitespace-nowrap z-10 hidden sm:flex shrink-0 rounded-sm">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          ব্রেকিং নিউজ
        </div>
        <div className="overflow-hidden flex-1 relative flex items-center ml-0 sm:ml-4 group">
          <div className="animate-marquee whitespace-nowrap flex w-max items-center text-[14px] font-medium text-gray-800 font-bangla group-hover:[animation-play-state:paused] cursor-pointer">
            {displayItems.map((text, idx) => (
              <span key={idx} className="contents">
                <span className="mx-4 text-red-600">■</span>
                <span className="hover:text-red-700 transition-colors">{text}</span>
              </span>
            ))}
            {/* Duplicate for seamless loop */}
            {displayItems.map((text, idx) => (
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
