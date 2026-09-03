'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
  more_info_needed: 'badge-more_info_needed',
  awaiting_approval: 'badge-awaiting_approval',
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

export default function MyProblemsPage() {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { page: String(page), limit: '10' };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;

    api.listProblems(params)
      .then((data: any) => {
        setProblems(data.data || []);
        setPagination(data.pagination);
      })
      .catch(() => setProblems([]))
      .finally(() => setLoading(false));
  }, [page, search, statusFilter]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">My Problems</h1>
          <p className="text-gray-400 text-sm">All your submitted civic problem reports</p>
        </div>
        <Link href="/dashboard/submit" className="btn-primary text-sm">
          + Report New
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input-civora flex-1"
          placeholder="Search problems..."
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-civora sm:w-48"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      ) : problems.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-xl font-semibold text-white mb-2">No problems found</h2>
          <p className="text-gray-400 text-sm mb-6">
            {search || statusFilter ? 'Try adjusting your filters.' : "You haven't reported any problems yet."}
          </p>
          {!search && !statusFilter && (
            <Link href="/dashboard/submit" className="btn-primary inline-flex">Submit First Report</Link>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {problems.map((problem) => (
              <Link
                key={problem.id}
                href={`/dashboard/my-problems/${problem.id}`}
                className="glass-card p-4 flex items-center gap-4 group cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                      {problem.civId}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[problem.status] || ''}`}>
                      {STATUS_LABELS[problem.status] || problem.status}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[problem.effectivePriority] || ''}`}>
                      {problem.effectivePriority?.toUpperCase()}
                    </span>
                    {problem.attachmentCount > 0 && (
                      <span className="text-xs text-gray-500">📎 {problem.attachmentCount}</span>
                    )}
                  </div>
                  <div className="text-sm font-medium text-white truncate group-hover:text-cyan-300 transition-colors">
                    {problem.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {problem.categoryName} · {problem.city} · {new Date(problem.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div className="text-gray-600 group-hover:text-gray-400 transition-colors">→</div>
              </Link>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary text-sm disabled:opacity-30 px-3 py-2"
              >
                ← Prev
              </button>
              <span className="text-sm text-gray-400">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="btn-secondary text-sm disabled:opacity-30 px-3 py-2"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
