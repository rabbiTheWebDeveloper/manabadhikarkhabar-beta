'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, Menu, User, ChevronRight, 
  Facebook, Twitter, Instagram, Youtube, MapPin, Check, Plus, AlertCircle, Settings,
  Printer, X, TrendingUp, PenTool, Share2, Clock, History, Moon, Sun, Copy,
  Compass, RefreshCw, Phone, Smartphone, Mail
} from 'lucide-react';
import Image from 'next/image';
import { LazyImage } from '@/components/lazy-image';
import { WeatherWidget } from '@/components/weather-widget';
import { RelatedArticles } from '@/components/related-articles';
import BreakingTicker from '@/components/public/BreakingTicker';
import Footer from '@/components/public/Footer';
import AdBanner from '@/components/AdBanner';
import { getAdsAction } from '@/app/actions/ad';
import Link from 'next/link';
import { Article } from '@/lib/types';
import { trackPageView } from '@/lib/analytics';
import { INITIAL_ARTICLES } from '@/lib/initial-data';
import { generateSlug } from '@/lib/utils';

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

function toBengaliDigits(num: number | string): string {
  return num
    .toString()
    .split('')
    .map(char => {
      const idx = parseInt(char, 10);
      return isNaN(idx) ? char : BENGALI_DIGITS[idx];
    })
    .join('');
}

function formatBengaliDuration(seconds: number): string {
  if (seconds < 60) {
    return `${toBengaliDigits(seconds)} সেকেন্ড`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) {
    return `${toBengaliDigits(minutes)} মিনিট`;
  }
  return `${toBengaliDigits(minutes)} মিনিট ${toBengaliDigits(remainingSeconds)} সেকেন্ড`;
}

function formatScraperLastRunBengali(lastRunMs: number): string {
  if (!lastRunMs || lastRunMs <= 0) return 'কখনোই নয়';
  const toEnBD = (n: number | string) => {
    const digits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    return n.toString().split('').map(d => digits[parseInt(d)] || d).join('');
  };
  try {
    const d = new Date(lastRunMs);
    const hours = toEnBD(String(d.getHours()).padStart(2, '0'));
    const mins = toEnBD(String(d.getMinutes()).padStart(2, '0'));
    const secs = toEnBD(String(d.getSeconds()).padStart(2, '0'));
    return `${hours}:${mins}:${secs} (আজ)`;
  } catch(e) {
    return 'কয়েক মুহূর্ত আগে';
  }
}

function PageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedCategory = searchParams.get('category') || 'all';
  const searchTerm = searchParams.get('search') || '';

  const [activeTab, setActiveTab] = useState<'latest' | 'popular'>('latest');
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dbSource, setDbSource] = useState('local');
  const [selectedArticle, setSelectedArticleAction] = useState<Article | null>(null);
  const [printTarget, setPrintTarget] = useState<Article | null>(null);
  const [renderTimestamp, setRenderTimestamp] = useState<number>(0);
  const [readingProgress, setReadingProgress] = useState(0);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);
  const [shareToastText, setShareToastText] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Keep night mode preference in local storage
  const [isNightMode, setIsNightMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('kachua_reader_night_mode') === 'true';
      } catch (e) {
        return false;
      }
    }
    return false;
  });

  const toggleNightMode = () => {
    setIsNightMode(prev => {
      const nextVal = !prev;
      try {
        localStorage.setItem('kachua_reader_night_mode', String(nextVal));
      } catch (e) {}
      return nextVal;
    });
  };

  // Keep reader font size preference in local storage
  const [readerFontSize, setReaderFontSize] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('kachua_reader_font_size');
        if (stored) {
          const parsed = parseInt(stored, 10);
          if (!isNaN(parsed) && parsed >= 14 && parsed <= 28) {
            return parsed;
          }
        }
      } catch (e) {
        // ignore
      }
    }
    return 18; // Default value
  });

  useEffect(() => {
    try {
      localStorage.setItem('kachua_reader_font_size', String(readerFontSize));
    } catch (e) {}
  }, [readerFontSize]);

  // States for active reading speed calculation (WPM)
  const [activeReadingTime, setActiveReadingTime] = useState<number>(0);
  const [sessionWpm, setSessionWpm] = useState<number | null>(null);
  
  const [lifetimeWpm, setLifetimeWpm] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('kachua_lifetime_wpm');
        return stored ? parseInt(stored, 10) : 150; // Default to 150 word/min
      } catch (e) {
        return 150;
      }
    }
    return 150;
  });

  const [totalArticlesRead, setTotalArticlesRead] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('kachua_articles_read_count');
        return stored ? parseInt(stored, 10) : 0;
      } catch (e) {
        return 0;
      }
    }
    return 0;
  });

  // Track if we already scored and updated the lifetime average for current modal article
  const [hasSavedSession, setHasSavedSession] = useState<boolean>(false);

  // Track reading speed statistics inside asynchronous timer callbacks
  useEffect(() => {
    if (!selectedArticle) return;

    const interval = setInterval(() => {
      setActiveReadingTime(prevTime => {
        const nextTime = prevTime + 1;

        // Perform async WPM calculation within the interval tick
        const textContent = selectedArticle.content || '';
        const wordCount = textContent.trim().split(/\s+/).filter(Boolean).length;

        if (wordCount > 0 && nextTime >= 3 && readingProgress > 1) {
          const wordsRead = (wordCount * readingProgress) / 100;
          const minutesElapsed = nextTime / 60;
          const computedWpm = Math.round(wordsRead / minutesElapsed);

          if (computedWpm >= 30 && computedWpm <= 800) {
            setSessionWpm(computedWpm);

            // Auto-save/update lifetime stats if read progress hits 90% and not saved yet in this modal session
            if (readingProgress >= 90 && !hasSavedSession && nextTime >= 10) {
              setHasSavedSession(true);
              setTotalArticlesRead(prevCount => {
                const nextCount = prevCount + 1;
                try {
                  localStorage.setItem('kachua_articles_read_count', String(nextCount));
                } catch (e) {}

                setLifetimeWpm(prevLifetime => {
                  const nextLifetime = Math.round(((prevLifetime * (nextCount - 1)) + computedWpm) / nextCount);
                  try {
                    localStorage.setItem('kachua_lifetime_wpm', String(nextLifetime));
                  } catch (e) {}
                  return nextLifetime;
                });

                return nextCount;
              });
            }
          }
        }

        return nextTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedArticle, readingProgress, hasSavedSession]);
  
  // Lazy state initialization to read from sessionStorage on client-side only
  const [recentHistory, setRecentHistory] = useState<Article[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('recent_articles_history');
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (e) {
        // ignore
      }
    }
    return [];
  });

  // Dual action state setter to track clicked articles without cascading useEffect renders
  const setSelectedArticle = (art: Article | null) => {
    if (art) {
      if (typeof window !== 'undefined') {
        window.location.href = `/${generateSlug(art.title)}`;
      }
      return;
    }
    setSelectedArticleAction(null);
  };

  const handlePrint = (e: React.MouseEvent, art: Article) => {
    e.stopPropagation();
    setPrintTarget(art);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleShare = async (e: React.MouseEvent, art: Article) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/${generateSlug(art.title)}`;
    
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: art.title,
          text: art.title,
          url: shareUrl
        });
        setShareToastText('লিঙ্ক শেয়ার সম্পন্ন হয়েছে!');
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
      } catch (err) {
        // User cancelled share window or API failed. Let's fallback to clipboard!
        console.log('Share error or canceled, using copy fallback:', err);
        try {
          await navigator.clipboard.writeText(shareUrl);
          setShareToastText('লিঙ্ক ক্লিপবোর্ডে কপি হয়েছে!');
          setShareSuccess(true);
          setTimeout(() => setShareSuccess(false), 2500);
        } catch (copyErr) {
          console.error('Clipboard fallback also failed:', copyErr);
        }
      }
    } else {
      // Direct Clipboard copy fallback
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareToastText('লিঙ্ক ক্লিপবোর্ডে কপি হয়েছে!');
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
      } catch (err) {
        console.error('Clipboard copy failed:', err);
      }
    }
  };

  // Load articles from DB Api
  const [scraperLoading, setScraperLoading] = useState(false);
  const [scraperStatus, setScraperStatus] = useState<{
    isRunning: boolean;
    lastRun: number;
    count: number;
    message: string;
  }>({
    isRunning: false,
    lastRun: 0,
    count: 0,
    message: 'এখনো স্ক্র্যাপ করা হয়নি'
  });

  const fetchScraperStatus = async () => {
    try {
      const res = await fetch('/api/scraper/scrape');
      if (res.ok) {
        const data = await res.json();
        if (data.status) {
          setScraperStatus(data.status);
        }
      }
    } catch (err) {
      console.error('Error loading scraper status:', err);
    }
  };

  const handleScrapeLatest = async () => {
    if (scraperLoading || scraperStatus.isRunning) return;
    try {
      setScraperLoading(true);
      setScraperStatus(prev => ({ ...prev, isRunning: true, message: 'খবর খোঁজা হচ্ছে...' }));
      const res = await fetch('/api/scraper/scrape', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        // Immediately load articles
        await fetchArticles(false);
      }
    } catch (err) {
      console.error('Manual scraping trigger failed:', err);
    } finally {
      setScraperLoading(false);
      await fetchScraperStatus();
    }
  };

  const fetchAds = async () => {
    try {
      const data = await getAdsAction();
      setAds(data.ads || []);
    } catch (err) {
      console.error('Error loading ads:', err);
    }
  };

  const fetchArticles = async (shouldSetLoading: boolean = false) => {
    try {
      if (shouldSetLoading) {
        setLoading(true);
      }
      const res = await fetch('/api/articles?published=true', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
        setDbSource(data.source || 'local');
      }
    } catch (err) {
      console.error('Error loading articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    trackPageView();
    let active = true;
    const timer = setTimeout(() => {
      if (active) {
        fetchArticles(false);
        fetchAds();
        fetchScraperStatus();
      }
    }, 50);

    // Poll current crawl statuses periodically
    const statusPoll = setInterval(() => {
      if (active) {
        fetchScraperStatus();
      }
    }, 10000);

    return () => {
      active = false;
      clearTimeout(timer);
      clearInterval(statusPoll);
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setRenderTimestamp(Date.now());
    }, 0);
    return () => clearTimeout(t);
  }, []);

  // Filter Categories
  const categoriesList = [
    { label: 'সর্বশেষ', value: 'all' },
    { label: 'বিশেষ সংবাদ', value: 'বিশেষ সংবাদ' },
    { label: 'রাজনীতি', value: 'রাজনীতি' },
    { label: 'বাংলাদেশ', value: 'বাংলাদেশ' },
    { label: 'অপরাধ', value: 'অপরাধ' },
    { label: 'বিশ্ব', value: 'বিশ্ব' },
    { label: 'বাণিজ্য', value: 'বাণিজ্য' },
    { label: 'মতামত', value: 'মতামত' },
    { label: 'খেলা', value: 'খেলা' },
    { label: 'বিনোদন', value: 'বিনোদন' }
  ];

  // Derive stories
  const filteredArticles = articles.filter(art => {
    // Show only currently published or already past publication date articles
    const isPublished = !art.publishDate || !renderTimestamp || new Date(art.publishDate).getTime() <= renderTimestamp;
    if (!isPublished) return false;

    const matchesCategory = selectedCategory === 'all' || art.category === selectedCategory;
    const matchesSearch = art.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          art.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Highlight blocks based on filters / roles
  const leadNews = filteredArticles.find(a => a.isLead) || filteredArticles[0];
  const subStories = filteredArticles.filter(a => a._id !== leadNews?._id).slice(0, 2);
  const secondaryStories = filteredArticles.filter(a => a._id !== leadNews?._id && !subStories.some(s => s._id === a._id));

  // Simple frequency counter for categories from the last 30 days of articles
  const trendingTopics = (() => {
    const frequency: { [key: string]: number } = {};
    const nowMs = renderTimestamp || 1779607026000; // 2026-05-24T07:17:06Z
    const thirtyDaysAgoMs = nowMs - 30 * 24 * 60 * 60 * 1000;

    articles.forEach(art => {
      let artTime = nowMs;
      if (art.publishDate) {
        const d = new Date(art.publishDate);
        if (!isNaN(d.getTime())) {
          artTime = d.getTime();
        }
      } else {
        // Fallback for seed data (May 24, 2026)
        artTime = new Date('2026-05-24T06:00:00.000Z').getTime();
      }

      const isPublished = !art.publishDate || !renderTimestamp || new Date(art.publishDate).getTime() <= renderTimestamp;

      if (isPublished && artTime >= thirtyDaysAgoMs && artTime <= nowMs) {
        const cat = art.category;
        if (cat) {
          frequency[cat] = (frequency[cat] || 0) + 1;
        }
      }
    });

    return Object.entries(frequency)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  })();

  const siteSchemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsMediaOrganization",
        "@id": "https://manabadhikarkhabar.com/#organization",
        "name": "মানবাধিকার খবর",
        "alternateName": "Manabadhikar Khabar",
        "url": "https://manabadhikarkhabar.com",
        "logo": "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=400&q=80",
        "description": "দেশ ও বিদেশের সর্বশেষ সত্য ও বস্তুনিষ্ঠ খবরের নির্ভরযোগ্য অনলাইন নিউজ পোর্টাল।",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "ঢাকা",
          "addressRegion": "ঢাকা",
          "addressCountry": "BD"
        }
      }
    ]
  };

  return (
    <div className="w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchemaData) }}
      />
      
      {/* Top Banner Ad */}
      <div className="max-w-7xl mx-auto px-4 mt-3 hidden md:block animate-fade-in">
        <AdBanner position="top_banner" aspectRatio="aspect-[728/90]" />
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 w-full flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-500">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bangla font-semibold text-lg text-gray-700">তথ্য লোড হচ্ছে...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500 max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
            <p className="font-bangla font-semibold text-xl text-gray-800 mb-2">কোন সংবাদ পাওয়া যায়নি</p>
            <p className="font-bangla text-gray-500 text-sm">আপনার সার্চ বা সিলেক্টকৃত ক্যাটেগরিতে এই মুহূর্তে নতুন কোনো খবর নেই। অন্য ক্যাটেগরি চেষ্টা করুন বা এডমিন ড্যাশবোর্ড থেকে নতুন খবর যোগ করুন।</p>
            <Link href="/admin" className="mt-6 bg-red-700 text-white px-5 py-2.5 rounded font-bangla font-bold hover:bg-red-800 transition-colors">
              নতুন সংবাদ পোস্ট করুন
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 md:gap-8 hover:no-underline">
            
            {/* Left/Main Column (9 Cols on large) */}
            <div className="lg:col-span-9">
              
              {/* Lead Story Section */}
              {leadNews && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 border-b border-gray-300 pb-4 sm:pb-6 mb-4 sm:mb-6">
                  
                  {/* Main Headline */}
                  <div 
                    onClick={() => setSelectedArticle(leadNews)}
                    className="md:col-span-8 group cursor-pointer relative pr-0 md:pr-4"
                  >
                     <div className="relative w-full aspect-[16/9] mb-4 overflow-hidden rounded bg-gray-100 border border-gray-200">
                        <LazyImage 
                          src={leadNews.imgUrl} 
                          alt={leadNews.title} 
                          fill
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-3 left-3 bg-red-700 text-white text-[12px] font-bold px-2 py-0.5 rounded shadow z-20">
                          {leadNews.category}
                        </span>
                     </div>
                     <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[40px] leading-[1.25] font-[900] text-gray-900 group-hover:text-red-700 transition-colors mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-serif-bangla), Georgia, serif' }}>
                       {leadNews.title}
                     </h2>
                     <p className="text-gray-700 text-sm sm:text-[15px] md:text-[17px] leading-[1.6] line-clamp-3 sm:line-clamp-none">
                       {leadNews.content}
                     </p>
                     
                     {/* Clean printed/metadata bar */}
                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-55/60 border border-gray-150 py-2 px-3 rounded-lg mt-3 sm:mt-4 no-print gap-1.5 sm:gap-2">
                       <div className="flex flex-wrap gap-2 sm:gap-4 text-gray-500 font-medium text-[11px] sm:text-[13px] items-center">
                         <span>লেখক: <strong className="text-gray-700">{leadNews.author}</strong></span>
                         <span>•</span>
                         <span>{leadNews.time}</span>
                       </div>
                       <button 
                         onClick={(e) => handlePrint(e, leadNews)}
                         className="flex items-center gap-1 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 hover:text-red-700 font-bangla font-bold text-[11px] px-2.5 py-1 rounded transition-colors cursor-pointer shadow-sm active:scale-95"
                         title="মুদ্রণ বা প্রিন্ট করুন"
                       >
                         <Printer className="w-3.5 h-3.5" />
                         <span>প্রিন্ট করুন</span>
                       </button>
                     </div>
                  </div>
 
                  {/* Sub Headlines Next to Main (Desktop) */}
                  <div className="md:col-span-4 flex flex-col gap-6 md:border-l md:border-gray-200 md:pl-5">
                    {subStories.map((sub, sIdx) => (
                      <div 
                        key={sub._id} 
                        onClick={() => setSelectedArticle(sub)}
                        className={`group cursor-pointer ${sIdx > 0 ? 'border-t border-gray-200 pt-5' : ''}`}
                      >
                        <div className="relative w-full aspect-[3/2] mb-3 overflow-hidden rounded bg-gray-100 border border-gray-200">
                          <LazyImage 
                            src={sub.imgUrl} 
                            alt={sub.title} 
                            fill
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <h3 className="text-[20px] font-bold text-gray-900 group-hover:text-blue-700 leading-snug transition-colors" style={{ fontFamily: 'var(--font-serif-bangla)' }}>
                          {sub.title}
                        </h3>
                        
                        <div className="flex justify-between items-center text-gray-400 text-[12px] mt-2 font-medium bg-gray-55/45 py-1 px-2 rounded border border-gray-150/40 no-print">
                          <div className="flex gap-2">
                            <span>{sub.category}</span>
                            <span>•</span>
                            <span>{sub.time}</span>
                          </div>
                          <button 
                            onClick={(e) => handlePrint(e, sub)}
                            className="text-gray-400 hover:text-red-700 flex items-center gap-1 cursor-pointer font-bold font-bangla text-[10px]"
                            title="সংবাদ প্রিন্ট করুন"
                          >
                            <Printer className="w-3 h-3 text-gray-450 hover:text-red-700 transition-colors" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {subStories.length === 0 && (
                      <p className="text-sm text-gray-400 italic">কোন অতিরিক্ত উপ-সংবাদ নেই।</p>
                    )}
                  </div>
 
                </div>
              )}
 
              {/* Bottom Grid for Secondary Stories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 pb-4 sm:pb-6 animate-fade-in">
                {secondaryStories.map(story => (
                  <div 
                    key={story._id} 
                    onClick={() => setSelectedArticle(story)}
                    className="flex flex-col group cursor-pointer border-b border-gray-200 sm:border-b-0 sm:border-r last:sm:border-r-0 border-gray-200 pb-4 sm:pb-0 sm:pr-4 last:sm:pr-0"
                  >
                     <div className="relative w-full aspect-[3/2] mb-3 overflow-hidden rounded bg-gray-100 border border-gray-200">
                       <LazyImage src={story.imgUrl} alt={story.title} fill className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                       <span className="absolute top-2 left-2 bg-gray-800/80 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded z-20">
                         {story.category}
                       </span>
                     </div>
                     <h3 className="text-base sm:text-[19px] font-bold text-gray-900 group-hover:text-blue-700 leading-snug transition-colors mb-1.5 sm:mb-2" style={{ fontFamily: 'var(--font-serif-bangla)' }}>
                        {story.title}
                     </h3>
                     <p className="text-gray-650 text-[13px] sm:text-[14px] line-clamp-2 sm:line-clamp-3 leading-relaxed mb-3 sm:mb-4">
                       {story.content}
                     </p>
                     
                     <div className="flex justify-between items-center text-gray-400 text-[12px] mt-auto pt-2 border-t border-gray-150/40 no-print">
                       <span>{story.time}</span>
                       <button 
                         onClick={(e) => handlePrint(e, story)}
                         className="text-gray-400 hover:text-red-700 flex items-center justify-center p-1 hover:bg-gray-100 rounded transition-all cursor-pointer"
                         title="প্রিন্ট করুন"
                       >
                         <Printer className="w-3.5 h-3.5 text-gray-400 hover:text-red-700 animate-pulse" />
                       </button>
                     </div>
                  </div>
                ))}
              </div>
 
            </div>
 
            {/* Right Sidebar (3 Cols) — separated visually on mobile */}
            <aside className="lg:col-span-3 border-t lg:border-t-0 border-gray-200 pt-4 lg:pt-0 mt-2 lg:mt-0">


              {/* Latest & Popular Tabs Block */}
              <div className="border border-gray-300">
                 <div className="flex">
                   <button 
                    onClick={() => setActiveTab('latest')}
                    className={`flex-1 py-2.5 text-[17px] font-bold text-center transition-colors border-b-[3px] ${activeTab === 'latest' ? 'text-red-700 border-red-700 bg-white' : 'text-gray-600 border-transparent bg-gray-50 hover:text-red-700'}`}
                   >
                     সর্বশেষ
                   </button>
                   <button 
                    onClick={() => setActiveTab('popular')}
                    className={`flex-1 py-2.5 text-[17px] font-bold text-center transition-colors border-b-[3px] border-l border-l-gray-300 ${activeTab === 'popular' ? 'text-red-700 border-red-700 bg-white' : 'text-gray-600 border-transparent bg-gray-50 hover:text-red-700'}`}
                   >
                     পঠিত
                   </button>
                 </div>
                 
                 <div className="p-4 flex flex-col pt-5">
                   {filteredArticles.slice(0, 5).map((art, i) => (
                     <div key={art._id} onClick={() => setSelectedArticle(art)} className={`flex gap-4 group cursor-pointer pb-4 ${i !== 4 ? 'border-b border-gray-200 mb-4' : ''}`}>
                       <span className="text-4xl font-[900] text-gray-200 font-serif leading-none mt-1 opacity-80" style={{ fontFamily: 'var(--font-serif-bangla)'}}>
                         {i + 1}
                       </span>
                       <div>
                         <h4 className="text-[17px] font-bold text-gray-900 group-hover:text-red-700 leading-snug transition-colors" style={{ fontFamily: 'var(--font-serif-bangla)' }}>
                           {art.title}
                         </h4>
                         <span className="text-[12px] text-gray-500 font-medium font-bangla">{art.category}</span>
                       </div>
                     </div>
                   ))}
                   {filteredArticles.length === 0 && (
                     <p className="text-sm text-gray-400 text-center py-6">কোন তথ্য উপলব্ধ নেই</p>
                   )}
                 </div>
              </div>
 
              {/* Recent History (Sessional Click/Read Tracker) */}
              {recentHistory.length > 0 && (
                <div className="border border-gray-300 mt-6 md:mt-8 p-4 bg-slate-50/50 font-bangla">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <History className="w-5 h-5 text-red-700 font-bold" />
                      <h3 className="text-[17px] font-extrabold text-[#030712] uppercase tracking-tight font-sans">
                        পঠিত সংবাদের ইতিহাস
                      </h3>
                    </div>
                    <button 
                      onClick={() => {
                        setRecentHistory([]);
                        try {
                          sessionStorage.removeItem('recent_articles_history');
                        } catch (e) {
                          // ignore
                        }
                      }}
                      className="text-[11px] text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-0.5 rounded-full font-bold cursor-pointer transition-all"
                    >
                      মুছে ফেলুন
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-450 font-semibold mb-3 leading-normal font-sans">
                    এই সেশনে আপনার ক্লিক করা বা পড়া সংবাদের তালিকা (সর্বোচ্চ ৫টি)।
                  </p>
                  
                  <div className="space-y-3">
                    {recentHistory.map((art) => (
                      <div 
                        key={'hist-' + art._id} 
                        onClick={() => setSelectedArticle(art)}
                        className="group flex gap-3 cursor-pointer items-start hover:bg-white p-1.5 rounded transition-all duration-200 border border-transparent hover:border-gray-200"
                      >
                        {art.imgUrl && (
                          <div className="relative w-12 h-12 rounded overflow-hidden shrink-0 border border-gray-205 shadow-xs">
                            <LazyImage 
                              src={art.imgUrl} 
                              alt={art.title} 
                              fill 
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 font-bangla">
                           <h4 className="text-[13.5px] font-bold text-gray-900 group-hover:text-red-700 leading-snug line-clamp-2 transition-colors font-bangla" style={{ fontFamily: 'var(--font-serif-bangla)' }}>
                            {art.title}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-medium font-bangla block mt-0.5">
                            {art.category} • {art.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
 
              {/* Trending Topics (Simple Frequency Counter for Last 30 Days of Articles) */}
              <div className="border border-gray-300 mt-6 md:mt-8 p-4 font-bangla">
                <div className="flex items-center gap-2 border-b border-gray-200 pb-2.5 mb-3">
                  <TrendingUp className="w-5 h-5 text-red-700 font-bold" />
                  <h3 className="text-[17px] font-extrabold text-gray-950 uppercase tracking-tight font-sans">
                    আজকের ট্রেন্ডিং বিষয়
                  </h3>
                </div>
                <p className="text-[11px] text-gray-400 font-semibold mb-4 leading-normal font-sans">
                  গত ৩০ দিনে প্রকাশিত সংবাদ সমূহের তথ্য বিশ্লেষণ করে স্বয়ংক্রিয়ভাবে তৈরি কৃত্রিম বুদ্ধিমত্তার ট্রেন্ডস।
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {trendingTopics.length === 0 ? (
                    <span className="text-xs text-gray-400 italic font-medium font-sans">কোনো ট্রেন্ডিং বিষয় নেই</span>
                  ) : (
                    trendingTopics.map((topic) => {
                      const isSelected = selectedCategory === topic.name;
                      return (
                        <button
                          key={'trend-' + topic.name}
                          onClick={() => router.push(`?category=${isSelected ? 'all' : topic.name}`)}
                          className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer font-sans ${
                            isSelected 
                              ? 'bg-red-700 border-red-700 text-white shadow-sm ring-1 ring-red-700' 
                              : 'bg-red-50 hover:bg-red-700 hover:text-white hover:border-red-700 border-red-100 text-red-800'
                          }`}
                        >
                          <span className="font-sans">#{topic.name}</span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none ${
                            isSelected 
                              ? 'bg-white/25 text-white' 
                              : 'bg-red-100 text-red-900 group-hover:bg-red-900/10 group-hover:text-white'
                          }`}>
                            {toBengaliDigits(topic.count)}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
 
              {/* Sidebar Ad Banners — multiple positions */}
              <AdBanner position="sidebar" aspectRatio="aspect-[3/4]" className="mt-6 md:mt-8" maxAds={3} />
              <AdBanner position="in_article" aspectRatio="aspect-[3/2]" className="mt-4" />
 
            </aside>
 
          </div>
        )}
        
        {/* Photo Gallery Section */}
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t-[3px] border-black pb-6 sm:pb-8">
           <div className="flex justify-between items-end mb-4 sm:mb-6">
             <h2 className="text-xl sm:text-2xl md:text-3xl font-[900] text-gray-900 border-l-4 sm:border-l-8 border-red-700 pl-2 sm:pl-3 leading-none" style={{ fontFamily: 'var(--font-serif-bangla)' }}>
               ছবিতে সংবাদ
             </h2>
             <span className="text-gray-400 font-medium text-sm">লাইভ গ্যালারি</span>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-4 md:gap-6">
              {filteredArticles.slice(0, 4).map((art, i) => (
                <div key={'gal-'+art._id} onClick={() => setSelectedArticle(art)} className="group cursor-pointer">
                  <div className="relative aspect-[4/3] rounded overflow-hidden mb-3 bg-gray-100 border border-gray-200">
                    <LazyImage src={art.imgUrl} alt="Gallery" fill className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-20"></div>
                  </div>
                  <h4 className="text-[13px] sm:text-[16px] font-bold text-gray-900 leading-snug group-hover:text-red-700 transition-colors line-clamp-2" style={{ fontFamily: 'var(--font-serif-bangla)' }}>
                    {art.title}
                  </h4>
                </div>
              ))}
           </div>
        </div>
 
      </main>

      {/* Hidden Print-Specific Container */}
      {printTarget && (
        <div id="article-print-area" className="hidden print:block">
          <div className="max-w-3xl mx-auto p-8 font-serif text-black leading-relaxed">
            {/* Clean Newspaper Masthead */}
            <div className="border-b-4 border-double border-black pb-4 mb-6 text-center">
              <h1 className="text-4xl font-black tracking-tight" style={{ fontFamily: 'var(--font-serif-bangla), Georgia, serif' }}>
                মানবাধিকার খবর
              </h1>
              <div className="flex justify-between items-center text-xs mt-2 font-mono uppercase tracking-widest border-t border-black/15 pt-2">
                <span>স্থান: ঢাকা, বাংলাদেশ</span>
                <span>তারিখ: রবি, ২৪ মে ২০২৬</span>
                <span>ওয়েব: manabadhikarkhabar.com</span>
              </div>
            </div>

            {/* Article Category */}
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 font-sans">
              {printTarget.category}
            </div>

            {/* Headline */}
            <h2 className="text-3xl font-bold leading-tight mb-4" style={{ fontFamily: 'var(--font-serif-bangla), Georgia, serif' }}>
              {printTarget.title}
            </h2>

            {/* Metadata */}
            <div className="flex gap-4 text-xs text-gray-600 border-b border-gray-200 pb-3 mb-6 font-medium">
              <span>লেখক: {printTarget.author}</span>
              <span>•</span>
              <span>প্রকাশকাল: {printTarget.time}</span>
            </div>

            {/* Optional Image */}
            {printTarget.imgUrl && (
              <div className="relative mb-6 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={printTarget.imgUrl} 
                  alt={printTarget.title} 
                  className="max-h-[300px] mx-auto object-cover border border-gray-300 rounded grayscale"
                />
                <p className="text-[11px] text-gray-500 mt-2 italic font-sans">চিত্র: {printTarget.title}</p>
              </div>
            )}

            {/* Paragraphs of text */}
            <div className="text-[15px] leading-[1.8] text-gray-900 whitespace-pre-line font-medium" style={{ fontFamily: 'var(--font-serif-bangla), Georgia, serif' }}>
              {printTarget.content}
            </div>

            {/* Footer of the printed page */}
            <div className="border-t border-dashed border-gray-300 mt-12 pt-4 text-center text-xs text-gray-500 font-medium font-sans">
              <p>মানবাধিকার খবর — সত্য ও ন্যায়ের পক্ষে সৎ সাংবাদিকতা</p>
              <p className="text-[10px] mt-1 text-gray-400">© ২০২৬ মানবাধিকার খবর | প্রিন্ট কপি</p>
            </div>
          </div>
        </div>
      )}

      {/* Selected Article Detailed Reader Modal overlay */}
      {selectedArticle && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-6 no-print animate-fade-in"
          onClick={() => setSelectedArticle(null)}
        >
          <div 
            className={`relative rounded-xl shadow-2xl border transition-colors duration-300 max-w-3xl w-full max-h-[92vh] overflow-y-auto font-sans flex flex-col ${
              isNightMode 
                ? 'bg-slate-900 border-slate-800 text-slate-100' 
                : 'bg-white border-gray-200 text-gray-800'
            }`}
            onClick={(e) => e.stopPropagation()}
            onScroll={(e) => {
              const target = e.currentTarget;
              const scrollTop = target.scrollTop;
              const scrollHeight = target.scrollHeight;
              const clientHeight = target.clientHeight;
              const totalScroll = scrollHeight - clientHeight;
              if (totalScroll > 0) {
                setReadingProgress((scrollTop / totalScroll) * 100);
              } else {
                setReadingProgress(0);
              }
            }}
          >
            {/* Modal Header Actions */}
            <div className={`relative flex flex-wrap items-center justify-between border-b px-4 sm:px-6 py-3 sm:py-4 sticky top-0 backdrop-blur-md z-10 transition-colors duration-300 gap-2 ${
              isNightMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-gray-200'
            }`}>
              {/* Visual Reading Progress Bar */}
              <div 
                className="absolute bottom-0 left-0 h-[3px] bg-red-700 transition-all duration-75 z-20" 
                style={{ width: `${readingProgress}%` }} 
              />

              <div className="flex items-center gap-2 mb-2 sm:mb-0">
                <span className={`text-xs uppercase tracking-wider font-extrabold px-2.5 py-1 rounded font-sans transition-colors ${
                  isNightMode ? 'text-red-400 bg-red-950/40 border border-red-900/40' : 'text-red-700 bg-red-50 border border-red-105'
                }`}>
                  {selectedArticle.category}
                </span>
                <span className={`text-xs font-medium hidden sm:inline transition-colors ${isNightMode ? 'text-slate-400' : 'text-gray-400'}`}>
                  • {selectedArticle.time}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {/* Night Mode Toggle */}
                <button 
                  onClick={toggleNightMode}
                  className={`flex items-center gap-1.5 border text-xs font-bold px-3 py-1.5 rounded transition-all cursor-pointer shadow-sm hover:shadow active:scale-95 duration-200 ${
                    isNightMode 
                      ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-500 font-sans' 
                      : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700 font-sans'
                  }`}
                  title={isNightMode ? 'লাইট মোড চালু করুন' : 'নাইট মোড চালু করুন'}
                >
                  {isNightMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isNightMode ? 'লাইট মোড' : 'নাইট মোড'}</span>
                </button>

                {/* Font Size Selector (A- / A+) */}
                <div className={`flex items-center border rounded shadow-sm text-xs font-bold duration-200 overflow-hidden font-sans ${
                  isNightMode 
                    ? 'border-slate-800 bg-slate-950/40 text-slate-300' 
                    : 'border-gray-200 bg-gray-55 text-gray-700'
                }`}>
                  <button
                    onClick={() => setReaderFontSize(prev => Math.max(14, prev - 2))}
                    disabled={readerFontSize <= 14}
                    className={`px-3 py-1.5 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-50 hover:text-red-700 ${
                      isNightMode ? 'hover:bg-slate-800 hover:text-white' : ''
                    }`}
                    title="ফন্ট সাইজ কমান (A-)"
                  >
                    A-
                  </button>
                  <span className={`px-2.5 py-1.5 border-x text-[12px] select-none ${
                    isNightMode ? 'border-slate-800' : 'border-gray-200'
                  }`}>
                    {toBengaliDigits(readerFontSize)}
                  </span>
                  <button
                    onClick={() => setReaderFontSize(prev => Math.min(28, prev + 2))}
                    disabled={readerFontSize >= 28}
                    className={`px-3 py-1.5 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-50 hover:text-red-700 ${
                      isNightMode ? 'hover:bg-slate-800 hover:text-white' : ''
                    }`}
                    title="ফন্ট সাইজ বাড়ান (A+)"
                  >
                    A+
                  </button>
                </div>

                {/* Native Web Share API / Clipboard Fallback Button */}
                <button 
                  onClick={(e) => handleShare(e, selectedArticle)}
                  className={`flex items-center gap-1.5 border text-xs font-bold px-3 py-1.5 rounded transition-all cursor-pointer shadow-sm hover:shadow active:scale-95 duration-200 ${
                    isNightMode 
                      ? 'bg-blue-600/10 hover:bg-blue-600/20 border-blue-500/30 text-blue-400 font-sans' 
                      : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 font-sans'
                  }`}
                  title="সংবাদটি শেয়ার বা লিঙ্ক কপি করুন"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>শেয়ার করুন</span>
                </button>
 
                {/* SEO Dedicated Page URL Link */}
                <Link 
                  href={`/${generateSlug(selectedArticle.title)}`}
                  className={`flex items-center gap-1.5 border text-xs font-bold px-3 py-1.5 rounded transition-all cursor-pointer shadow-sm hover:shadow active:scale-95 duration-200 ${
                    isNightMode 
                      ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 hover:text-white font-sans' 
                      : 'bg-gray-150 hover:bg-gray-250 border-gray-300 text-gray-750 hover:text-black font-sans'
                  }`}
                  title="এই খবরের ডেডিকেটেড এসইও পেজ ওপেন করুন"
                >
                  <Copy className="w-3.5 h-3.5 text-gray-500" />
                  <span className="hidden md:inline font-bangla">বিস্তারিত পৃষ্ঠা</span>
                </Link>
 
                {/* Print Button */}
                <button 
                  onClick={(e) => handlePrint(e, selectedArticle)}
                  className="flex items-center gap-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-3.5 py-1.5 rounded transition-all cursor-pointer shadow-sm hover:shadow active:scale-95 font-sans"
                  title="সংবাদটি প্রিন্ট দিন"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট করুন</span>
                </button>
                
                {/* Close Button */}
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                    isNightMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-label="বন্ধ করুন"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Absolute Success feedback toast overlay */}
            {shareSuccess && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-green-600 border border-green-550 text-white font-bold text-xs py-2 px-4 rounded-full shadow-xl z-50 flex items-center gap-1.5 animate-bounce font-bangla">
                <Check className="w-4 h-4" />
                <span>{shareToastText}</span>
              </div>
            )}

            {/* Read Content Area */}
            <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 flex-1 text-left">
              <h1 
                className={`text-xl sm:text-2xl md:text-[34px] font-[900] leading-tight tracking-tight transition-colors duration-300 ${
                  isNightMode ? 'text-white' : 'text-gray-900'
                }`}
                style={{ fontFamily: 'var(--font-serif-bangla), Georgia, serif' }}
              >
                {selectedArticle.title}
              </h1>

              <div className={`flex flex-wrap items-center gap-4 text-[13px] font-semibold border-b pb-4 font-sans transition-colors duration-300 ${
                isNightMode ? 'text-slate-400 border-slate-800' : 'text-gray-500 border-gray-150'
              }`}>
                <span>লেখক: <span className={`font-bold transition-colors ${isNightMode ? 'text-slate-200' : 'text-gray-800'}`}>{selectedArticle.author}</span></span>
                <span className={`transition-colors ${isNightMode ? 'text-slate-700' : 'text-gray-300'}`}>|</span>
                <span>প্রকাশকাল: <span className={`transition-colors ${isNightMode ? 'text-slate-200' : 'text-gray-800'}`}>{selectedArticle.time}</span></span>
                <span className={`transition-colors ${isNightMode ? 'text-slate-700' : 'text-gray-300'}`}>|</span>
                <span>উৎস: <span className={`font-bold transition-colors ${isNightMode ? 'text-red-400' : 'text-red-700'}`}>মানবাধিকার খবর</span></span>
                <span className={`transition-colors ${isNightMode ? 'text-slate-700' : 'text-gray-300'}`}>|</span>
                <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold font-bangla border transition-colors ${
                  isNightMode ? 'text-emerald-400 bg-emerald-950/30 border-emerald-900/40' : 'text-emerald-700 bg-emerald-50 border-emerald-100'
                }`}>
                  <Clock className={`w-3.5 h-3.5 transition-colors ${isNightMode ? 'text-emerald-500' : 'text-emerald-600'}`} />
                  <span>{toBengaliDigits(Math.max(1, Math.ceil((selectedArticle.content || '').trim().split(/\s+/).length / 200)))} মিনিট পড়ার সময়</span>
                </span>
              </div>

              {/* Real-time Reading Speed and Stats Gauge Widget */}
              <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans transition-colors duration-300 ${
                isNightMode 
                  ? 'bg-slate-950/50 border-slate-800 text-slate-200' 
                  : 'bg-[#F9FAFB] border-gray-200 text-gray-700'
              }`}>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-red-650 animate-pulse"></span>
                    <span>সেশন সময়:</span>
                    <strong className={isNightMode ? 'text-white font-bold' : 'text-gray-900 font-bold'}>
                      {formatBengaliDuration(activeReadingTime)}
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>অগ্রগতি:</span>
                    <strong className={isNightMode ? 'text-white font-bold' : 'text-gray-900 font-bold'}>
                      {toBengaliDigits(Math.round(readingProgress))}%
                    </strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs border-t md:border-t-0 pt-3 md:pt-0 border-gray-200/50">
                  <span className="text-[11px] font-semibold text-gray-400">গতি পরিমাপক (WPM):</span>
                  {activeReadingTime < 5 ? (
                    <span className={`px-2.5 py-1 rounded text-[11px] font-semibold animate-pulse ${
                      isNightMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'
                    }`}>
                      পরিমাপ করা হচ্ছে...
                    </span>
                  ) : (
                    <span className={`px-3 py-1 rounded font-extrabold text-xs flex items-center gap-1.5 ${
                      isNightMode ? 'bg-amber-950/30 text-amber-400 border border-amber-900/40' : 'bg-amber-50 text-amber-805 border border-amber-100'
                    }`}>
                      ⚡ <span>{sessionWpm ? toBengaliDigits(sessionWpm) : '---'} শব্দ/মি.</span>
                    </span>
                  )}

                  <span className="text-gray-300 mx-1">|</span>

                  <span className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 ${
                    isNightMode ? 'bg-slate-900/80 text-slate-300 border border-slate-800' : 'bg-white text-gray-600 border border-gray-200'
                  }`} title="আপনার আগের সমস্ত সেশনের গড় গতি">
                    গড় গতি: <strong className={isNightMode ? 'text-white font-extrabold' : 'text-gray-900 font-extrabold'}>{toBengaliDigits(lifetimeWpm)} শব্দ/মি.</strong>
                    <span className="text-gray-400 text-[10px] font-normal">({toBengaliDigits(totalArticlesRead)}টি সংবাদ)</span>
                  </span>

                  {totalArticlesRead > 0 && (
                    <button
                      onClick={() => {
                        if (confirm('আপনার পঠিত গতি পরিসংখ্যান রিসেট করতে চান?')) {
                          setTotalArticlesRead(0);
                          setLifetimeWpm(150);
                          try {
                            localStorage.removeItem('kachua_articles_read_count');
                            localStorage.removeItem('kachua_lifetime_wpm');
                          } catch (e) {}
                        }
                      }}
                      className="ml-1 text-[10px] text-red-600 hover:text-red-700 hover:underline cursor-pointer font-bold font-bangla"
                    >
                      রিসেট
                    </button>
                  )}
                </div>
              </div>

              {selectedArticle.imgUrl && (
                <div className={`relative w-full aspect-[16/9] rounded-lg overflow-hidden border transition-colors ${
                  isNightMode ? 'bg-slate-950 border-slate-850' : 'bg-gray-100 border-gray-200'
                }`}>
                  <LazyImage 
                    src={selectedArticle.imgUrl} 
                    alt={selectedArticle.title}
                    fill
                    className={`object-cover transition-all ${isNightMode ? 'brightness-90 hover:brightness-100' : ''}`}
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <div 
                className={`leading-[1.9] whitespace-pre-line font-medium text-justify font-bangla-serif transition-colors duration-300 ${
                  isNightMode ? 'text-slate-300' : 'text-gray-800'
                }`}
                style={{ 
                  fontFamily: 'var(--font-sans), Georgia, serif',
                  fontSize: `${readerFontSize}px`
                }}
              >
                {selectedArticle.content}
              </div>

              <div className={`border-l-4 border-amber-500 p-4 rounded-r-lg mt-6 text-xs font-sans italic transition-colors ${
                isNightMode ? 'bg-amber-500/5 border-amber-600 text-amber-500/80' : 'bg-amber-50/50 text-gray-650'
              }`}>
                * এই সংবাদপত্রের উপাদানসমূহ কোনো অননুমোদিত উপায়ে পুনর্মুদ্রণ বা বিতরণ করা আইনত দণ্ডনীয় অপরাধ।
              </div>

              {/* Related Articles Component */}
              <RelatedArticles 
                category={selectedArticle.category} 
                excludeId={selectedArticle._id} 
                onSelectArticle={(art) => setSelectedArticle(art)} 
                isNightMode={isNightMode}
              />
            </div>

            {/* Footer indicator */}
            <div className={`border-t px-6 py-4 flex justify-between items-center text-xs font-semibold font-sans transition-colors duration-300 ${
              isNightMode ? 'border-slate-850 bg-slate-950 text-slate-400' : 'border-gray-150 bg-gray-50/80 text-gray-500'
            }`}>
              <span>© ২০২৬ মানবাধিকার খবর ডিজিটাল</span>
              <button 
                onClick={() => setSelectedArticle(null)}
                className={`hover:underline font-bold transition-colors ${isNightMode ? 'text-red-400' : 'text-red-700'}`}
              >
                পড়া শেষ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-500">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bangla font-semibold text-lg text-gray-700">লোড হচ্ছে...</p>
      </div>
    }>
      <PageContent />
    </Suspense>
  );
}
