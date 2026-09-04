'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth.context';
import { User, Shield, Zap, ArrowLeft } from 'lucide-react';

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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1C4830] to-[#2F6D49] flex items-center justify-center text-xl font-bold text-white shadow-sm">
            C
          </div>
          <span className="text-2xl font-extrabold text-[#14261C]">
            Civora
          </span>
        </Link>
      </div>

      {/* Role Switcher Tabs */}
      <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#F0F5EE] border border-[#DCE6DA] mb-6 shadow-xs">
        <button
          type="button"
          onClick={() => {
            setActiveRole('citizen');
            setError('');
          }}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeRole === 'citizen'
              ? 'bg-[#1C4830] text-white shadow-xs'
              : 'text-[#4E6B5A] hover:text-[#14261C]'
          }`}
        >
          <User className="w-4 h-4" />
          Citizen Sign In
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveRole('admin');
            setError('');
          }}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeRole === 'admin'
              ? 'bg-[#1C4830] text-white shadow-xs'
              : 'text-[#4E6B5A] hover:text-[#14261C]'
          }`}
        >
          <Shield className="w-4 h-4" />
          Admin Console
        </button>
      </div>

      {/* Card */}
      <div className="glass-card p-8 bg-white border border-[#CADDC7] shadow-md">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-extrabold text-[#14261C] mb-1">
            {activeRole === 'admin' ? 'Admin Command Center' : 'Citizen Portal Access'}
          </h2>
          <p className="text-xs text-[#5D7666]">
            {activeRole === 'admin'
              ? 'Official administrative access for triage and publishing'
              : 'Sign in to report, track, and monitor community problems'}
          </p>
        </div>

        {activeRole === 'admin' && (
          <div className="mb-5 p-3.5 rounded-xl bg-[#EAF5EA] border border-[#CCE2CA] flex items-center justify-between">
            <div className="text-xs text-[#1E5433]">
              <span className="font-bold">Demo Admin:</span> admin@civora.ai
            </div>
            <button
              type="button"
              onClick={handleFillAdmin}
              className="text-xs px-2.5 py-1 rounded-lg bg-white hover:bg-[#F2F8F1] text-[#1E5433] font-bold border border-[#CCE2CA] transition-colors shadow-xs inline-flex items-center gap-1"
            >
              <Zap className="w-3.5 h-3.5 text-[#1E5433]" />
              Auto-Fill
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#4E6857] uppercase tracking-wider mb-1.5">
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
            <label className="block text-xs font-bold text-[#4E6857] uppercase tracking-wider mb-1.5">Password</label>
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
            <div className="p-3 rounded-xl bg-[#FDEEEE] border border-[#F8B4B4] text-[#B92E2E] text-xs font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full justify-center py-3 text-xs font-bold rounded-xl text-white transition-all btn-primary shadow-xs"
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
              'Sign In to Admin Center'
            ) : (
              'Sign In as Citizen'
            )}
          </button>
        </form>

        {activeRole === 'citizen' && (
          <div className="mt-6 text-center text-xs text-[#5D7666]">
            Don't have a citizen account?{' '}
            <Link href="/register" className="text-[#1E5433] hover:underline font-bold transition-colors">
              Create account here
            </Link>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <Link href="/" className="text-xs font-bold text-[#557161] hover:text-[#14261C] transition-colors inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to Civora Home
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      <Suspense fallback={<div className="text-[#597262] text-sm">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
