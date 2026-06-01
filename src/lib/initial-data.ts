import { Author, Article } from './types';

export const INITIAL_AUTHORS: Author[] = [
  {
    name: "নিজস্ব প্রতিবেদক",
    designation: "স্টাফ রিপোর্টার",
    bio: "মানবাধিকার খবরের বিশেষ অনুসন্ধানী ও স্টাফ রিপোর্টার দল, যারা মাঠ পর্যায়ে সর্বক্ষণ সত্য ঘটনা উদঘাটনে কাজ করেন।",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    email: "staff.reporter@manabadhikarkhabar.com",
    socialLinks: {
      facebook: "https://facebook.com",
      twitter: "https://twitter.com"
    }
  },
  {
    name: "কৃষি প্রতিনিধি",
    designation: "কৃষি ও পরিবেশ বিষয়ক প্রতিবেদক",
    bio: "বিশেষজ্ঞ সাংবাদিক যিনি বাংলাদেশ এবং স্থানীয় অঞ্চলের কৃষি উন্নয়ন, ফসলের উৎপাদন এবং কৃষকদের অধিকার নিয়ে কাজ করে চলেছেন।",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    email: "agri.rep@manabadhikarkhabar.com"
  },
  {
    name: "ক্রীড়া প্রতিনিধি",
    designation: "ক্রীড়া প্রতিবেদক",
    bio: "জেলা ও দেশের সর্বোচ্চ ক্রীড়া প্রতিযোগিতার খবরাখবর সবার আগে পৌছে দেয়াই আমাদের এই প্রতিনিধির মূল দায়িত্ব।",
    avatarUrl: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=150&q=80",
    email: "sports@manabadhikarkhabar.com"
  },
  {
    name: "ক্রীড়া প্রতিনিধি",
    designation: "ক্রীড়া প্রতিবেদক",
    bio: "জেলা ও দেশের সর্বোচ্চ ক্রীড়া প্রতিযোগিতার খবরাখবর সবার আগে পৌছে দেয়াই আমাদের এই প্রতিনিধির মূল দায়িত্ব।",
    avatarUrl: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=150&q=80",
    email: "sports@manabadhikarkhabar.com"
  },
  {
    name: "অর্থনীতি প্রতিবেদক",
    designation: "বাণিজ্য ও অর্থ সম্পাদক",
    bio: "অর্থনৈতিক পরিস্থিতি বিশ্লেষণ ও ব্যবসা-বাণিজ্য সংক্রান্ত দৈনিক খবরের বিশ্লেষক।",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
    email: "economy@manabadhikarkhabar.com"
  },
  {
    name: "পুলিশ ব্যুরো",
    designation: "আইন ও অপরাধ রিপোর্টার",
    bio: "পুলিশ সদর দপ্তর ও আইন-শৃঙ্খলা রক্ষাকারী বাহিনীর যাবতীয় কার্যক্রম, নিরাপত্তা ও অপরাধবিষয়ক নির্ভরযোগ্য তথ্যের বিশ্লেষক।",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80",
    email: "crime@manabadhikarkhabar.com"
  },
  {
    name: "প্রথম আলো",
    designation: "সিন্ডিকেট কন্টেন্ট পার্টনার",
    bio: "প্রথম আলো থেকে সংগৃহীত ও সর্বাধুনিক এআই ক্রলিং প্রযুক্তির মাধ্যমে মানবাধিকার খবরের ক্যাটাগরি ম্যাপিং অনুযায়ী ক্লাসিফাইডকৃত খবর।",
    avatarUrl: "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=150&q=80",
    email: "info@manabadhikarkhabar.com"
  },
  {
    name: "রয়টার্স",
    designation: "আন্তর্জাতিক সংবাদ সংস্থা",
    bio: "রয়টার্স বৈশ্বিক সংবাদ সংস্থা, বিশ্বব্যাপী চলমান রাজনৈতিক ও বৈচিত্র্যপূর্ণ ঘটনার বিশ্বস্ত উৎস।",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    email: "foreign@manabadhikarkhabar.com"
  },
  {
    name: "কুরিয়ার নিউজ",
    designation: "সিন্ডিকেটেড সংবাদ প্রবাহ",
    bio: "জাতীয় ও অনলাইন নিউজফিড ভিত্তিক সিন্ডিকেটেড সংবাদ প্রবাহের বিশ্বস্ত সহযোগী সদস্য।",
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80",
    email: "courier@manabadhikarkhabar.com"
  },
  {
    name: "নাগরিক সাংবাদিক",
    designation: "কন্ট্রিবিউটর ও পাবলিক কন্টেন্ট রাইটার",
    bio: "জনসাধারণের অধিকার নিয়ে সোচ্চার মানবাধিকার খবর নাগরিক সাংবাদিক কন্টেন্ট ফোরামের সম্মানিত লেখকবৃন্দ।",
    avatarUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80",
    email: "citizen@manabadhikarkhabar.com"
  },
  {
    name: "নগর প্রতিনিধি (পাবলিক)",
    designation: "জনসাধারণের অধিকার প্রতিনিধি",
    bio: "স্থানীয় শহর ও ওয়ার্ড পর্যায় থেকে সংগৃহীত মাঠপর্যায়ের জনদুর্ভোগ ও সংবাদ প্রবাহ।",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
    email: "city@manabadhikarkhabar.com"
  }
];

