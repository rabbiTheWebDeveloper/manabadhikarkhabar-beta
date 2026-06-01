// Portal settings store with in-memory fallback

export interface BreakingNewsItem {
  id: string;
  text: string;
  isActive: boolean;
  createdAt: string;
}

export interface PortalSettings {
  categories: string[];
  breakingNews: BreakingNewsItem[];
  siteName: string;
  siteDescription: string;
}

const DEFAULT_CATEGORIES = [
  'বিশেষ সংবাদ', 'রাজনীতি', 'বাংলাদেশ', 'অপরাধ',
  'বিশ্ব', 'বাণিজ্য', 'মতামত', 'খেলা', 'বিনোদন'
];

const DEFAULT_BREAKING: BreakingNewsItem[] = [];

export let memorySettings: PortalSettings = {
  categories: [...DEFAULT_CATEGORIES],
  breakingNews: [...DEFAULT_BREAKING],
  siteName: 'মানবাধিকার খবর',
  siteDescription: 'দেশ ও বিদেশের সর্বশেষ সত্য ও বস্তুনিষ্ঠ খবরের নির্ভরযোগ্য অনলাইন নিউজ পোর্টাল।',
};

export function getSettings(): PortalSettings {
  return { ...memorySettings };
}

export function updateSettings(updates: Partial<PortalSettings>): PortalSettings {
  memorySettings = { ...memorySettings, ...updates };
  return { ...memorySettings };
}

export function addBreakingNews(text: string): BreakingNewsItem {
  const item: BreakingNewsItem = {
    id: `bn-${Date.now()}`,
    text,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  memorySettings.breakingNews.unshift(item);
  return item;
}

export function removeBreakingNews(id: string): boolean {
  const idx = memorySettings.breakingNews.findIndex(b => b.id === id);
  if (idx !== -1) {
    memorySettings.breakingNews.splice(idx, 1);
    return true;
  }
  return false;
}

export function toggleBreakingNews(id: string): BreakingNewsItem | null {
  const item = memorySettings.breakingNews.find(b => b.id === id);
  if (item) {
    item.isActive = !item.isActive;
    return item;
  }
  return null;
}
