'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth.context';
import { api } from '@/lib/api';
import { 
  FileText, 
  RefreshCw, 
  CheckCircle2, 
  MapPin, 
  Plus, 
  ArrowRight,
  Inbox
} from 'lucide-react';

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

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="glass-card p-5 bg-white border border-[#DCE5DA]">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-[#F0F6EE] border border-[#D9E7D8] flex items-center justify-center text-[#235837]">
          <Icon className="w-5 h-5" />
        </div>
        <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
      </div>
      <div className="text-xs font-bold text-[#577262]">{label}</div>
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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="pb-2 border-b border-[#E2EBE0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#13251A] tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-[#546E5E]">Track your submitted civic issues and real-time resolution progress.</p>
        </div>
        <Link href="/dashboard/submit" className="btn-primary text-xs px-5 py-2.5 rounded-xl shadow-xs self-start sm:self-auto inline-flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          Report New Issue
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Reports" value={user?.problemsCount || 0} icon={FileText} color="text-[#19432C]" />
        <StatCard label="Active in Pipeline" value={stats.active} icon={RefreshCw} color="text-[#B5500A]" />
        <StatCard label="Issues Resolved" value={stats.resolved} icon={CheckCircle2} color="text-[#1E6B39]" />
        <StatCard label="Registered City" value={user?.city || 'Islamabad'} icon={MapPin} color="text-[#255C3A]" />
      </div>

      {/* Action Banner */}
      <div className="glass-card p-6 bg-gradient-to-r from-[#F4FAF2] to-[#EAF5E8] border border-[#CADDC8]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-base text-[#14261C] mb-1">Observe a hazard or municipal failure?</h2>
            <p className="text-xs text-[#526B5C]">Submit your report with GPS coordinates and photos for autonomous AI verification.</p>
          </div>
          <Link href="/dashboard/submit" className="btn-primary text-xs px-5 py-2.5 rounded-xl whitespace-nowrap shadow-xs inline-flex items-center gap-1.5">
            Start Submission Wizard
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Recent Problems */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base text-[#14261C]">Your Recent Submissions</h2>
          <Link href="/dashboard/my-problems" className="text-xs font-bold text-[#235C3A] hover:text-[#143922] transition-colors inline-flex items-center gap-1">
            View All Reports
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-2xl" />
            ))}
          </div>
        ) : problems.length === 0 ? (
          <div className="glass-card p-12 text-center bg-white border border-[#DCE5DA]">
            <Inbox className="w-10 h-10 text-[#718D7D] mx-auto mb-2" />
            <h3 className="font-bold text-base text-[#14261C] mb-1">No reports logged yet</h3>
            <p className="text-xs text-[#5E7666] mb-4">You have not submitted any civic complaints so far.</p>
            <Link href="/dashboard/submit" className="btn-primary text-xs px-5 py-2.5 rounded-xl inline-flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Submit Your First Report
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {problems.map((problem) => (
              <Link
                key={problem.id}
                href={`/dashboard/my-problems/${problem.id}`}
                className="glass-card p-4 flex items-center justify-between gap-4 bg-white border border-[#DCE5DA] hover:border-[#96B89A] transition-all group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#215735] bg-[#EBF4E8] px-2 py-0.5 rounded-md border border-[#CCE2CA]">
                      {problem.civId}
                    </span>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase ${STATUS_COLORS[problem.status] || 'badge-submitted'}`}>
                      {STATUS_LABELS[problem.status] || problem.status}
                    </span>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase ${PRIORITY_COLORS[problem.effectivePriority] || ''}`}>
                      {problem.effectivePriority}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-[#14261C] group-hover:text-[#235C3A] transition-colors truncate">
                    {problem.title}
                  </div>
                  <div className="text-xs text-[#637C6D] mt-0.5 flex items-center gap-1.5">
                    <span>{problem.categoryName}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#7B9586]" />
                      {problem.city || 'Islamabad'}
                    </span>
                    <span>·</span>
                    <span>{new Date(problem.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#235C3A] bg-[#F2F7F1] px-3 py-1.5 rounded-lg border border-[#DCE6DA] flex items-center gap-1">
                  Track
                  <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
