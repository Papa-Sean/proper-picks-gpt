'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function SignOut() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    const signOut = async () => {
      try {
        await logout();
        router.push('/login');
      } catch (error) {
        console.error('Failed to sign out:', error);
      }
    };

    signOut();
  }, [logout, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Signing out...</p>
    </div>
  );
}