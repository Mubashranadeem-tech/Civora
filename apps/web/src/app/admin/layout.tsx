'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth.context';
import { 
  LayoutDashboard, 
  ClipboardList, 
  TrendingUp, 
  Globe, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  ShieldAlert 
} from 'lucide-react';

const adminNav = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/problems', label: 'Problems Queue', icon: ClipboardList },
  { href: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
  { href: '/admin/publishing', label: 'Publishing', icon: Globe },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
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
      <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1C4830] to-[#2D6C48] flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 animate-pulse shadow-md">
            C
          </div>
          <div className="text-[#597262] text-sm font-medium">Loading Admin Console...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-[#14261C] flex">
      {/* Admin Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E0E8DF] flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:z-auto shadow-xs`}
      >
        <div className="p-6 border-b border-[#EAF0E8]">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1C4830] to-[#2F6D49] text-white flex items-center justify-center text-sm font-bold shadow-xs">
              A
            </div>
            <div>
              <div className="text-base font-bold text-[#14261C]">
                Civora
              </div>
              <div className="text-xs font-semibold text-[#255C3A]">Admin Console</div>
            </div>
          </Link>
          <div className="mt-3 px-3 py-1.5 rounded-lg bg-[#EAF4E8] border border-[#CEE4CD] text-xs font-semibold text-[#1F5433] flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-[#2F7349]" />
            Authority Command
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {adminNav.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#EBF4EA] text-[#1C4C2F] border border-[#CFE3CE] shadow-xs'
                    : 'text-[#506A5B] hover:text-[#14261C] hover:bg-[#F2F7F1]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#1C4C2F]' : 'text-[#617D6D]'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#EAF0E8]">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F4F8F3] border border-[#DFEAE0]">
            <div className="w-8 h-8 rounded-full bg-[#1C4830] text-white flex items-center justify-center text-xs font-bold shadow-xs flex-shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[#14261C] truncate">{user.name}</div>
              <div className="text-[11px] text-[#4E6F5B]">Administrator</div>
            </div>
            <button
              onClick={() => { logout(); router.push('/'); }}
              className="text-[#728C7D] hover:text-[#B92E2E] transition-colors p-1.5 rounded-lg hover:bg-white"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-xs z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden bg-white border-b border-[#E0E8DF] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-[#F0F5EF]">
              <Menu className="w-5 h-5 text-[#14261C]" />
            </button>
            <span className="font-bold text-[#14261C]">Civora <span className="text-[#255C3A] text-xs font-semibold uppercase ml-1">Admin</span></span>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
