import { EPaperCollection } from '@/lib/types';

export let memoryEPapers: EPaperCollection[] = [
  {
    _id: "2026-06",
    monthName: "জুন ২০২৬",
    year: 2026,
    month: 6,
    pages: [
      { pageNumber: 1, title: "প্রথম পাতা (প্রচ্ছদ)", imgUrl: "https://manabadhikarkhabar.com/epaper/admin/background/22-4-2026-17768674352.jpg" },
      { pageNumber: 2, title: "জাতীয় সংবাদ (২য় পাতা)", imgUrl: "https://manabadhikarkhabar.com/epaper/admin/background/22-4-2026-17768701711.jpg" },
      { pageNumber: 3, title: "আন্তর্জাতিক (৩য় পাতা)", imgUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200" },
      { pageNumber: 4, title: "সম্পাদকীয় ও মতামত (৪র্থ পাতা)", imgUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=1200" },
      { pageNumber: 5, title: "সারাদেশ ও বিশেষ প্রতিবেদন (৫ম পাতা)", imgUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=1200" },
      { pageNumber: 6, title: "খেলাধুলা (৬ষ্ঠ পাতা)", imgUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=1200" },
      { pageNumber: 7, title: "সাহিত্য ও সংস্কৃতি (৭ম পাতা)", imgUrl: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=1200" },
      { pageNumber: 8, title: "শেষ পাতা (বিশেষ সংবাদ)", imgUrl: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=1200" }
    ],
    updatedAt: "2026-06-01T04:28:00Z"
  },
  {
    _id: "2026-05",
    monthName: "মে ২০২৬",
    year: 2026,
    month: 5,
    pages: [
      { pageNumber: 1, title: "প্রধান পাতা (মে সংখ্যা)", imgUrl: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=1200" },
      { pageNumber: 2, title: "সম্পাদকীয় মতামত (২য় পাতা)", imgUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=1200" },
      { pageNumber: 3, title: "জাতীয় ও বিশ্ব ঘটনা", imgUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200" }
    ],
    updatedAt: "2026-05-01T08:00:00Z"
  }
];

export function resetEPapers() {
  memoryEPapers = [
    {
      _id: "2026-06",
      monthName: "জুন ২০২৬",
      year: 2026,
      month: 6,
      pages: [
        { pageNumber: 1, title: "প্রথম পাতা (প্রচ্ছদ)", imgUrl: "https://manabadhikarkhabar.com/epaper/admin/background/22-4-2026-17768674352.jpg" },
        { pageNumber: 2, title: "জাতীয় সংবাদ (২য় পাতা)", imgUrl: "https://manabadhikarkhabar.com/epaper/admin/background/22-4-2026-17768701711.jpg" },
        { pageNumber: 3, title: "আন্তর্জাতিক (৩য় পাতা)", imgUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200" },
        { pageNumber: 4, title: "সম্পাদকীয় ও মতামত (৪র্থ পাতা)", imgUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=1200" },
        { pageNumber: 5, title: "সারাদেশ ও বিশেষ প্রতিবেদন (৫ম পাতা)", imgUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=1200" },
        { pageNumber: 6, title: "খেলাধুলা (৬ষ্ঠ পাতা)", imgUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=1200" },
        { pageNumber: 7, title: "সাহিত্য ও সংস্কৃতি (৭ম পাতা)", imgUrl: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=1200" },
        { pageNumber: 8, title: "শেষ পাতা (বিশেষ সংবাদ)", imgUrl: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=1200" }
      ],
      updatedAt: "2026-06-01T04:28:00Z"
    }
  ];
}

export function saveOrUpdateEPaper(id: string, updated: Omit<EPaperCollection, '_id'>) {
  const index = memoryEPapers.findIndex(e => e._id === id);
  const updatedCollection: EPaperCollection = {
    ...updated,
    _id: id,
    updatedAt: new Date().toISOString()
  };

  if (index !== -1) {
    memoryEPapers[index] = updatedCollection;
  } else {
    memoryEPapers.push(updatedCollection);
  }
  // Sort descending by Year and Month
  memoryEPapers.sort((a, b) => b._id.localeCompare(a._id));
  return updatedCollection;
}

export function deleteEPaper(id: string) {
  const index = memoryEPapers.findIndex(e => e._id === id);
  if (index !== -1) {
    const deleted = memoryEPapers[index];
    memoryEPapers.splice(index, 1);
    return deleted;
  }
  return null;
}
