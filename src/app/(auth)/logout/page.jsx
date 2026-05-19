'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Clear all queries first
    
        
        // Then perform logout
        logout();
        router.push('/');
      } catch (error) {
        console.error('Logout error:', error);
        router.push('/');
      }
    };

    performLogout();
  }, [router]);

  return null;
}
