'use client';

import { useState, useEffect } from 'react';
import { Users, Shield, Clock, Mail, User } from 'lucide-react';

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/users').then(r => r.json()).catch(() => ({ users: [] })),
      fetch('/api/auth/me').then(r => r.json()).catch(() => ({})),
    ]).then(([userData, meData]) => {
      setUsers(userData.users || []);
      if (meData.authenticated) setCurrentUser(meData.user);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">ব্যবহারকারী পরিচালনা</h1>
        <p className="text-sm text-gray-500">নিবন্ধিত {users.length}জন ব্যবহারকারী</p>
      </div>

      {/* Current User Card */}
      {currentUser && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden animate-scale-in">
          <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-xl font-black shrink-0">
              {(currentUser.name || currentUser.username || 'A').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">বর্তমান সেশন</span>
              </div>
              <h2 className="text-xl font-black">{currentUser.name || currentUser.username}</h2>
              <p className="text-sm text-slate-400">{currentUser.email || 'admin'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-extrabold text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-red-500" />
            <span>নিবন্ধিত ব্যবহারকারীগণ</span>
          </h3>
        </div>

        {users.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="font-bold">কোনো ব্যবহারকারী পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {users.map((user, idx) => (
              <div key={user._id || idx} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors animate-slide-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center text-red-700 font-black text-sm shrink-0 border border-red-200">
                  {(user.name || user.username || '?').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900 text-sm">{user.name || user.username}</p>
                    {user.username === 'admin' && (
                      <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded-full border border-red-100 font-bold">Admin</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <User className="w-3 h-3" /> {user.username}
                    </span>
                    {user.email && (
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {user.email}
                      </span>
                    )}
                    {user.createdAt && (
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(user.createdAt).toLocaleDateString('bn-BD')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0">
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full border border-emerald-100 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> সক্রিয়
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