export const INITIAL_ARTICLES: Article[] = [
  {
    _id: "lead-1",
    title: "কচুয়া পৌরসভায় নতুন মেগা উন্নয়ন প্রকল্পের অনুমোদন, বাজেট বরাদ্দে রেকর্ড",
    content: "স্থানীয় সরকার মন্ত্রণালয়ের অধীনে কচুয়া পৌরসভার বিভিন্ন অবকাঠামো উন্নয়নের জন্য প্রায় ৫০ কোটি টাকার বিশেষ বাজেট বরাদ্দ দেওয়া হয়েছে। এই প্রকল্পের অধীনে রাস্তাঘাট সংস্কার, ড্রেনেজ ব্যবস্থার উন্নয়ন এবং কালভার্ট নির্মাণ অন্তর্ভুক্ত রয়েছে। মেয়র জানান, এই প্রকল্প বাস্তবায়ন হলে পৌর এলাকার দীর্ঘদিনের জলাবদ্ধতা দূর হবে এবং নাগরিক সুবিধা বৃদ্ধি পাবে।",
    category: "বিশেষ সংবাদ",
    imgUrl: "https://picsum.photos/seed/politics3/800/450",
    time: "২ ঘণ্টা আগে",
    author: "নিজস্ব প্রতিবেদক",
    isLead: true,
    isSub: false
  },
  {
    _id: "sub-1",
    title: "কৃষকদের সুবিধার্থে নতুন সার ও বীজ বিতরণ কর্মসূচি শুরু",
    content: "উপজেলা কৃষি সম্প্রসারণ অধিদপ্তরের উদ্যোগেও স্থানীয় ক্ষুদ্র ও প্রান্তিক কৃষকদের মাঝে উন্নত জাতের বীজ এবং ভর্তুকিমূল্যে রাসায়নিক সার বিতরণ শুরু হয়েছে। আজ সকালে উপজেলা মিলনায়তনে এই কর্মসূচির উদ্বোধন করা হয়।",
    category: "বাংলাদেশ",
    imgUrl: "https://picsum.photos/seed/farmers/400/266",
    time: "৩ ঘণ্টা আগে",
    author: "কৃষি প্রতিনিধি",
    isLead: false,
    isSub: true
  },
  {
    _id: "sub-2",
    title: "উপজেলা স্বাস্থ্য কমপ্লেক্সে আধুনিক যন্ত্রপাতি সংযোজন, সেবার মান বৃদ্ধি",
    content: "কচুয়া উপজেলা স্বাস্থ্য কমপ্লেক্সে নতুন আল্ট্রাসনোগ্রাম ও এক্স-রে মেশিন সংযোজন করা হয়েছে। এর ফলে প্রত্যন্ত অঞ্চলের মানুষকে আর জেলা সদরে যেতে হবে না। হাসপাতালের প্রধান জানান, এখন থেকে স্বল্পমূল্যে এই চিকিৎসাসেবা দেওয়া সম্ভব হবে।",
    category: "বাংলাদেশ",
    imgUrl: "https://picsum.photos/seed/med/400/266",
    time: "৫ ঘণ্টা আগে",
    author: "নিজস্ব প্রতিবেদক",
    isLead: false,
    isSub: true
  },
  {
    _id: "sec-1",
    title: "কচুয়া সরকারি কলেজে বার্ষিক ক্রীড়া প্রতিযোগিতা অনুষ্ঠিত",
    content: "কচুয়া সরকারি কলেজের খেলার মাঠে বার্ষিক ক্রীড়া ও সাংস্কৃতিক প্রতিযোগিতার প্রথম পর্ব শেষ হয়েছে। সমাপনী অনুষ্ঠানে বিজয়ীদের হাতে পুরস্কার তুলে দিতে স্থানীয় গণ্যমান্য ব্যক্তিবর্গ উপস্থিত ছিলেন।",
    category: "খেলা",
    imgUrl: "https://picsum.photos/seed/school/400/266",
    time: "৬ ঘণ্টা আগে",
    author: "ক্রীড়া প্রতিনিধি",
    isLead: false,
    isSub: false
  },
  {
    _id: "sec-2",
    title: "গ্রামীণ অর্থনীতি চাঙ্গা করতে ক্ষুদ্র ঋণ বিতরণ শুরু",
    content: "স্থানীয় উদ্যোক্তাদের উৎসাহিত করতে সহজ শর্তে ঋণ দেওয়ার উদ্যোগ নেওয়া হয়েছে। নারী সমাজকে স্বাবলম্বী করতে এই মেগা ঋণে বিশেষ প্রাধান্য দেওয়া হচ্ছে বলে সরকারি সূত্র জানিয়েছে।",
    category: "বাণিজ্য",
    imgUrl: "https://picsum.photos/seed/economy/400/266",
    time: "৮ ঘণ্টা আগে",
    author: "অর্থনীতি প্রতিবেদক",
    isLead: false,
    isSub: false
  },
  {
    _id: "sec-3",
    title: "মহাসড়কে যানজট নিরসনে ট্রাফিক পুলিশের বিশেষ অভিযান",
    content: "কচুয়া চাঁদপুর বাইপাস ও জাতীয় মহাসড়কে যানজট ও অবৈধ পার্কিং নিরসনে পুলিশের যৌথ অভিযান পরিচালিত হয়েছে। ১০টি ফিটনেসবিহীন গাড়ি জব্দ করা হয়েছে এবং জরিমানা করা হয়েছে।",
    category: "বাংলাদেশ",
    imgUrl: "https://picsum.photos/seed/traffic/400/266",
    time: "১০ ঘণ্টা আগে",
    author: "পুলিশ ব্যুরো",
    isLead: false,
    isSub: false
  }
];
