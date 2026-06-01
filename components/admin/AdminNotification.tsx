'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, X, Info } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

let addNotifFn: ((message: string, type: 'success' | 'error' | 'info') => void) | null = null;

// Exported utility function usable from any admin component
export function showAdminNotif(message: string, type: 'success' | 'error' | 'info' = 'success') {
  if (addNotifFn) {
    addNotifFn(message, type);
  }
}

export default function AdminNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    addNotifFn = (message: string, type: 'success' | 'error' | 'info') => {
      const id = Date.now().toString() + Math.random().toString(36).slice(2);
      setNotifications(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 4500);
    };
    return () => { addNotifFn = null; };
  }, []);

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`pointer-events-auto animate-slide-in-left rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg border backdrop-blur-sm ${
            notif.type === 'success'
              ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800'
              : notif.type === 'error'
              ? 'bg-red-50/95 border-red-200 text-red-800'
              : 'bg-blue-50/95 border-blue-200 text-blue-800'
          }`}
        >
          {notif.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />}
          {notif.type === 'error' && <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />}
          {notif.type === 'info' && <Info className="w-5 h-5 shrink-0 text-blue-600" />}
          <p className="text-sm font-bold flex-1 min-w-0 font-bangla">{notif.message}</p>
          <button onClick={() => dismiss(notif.id)} className="p-0.5 rounded hover:bg-black/5 transition-colors cursor-pointer shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
