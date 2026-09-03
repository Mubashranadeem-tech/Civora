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
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Civic Analytics & Insights</h1>
        <p className="text-gray-400 text-sm">Aggregated city health, resolution rates, and civic trend metrics</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5">
          <div className="text-xs text-gray-400 mb-1">Total Issues Logged</div>
          <div className="text-3xl font-bold text-white">{stats?.totalProblems || 0}</div>
        </div>
        <div className="glass-card p-5">
          <div className="text-xs text-gray-400 mb-1">Resolved Successfully</div>
          <div className="text-3xl font-bold text-green-400">{stats?.resolvedProblems || 0}</div>
        </div>
        <div className="glass-card p-5">
          <div className="text-xs text-gray-400 mb-1">Resolution Rate</div>
          <div className="text-3xl font-bold text-cyan-400">
            {stats?.totalProblems ? Math.round(((stats?.resolvedProblems || 0) / stats.totalProblems) * 100) : 0}%
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="text-xs text-gray-400 mb-1">Active Citizens</div>
          <div className="text-3xl font-bold text-purple-400">{stats?.totalUsers || 0}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Breakdown by Domain</h2>
          <div className="space-y-3">
            {stats?.byCategory?.map((cat: any) => (
              <div key={cat.name} className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || '#38bdf8' }} />
                  <span className="text-sm text-gray-200">{cat.name}</span>
                </div>
                <span className="font-mono text-sm font-semibold text-white">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Severity & Urgency Index</h2>
          <div className="space-y-4">
            {Object.entries(stats?.byPriority || {}).map(([priority, count]: any) => (
              <div key={priority}>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span className="capitalize">{priority}</span>
                  <span className="text-white font-medium">{count} cases</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      priority === 'critical' ? 'bg-red-500' :
                      priority === 'high' ? 'bg-orange-500' :
                      priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
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
