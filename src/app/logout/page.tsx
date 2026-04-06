'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function LogoutPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const performLogout = async () => {
    setLoading(true);
    setError('');

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Continue with client cleanup even if API call fails.
    }

    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    router.replace('/login');
  };

  useEffect(() => {
    performLogout().catch(() => {
      setLoading(false);
      setError('Failed to logout automatically. Please try again.');
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Logging out</h1>
        <p className="text-gray-600 mb-6">
          {loading ? 'Please wait while we sign you out...' : 'You can sign out manually below.'}
        </p>

        {error ? (
          <div className="space-y-3">
            <p className="text-sm text-red-600">{error}</p>
            <Button onClick={performLogout} variant="primary" className="w-full">
              Try Logout Again
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
