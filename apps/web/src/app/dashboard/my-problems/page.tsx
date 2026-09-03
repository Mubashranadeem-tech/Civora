'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Plus, Paperclip, MapPin, ArrowRight, Inbox } from 'lucide-react';

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
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="pb-2 border-b border-[#E2EBE0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#13251A] tracking-tight">My Civic Reports</h1>
          <p className="text-sm text-[#546E5E]">View and inspect the resolution progress of your submitted complaints.</p>
        </div>
        <Link href="/dashboard/submit" className="btn-primary text-xs px-5 py-2.5 rounded-xl shadow-xs self-start sm:self-auto inline-flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          Report New Problem
        </Link>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input-civora flex-1"
          placeholder="Search by title, keyword, or location..."
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-civora sm:w-48 text-xs font-semibold"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      ) : problems.length === 0 ? (
        <div className="glass-card p-16 text-center bg-white border border-[#DCE5DA]">
          <Inbox className="w-10 h-10 text-[#718D7D] mx-auto mb-2" />
          <h2 className="text-lg font-bold text-[#14261C] mb-1">No community reports found</h2>
          <p className="text-xs text-[#5D7666] mb-6">
            {search || statusFilter ? 'Try adjusting your search criteria.' : "You haven't reported any problems yet."}
          </p>
          {!search && !statusFilter && (
            <Link href="/dashboard/submit" className="btn-primary text-xs px-5 py-2.5 rounded-xl inline-flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Submit Your First Report
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {problems.map((problem) => (
              <Link
                key={problem.id}
                href={`/dashboard/my-problems/${problem.id}`}
                className="glass-card p-5 flex items-center justify-between gap-4 bg-white border border-[#DCE5DA] hover:border-[#96B89A] transition-all group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-[#1F5333] bg-[#EBF4E8] px-2.5 py-0.5 rounded-md border border-[#CCE2CA]">
                      {problem.civId}
                    </span>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase ${STATUS_COLORS[problem.status] || ''}`}>
                      {STATUS_LABELS[problem.status] || problem.status}
                    </span>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase ${PRIORITY_COLORS[problem.effectivePriority] || ''}`}>
                      {problem.effectivePriority}
                    </span>
                    {problem.attachmentCount > 0 && (
                      <span className="text-xs text-[#5E7868] flex items-center gap-1">
                        <Paperclip className="w-3 h-3 text-[#799584]" />
                        {problem.attachmentCount}
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-[#14261C] group-hover:text-[#215735] truncate transition-colors">
                    {problem.title}
                  </div>
                  <div className="text-xs text-[#60796A] mt-1 flex items-center gap-1.5">
                    <span>{problem.categoryName}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#7A9685]" />
                      {problem.city || 'Islamabad'}
                    </span>
                    <span>·</span>
                    <span>{new Date(problem.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#205433] bg-[#F2F7F1] px-3 py-1.5 rounded-lg border border-[#DCE6DA] flex items-center gap-1">
                  Inspect
                  <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary text-xs disabled:opacity-40 px-3.5 py-2"
              >
                ← Prev
              </button>
              <span className="text-xs font-bold text-[#4E6857]">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
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
