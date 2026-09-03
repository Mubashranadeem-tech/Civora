'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { AlertCircle, MapPin, Paperclip, ArrowRight, FileText } from 'lucide-react';

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
        <div className="w-8 h-8 border-3 border-[#2A6544]/20 border-t-[#2A6544] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="max-w-xl mx-auto glass-card p-10 text-center bg-white border border-[#DCE5DA]">
        <AlertCircle className="w-10 h-10 text-[#C52222] mx-auto mb-2" />
        <h2 className="text-lg font-bold text-[#14261C] mb-2">{error || 'Problem not found'}</h2>
        <Link href="/dashboard/my-problems" className="btn-secondary mt-4 inline-block text-xs">
          ← Back to My Reports
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E2EBE0]">
        <Link
          href="/dashboard/my-problems"
          className="text-xs font-bold text-[#4E6857] hover:text-[#163623] transition-colors flex items-center gap-1"
        >
          ← Back to Reports
        </Link>
        <Link
          href={`/dashboard/track?id=${problem.civId}`}
          className="text-xs font-bold text-[#205433] hover:underline inline-flex items-center gap-1"
        >
          Track Full Lifecycle Stepper
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Details Card */}
      <div className="glass-card p-6 md:p-8 bg-white border border-[#DCE5DA] shadow-xs">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="font-mono text-xs font-extrabold text-[#1F5333] bg-[#EBF4E8] px-2.5 py-0.5 rounded-md border border-[#CCE2CA]">
            {problem.civId}
          </span>
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase ${STATUS_COLORS[problem.status] || ''}`}>
            {STATUS_LABELS[problem.status] || problem.status}
          </span>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-[#F2F7F1] text-[#294B37] border border-[#D7E4D5]">
            {problem.effectivePriority} PRIORITY
          </span>
        </div>

        <h1 className="text-2xl font-extrabold text-[#14261C] mb-4">{problem.title}</h1>

        <div className="grid sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#F6FAF5] border border-[#E2EBE1] mb-6 text-xs">
          <div>
            <span className="font-bold text-[#567261] uppercase tracking-wider block mb-1">Domain</span>
            <span className="text-[#14261C] font-semibold">{problem.category?.name || '—'}</span>
          </div>
          <div>
            <span className="font-bold text-[#567261] uppercase tracking-wider block mb-1">Location</span>
            <span className="text-[#14261C] font-semibold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#2B6846]" />
              {problem.location?.city}{problem.location?.area ? `, ${problem.location.area}` : ''}
            </span>
          </div>
          <div>
            <span className="font-bold text-[#567261] uppercase tracking-wider block mb-1">Submission Date</span>
            <span className="text-[#14261C] font-semibold">{new Date(problem.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {problem.description && (
          <div className="mb-6">
            <h3 className="text-xs font-bold text-[#4E6857] uppercase tracking-wider mb-2">Description</h3>
            <p className="text-[#2B4033] text-xs whitespace-pre-wrap leading-relaxed bg-[#F9FBF8] p-4 rounded-xl border border-[#E2ECE1]">
              {problem.description}
            </p>
          </div>
        )}

        {/* Evidence */}
        {problem.attachments?.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-[#4E6857] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Paperclip className="w-4 h-4 text-[#2B6846]" />
              Attached Evidence ({problem.attachments.length} files)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {problem.attachments.map((att: any) => (
                <a
                  key={att.id}
                  href={att.signedUrl || att.storageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl overflow-hidden border border-[#D6E3D4] hover:border-[#2D6C48] transition-all block bg-[#FAFDF9]"
                >
                  {att.mimeType?.startsWith('image/') ? (
                    <img
                      src={att.signedUrl || att.storageUrl}
                      alt={att.originalName}
                      className="w-full h-28 object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-28 flex flex-col items-center justify-center bg-[#F2F7F1] text-[#4E6B5A] gap-1">
                      <FileText className="w-6 h-6 text-[#2B6846]" />
                      <span className="text-[10px] font-mono font-bold uppercase">{att.mimeType?.split('/')[1]}</span>
                    </div>
                  )}
                  <div className="p-2 bg-white border-t border-[#EAEFE8]">
                    <p className="text-[11px] font-bold text-[#14261C] truncate">{att.originalName}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status History Updates */}
      <div className="glass-card p-6 md:p-8 bg-white border border-[#DCE5DA] shadow-xs">
        <h2 className="font-bold text-base text-[#14261C] mb-4 pb-2 border-b border-[#EAF0E8]">
          Timeline & Administrative Log
        </h2>
        {problem.statusHistory?.length > 0 ? (
          <div className="space-y-3">
            {problem.statusHistory.map((history: any) => (
              <div key={history.id} className="flex items-start gap-4 p-3.5 rounded-xl bg-[#F6FAF5] border border-[#DEE7DC] text-xs">
                <div className="text-[#1E5433] font-mono font-bold flex-shrink-0 pt-0.5">
                  {new Date(history.createdAt).toLocaleDateString()}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[#14261C] mb-0.5">
                    Stage updated to: <span className="text-[#1E5433] uppercase">{STATUS_LABELS[history.toStatus] || history.toStatus}</span>
                  </div>
                  {history.notes && (
                    <p className="text-[#556F60] mt-0.5">{history.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#637C6D]">No status updates recorded yet. Problem is queued for review.</p>
        )}
      </div>
    </div>
  );
}
