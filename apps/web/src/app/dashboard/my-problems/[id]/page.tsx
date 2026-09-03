'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  submitted: 'badge-submitted',
  under_verification: 'badge-under_verification',
  ai_analysis: 'badge-ai_analysis',
  ai_research: 'badge-ai_research',
  verified: 'badge-verified',
  rejected: 'badge-rejected',
  published: 'badge-published',
  resolved: 'badge-resolved',
  in_progress: 'badge-in_progress',
  more_info_needed: 'badge-more_info_needed',
  awaiting_approval: 'badge-awaiting_approval',
  approved: 'badge-approved',
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

export default function UserProblemDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getProblem(id)
      .then((data: any) => setProblem(data))
      .catch((err: any) => setError(err.message || 'Problem not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 flex justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="max-w-xl mx-auto glass-card p-10 text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <h2 className="text-lg font-bold text-white mb-2">{error || 'Problem not found'}</h2>
        <Link href="/dashboard/my-problems" className="btn-secondary mt-4 inline-block">
          ← Back to My Problems
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/dashboard/my-problems" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
          ← Back to My Problems
        </Link>
        <Link href={`/dashboard/track?id=${problem.civId}`} className="text-xs text-cyan-400 hover:text-cyan-300">
          Track Lifecycle Timeline →
        </Link>
      </div>

      {/* Main card */}
      <div className="glass-card p-6 mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="font-mono text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded font-bold">
            {problem.civId}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[problem.status] || ''}`}>
            {STATUS_LABELS[problem.status] || problem.status}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/10 text-gray-300">
            {problem.effectivePriority?.toUpperCase()} PRIORITY
          </span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-4">{problem.title}</h1>

        <div className="grid sm:grid-cols-3 gap-4 p-4 rounded-xl bg-white/3 border border-white/5 mb-6 text-sm">
          <div>
            <span className="text-xs text-gray-500 block">Category</span>
            <span className="text-gray-200 font-medium">{problem.category?.name || '—'}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Location</span>
            <span className="text-gray-200 font-medium">
              {problem.location?.city}{problem.location?.area ? `, ${problem.location.area}` : ''}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Submitted On</span>
            <span className="text-gray-200 font-medium">{new Date(problem.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {problem.description && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Description</h3>
            <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed bg-white/2 p-4 rounded-xl border border-white/5">
              {problem.description}
            </p>
          </div>
        )}

        {/* Evidence */}
        {problem.attachments?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">
              Attached Evidence ({problem.attachments.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {problem.attachments.map((att: any) => (
                <a
                  key={att.id}
                  href={att.signedUrl || att.storageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl overflow-hidden border border-white/10 hover:border-cyan-500/40 transition-all block bg-white/3"
                >
                  {att.mimeType?.startsWith('image/') ? (
                    <img
                      src={att.signedUrl || att.storageUrl}
                      alt={att.originalName}
                      className="w-full h-28 object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-28 flex flex-col items-center justify-center text-gray-400 gap-1">
                      <span className="text-2xl">📄</span>
                      <span className="text-xs text-gray-500">{att.mimeType?.split('/')[1]?.toUpperCase()}</span>
                    </div>
                  )}
                  <div className="p-2 bg-black/40">
                    <p className="text-xs text-gray-300 truncate">{att.originalName}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status History */}
      <div className="glass-card p-6">
        <h2 className="text-base font-semibold text-white mb-4">Status & Resolution Updates</h2>
        {problem.statusHistory?.length > 0 ? (
          <div className="space-y-3">
            {problem.statusHistory.map((history: any) => (
              <div key={history.id} className="flex gap-4 p-3 rounded-xl bg-white/2 border border-white/5 text-sm">
                <div className="text-cyan-400 font-mono text-xs flex-shrink-0 pt-0.5">
                  {new Date(history.createdAt).toLocaleDateString()}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white mb-0.5">
                    Status changed to <span className="text-cyan-300">{STATUS_LABELS[history.toStatus] || history.toStatus}</span>
                  </div>
                  {history.notes && (
                    <p className="text-xs text-gray-400">{history.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500">No updates yet. Your problem is in queue for review.</p>
        )}
      </div>
    </div>
  );
}
