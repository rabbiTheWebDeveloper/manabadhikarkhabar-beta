"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting until mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a matching skeleton placeholder during SSR
    return (
      <div className="w-8 h-8 rounded-full bg-[#F0EDE8] dark:bg-[#262523] border border-neutral-300 dark:border-neutral-700 animate-pulse"></div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative p-2 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:text-red-700 dark:hover:text-red-400 transition-all duration-300 shadow-sm active:scale-90 hover:scale-105 group overflow-hidden cursor-pointer"
      title={isDark ? "লাইট মোড" : "ডার্ক মোড"}
      aria-label="Toggle Theme"
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun size={16} className="text-amber-500 animate-spin-slow transition-transform duration-300 group-hover:rotate-45" />
        ) : (
          <Moon size={16} className="text-indigo-600 transition-transform duration-300 group-hover:-rotate-12" />
        )}
      </div>
    </button>
  );
}
