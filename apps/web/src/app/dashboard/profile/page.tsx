'use client';

import { useAuth } from '@/contexts/auth.context';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Citizen Profile</h1>
        <p className="text-gray-400 text-sm">Manage your personal information and civic credentials</p>
      </div>

      <div className="glass-card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-2xl font-bold text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{user?.name}</h2>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <span className="inline-block mt-1 text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Verified Citizen Account
            </span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-sm mb-6">
          <div className="p-3 rounded-xl bg-white/2 border border-white/5">
            <span className="text-xs text-gray-500 block">Registered City</span>
            <span className="text-white font-medium">{user?.city || 'Not specified'}</span>
          </div>
          <div className="p-3 rounded-xl bg-white/2 border border-white/5">
            <span className="text-xs text-gray-500 block">Total Problems Reported</span>
            <span className="text-white font-medium">{user?.problemsCount || 0} reports</span>
          </div>
        </div>

        <button onClick={logout} className="btn-danger text-sm">
          Sign Out of Civora
        </button>
      </div>
    </div>
  );
}
