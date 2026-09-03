'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics().then(setStats).catch(() => null).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 flex justify-center">
        <div className="w-8 h-8 border-3 border-[#2A6544]/20 border-t-[#2A6544] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="pb-2 border-b border-[#E2EBE0]">
        <h1 className="text-2xl font-extrabold text-[#13251A] tracking-tight">Civic Analytics & Insights</h1>
        <p className="text-sm text-[#546E5E]">Aggregated municipal health, resolution velocities, and domain trends.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 bg-white border border-[#DCE5DA]">
          <div className="text-xs font-bold text-[#577262] uppercase tracking-wider mb-1">Total Issues Logged</div>
          <div className="text-3xl font-extrabold text-[#14261C]">{stats?.totalProblems || 0}</div>
        </div>
        <div className="glass-card p-5 bg-white border border-[#DCE5DA]">
          <div className="text-xs font-bold text-[#577262] uppercase tracking-wider mb-1">Resolved Successfully</div>
          <div className="text-3xl font-extrabold text-[#1E6B39]">{stats?.resolvedProblems || 0}</div>
        </div>
        <div className="glass-card p-5 bg-white border border-[#DCE5DA]">
          <div className="text-xs font-bold text-[#577262] uppercase tracking-wider mb-1">Resolution Rate</div>
          <div className="text-3xl font-extrabold text-[#1E5433]">
            {stats?.totalProblems ? Math.round(((stats?.resolvedProblems || 0) / stats.totalProblems) * 100) : 0}%
          </div>
        </div>
        <div className="glass-card p-5 bg-white border border-[#DCE5DA]">
          <div className="text-xs font-bold text-[#577262] uppercase tracking-wider mb-1">Registered Citizens</div>
          <div className="text-3xl font-extrabold text-[#234E35]">{stats?.totalUsers || 0}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6 bg-white border border-[#DCE5DA]">
          <h2 className="text-base font-bold text-[#14261C] mb-4 pb-2 border-b border-[#EAF0E8]">Breakdown by Domain</h2>
          <div className="space-y-2.5">
            {stats?.byCategory?.map((cat: any) => (
              <div key={cat.name} className="flex items-center justify-between p-3 rounded-xl bg-[#F6FAF5] border border-[#DEE7DC]">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || '#2D6C48' }} />
                  <span className="text-xs font-bold text-[#14261C]">{cat.name}</span>
                </div>
                <span className="font-mono text-xs font-extrabold text-[#1D5432] bg-white px-2 py-0.5 rounded-md border border-[#D5E3D3]">
                  {cat.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 bg-white border border-[#DCE5DA]">
          <h2 className="text-base font-bold text-[#14261C] mb-4 pb-2 border-b border-[#EAF0E8]">Severity & Urgency Index</h2>
          <div className="space-y-4">
            {Object.entries(stats?.byPriority || {}).map(([priority, count]: any) => (
              <div key={priority}>
                <div className="flex justify-between text-xs font-semibold text-[#4E6757] mb-1.5">
                  <span className="capitalize">{priority} Priority</span>
                  <span className="text-[#14261C] font-mono font-bold">{count} cases</span>
                </div>
                <div className="h-2 rounded-full bg-[#EAEFE8] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      priority === 'critical' ? 'bg-[#C52222]' :
                      priority === 'high' ? 'bg-[#C25008]' :
                      priority === 'medium' ? 'bg-[#B57314]' : 'bg-[#1E6B39]'
                    }`}
                    style={{
                      width: `${stats?.totalProblems ? ((count / stats.totalProblems) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
