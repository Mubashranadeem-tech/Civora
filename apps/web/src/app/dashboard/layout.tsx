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
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
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
  const [collapsed, setCollapsed] = useState(false);

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
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E0E8DF] flex flex-col transition-all duration-300 ease-in-out lg:relative lg:inset-auto lg:z-auto lg:translate-x-0 shadow-xs ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          collapsed ? 'lg:w-20' : 'lg:w-64'
        }`}
      >
        {/* Floating Border Collapse Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center absolute -right-3 top-6 z-30 w-6 h-6 rounded-full bg-white border border-[#CDDDCC] text-[#2F593E] hover:text-[#112417] hover:bg-[#EEF6EC] shadow-xs hover:shadow-sm transition-all"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Header / Logo */}
        <div className={`p-4 border-b border-[#EAF0E8] flex flex-col ${collapsed ? 'items-center justify-center' : ''}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'gap-2.5 min-w-0'}`}>
            <Link href="/" className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5 min-w-0'}`}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1C4830] to-[#2F6D49] text-white flex items-center justify-center text-sm font-bold shadow-xs shrink-0">
                C
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <span className="text-base font-bold text-[#14261C] truncate block leading-tight">
                    Civora
                  </span>
                  <div className="text-[11px] font-semibold text-[#255C3A] truncate">Citizen Portal</div>
                </div>
              )}
            </Link>
          </div>

          {!collapsed && (
            <div className="mt-3 px-2.5 py-1 rounded-lg bg-[#EAF4E8] border border-[#CEE4CD] text-[11px] font-semibold text-[#1F5433] flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2F7349]" />
              Verified Community Member
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <div className="px-3 pt-3 pb-1">
          <Link
            href="/dashboard/submit"
            onClick={() => setSidebarOpen(false)}
            title={collapsed ? "Report Problem" : undefined}
            className={`btn-primary text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold shadow-xs hover:shadow-sm transition-all ${
              collapsed ? 'px-2' : 'px-3 w-full'
            }`}
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Report Problem</span>}
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                title={collapsed ? item.label : undefined}
                className={`flex items-center rounded-xl text-xs font-semibold transition-all duration-150 ${
                  collapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5'
                } ${
                  isActive
                    ? 'bg-[#1C4830] text-white shadow-xs font-bold'
                    : 'text-[#486353] hover:text-[#14261C] hover:bg-[#F0F5EE]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#617D6D]'}`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-3 border-t border-[#EAF0E8]">
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div 
                className="w-8 h-8 rounded-full bg-[#1C4830] text-white flex items-center justify-center text-xs font-bold shadow-xs shrink-0"
                title={user.name || 'User'}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <button
                onClick={() => { logout(); router.push('/'); }}
                className="text-[#728C7D] hover:text-[#B92E2E] transition-colors p-1.5 rounded-lg hover:bg-[#F4F8F3]"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#F4F8F3] border border-[#DFEAE0]">
              <div className="w-8 h-8 rounded-full bg-[#1C4830] text-white flex items-center justify-center text-xs font-bold shadow-xs shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#14261C] truncate">{user.name}</div>
                <div className="text-[10px] text-[#4E6F5B] truncate">{user.email}</div>
              </div>
              <button
                onClick={() => { logout(); router.push('/'); }}
                className="text-[#728C7D] hover:text-[#B92E2E] transition-colors p-1.5 rounded-lg hover:bg-white"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-xs z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 w-full overflow-x-hidden">
        <header className="lg:hidden bg-white border-b border-[#E0E8DF] px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-[#F0F5EF]" aria-label="Open menu">
              <Menu className="w-5 h-5 text-[#14261C]" />
            </button>
            <span className="font-bold text-[#14261C]">Civora</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8 min-w-0 w-full max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
