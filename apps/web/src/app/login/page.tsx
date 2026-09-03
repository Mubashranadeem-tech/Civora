'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth.context';

function LoginForm() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'admin' ? 'admin' : 'citizen';
  const [activeRole, setActiveRole] = useState<'citizen' | 'admin'>(initialRole);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'admin') {
      setActiveRole('admin');
    } else if (roleParam === 'citizen') {
      setActiveRole('citizen');
    }
  }, [searchParams]);

  const handleFillAdmin = () => {
    setEmail('admin@civora.ai');
    setPassword('Admin@Civora2026!');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const savedUser = localStorage.getItem('civora_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (activeRole === 'admin' && user.role !== 'admin') {
          setError('This account does not have administrator privileges.');
          setLoading(false);
          return;
        }
        router.push(user.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        router.push(activeRole === 'admin' ? '/admin' : '/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-xl font-bold">
            C
          </div>
          <span className="text-2xl font-bold">
            Civ<span className="gradient-text">ora</span>
          </span>
        </Link>
      </div>

      {/* Role Switcher Tabs */}
      <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
        <button
          type="button"
          onClick={() => {
            setActiveRole('citizen');
            setError('');
          }}
          className={`py-2.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeRole === 'citizen'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <span>👤</span> Citizen Sign In
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveRole('admin');
            setError('');
          }}
          className={`py-2.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeRole === 'admin'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <span>🛡️</span> Admin Portal
        </button>
      </div>

      {/* Card */}
      <div className="glass-card p-8">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-white mb-1">
            {activeRole === 'admin' ? 'Admin Command Center' : 'Citizen Portal'}
          </h2>
          <p className="text-xs text-gray-400">
            {activeRole === 'admin'
              ? 'Secure administrative sign-in for platform management'
              : 'Sign in to report, track, and resolve community problems'}
          </p>
        </div>

        {activeRole === 'admin' && (
          <div className="mb-5 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
            <div className="text-xs text-purple-300">
              <span className="font-semibold">Demo Admin:</span> admin@civora.ai
            </div>
            <button
              type="button"
              onClick={handleFillAdmin}
              className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 font-medium transition-colors"
            >
              ⚡ Auto-Fill
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              {activeRole === 'admin' ? 'Admin Email' : 'Email Address'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-civora"
              placeholder={activeRole === 'admin' ? 'admin@civora.ai' : 'citizen@example.com'}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-civora"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full justify-center py-3 text-sm font-semibold rounded-xl text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              activeRole === 'admin'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/20'
                : 'btn-primary'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Authenticating...
              </span>
            ) : activeRole === 'admin' ? (
              '🛡️ Sign In to Admin Center'
            ) : (
              '👤 Sign In as Citizen'
            )}
          </button>
        </form>

        {activeRole === 'citizen' && (
          <div className="mt-6 text-center text-xs text-gray-500">
            Don't have a citizen account?{' '}
            <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
              Create one here
            </Link>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <Link href="/" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to Homepage
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#080d14] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      <Suspense fallback={<div className="text-gray-400 text-sm">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
