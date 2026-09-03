'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth.context';
import { api } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  submitted: 'badge-submitted',
  under_verification: 'badge-under_verification',
  ai_analysis: 'badge-ai_analysis',
  verified: 'badge-verified',
  rejected: 'badge-rejected',
  published: 'badge-published',
  resolved: 'badge-resolved',
  in_progress: 'badge-in_progress',
};

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  under_verification: 'Under Verification',
  ai_analysis: 'AI Analysis',
  ai_research: 'AI Research',
  verified: 'Verified',
  rejected: 'Rejected',
  awaiting_approval: 'Awaiting Approval',
  approved: 'Approved',
  published: 'Published',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  more_info_needed: 'More Info Needed',
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'badge-critical',
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
};

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-2xl">{icon}</div>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
      </div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

export default function DashboardHome() {
  const { user } = useAuth();
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listProblems({ limit: '5', sortBy: 'newest' })
      .then((data: any) => setProblems(data.data || []))
      .catch(() => setProblems([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: problems.length,
    active: problems.filter(p => !['resolved', 'rejected'].includes(p.status)).length,
    resolved: problems.filter(p => p.status === 'resolved').length,
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-400 text-sm">Here's an overview of your civic reports.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Reports" value={user?.problemsCount || 0} icon="📋" color="text-blue-400" />
        <StatCard label="Active Cases" value={stats.active} icon="🔄" color="text-orange-400" />
        <StatCard label="Resolved" value={stats.resolved} icon="✅" color="text-green-400" />
        <StatCard label="Your City" value={user?.city || '—'} icon="🏙️" color="text-cyan-400" />
      </div>

      {/* CTA */}
      <div className="glass-card p-6 mb-8 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border border-cyan-500/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-white mb-1">See something that needs fixing?</h2>
            <p className="text-sm text-gray-400">Report a civic problem in your community with photos, documents, and location.</p>
          </div>
          <Link href="/dashboard/submit" className="btn-primary flex-shrink-0">
            Report a Problem →
          </Link>
        </div>
      </div>

      {/* Recent Problems */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Your Recent Reports</h2>
          <Link href="/dashboard/my-problems" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : problems.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="font-semibold text-white mb-2">No reports yet</h3>
            <p className="text-sm text-gray-400 mb-6">Submit your first civic problem report to get started.</p>
            <Link href="/dashboard/submit" className="btn-primary inline-flex">
              Submit First Report
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {problems.map((problem) => (
              <Link
                key={problem.id}
                href={`/dashboard/my-problems/${problem.id}`}
                className="glass-card p-4 flex items-center gap-4 group cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-cyan-400">{problem.civId}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[problem.status] || 'badge-submitted'}`}>
                      {STATUS_LABELS[problem.status] || problem.status}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[problem.effectivePriority] || ''}`}>
                      {problem.effectivePriority?.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-white truncate group-hover:text-cyan-300 transition-colors">
                    {problem.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {problem.categoryName} · {problem.city} · {new Date(problem.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-gray-600 group-hover:text-gray-400 transition-colors text-sm">→</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
