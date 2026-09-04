'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth.context';
import { UserPlus, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', city: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 hero-gradient pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1C4830] to-[#2F6D49] flex items-center justify-center text-xl font-bold text-white shadow-sm">
              C
            </div>
            <span className="text-2xl font-extrabold text-[#14261C]">
              Civora
            </span>
          </Link>
          <p className="text-[#567262] mt-2 text-xs font-semibold">Join as a verified community member</p>
        </div>

        <div className="glass-card p-8 bg-white border border-[#CADDC7] shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#4E6857] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-civora"
                placeholder="Mubashir Nadeem"
                required
                minLength={2}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4E6857] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-civora"
                placeholder="you@domain.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4E6857] uppercase tracking-wider mb-1.5">
                City / Municipality
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="input-civora"
                placeholder="Islamabad, Rawalpindi, Lahore..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4E6857] uppercase tracking-wider mb-1.5">
                Account Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-civora"
                placeholder="Min. 8 characters"
                required
                minLength={8}
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
              className="btn-primary w-full justify-center py-3 text-xs font-bold rounded-xl text-white transition-all shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Creating Citizen Account...' : 'Create Citizen Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#5C7767]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#1E5433] hover:underline font-bold">
              Sign in here
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs font-bold text-[#557161] hover:text-[#14261C] transition-colors inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Civora Home
          </Link>
        </div>
      </div>
    </div>
  );
}
