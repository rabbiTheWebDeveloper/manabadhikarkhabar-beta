'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FileText, Megaphone, Cpu, BookOpen,
  Users, Settings, ChevronLeft, ChevronRight, LogOut, Newspaper, FolderTree
} from 'lucide-react';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentUser: any;
  onLogout: () => void;
}

const navItems = [
  { href: '/admin', label: 'ড্যাশবোর্ড', labelEn: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/news', label: 'সংবাদ ব্যবস্থাপনা', labelEn: 'News', icon: FileText },
  { href: '/admin/categories', label: 'ক্যাটেগরি', labelEn: 'Categories', icon: FolderTree },
  { href: '/admin/ads', label: 'বিজ্ঞাপন প্যানেল', labelEn: 'Ads', icon: Megaphone },
  { href: '/admin/crawler', label: 'নিউজ ক্রলার', labelEn: 'Crawler', icon: Cpu },
  { href: '/admin/epaper', label: 'ই-পেপার', labelEn: 'E-Paper', icon: BookOpen },
  { href: '/admin/users', label: 'ব্যবহারকারী', labelEn: 'Users', icon: Users },
  { href: '/admin/settings', label: 'সেটিংস', labelEn: 'Settings', icon: Settings },
];

export default function AdminSidebar({ collapsed, onToggle, currentUser, onLogout }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-[#0F172A] text-slate-300 z-50 flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
    >
      {/* Logo Header */}
      <div className={`flex items-center h-16 border-b border-slate-700/50 px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0 animate-fade-in">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shrink-0">
              <Newspaper className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-extrabold text-white truncate leading-tight">মানবাধিকার খবর</h1>
              <p className="text-[10px] text-slate-500 font-semibold">Admin Panel v2.0</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto admin-scrollbar">
        {!collapsed && (
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">মেনু</p>
        )}
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex items-center gap-3 rounded-lg transition-all duration-200 group relative ${
                collapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5'
              } ${
                active
                  ? 'bg-red-500/15 text-red-400 font-bold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-red-500 rounded-r-full" />
              )}
              <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-red-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              {!collapsed && (
                <span className="text-[13px] truncate">{item.label}</span>
              )}
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-slate-700">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-2 py-2 border-t border-slate-700/50">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
          title={collapsed ? 'সাইডবার বড় করুন' : 'সাইডবার ছোট করুন'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="text-xs font-semibold">সাইডবার ছোট করুন</span>}
        </button>
      </div>

      {/* User & Logout */}
      <div className={`border-t border-slate-700/50 p-3 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        {!collapsed && currentUser && (
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center text-white text-xs font-black shrink-0">
              {(currentUser.name || currentUser.username || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{currentUser.name || currentUser.username}</p>
              <p className="text-[10px] text-slate-500 truncate">{currentUser.email || 'admin'}</p>
            </div>
          </div>
        )}
        {collapsed && currentUser && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center text-white text-xs font-black" title={currentUser.name || currentUser.username}>
            {(currentUser.name || currentUser.username || 'A').charAt(0).toUpperCase()}
          </div>
        )}
        <button
          onClick={onLogout}
          className={`flex items-center gap-2 rounded-lg text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-colors cursor-pointer ${
            collapsed ? 'p-2 justify-center' : 'w-full px-3 py-2 text-xs font-bold'
          }`}
          title="লগ-আউট"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>লগ-আউট</span>}
        </button>
      </div>
    </aside>
  );
}
