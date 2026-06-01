'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';
import AdminNotification from '@/components/admin/AdminNotification';

const pageTitles: Record<string, string> = {
  '/admin': 'ড্যাশবোর্ড',
  '/admin/news': 'সংবাদ ব্যবস্থাপনা',
  '/admin/categories': 'ক্যাটেগরি ব্যবস্থাপনা',
  '/admin/ads': 'বিজ্ঞাপন প্যানেল',
  '/admin/crawler': 'নিউজ ক্রলার কন্ট্রোল',
  '/admin/epaper': 'ই-পেপার ব্যবস্থাপনা',
  '/admin/users': 'ব্যবহারকারী পরিচালনা',
  '/admin/settings': 'সেটিংস',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dbSource, setDbSource] = useState('loading');
  const hasRedirected = useRef(false);

  useEffect(() => {
    let active = true;
    async function checkAuth() {
      // Prevent re-triggering if we already redirected
      if (hasRedirected.current) return;
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && active) {
            setCurrentUser(data.user);
            setAuthLoading(false);
          } else if (active) {
            hasRedirected.current = true;
            router.replace('/login');
          }
        } else if (active) {
          hasRedirected.current = true;
          router.replace('/login');
        }
      } catch {
        if (active) {
          hasRedirected.current = true;
          router.replace('/login');
        }
      }
    }
    checkAuth();

    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch DB source only after auth succeeds
  useEffect(() => {
    if (authLoading || !currentUser) return;
    let active = true;
    fetch('/api/articles')
      .then(r => r.json())
      .then(d => { if (active) setDbSource(d.source || 'local'); })
      .catch(() => {});
    return () => { active = false; };
  }, [authLoading, currentUser]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setTimeout(() => {
          router.push('/login');
          router.refresh();
        }, 500);
      }
    } catch {
      // ignore
    }
  }, [router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center font-bangla">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-red-300/30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-sm font-bold text-gray-500">নিরাপত্তা যাচাই করা হচ্ছে...</p>
        </div>
      </div>
    );
  }

  const pageTitle = pageTitles[pathname] || 'এডমিন প্যানেল';

  return (
    <div className="min-h-screen bg-slate-50/50 font-bangla">
      {/* Notification Toast System */}
      <AdminNotification />

      {/* Sidebar */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[260px] animate-slide-in-left">
            <AdminSidebar
              collapsed={false}
              onToggle={() => setMobileMenuOpen(false)}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
        }`}
      >
        {/* Top Bar */}
        <AdminTopbar
          collapsed={sidebarCollapsed}
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          mobileMenuOpen={mobileMenuOpen}
          dbSource={dbSource}
          pageTitle={pageTitle}
        />

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
