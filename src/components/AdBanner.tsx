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
    if (position === 'top_banner' || position === 'below_header' || position === 'footer_banner') {
      return (
        <a 
          href="tel:01711391530"
          className={`block w-full rounded-lg overflow-hidden border border-[#E4DFD5] shadow-xs hover:shadow-md transition-all duration-300 group cursor-pointer ${className}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/ad-banner-default.png" 
            alt="আপনার প্রতিষ্ঠানের বিজ্ঞাপন দিতে চান? যোগাযোগ করুন ০১৭১১-৩৯১৫৩০" 
            className="w-full h-auto block group-hover:scale-[1.01] transition-transform duration-500 object-contain"
          />
        </a>
      );
    }

    return (
      <a 
        href="tel:01711391530"
        className={`block w-full rounded-lg overflow-hidden border border-[#E4DFD5] bg-gradient-to-b from-emerald-50 via-white to-amber-50 shadow-xs hover:shadow-md transition-all duration-300 group cursor-pointer text-center select-none ${className}`}
      >
        <div className="relative p-5 flex flex-col items-center gap-4 min-h-[220px] justify-center">
          {/* Raised Hands SVG Watermark */}
          <div className="absolute inset-x-0 bottom-0 opacity-[0.12] pointer-events-none h-16 flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 30" fill="currentColor" className="text-emerald-800 w-2/3 h-full">
              <path d="M5,30 C10,20 15,10 18,15 C20,18 22,22 25,24 C28,15 32,5 35,8 C38,15 40,22 42,24 C45,18 48,10 52,12 C55,15 58,22 60,24 C65,12 70,5 75,10 C78,12 80,20 82,22 C85,15 90,10 95,30 Z" />
            </svg>
          </div>

          <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-700 bg-amber-100/50 border border-amber-200/50 px-2.5 py-1 rounded w-fit font-sans z-10">
            বিজ্ঞাপন
          </span>
          
          <div className="flex flex-col gap-2 z-10">
            <h4 className="text-[#BC1E2D] font-extrabold text-base md:text-lg leading-tight font-bangla group-hover:text-red-750 transition-colors">
              আপনার প্রতিষ্ঠানের বিজ্ঞাপন দিতে চান?
            </h4>
            <p className="text-[#15803d] font-bold text-sm font-bangla">
              যোগাযোগ করুন
            </p>
          </div>
          
          <div className="bg-white/95 border border-emerald-100 rounded-full px-4 py-2 w-full hover:bg-emerald-600 hover:text-white transition-all duration-300 group-hover:scale-102 group-hover:border-emerald-600 shadow-sm z-10">
            <span className="text-blue-800 font-black tracking-wider text-base sm:text-lg md:text-xl font-sans group-hover:text-white transition-colors block">
              ০১৭১১-৩৯১৫৩০
            </span>
          </div>
        </div>
      </a>
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
