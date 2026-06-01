'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface AdBannerProps {
  position: 'sidebar' | 'top_banner' | 'in_article' | 'below_header' | 'footer_banner';
  className?: string;
  aspectRatio?: string;
  maxAds?: number;
}

export default function AdBanner({ position, className = '', aspectRatio = 'aspect-[3/2]', maxAds = 1 }: AdBannerProps) {
  const [ads, setAds] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/ads')
      .then(r => r.json())
      .then(data => {
        const filtered = (data.ads || []).filter(
          (ad: any) => ad.position === position && ad.isActive
        );
        setAds(filtered.slice(0, maxAds));
      })
      .catch(() => {});
  }, [position, maxAds]);

  if (ads.length === 0) {
    return (
      <div className={`${aspectRatio} bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex flex-col items-center justify-center text-gray-400 rounded-lg overflow-hidden ${className}`}>
        <span className="text-[9px] uppercase tracking-[0.15em] font-bold text-gray-400 mb-2 bg-white/60 px-2 py-0.5 rounded">বিজ্ঞাপন</span>
        <span className="text-xs font-semibold text-gray-500">বিজ্ঞাপন দিন</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {ads.map(ad => (
        <a
          key={ad._id}
          href={ad.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-auto relative overflow-hidden border border-gray-200 group cursor-pointer rounded-lg bg-gray-50 shadow-xs"
          title={ad.title}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ad.imgUrl}
            alt={ad.title}
            className="w-full h-auto block group-hover:scale-[1.02] transition-transform duration-500 object-contain"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-1.5 left-1.5 bg-black/50 text-[8px] uppercase tracking-wider text-white px-1.5 py-0.5 rounded font-bold z-10 select-none">
            AD
          </div>
        </a>
      ))}
    </div>
  );
}
