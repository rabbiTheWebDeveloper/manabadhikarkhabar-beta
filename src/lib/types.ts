export interface Author {
  _id?: string;
  name: string;
  designation: string;
  bio: string;
  avatarUrl: string;
  email?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export interface Article {
  _id: string;
  title: string;
  content: string;
  category: string;
  imgUrl: string;
  time: string;
  author: string;
  isLead: boolean;
  isSub: boolean;
  isPublished?: boolean;
  publishDate?: string;
}

export interface EPaperPage {
  pageNumber: number;
  title: string;
  imgUrl: string;
}

export interface EPaperCollection {
  _id: string; // "YYYY-MM" format e.g. "2026-06"
  monthName: string; // e.g., "জুন ২০২৬" or "June 2026"
  year: number;
  month: number;
  pages: EPaperPage[];
  updatedAt: string;
}

export interface Category {
  _id?: string;
  value: string;
  label: string;
  order: number;
  createdAt?: string;
}

