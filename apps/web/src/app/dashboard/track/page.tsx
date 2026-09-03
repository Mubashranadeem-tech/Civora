'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

const STATUS_TIMELINE = [
  { status: 'submitted', label: 'Submitted', icon: '📋', desc: 'Problem received by Civora' },
  { status: 'under_verification', label: 'Under Verification', icon: '🔍', desc: 'Team is reviewing the report' },
  { status: 'ai_analysis', label: 'AI Analysis', icon: '🤖', desc: 'AI analyzing evidence and severity' },
  { status: 'ai_research', label: 'AI Research', icon: '🔬', desc: 'Deep research underway' },
  { status: 'verified', label: 'Verified', icon: '✅', desc: 'Problem has been verified' },
  { status: 'awaiting_approval', label: 'Awaiting Approval', icon: '⏳', desc: 'Admin reviewing for publication' },
  { status: 'approved', label: 'Approved', icon: '👍', desc: 'Approved for publication' },
  { status: 'published', label: 'Published', icon: '🌐', desc: 'Published to public channels' },
  { status: 'in_progress', label: 'In Progress', icon: '🔧', desc: 'Authorities addressing the issue' },
  { status: 'resolved', label: 'Resolved', icon: '🎉', desc: 'Problem has been resolved!' },
];

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-green-400',
};

export default function TrackProblemPage() {
  const [civId, setCivId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const track = async () => {
    if (!civId.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await api.trackProblem(civId.trim().toUpperCase()) as any;
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Problem not found');
    } finally {
      setLoading(false);
    }
  };

  const currentStatusIndex = result
    ? STATUS_TIMELINE.findIndex((s) => s.status === result.status)
    : -1;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Track a Problem</h1>
        <p className="text-gray-400 text-sm">Enter a Civora Problem ID to see its current status and lifecycle.</p>
      </div>

      {/* Search */}
      <div className="glass-card p-6 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={civId}
            onChange={(e) => setCivId(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && track()}
            className="input-civora flex-1 font-mono text-sm"
            placeholder="CIV-2026-000001"
          />
          <button onClick={track} disabled={loading} className="btn-primary px-6">
            {loading ? '...' : 'Track'}
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-4 animate-fade-in">
          {/* Problem Header */}
          <div className="glass-card p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="font-mono text-lg font-bold gradient-text mb-1">{result.civId}</div>
                <h2 className="text-lg font-semibold text-white">{result.title}</h2>
                <div className="text-sm text-gray-400 mt-1">
                  {result.categoryName} · {result.city}
                </div>
              </div>
              <div className={`text-sm font-semibold ${PRIORITY_COLORS[result.effectivePriority]}`}>
                {result.effectivePriority?.toUpperCase()}
              </div>
            </div>

            <div className="text-xs text-gray-500">
              Submitted: {new Date(result.createdAt).toLocaleString()}
            </div>
          </div>

          {/* Status Timeline */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-6">Problem Lifecycle</h3>
            <div className="space-y-1">
              {STATUS_TIMELINE.map((item, i) => {
                const isPast = i < currentStatusIndex;
                const isCurrent = i === currentStatusIndex;
                const isFuture = i > currentStatusIndex;

                // Skip rejected/closed states unless they match current
                if (['rejected', 'closed', 'more_info_needed'].includes(item.status) && item.status !== result.status) {
                  return null;
                }

                return (
                  <div key={item.status} className="timeline-item">
                    <div className={`timeline-dot ${
                      isPast
                        ? 'bg-green-500/20 border-green-500/50'
                        : isCurrent
                        ? 'bg-cyan-500/20 border-cyan-500 animate-pulse-glow'
                        : 'bg-white/5 border-white/15'
                    }`}>
                      <span className="text-xs">
                        {isPast ? '✓' : isCurrent ? '●' : '○'}
                      </span>
                    </div>

                    <div className={`pb-6 ${isFuture ? 'opacity-30' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span>{item.icon}</span>
                        <span className={`text-sm font-medium ${isCurrent ? 'text-cyan-300' : isPast ? 'text-white' : 'text-gray-500'}`}>
                          {item.label}
                        </span>
                        {isCurrent && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{item.desc}</div>

                      {/* Show timestamp if in history */}
                      {result.statusHistory?.find((h: any) => h.toStatus === item.status) && (
                        <div className="text-xs text-gray-600 mt-1">
                          {new Date(result.statusHistory.find((h: any) => h.toStatus === item.status)?.createdAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Empty state hint */}
      {!result && !loading && !error && (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="font-semibold text-white mb-2">Track Your Problem</h3>
          <p className="text-sm text-gray-400">
            Enter your Problem ID (e.g., <span className="font-mono text-cyan-400">CIV-2026-000001</span>) above to see its current status and full lifecycle timeline.
          </p>
        </div>
      )}
    </div>
  );
}
