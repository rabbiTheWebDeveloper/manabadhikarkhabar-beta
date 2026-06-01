import { getArticlesAction } from '@/app/actions/article';
import PageClient from './page-client';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { articles } = await getArticlesAction(true);

  return (
    <Suspense fallback={null}>
      <PageClient initialArticles={articles || []} />
    </Suspense>
  );
}
