'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth.context';
import { 
  Home, 
  PlusCircle, 
  ClipboardList, 
  Search, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  ShieldCheck 
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/submit', label: 'Report Problem', icon: PlusCircle, highlight: true },
  { href: '/dashboard/my-problems', label: 'My Reports', icon: ClipboardList },
  { href: '/dashboard/track', label: 'Track Problem', icon: Search },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
    if (!isLoading && user && isAdmin) {
      router.push('/admin');
    }
  }, [user, isLoading, isAdmin, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1C4830] to-[#2D6C48] flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 animate-pulse shadow-md">
            C
          </div>
          <div className="text-[#597262] text-sm font-medium">Loading Citizen Portal...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-[#14261C] flex">
      {/* Citizen Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E0E8DF] flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:z-auto shadow-xs`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[#EAF0E8]">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1C4830] to-[#2F6D49] text-white flex items-center justify-center text-sm font-bold shadow-xs">
              C
            </div>
            <div>
              <span className="text-base font-bold text-[#14261C]">
                Civora
              </span>
              <div className="text-xs font-semibold text-[#255C3A]">Citizen Portal</div>
            </div>
          </Link>
          <div className="mt-3 px-3 py-1.5 rounded-lg bg-[#EAF4E8] border border-[#CEE4CD] text-xs font-semibold text-[#1F5433] flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2F7349]" />
            Community Member
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                  item.highlight
                    ? 'bg-[#1C4830] text-white hover:bg-[#163C27] shadow-xs'
                    : isActive
                    ? 'bg-[#EBF4EA] text-[#1C4C2F] border border-[#CFE3CE] shadow-xs'
                    : 'text-[#506A5B] hover:text-[#14261C] hover:bg-[#F2F7F1]'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.highlight ? 'text-white' : isActive ? 'text-[#1C4C2F]' : 'text-[#617D6D]'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-[#EAF0E8]">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F4F8F3] border border-[#DFEAE0]">
            <div className="w-8 h-8 rounded-full bg-[#1C4830] text-white flex items-center justify-center text-xs font-bold shadow-xs flex-shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[#14261C] truncate">{user.name}</div>
              <div className="text-[11px] text-[#4E6F5B] truncate">{user.email}</div>
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

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-xs z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden bg-white border-b border-[#E0E8DF] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-[#F0F5EF]">
              <Menu className="w-5 h-5 text-[#14261C]" />
            </button>
            <span className="font-bold text-[#14261C]">Civora</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
