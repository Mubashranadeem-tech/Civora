'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { 
  FileText, 
  Search, 
  BrainCircuit, 
  Layers, 
  CheckCircle2, 
  Clock, 
  ThumbsUp, 
  Globe, 
  Wrench, 
  Check,
  MapPin
} from 'lucide-react';

const STATUS_TIMELINE = [
  { status: 'submitted', label: 'Report Submitted', icon: FileText, desc: 'Civic complaint received into Civora queue' },
  { status: 'under_verification', label: 'Under Verification', icon: Search, desc: 'Review team is verifying authenticity' },
  { status: 'ai_analysis', label: 'AI Evidence Analysis', icon: BrainCircuit, desc: 'AI evaluating evidence quality and severity' },
  { status: 'ai_research', label: 'Deep Civic Research', icon: Layers, desc: 'Autonomous background research and authority mapping' },
  { status: 'verified', label: 'Verified & Formatted', icon: CheckCircle2, desc: 'Problem validated and dossier compiled' },
  { status: 'awaiting_approval', label: 'Awaiting Official Approval', icon: Clock, desc: 'Admin reviewing for public release' },
  { status: 'approved', label: 'Approved for Publishing', icon: ThumbsUp, desc: 'Authorized for multi-channel dispatch' },
  { status: 'published', label: 'Publicly Published', icon: Globe, desc: 'Broadcast to official channels & social portals' },
  { status: 'in_progress', label: 'In Progress with Authorities', icon: Wrench, desc: 'Departmental actions underway' },
  { status: 'resolved', label: 'Issue Resolved', icon: CheckCircle2, desc: 'Civic complaint successfully rectified' },
];

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'text-[#C52222]',
  high: 'text-[#C25008]',
  medium: 'text-[#B57314]',
  low: 'text-[#1E6E3B]',
};

export default function TrackProblemPage() {
  const searchParams = useSearchParams();
  const [civId, setCivId] = useState(searchParams.get('id') || '');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const track = async (idToTrack?: string) => {
    const target = (idToTrack || civId).trim().toUpperCase();
    if (!target) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await api.trackProblem(target) as any;
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Problem ID not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setCivId(idFromUrl.toUpperCase());
      track(idFromUrl);
    }
  }, [searchParams]);

  const currentStatusIndex = result
    ? STATUS_TIMELINE.findIndex((s) => s.status === result.status)
    : -1;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="pb-2 border-b border-[#E2EBE0]">
        <h1 className="text-2xl font-extrabold text-[#13251A] tracking-tight">Track a Civic Problem</h1>
        <p className="text-sm text-[#546E5E]">Look up any Ticket ID to inspect its real-time verification and resolution lifecycle.</p>
      </div>

      {/* Search Input Box */}
      <div className="glass-card p-6 bg-white border border-[#DCE5DA] shadow-xs">
        <div className="flex gap-2.5">
          <input
            type="text"
            value={civId}
            onChange={(e) => setCivId(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && track()}
            className="input-civora font-mono text-xs font-semibold flex-1 uppercase"
            placeholder="CIV-2026-000004"
          />
          <button
            onClick={() => track()}
            disabled={loading}
            className="btn-primary text-xs px-6 py-2.5 rounded-xl whitespace-nowrap shadow-xs disabled:opacity-40 inline-flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            {loading ? 'Tracking...' : 'Track Status'}
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-[#FDEEEE] border border-[#F8B4B4] text-[#B92E2E] text-xs font-semibold">
            {error}
          </div>
        )}
      </div>

      {/* Result Display */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Card */}
          <div className="glass-card p-6 bg-white border border-[#DCE5DA] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
              <div>
                <div className="font-mono text-xs font-extrabold text-[#1F5333] bg-[#EBF4E8] px-2.5 py-1 rounded-md border border-[#CCE2CA] inline-block mb-2">
                  {result.civId}
                </div>
                <h2 className="text-xl font-bold text-[#14261C]">{result.title}</h2>
                <div className="text-xs text-[#597566] mt-1 flex items-center gap-2 flex-wrap">
                  <span>{result.categoryName}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#2E6B47]" />
                    {result.city || 'Islamabad'}
                  </span>
                  <span>·</span>
                  <span>Submitted {new Date(result.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-[#F4F9F2] border border-[#DEEADE] ${PRIORITY_COLORS[result.effectivePriority] || 'text-[#1F5333]'}`}>
                {result.effectivePriority} PRIORITY
              </div>
            </div>
          </div>

          {/* Lifecycle Stepper */}
          <div className="glass-card p-6 md:p-8 bg-white border border-[#DCE5DA] shadow-xs">
            <h3 className="font-bold text-base text-[#14261C] mb-6 pb-2 border-b border-[#EAF0E8]">
              Lifecycle Progression
            </h3>

            <div className="space-y-1">
              {STATUS_TIMELINE.map((item, i) => {
                const isPast = i < currentStatusIndex;
                const isCurrent = i === currentStatusIndex;
                const isFuture = i > currentStatusIndex;
                const Icon = item.icon;

                if (['rejected', 'closed', 'more_info_needed'].includes(item.status) && item.status !== result.status) {
                  return null;
                }

                return (
                  <div key={item.status} className="timeline-item">
                    <div
                      className={`timeline-dot ${
                        isPast
                          ? 'bg-[#EAF5EA] border-[#2D6C48] text-[#1E5433]'
                          : isCurrent
                          ? 'bg-[#1C4830] border-[#163C27] text-white shadow-md'
                          : 'bg-white border-[#D6E3D4] text-[#8EA495]'
                      }`}
                    >
                      <span className="text-[11px] font-bold">
                        {isPast ? <Check className="w-3 h-3" /> : isCurrent ? '●' : '○'}
                      </span>
                    </div>

                    <div className={`pb-6 ${isFuture ? 'opacity-40' : ''}`}>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Icon className={`w-4 h-4 ${isCurrent ? 'text-[#1B4D2E]' : isPast ? 'text-[#14261C]' : 'text-[#6C8577]'}`} />
                        <span className={`text-xs font-bold ${isCurrent ? 'text-[#1B4D2E]' : isPast ? 'text-[#14261C]' : 'text-[#6C8577]'}`}>
                          {item.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-[#EBF5EA] text-[#1E5332] border border-[#CCE2CA]">
                            Active Stage
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#5D7868] leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && !error && (
        <div className="glass-card p-12 text-center bg-white border border-[#DCE5DA]">
          <Search className="w-10 h-10 text-[#718D7D] mx-auto mb-2" />
          <h3 className="font-bold text-base text-[#14261C] mb-1">Instant Ticket Tracking</h3>
          <p className="text-xs text-[#5D7666] max-w-sm mx-auto">
            Enter your Problem ID (e.g., <strong className="font-mono text-[#215434]">CIV-2026-000004</strong>) above to inspect its real-time status.
          </p>
        </div>
      )}
    </div>
  );
}
