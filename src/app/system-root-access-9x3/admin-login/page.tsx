'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SecretAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          loginRole: 'admin',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Admin login failed');
      }

      localStorage.setItem('user', JSON.stringify(data.data));
      localStorage.setItem('userId', data.data._id);
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900/80 p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-2">Admin Sign In</h1>
        <p className="text-slate-300 mb-6">Restricted access portal</p>

        {error ? (
          <div className="mb-4 rounded-md border border-red-700 bg-red-900/40 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
              placeholder="Admin password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white transition hover:bg-cyan-700 disabled:bg-slate-600"
          >
            {loading ? 'Signing in...' : 'Sign in as Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
