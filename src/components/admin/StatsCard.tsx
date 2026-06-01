'use client';

import { ReactNode } from 'react';

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  accentColor?: string; // tailwind color class e.g. 'red', 'emerald', 'blue'
  trend?: string;
}

const colorMap: Record<string, { bg: string; text: string; iconBg: string; border: string }> = {
  red: { bg: 'bg-red-50', text: 'text-red-700', iconBg: 'bg-red-100', border: 'border-red-100' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', iconBg: 'bg-emerald-100', border: 'border-emerald-100' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', iconBg: 'bg-blue-100', border: 'border-blue-100' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', iconBg: 'bg-orange-100', border: 'border-orange-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', iconBg: 'bg-purple-100', border: 'border-purple-100' },
  slate: { bg: 'bg-slate-50', text: 'text-slate-700', iconBg: 'bg-slate-100', border: 'border-slate-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', iconBg: 'bg-amber-100', border: 'border-amber-100' },
};

export default function StatsCard({ icon, label, value, sublabel, accentColor = 'red', trend }: StatsCardProps) {
  const colors = colorMap[accentColor] || colorMap.red;

  return (
    <div className={`admin-stat-card bg-white rounded-xl border ${colors.border} p-5 flex items-start gap-4 animate-scale-in`}>
      <div className={`w-11 h-11 rounded-xl ${colors.iconBg} flex items-center justify-center shrink-0 ${colors.text}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-black ${colors.text}`}>{value}</span>
          {trend && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">{trend}</span>
          )}
        </div>
        {sublabel && (
          <p className="text-[11px] text-gray-400 font-medium mt-0.5">{sublabel}</p>
        )}
      </div>
    </div>
  );
}
