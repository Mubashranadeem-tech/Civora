'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Search, MapPin, Paperclip, ArrowRight, Inbox } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3EBE1]">
        <div>
          <h1 className="text-2xl font-extrabold text-[#14261C] tracking-tight">Problems Queue</h1>
          <p className="text-[#516B5B] text-sm">
            {pagination ? `${pagination.total} total community reports in pipeline` : 'Loading queue...'}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 flex flex-wrap gap-3 bg-white border border-[#DCE6DA]">
        <div className="flex-1 min-w-[240px] relative">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-civora w-full"
            placeholder="Search by title, location, or Ticket ID..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-civora w-48 font-medium text-xs text-[#223B2B]"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
          className="input-civora w-40 font-medium text-xs text-[#223B2B]"
        >
          <option value="">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-2xl" />
          ))}
        </div>
      ) : problems.length === 0 ? (
        <div className="glass-card p-16 text-center bg-white">
          <Inbox className="w-10 h-10 text-[#718D7D] mx-auto mb-2" />
          <h2 className="text-lg font-bold text-[#14261C] mb-1">No community reports found</h2>
          <p className="text-xs text-[#5D7666]">Try adjusting your search criteria or filter selections.</p>
        </div>
      ) : (
        <>
          <div className="glass-card overflow-hidden bg-white border border-[#DCE5DA] shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#EAF0E8] bg-[#F7FAF6] text-[11px] font-bold uppercase tracking-wider text-[#4E6857]">
                    <th className="px-5 py-3.5">Ticket ID</th>
                    <th className="px-5 py-3.5">Problem Title</th>
                    <th className="px-5 py-3.5 hidden md:table-cell">Category</th>
                    <th className="px-5 py-3.5 hidden lg:table-cell">Submitter</th>
                    <th className="px-5 py-3.5">Priority</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Date</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDF3EC]">
                  {problems.map((problem) => (
                    <tr
                      key={problem.id}
                      className="hover:bg-[#F3F7F2] transition-colors group text-sm"
                    >
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-bold text-[#205434] bg-[#EBF4E8] px-2.5 py-1 rounded-md border border-[#CCE2CA] whitespace-nowrap">
                          {problem.civId}
                        </span>
                      </td>
                      <td className="px-5 py-4 max-w-xs sm:max-w-md">
                        <div className="font-bold text-[#14261C] group-hover:text-[#215735] truncate transition-colors">
                          {problem.title}
                        </div>
                        <div className="text-xs text-[#5E7666] mt-0.5 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#779483]" />
                            {problem.city || 'Islamabad'}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Paperclip className="w-3 h-3 text-[#779483]" />
                            {problem.attachmentCount || 0} files
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#F0F5EF] text-[#334D3D] border border-[#DEE7DD]">
                          {problem.categoryName || 'General'}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className="text-xs text-[#526B5C] font-medium">
                          {problem.submitterName || 'Anonymous'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center ${PRIORITY_COLORS[problem.effectivePriority] || ''}`}>
                          {problem.effectivePriority}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${STATUS_COLORS[problem.status] || 'badge-submitted'}`}>
                          {STATUS_LABELS[problem.status] || problem.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell text-xs font-mono text-[#617B6B]">
                        {new Date(problem.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/problems/${problem.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#1F5434] bg-[#EBF4E8] hover:bg-[#D7EBD4] border border-[#CDE3CB] px-3 py-1.5 rounded-lg transition-all"
                        >
                          Studio
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary text-xs disabled:opacity-40 px-3.5 py-2"
              >
                ← Prev
              </button>
              <span className="text-xs font-bold text-[#4E6857]">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="btn-secondary text-xs disabled:opacity-40 px-3.5 py-2"
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
