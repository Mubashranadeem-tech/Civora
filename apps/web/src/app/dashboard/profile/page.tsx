'use client';

import { useAuth } from '@/contexts/auth.context';
import { MapPin, FileText, CheckCircle2, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="pb-2 border-b border-[#E2EBE0]">
        <h1 className="text-2xl font-extrabold text-[#13251A] tracking-tight">Citizen Profile</h1>
        <p className="text-sm text-[#546E5E]">Manage your citizen identity and civic reporting credentials.</p>
      </div>

      <div className="glass-card p-6 md:p-8 bg-white border border-[#DCE5DA] shadow-xs">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#EAF0E8]">
          <div className="w-16 h-16 rounded-2xl bg-[#1C4830] flex items-center justify-center text-2xl font-extrabold text-white shadow-xs flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#14261C]">{user?.name}</h2>
            <p className="text-xs font-medium text-[#5E7868] mt-0.5">{user?.email}</p>
            <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EBF5EA] text-[#1D5432] border border-[#CCE2CA]">
              <CheckCircle2 className="w-3 h-3" />
              Verified Community Member
            </span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-xs mb-6">
          <div className="p-4 rounded-xl bg-[#F6FAF5] border border-[#E2EBE1]">
            <span className="font-bold text-[#567261] uppercase tracking-wider block mb-1">Registered City</span>
            <span className="text-sm font-bold text-[#14261C] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#2C6946]" />
              {user?.city || 'Islamabad'}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-[#F6FAF5] border border-[#E2EBE1]">
            <span className="font-bold text-[#567261] uppercase tracking-wider block mb-1">Total Reports Logged</span>
            <span className="text-sm font-bold text-[#14261C] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#2C6946]" />
              {user?.problemsCount || 0} reports
            </span>
          </div>
        </div>

        <button onClick={logout} className="btn-danger text-xs px-5 py-2.5 rounded-xl inline-flex items-center gap-1.5">
          <LogOut className="w-3.5 h-3.5" />
          Sign Out of Civora
        </button>
      </div>
    </div>
  );
}
