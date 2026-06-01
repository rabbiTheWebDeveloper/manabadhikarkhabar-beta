'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, Calendar, User, Printer, 
  Settings, Facebook, Twitter, Youtube, MapPin, Clock,
  Mail, Phone, Smartphone
} from 'lucide-react';
import { Article, Author } from '@/lib/types';
import { trackPageView } from '@/lib/analytics';
import { WeatherWidget } from '@/components/weather-widget';
import { RelatedArticles } from '@/components/related-articles';
import { generateSlug } from '@/lib/utils';
import AdBanner from '@/components/AdBanner';

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

interface ArticleDetailClientProps {
  article: Article;
  sourceLabel: string;
  authorData?: Author | null;
}

export function ArticleDetailClient({ article, sourceLabel, authorData }: ArticleDetailClientProps) {
  // Sync viewed article to recent session history
  useEffect(() => {
    trackPageView();
  }, [article?._id]);

  useEffect(() => {
    if (article) {
      try {
        const stored = sessionStorage.getItem('recent_articles_history');
        const prev: Article[] = stored ? JSON.parse(stored) : [];
        const filtered = prev.filter((item: Article) => item._id !== article._id);
        const updated = [article, ...filtered].slice(0, 5);
        sessionStorage.setItem('recent_articles_history', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
    }
  }, [article]);

  let isoDate = new Date().toISOString();
  try {
    if (article.time) {
      const parsed = Date.parse(article.time);
      if (!isNaN(parsed)) {
        isoDate = new Date(parsed).toISOString();
      }
    }
  } catch (e) {
    // ignore
  }

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "image": [article.imgUrl].filter(Boolean),
    "datePublished": isoDate,
    "dateModified": isoDate,
    "author": [{
      "@type": "Person",
      "name": article.author,
    }],
    "publisher": {
      "@type": "Organization",
      "name": "মানবাধিকার খবর",
      "logo": {
        "@type": "ImageObject",
        "url": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=400&q=80"
      }
    },
    "description": (article.content || '').substring(0, 160).replace(/\r?\n/g, ' ') + '...'
  };

  return (
    <div className="w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      
      {/* Top banner advertisement spot */}
      <div className="max-w-7xl mx-auto px-4 pt-4 no-print">
        <AdBanner position="top_banner" className="w-full" />
      </div>

      {/* Article Detail Body layout */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
          
          {/* Left Column (9 Cols) */}
          <div className="lg:col-span-9">
            <article className="bg-white rounded-2xl border border-gray-250/70 p-4 sm:p-6 md:p-10 shadow-sm space-y-4 sm:space-y-6">
          
          {/* Category Pill and Print */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-150 no-print">
            <span className="text-red-700 font-extrabold text-xs uppercase tracking-wider bg-red-50 border border-red-100 px-3 py-1.5 rounded-full font-bangla">
              {article.category}
            </span>
            
            <div className="flex items-center gap-2 font-bangla">
              <button 
                onClick={() => {
                  if (typeof window !== 'undefined') window.print();
                }}
                className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold px-3 py-2 rounded-lg transition-all cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট করুন</span>
              </button>
            </div>
          </div>

          {/* Heading */}
          <h1 
            className="text-xl sm:text-2xl md:text-4xl font-[900] text-gray-900 leading-tight tracking-tight pt-2"
            style={{ fontFamily: 'var(--font-serif-bangla), Georgia, serif' }}
          >
            {article.title}
          </h1>

          {/* Metadata Block */}
          <div className="flex flex-wrap items-center gap-y-3.5 gap-x-4 text-[13px] font-semibold text-gray-500 border-b border-gray-150 pb-5">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-gray-400" />
              <span>লেখক: <span className="text-gray-800 font-bold">{article.author}</span></span>
            </span>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>ক্যালেন্ডার প্রকাশকাল: <span className="text-gray-800">{article.time}</span></span>
            </span>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <span>উৎস: <span className="text-red-700 font-bold">মানবাধিকার খবর</span></span>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs font-bold font-bangla border border-emerald-100">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{toBengaliDigits(Math.max(1, Math.ceil((article.content || '').trim().split(/\s+/).length / 200)))} মিনিট পড়ার সময়</span>
            </span>
          </div>

          {/* Image */}
          {article.imgUrl && (
            <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-xs">
              <Image 
                src={article.imgUrl} 
                alt={article.title}
                fill
                className="object-cover"
                priority
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Content Body with gorgeous Bangla formatting */}
          <p 
            className="text-[15px] sm:text-[17px] md:text-[18px] leading-[1.7] sm:leading-[1.8] text-gray-850 whitespace-pre-line font-medium text-justify font-bangla pt-4"
          >
            {article.content}
          </p>

          {/* In-article advertisement spot */}
          <div className="my-6 border-y border-gray-100 py-4 no-print">
            <AdBanner position="in_article" className="w-full" />
          </div>

          {/* About the Author Section */}
          {authorData && (
            <div className="mt-12 p-6 bg-slate-50 border border-gray-200 rounded-xl space-y-4 no-print shadow-xs">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-red-700 font-sans flex items-center gap-2">
                  <User className="w-4 h-4 text-red-600" />
                  <span>লেখক পরিচিতি / About the Author</span>
                </h3>
              </div>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-300 shrink-0 shadow-sm">
                  <Image 
                    src={authorData.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                    alt={authorData.name}
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-center sm:text-left space-y-1.5 flex-1">
                  <h4 className="text-lg font-bold text-gray-900 font-sans">
                    {authorData.name}
                  </h4>
                  <p className="text-xs text-amber-600 font-bold uppercase tracking-wider font-sans">
                    {authorData.designation}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed font-sans">
                    {authorData.bio}
                  </p>
                  
                  {/* Author Contacts or Social Links */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs font-semibold text-gray-500 font-sans">
                    {authorData.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <a href={`mailto:${authorData.email}`} className="hover:text-red-600 transition-colors">{authorData.email}</a>
                      </span>
                    )}
                    {authorData.socialLinks?.facebook && (
                      <span className="flex items-center gap-1 border-l border-gray-200 pl-3">
                        <Facebook className="w-3.5 h-3.5 text-blue-600" />
                        <a href={authorData.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-red-700 transition-colors">Facebook</a>
                      </span>
                    )}
                    {authorData.socialLinks?.twitter && (
                      <span className="flex items-center gap-1 border-l border-gray-200 pl-3">
                        <Twitter className="w-3.5 h-3.5 text-blue-400" />
                        <a href={authorData.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-red-700 transition-colors">Twitter</a>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-amber-50/50 border-l-4 border-amber-500 p-4 rounded-r-lg mt-8 text-xs text-gray-600 font-sans italic no-print">
            * এই সংবাদপত্রের উপাত্ত ও ছবি যথাযথ অনুমোদন ব্যতীত প্রকাশনা বা অন্যান্য সাইটে কপি করা আইনত দণ্ডনীয় অপরাধ।
          </div>

          {/* Related Articles client component section - dynamic query by same category and exclude current article ID */}
          <div className="no-print">
            <RelatedArticles 
              category={article.category}
              excludeId={article._id}
              onSelectArticle={(art) => {
                if (typeof window !== 'undefined') {
                  window.location.href = `/${generateSlug(art.title)}`;
                }
              }}
            />
          </div>

        </article>
      </div>

      {/* Right Sidebar Column (3 Cols) */}
      <aside className="lg:col-span-3 space-y-4 sm:space-y-6 no-print animate-fade-in border-t lg:border-t-0 border-gray-200 pt-4 lg:pt-0 mt-2 lg:mt-0">
        <AdBanner position="sidebar" className="w-full" />
        <AdBanner position="in_article" className="w-full" />
        
        {/* Quick Links Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
          <h3 className="text-[17px] font-extrabold text-gray-900 border-b border-gray-150 pb-3 mb-4 font-bangla" style={{ fontFamily: 'var(--font-serif-bangla)' }}>
            জরুরী লিঙ্ক সমূহ
          </h3>
          <ul className="space-y-3 font-bangla text-[13.5px]">
            <li>
              <Link href="/" className="hover:text-red-700 transition-colors font-bold flex items-center gap-2 text-gray-705">
                <span className="text-red-600 font-bold">•</span> <span>হোমপেজ সংস্করণ</span>
              </Link>
            </li>
            <li>
              <Link href="/epaper" className="hover:text-red-700 transition-colors font-bold flex items-center gap-2 text-gray-705">
                <span className="text-red-600 font-bold">•</span> <span>ই-পেপার প্রকাশনা</span>
              </Link>
            </li>
          </ul>
        </div>
      </aside>

    </div>
  </main>

</div>
  );
}
