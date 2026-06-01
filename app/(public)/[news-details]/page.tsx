import { Metadata } from 'next';
import { getDb, Article, Author, INITIAL_AUTHORS } from '@/lib/db';
import { memoryArticles } from '@/app/api/articles/store';
import { ObjectId } from 'mongodb';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { ArticleDetailClient } from '@/components/article-detail-client';
import { generateSlug } from '@/lib/utils';

// Dynamic Metadata Generation for catching SEO crawlers
export async function generateMetadata(
  { params }: { params: Promise<{ 'news-details': string }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  const newsDetails = resolvedParams['news-details'];
  let article: Article | null = null;

  try {
    const { db, isUsingFallback } = await getDb();
    if (!isUsingFallback && db) {
      // 1. Try by exact MongoDB ObjectId
      if (ObjectId.isValid(newsDetails)) {
        const dbArt = await db.collection('articles').findOne({ _id: new ObjectId(newsDetails) });
        if (dbArt) {
          article = { ...dbArt, _id: dbArt._id.toString() } as Article;
        }
      }
      
      // 2. Try by raw string ID matching
      if (!article) {
        const dbArt = await db.collection('articles').findOne({ _id: newsDetails as any });
        if (dbArt) {
          article = { ...dbArt, _id: dbArt._id.toString() } as Article;
        }
      }

      // 3. Try by normalized dynamic slug matching
      if (!article) {
        const allArticles = await db.collection('articles').find({}).toArray();
        const matched = allArticles.find(a => generateSlug(a.title) === newsDetails);
        if (matched) {
          article = { ...matched, _id: matched._id.toString() } as Article;
        }
      }
    }
  } catch {
    // ignore
  }

  // Fallback to local memory articles
  if (!article) {
    article = memoryArticles.find(
      a => a._id === newsDetails || generateSlug(a.title) === newsDetails
    ) || null;
  }

  if (!article) {
    return {
      title: 'সংবাদ পাওয়া যায়নি - মানবাধিকার খবর',
      description: 'আপনার অনুরোধকৃত খবরটি ডেটাবেজে খুঁজে পাওয়া যায়নি।'
    };
  }

  const cleanDescription = article.content.substring(0, 160).replace(/\r?\n/g, ' ') + '...';

  return {
    title: `${article.title} | মানবাধিকার খবর`,
    description: cleanDescription,
    category: article.category,
    authors: [{ name: article.author }],
    alternates: {
      canonical: `https://manabadhikarkhabar.com/${generateSlug(article.title)}`,
    },
    openGraph: {
      title: article.title,
      description: cleanDescription,
      url: `/${generateSlug(article.title)}`,
      siteName: 'মানবাধিকার খবর',
      images: [
        {
          url: article.imgUrl,
          width: 800,
          height: 450,
          alt: article.title,
        }
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: cleanDescription,
      images: [article.imgUrl],
    }
  };
}

export default async function NewsDetailsPage(
  { params }: { params: Promise<{ 'news-details': string }> }
) {
  const resolvedParams = await params;
  const newsDetails = resolvedParams['news-details'];
  let article: Article | null = null;
  let sourceLabel = '';

  try {
    const { db, isUsingFallback } = await getDb();
    if (!isUsingFallback && db) {
      // 1. Try by exact MongoDB ObjectId
      if (ObjectId.isValid(newsDetails)) {
        const dbArt = await db.collection('articles').findOne({ _id: new ObjectId(newsDetails) });
        if (dbArt) {
          article = { ...dbArt, _id: dbArt._id.toString() } as Article;
          sourceLabel = '🟢 MONGO LIVE';
        }
      }
      
      // 2. Try by raw string ID matching
      if (!article) {
        const dbArt = await db.collection('articles').findOne({ _id: newsDetails as any });
        if (dbArt) {
          article = { ...dbArt, _id: dbArt._id.toString() } as Article;
          sourceLabel = '🟢 MONGO LIVE';
        }
      }

      // 3. Try by normalized dynamic slug matching
      if (!article) {
        const allArticles = await db.collection('articles').find({}).toArray();
        const matched = allArticles.find(a => generateSlug(a.title) === newsDetails);
        if (matched) {
          article = { ...matched, _id: matched._id.toString() } as Article;
          sourceLabel = '🟢 MONGO LIVE';
        }
      }
    }
  } catch {
    // ignore
  }

  // Fallback to local memory articles
  if (!article) {
    const matched = memoryArticles.find(
      a => a._id === newsDetails || generateSlug(a.title) === newsDetails
    );
    if (matched) {
      article = matched;
      sourceLabel = '🟡 LOCAL STREAM';
    }
  }

  // Not Found layout
  if (!article) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-gray-850">
        <header className="border-b-[3px] border-red-700 py-6 bg-white shrink-0">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <Link href="/" className="text-3xl font-black text-red-700 tracking-tight" style={{ fontFamily: 'var(--font-serif-bangla)' }}>
              মানবাধিকার খবর
            </Link>
            <Link href="/" className="flex items-center gap-2 hover:bg-gray-100 px-3 py-1.5 border border-gray-200 rounded transition-colors text-xs font-bold font-bangla">
              <ArrowLeft className="w-4 h-4" />
              <span>মূল পাতায় যান</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
          <div className="bg-white border rounded-2xl p-8 shadow-sm space-y-4">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
            <h2 className="text-xl font-bold font-bangla text-gray-900">সংবাদটি খুঁজে পাওয়া যায়নি!</h2>
            <p className="text-sm text-gray-500 font-bangla leading-relaxed">
              দুঃখিত, আপনি যে খবরটি পড়তে চাইছেন তার কোনো অস্তিত্ব বা সঠিক আইডি/লিংক নেই। অথবা এটি মুছে ফেলা হয়েছে।
            </p>
            <Link href="/" className="inline-block bg-red-700 hover:bg-red-800 text-white font-bold text-xs px-5 py-2.5 rounded transition-all font-bangla cursor-pointer">
              অন্যান্য খবর পড়ুন
            </Link>
          </div>
        </main>
      </div>
    );
  }

  let authorData: Author | null = null;
  try {
    const { db, isUsingFallback } = await getDb();
    if (!isUsingFallback && db) {
      // Lazy seed author data if collection is empty
      const count = await db.collection('authors').countDocuments();
      if (count === 0) {
        const withNoId = INITIAL_AUTHORS.map(({ _id, ...rest }) => rest);
        await db.collection('authors').insertMany(withNoId as any);
      }
      
      const dbAuthor = await db.collection('authors').findOne({ name: article.author });
      if (dbAuthor) {
        authorData = {
          name: dbAuthor.name,
          designation: dbAuthor.designation,
          bio: dbAuthor.bio,
          avatarUrl: dbAuthor.avatarUrl,
          email: dbAuthor.email,
          socialLinks: dbAuthor.socialLinks
        };
      }
    }
  } catch (err) {
    console.error('Failed to load author metadata from MongoDB:', err);
  }

  // Fallback to local array
  if (!authorData) {
    const localAuthor = INITIAL_AUTHORS.find(a => a.name === article!.author);
    if (localAuthor) {
      authorData = localAuthor;
    } else if (article.author) {
      authorData = {
        name: article.author,
        designation: "কন্ট্রিবিউটর",
        bio: `${article.author}  পোর্টালে নিয়মিত বস্তুনিষ্ঠ সংবাদ ও বিশ্লেষণ কলাম লেখেন।`,
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
        email: "manabadhikarkhabar11@gmail.com"
      };
    }
  }

  return <ArticleDetailClient article={article} sourceLabel={sourceLabel} authorData={authorData} />;
}
