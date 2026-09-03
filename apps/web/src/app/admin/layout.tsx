'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth.context';
import { useState } from 'react';

const adminNav = [
  { href: '/admin', label: 'Overview', icon: '📊', exact: true },
  { href: '/admin/problems', label: 'Problems Queue', icon: '📋' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { href: '/admin/publishing', label: 'Publishing', icon: '🌐' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
    if (!isLoading && user && !isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isLoading, isAdmin, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#080d14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-xl font-bold mx-auto mb-4 animate-pulse">C</div>
          <div className="text-gray-400 text-sm">Loading Admin...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080d14] flex">
      {/* Admin Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 glass border-r border-white/5 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-700 flex items-center justify-center text-sm font-bold">A</div>
            <div>
              <div className="text-lg font-bold">Civ<span className="gradient-text">ora</span></div>
              <div className="text-xs text-orange-400">Admin Console</div>
            </div>
          </Link>
          <div className="mt-3 px-2 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-xs text-orange-400">
            ⚙️ Administration
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {adminNav.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white/8 text-white border border-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl glass">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-700 flex items-center justify-center text-xs font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user.name}</div>
              <div className="text-xs text-orange-400">Administrator</div>
            </div>
            <button
              onClick={() => { logout(); router.push('/'); }}
              className="text-gray-500 hover:text-red-400 transition-colors text-xs p-1"
              title="Sign out"
            >
              ↩
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden glass border-b border-white/5 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-white/5 transition-colors">☰</button>
          <span className="font-bold">Civ<span className="gradient-text">ora</span> <span className="text-orange-400 text-sm">Admin</span></span>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
