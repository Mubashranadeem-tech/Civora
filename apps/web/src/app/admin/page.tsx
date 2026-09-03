'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

function StatCard({ label, value, icon, color, sub }: any) {
  return (
    <div className="glass-card p-5 group hover:border-white/15 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="text-2xl">{icon}</div>
        <div className={`text-2xl font-bold ${color}`}>{value ?? '—'}</div>
      </div>
      <div className="text-sm font-medium text-gray-300">{label}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

const PRIORITY_BAR_COLORS: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

const STATUS_COLORS: Record<string, string> = {
  submitted: '#3b82f6',
  under_verification: '#eab308',
  ai_analysis: '#8b5cf6',
  verified: '#22c55e',
  rejected: '#ef4444',
  published: '#06b6d4',
  resolved: '#10b981',
  in_progress: '#f97316',
};

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiStatus, setAiStatus] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      api.getAnalytics().catch(() => null),
      api.getAiStatus().catch(() => null),
    ]).then(([analytics, ai]) => {
      setStats(analytics);
      setAiStatus(ai);
      setLoading(false);
    });
  }, []);

  const priorityTotal = stats
    ? Object.values(stats.byPriority as Record<string, number>).reduce((a: any, b: any) => a + b, 0) || 1
    : 1;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Admin Overview</h1>
          <p className="text-gray-400 text-sm">Real-time Civora platform statistics</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/10 text-xs text-gray-400">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Live
        </div>
      </div>

      {/* AI Status Banner */}
      {aiStatus && (
        <div className={`mb-6 p-4 rounded-xl border ${aiStatus.isConfigured ? 'bg-green-500/10 border-green-500/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
          <div className="flex items-center gap-3">
            <div className="text-xl">🤖</div>
            <div>
              <div className={`text-sm font-medium ${aiStatus.isConfigured ? 'text-green-300' : 'text-orange-300'}`}>
                AI Engine: {aiStatus.isConfigured ? 'Online & Configured' : 'Not Configured'}
              </div>
              <div className="text-xs text-gray-400">
                Provider: {aiStatus.provider} {!aiStatus.isConfigured && '— Set OPENAI_API_KEY in .env to enable AI features'}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
      ) : (
        <>
          {/* Main Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Problems" value={stats?.totalProblems} icon="📋" color="text-blue-400" />
            <StatCard label="New / Submitted" value={stats?.newProblems} icon="🆕" color="text-cyan-400" sub="Needs attention" />
            <StatCard label="Critical Priority" value={stats?.criticalProblems} icon="🔴" color="text-red-400" sub="Urgent action needed" />
            <StatCard label="Pending Verification" value={stats?.pendingVerification} icon="⏳" color="text-yellow-400" />
            <StatCard label="Verified" value={stats?.verifiedProblems} icon="✅" color="text-green-400" />
            <StatCard label="Published" value={stats?.publishedProblems} icon="🌐" color="text-purple-400" />
            <StatCard label="Resolved" value={stats?.resolvedProblems} icon="🎯" color="text-emerald-400" />
            <StatCard label="Total Users" value={stats?.totalUsers} icon="👥" color="text-indigo-400" />
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Priority Distribution */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4">Priority Distribution</h3>
              <div className="space-y-3">
                {['critical', 'high', 'medium', 'low'].map((priority) => {
                  const count = stats?.byPriority?.[priority] || 0;
                  const pct = Math.round((count / priorityTotal) * 100);
                  return (
                    <div key={priority}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400 capitalize">{priority}</span>
                        <span className="text-white font-medium">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full ${PRIORITY_BAR_COLORS[priority]} rounded-full transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Distribution */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4">Problems by Category</h3>
              <div className="space-y-2 max-h-52 overflow-auto">
                {stats?.byCategory?.length > 0 ? (
                  stats.byCategory
                    .sort((a: any, b: any) => b.count - a.count)
                    .slice(0, 8)
                    .map((cat: any) => (
                      <div key={cat.name} className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cat.color || '#6b7280' }} />
                        <div className="flex-1 text-xs text-gray-300 truncate">{cat.name || 'Unknown'}</div>
                        <div className="text-xs font-medium text-white">{cat.count}</div>
                      </div>
                    ))
                ) : (
                  <div className="text-sm text-gray-500 text-center py-6">No data yet</div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Problems */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Recent Problems</h3>
              <Link href="/admin/problems" className="text-xs text-cyan-400 hover:text-cyan-300">
                View All →
              </Link>
            </div>
            <div className="space-y-2">
              {stats?.recentProblems?.length > 0 ? (
                stats.recentProblems.map((p: any) => (
                  <Link
                    key={p.id}
                    href={`/admin/problems/${p.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <span className="font-mono text-xs text-cyan-400 w-36 flex-shrink-0">{p.civId}</span>
                    <span className="text-sm text-white flex-1 truncate group-hover:text-cyan-300 transition-colors">{p.title}</span>
                    <span className="text-xs text-gray-500 hidden sm:block">{p.categoryName}</span>
                    <span className="text-xs text-gray-600">{new Date(p.createdAt).toLocaleDateString()}</span>
                  </Link>
                ))
              ) : (
                <div className="text-sm text-gray-500 text-center py-8">No problems yet</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
