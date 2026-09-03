'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { 
  ClipboardList, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Globe, 
  Target, 
  Users, 
  Cpu, 
  ArrowRight 
} from 'lucide-react';

function StatCard({ label, value, icon: Icon, color, sub }: any) {
  return (
    <div className="glass-card p-5 group hover:border-[#ADC7B0] transition-all bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-[#F0F6EE] border border-[#D9E7D8] flex items-center justify-center text-[#235837]">
          <Icon className="w-5 h-5" />
        </div>
        <div className={`text-2xl font-extrabold ${color}`}>{value ?? '—'}</div>
      </div>
      <div className="text-xs font-bold text-[#14261C]">{label}</div>
      {sub && <div className="text-[11px] text-[#5D7867] mt-1 font-medium">{sub}</div>}
    </div>
  );
}

const PRIORITY_BAR_COLORS: Record<string, string> = {
  critical: 'bg-[#C52222]',
  high: 'bg-[#C25008]',
  medium: 'bg-[#C4881A]',
  low: 'bg-[#2E6F48]',
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3EBE1]">
        <div>
          <h1 className="text-2xl font-extrabold text-[#13251A] tracking-tight">Admin Overview</h1>
          <p className="text-[#516C5C] text-sm">Real-time civic intelligence and resolution status</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#D5E4D4] text-xs font-semibold text-[#255C3A] shadow-xs">
          <div className="w-2 h-2 rounded-full bg-[#2F7A4C] animate-pulse" />
          Live Connected Engine
        </div>
      </div>

      {/* AI Status Banner */}
      {aiStatus && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
            aiStatus.isConfigured
              ? 'bg-[#EBF5EB] border-[#CDE5CC] text-[#1B5230]'
              : 'bg-[#FFF4EB] border-[#FBD9BE] text-[#9A420A]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#CFE3CE] flex items-center justify-center text-[#1E5433] shadow-xs">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold">
                AI Pipeline Engine: {aiStatus.isConfigured ? 'Operational & Ready' : 'Not Configured'}
              </div>
              <div className="text-[11px] opacity-80">
                Active Provider: <span className="font-semibold uppercase">{aiStatus.provider}</span> (Groq High-Speed Inference)
              </div>
            </div>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white border border-current shadow-xs">
            {aiStatus.isConfigured ? 'ONLINE' : 'ACTION REQUIRED'}
          </span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Problems" value={stats?.totalProblems} icon={ClipboardList} color="text-[#19402B]" />
            <StatCard label="New / Submitted" value={stats?.newProblems} icon={AlertCircle} color="text-[#1A5B8C]" sub="Needs verification" />
            <StatCard label="Critical Priority" value={stats?.criticalProblems} icon={AlertCircle} color="text-[#C52222]" sub="Immediate action" />
            <StatCard label="Pending Triage" value={stats?.pendingVerification} icon={Clock} color="text-[#B57314]" />
            <StatCard label="AI Verified" value={stats?.verifiedProblems} icon={CheckCircle2} color="text-[#1F6E3B]" />
            <StatCard label="Published" value={stats?.publishedProblems} icon={Globe} color="text-[#126860]" sub="WordPress & Social" />
            <StatCard label="Resolved" value={stats?.resolvedProblems} icon={Target} color="text-[#1E6B39]" />
            <StatCard label="Total Users" value={stats?.totalUsers} icon={Users} color="text-[#4E3F78]" />
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Priority Distribution */}
            <div className="glass-card p-6 bg-white">
              <h3 className="font-bold text-base text-[#14261C] mb-4">Priority Distribution</h3>
              <div className="space-y-3.5">
                {['critical', 'high', 'medium', 'low'].map((priority) => {
                  const count = stats?.byPriority?.[priority] || 0;
                  const pct = Math.round((count / priorityTotal) * 100);
                  return (
                    <div key={priority}>
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className="text-[#4E6757] capitalize">{priority} Priority</span>
                        <span className="text-[#16291E] font-mono">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#EAEFE8] overflow-hidden">
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

            {/* Category Breakdown */}
            <div className="glass-card p-6 bg-white">
              <h3 className="font-bold text-base text-[#14261C] mb-4">Volume by Domain</h3>
              <div className="space-y-2.5 max-h-52 overflow-auto pr-2">
                {stats?.byCategory?.length > 0 ? (
                  stats.byCategory
                    .sort((a: any, b: any) => b.count - a.count)
                    .slice(0, 8)
                    .map((cat: any) => (
                      <div key={cat.name} className="flex items-center justify-between p-2 rounded-xl bg-[#F6FAF5] border border-[#E2EBE1]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color || '#358153' }} />
                          <span className="text-xs font-bold text-[#182F22]">{cat.name || 'General'}</span>
                        </div>
                        <span className="text-xs font-mono font-extrabold text-[#225737] bg-white px-2 py-0.5 rounded-md border border-[#D5E3D3]">
                          {cat.count}
                        </span>
                      </div>
                    ))
                ) : (
                  <div className="text-xs text-[#728A7A] text-center py-8">No category data recorded yet</div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Problems */}
          <div className="glass-card p-6 bg-white">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EAF0E8]">
              <h3 className="font-bold text-base text-[#14261C]">Recent Community Reports</h3>
              <Link href="/admin/problems" className="text-xs font-bold text-[#235C3A] hover:text-[#143922] transition-colors inline-flex items-center gap-1">
                View Full Queue
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {stats?.recentProblems?.length > 0 ? (
                stats.recentProblems.map((p: any) => (
                  <Link
                    key={p.id}
                    href={`/admin/problems/${p.id}`}
                    className="flex items-center justify-between gap-4 p-3.5 rounded-xl hover:bg-[#F2F7F1] border border-transparent hover:border-[#D6E3D4] transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs font-bold text-[#215735] bg-[#EBF4E8] px-2.5 py-1 rounded-md border border-[#CCE2CA] flex-shrink-0">
                        {p.civId}
                      </span>
                      <span className="text-xs font-bold text-[#15271D] group-hover:text-[#215735] truncate transition-colors">
                        {p.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 text-xs text-[#5C7566]">
                      <span className="hidden sm:inline-block font-medium px-2 py-0.5 rounded bg-[#F0F5EE] border border-[#DEE7DC]">
                        {p.categoryName || 'General'}
                      </span>
                      <span className="font-mono text-[11px]">{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-xs text-[#708979] text-center py-8">No problems registered yet</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
