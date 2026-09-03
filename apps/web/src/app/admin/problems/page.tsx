'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

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

const STATUS_COLORS: Record<string, string> = {
  submitted: 'badge-submitted',
  under_verification: 'badge-under_verification',
  ai_analysis: 'badge-ai_analysis',
  verified: 'badge-verified',
  rejected: 'badge-rejected',
  published: 'badge-published',
  resolved: 'badge-resolved',
  awaiting_approval: 'badge-awaiting_approval',
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'badge-critical',
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
};

const PRIORITY_ICONS: Record<string, string> = {
  critical: '🔴',
  high: '🟠',
  medium: '🟡',
  low: '🟢',
};

export default function AdminProblemsPage() {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  const fetchProblems = () => {
    setLoading(true);
    const params: Record<string, string> = {
      page: String(page),
      limit: '15',
      sortBy: 'priority',
    };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (priorityFilter) params.priority = priorityFilter;

    api.listProblems(params)
      .then((data: any) => {
        setProblems(data.data || []);
        setPagination(data.pagination);
      })
      .catch(() => setProblems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProblems(); }, [page, search, statusFilter, priorityFilter]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Problems Queue</h1>
          <p className="text-gray-400 text-sm">
            {pagination ? `${pagination.total} total problems` : 'Loading...'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input-civora flex-1 min-w-48"
          placeholder="Search by title, ID..."
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-civora w-48"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
          className="input-civora w-36"
        >
          <option value="">All Priority</option>
          <option value="critical">🔴 Critical</option>
          <option value="high">🟠 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : problems.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-xl font-semibold text-white mb-2">No problems found</h2>
          <p className="text-gray-400 text-sm">Adjust filters or wait for citizen submissions.</p>
        </div>
      ) : (
        <>
          <div className="glass-card overflow-hidden mb-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">ID</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 hidden lg:table-cell">Submitter</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 hidden sm:table-cell">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {problems.map((problem) => (
                  <tr key={problem.id} className="border-b border-white/3 hover:bg-white/3 transition-colors group">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-cyan-400">{problem.civId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-white max-w-xs truncate font-medium group-hover:text-cyan-300 transition-colors">
                        {problem.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 hidden sm:block">
                        {problem.city} · 📎 {problem.attachmentCount}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-400">{problem.categoryName}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-gray-400">{problem.submitterName || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[problem.effectivePriority] || ''}`}>
                        {PRIORITY_ICONS[problem.effectivePriority]} {problem.effectivePriority?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[problem.status] || 'badge-submitted'}`}>
                        {STATUS_LABELS[problem.status] || problem.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-gray-500">
                        {new Date(problem.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/problems/${problem.id}`}
                        className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors px-2 py-1 rounded-lg hover:bg-cyan-500/10"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              <span className="text-sm text-gray-400">Page {page} of {pagination.totalPages}</span>
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
