'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { 
  FileText, 
  BrainCircuit, 
  Newspaper, 
  Globe, 
  History, 
  MapPin, 
  Paperclip, 
  CheckCircle2, 
  XCircle, 
  Wrench, 
  ExternalLink,
  Edit3,
  Save,
  Check,
  Search,
  Cpu,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

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

type Tab = 'overview' | 'ai' | 'report' | 'publishing' | 'history';

function TabButton({ label, icon: Icon, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2 ${
        active
          ? 'bg-[#1C4830] text-white shadow-xs'
          : 'bg-white text-[#4A6454] hover:text-[#15291E] hover:bg-[#F2F7F1] border border-[#DEE7DD]'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function ActionButton({ label, onClick, loading, variant = 'primary', disabled = false, icon: Icon }: any) {
  const classes = ({
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ai: 'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#EBF5EA] text-[#1B5030] border border-[#CCE4CA] hover:bg-[#D8EBD6] transition-all cursor-pointer disabled:opacity-40 shadow-xs',
  } as Record<string, string>)[variant] || 'btn-primary';

  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`${classes} disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Processing...
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          {Icon && <Icon className="w-4 h-4" />}
          {label}
        </span>
      )}
    </button>
  );
}

export default function AdminProblemDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [publishingStatus, setPublishingStatus] = useState<any>(null);
  const [publishingResults, setPublishingResults] = useState<any[]>([]);
  const [editingReport, setEditingReport] = useState(false);
  const [reportEdits, setReportEdits] = useState<any>({});

  const fetch = async () => {
    try {
      const data = await api.getProblem(id) as any;
      setProblem(data);
      if (data.civicReport) {
        setReportEdits({
          overview: data.civicReport.overview,
          whyItMatters: data.civicReport.whyItMatters,
          researchFindings: data.civicReport.researchFindings,
          recommendedAction: data.civicReport.recommendedAction,
          responsibleAuthority: data.civicReport.responsibleAuthority,
          proposedPostContent: data.civicReport.proposedPostContent,
        });
      }
      try {
        const results = await api.getPublishingResults(id) as any[];
        setPublishingResults(results || []);
      } catch {
        // ignore
      }
    } catch {
      setStatusMsg('Problem not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [id]);

  useEffect(() => {
    api.getPublishingStatus().then(setPublishingStatus).catch(() => null);
  }, []);

  const handleAction = async (action: string) => {
    setActionLoading(action);
    setStatusMsg('');
    try {
      switch (action) {
        case 'ai-analyze':
          await api.analyzeWithAI(id);
          setStatusMsg('AI analysis completed successfully');
          break;
        case 'ai-research':
          await api.researchWithAI(id);
          setStatusMsg('AI research & civic report generated');
          break;
        case 'verify':
          await api.reviewProblem(id, { action: 'verify', notes: reviewNotes });
          setStatusMsg('Problem marked as verified');
          break;
        case 'reject':
          await api.reviewProblem(id, { action: 'reject', notes: reviewNotes });
          setStatusMsg('Problem rejected');
          break;
        case 'approve':
          await api.reviewProblem(id, { action: 'approve', notes: reviewNotes });
          setStatusMsg('Problem approved for publication');
          break;
        case 'under_verification':
          await api.updateProblemStatus(id, { status: 'under_verification', notes: reviewNotes });
          setStatusMsg('Status updated to Under Verification');
          break;
        case 'in_progress':
          await api.updateProblemStatus(id, { status: 'in_progress', notes: reviewNotes });
          setStatusMsg('Status updated to In Progress');
          break;
        case 'resolved':
          await api.updateProblemStatus(id, { status: 'resolved', notes: reviewNotes });
          setStatusMsg('Problem marked as Resolved');
          break;
        case 'publish':
          await api.publishProblem(id);
          setStatusMsg('Published to configured platforms');
          break;
        case 'save-report':
          await api.updateCivicReport(id, reportEdits);
          setStatusMsg('Civic report saved');
          setEditingReport(false);
          break;
      }
      await fetch();
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#2A6544]/20 border-t-[#2A6544] rounded-full animate-spin mx-auto mb-3" />
          <div className="text-xs font-medium text-[#577262]">Loading problem studio...</div>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="glass-card p-12 text-center bg-white">
        <AlertCircle className="w-10 h-10 text-[#C52222] mx-auto mb-2" />
        <div className="text-[#14261C] font-bold text-lg mb-2">Problem Not Found</div>
        <button onClick={() => router.push('/admin/problems')} className="btn-secondary mt-3 text-xs">
          ← Back to Queue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-card p-6 bg-white border border-[#DCE5DA] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
              <button
                onClick={() => router.push('/admin/problems')}
                className="text-xs font-bold text-[#4E6B5A] hover:text-[#163623] transition-colors"
              >
                ← Back to Queue
              </button>
              <span className="text-[#B9CBBF]">|</span>
              <span className="font-mono text-xs font-bold text-[#1F5333] bg-[#EBF4E8] px-2.5 py-0.5 rounded-md border border-[#CCE2CA]">
                {problem.civId}
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#F2F7F1] text-[#294B37] border border-[#D7E4D5]">
                {STATUS_LABELS[problem.status] || problem.status}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFF1E6] text-[#A64708] border border-[#FCD7BE] uppercase tracking-wider">
                {problem.effectivePriority} Priority
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#13251A] tracking-tight">{problem.title}</h1>
            <div className="text-xs text-[#526B5C] mt-1 flex items-center gap-2 flex-wrap">
              <span>{problem.category?.name} › {problem.type?.name}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#799584]" />
                {problem.location?.city || 'Islamabad'}{problem.location?.area && `, ${problem.location.area}`}
              </span>
              <span>·</span>
              <span>Submitted by <strong className="text-[#14261C]">{problem.submitter?.name || 'Citizen'}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-xs font-bold border flex items-center gap-2 ${
            statusMsg.startsWith('Error')
              ? 'bg-[#FDEEEE] border-[#F8B4B4] text-[#B92E2E]'
              : 'bg-[#EBF5EA] border-[#CCE2CA] text-[#1E5633]'
          }`}
        >
          <Check className="w-4 h-4" />
          {statusMsg}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-2 flex-wrap">
        <TabButton label="Overview" icon={FileText} active={tab === 'overview'} onClick={() => setTab('overview')} />
        <TabButton label="AI Pipeline" icon={BrainCircuit} active={tab === 'ai'} onClick={() => setTab('ai')} />
        <TabButton label="Civic Report" icon={Newspaper} active={tab === 'report'} onClick={() => setTab('report')} />
        <TabButton label="Publishing" icon={Globe} active={tab === 'publishing'} onClick={() => setTab('publishing')} />
        <TabButton label="Audit History" icon={History} active={tab === 'history'} onClick={() => setTab('history')} />
      </div>

      {/* ── Tab 1: Overview ─────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Details */}
            <div className="glass-card p-6 bg-white border border-[#DCE5DA]">
              <h3 className="font-bold text-base text-[#14261C] mb-4 pb-2 border-b border-[#EAF0E8]">
                Problem Report Metadata
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 text-xs mb-4">
                <div className="p-3.5 rounded-xl bg-[#F6FAF5] border border-[#E2EBE1]">
                  <div className="text-[11px] font-bold text-[#567261] uppercase tracking-wider mb-1">Category & Sub-Type</div>
                  <div className="font-bold text-[#14261C]">{problem.category?.name} ({problem.type?.name})</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F6FAF5] border border-[#E2EBE1]">
                  <div className="text-[11px] font-bold text-[#567261] uppercase tracking-wider mb-1">Assessed Priority</div>
                  <div className="font-bold text-[#14261C] uppercase">
                    {problem.effectivePriority} Priority
                  </div>
                </div>
              </div>

              {problem.description && (
                <div>
                  <div className="text-[11px] font-bold text-[#567261] uppercase tracking-wider mb-2">Citizen Description</div>
                  <div className="text-[#2C4134] text-xs leading-relaxed bg-[#F8FAF7] border border-[#E2EBE1] rounded-xl p-4">
                    {problem.description}
                  </div>
                </div>
              )}
            </div>

            {/* Location */}
            {problem.location && (
              <div className="glass-card p-6 bg-white border border-[#DCE5DA]">
                <h3 className="font-bold text-base text-[#14261C] mb-3 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#2E6A47]" />
                  Location Coordinates
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-[#5A7464] font-medium">City:</span> <span className="font-bold text-[#14261C] ml-1">{problem.location.city}</span></div>
                  {problem.location.area && <div><span className="text-[#5A7464] font-medium">Area:</span> <span className="font-bold text-[#14261C] ml-1">{problem.location.area}</span></div>}
                  {problem.location.address && <div className="col-span-2"><span className="text-[#5A7464] font-medium">Address:</span> <span className="font-bold text-[#14261C] ml-1">{problem.location.address}</span></div>}
                </div>
              </div>
            )}

            {/* Attachments */}
            {problem.attachments?.length > 0 && (
              <div className="glass-card p-6 bg-white border border-[#DCE5DA]">
                <h3 className="font-bold text-base text-[#14261C] mb-3 flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-[#2E6A47]" />
                  Document & Photo Evidence ({problem.attachments.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {problem.attachments.map((att: any) => (
                    <a
                      key={att.id}
                      href={att.signedUrl || att.storageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block rounded-xl overflow-hidden border border-[#D6E3D4] hover:border-[#2D6C48] transition-all bg-[#FAFDF9]"
                    >
                      {att.mimeType?.startsWith('image/') ? (
                        <img
                          src={att.signedUrl || att.storageUrl}
                          alt={att.originalName}
                          className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-24 flex items-center justify-center bg-[#F2F7F1] text-xs font-mono font-bold text-[#4E6857]">
                          {att.mimeType?.split('/')[1]?.toUpperCase()}
                        </div>
                      )}
                      <div className="p-2.5 bg-white border-t border-[#EAEFE8]">
                        <div className="text-xs font-bold text-[#14261C] truncate">{att.originalName}</div>
                        <div className="text-[11px] text-[#698575]">{(att.fileSize / 1024).toFixed(1)} KB</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Admin Sidebar Panel */}
          <div className="space-y-6">
            <div className="glass-card p-6 bg-white border border-[#DCE5DA]">
              <h3 className="font-bold text-base text-[#14261C] mb-3">Triage & Actions</h3>
              <div className="space-y-2 mb-4">
                <div className="text-xs font-semibold text-[#577262]">Review Notes (optional)</div>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="input-civora text-xs resize-none"
                  rows={3}
                  placeholder="Record administrative notes..."
                />
              </div>

              <div className="space-y-2">
                {problem.status === 'submitted' && (
                  <ActionButton label="Start Verification" icon={Search} onClick={() => handleAction('under_verification')} loading={actionLoading === 'under_verification'} />
                )}
                {['under_verification', 'more_info_needed'].includes(problem.status) && (
                  <>
                    <ActionButton label="Mark Verified" icon={CheckCircle2} onClick={() => handleAction('verify')} loading={actionLoading === 'verify'} />
                    <ActionButton label="Reject Issue" icon={XCircle} onClick={() => handleAction('reject')} loading={actionLoading === 'reject'} variant="danger" />
                  </>
                )}
                {['verified', 'awaiting_approval'].includes(problem.status) && (
                  <ActionButton label="Approve for Publishing" icon={CheckCircle2} onClick={() => handleAction('approve')} loading={actionLoading === 'approve'} />
                )}
                {['published', 'approved'].includes(problem.status) && (
                  <ActionButton label="Mark In Progress" icon={Wrench} onClick={() => handleAction('in_progress')} loading={actionLoading === 'in_progress'} variant="secondary" />
                )}
                {['in_progress'].includes(problem.status) && (
                  <ActionButton label="Mark Resolved" icon={CheckCircle2} onClick={() => handleAction('resolved')} loading={actionLoading === 'resolved'} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: AI Pipeline ──────────────────────────────────────────────── */}
      {tab === 'ai' && (
        <div className="space-y-6">
          <div className="glass-card p-6 bg-white border border-[#DCE5DA]">
            <h3 className="font-bold text-base text-[#14261C] mb-1">AI Pipeline Operations</h3>
            <p className="text-xs text-[#526D5D] mb-6">
              Execute evidence verification and deep autonomous research to generate the official civic report.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#F6FAF5] border border-[#D4E5D2]">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#D4E5D2] flex items-center justify-center text-[#255C3A] mb-3 shadow-xs">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div className="font-bold text-[#194C2F] text-xs mb-1">Step 1: Evidence & Duplicate Analysis</div>
                <div className="text-xs text-[#556F60] mb-4">AI validates evidence authenticity, assesses severity, and checks duplicate reports.</div>
                <ActionButton
                  label="Run Evidence Analysis"
                  icon={BrainCircuit}
                  onClick={() => handleAction('ai-analyze')}
                  loading={actionLoading === 'ai-analyze'}
                  variant="ai"
                />
              </div>

              <div className="p-5 rounded-2xl bg-[#F4F9F6] border border-[#D2E4D6]">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#D2E4D6] flex items-center justify-center text-[#255C3A] mb-3 shadow-xs">
                  <Search className="w-5 h-5" />
                </div>
                <div className="font-bold text-[#144D32] text-xs mb-1">Step 2: Deep Civic Research</div>
                <div className="text-xs text-[#556F60] mb-4">Autonomous intelligence queries precedent statistics, finds responsible authorities, and writes report.</div>
                <ActionButton
                  label="Run Deep Research"
                  icon={Search}
                  onClick={() => handleAction('ai-research')}
                  loading={actionLoading === 'ai-research'}
                  variant="ai"
                  disabled={!problem.aiAnalysis}
                />
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          {problem.aiAnalysis && (
            <div className="glass-card p-6 bg-white border border-[#DCE5DA]">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EAF0E8]">
                <h3 className="font-bold text-base text-[#14261C]">Evidence Analysis Results</h3>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EBF5EA] text-[#1D5432] border border-[#CCE2CA] inline-flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Analysis Completed
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="p-3.5 rounded-xl bg-[#F8FAF7] border border-[#E2EBE1]">
                  <div className="text-xs font-bold text-[#567261] uppercase tracking-wider mb-1">Recommended Priority</div>
                  <div className="text-xs font-bold text-[#14261C] uppercase">
                    {problem.aiAnalysis.priorityRecommendation} Priority
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F8FAF7] border border-[#E2EBE1]">
                  <div className="text-xs font-bold text-[#567261] uppercase tracking-wider mb-1">Confidence Score: {problem.aiAnalysis.confidenceScore}%</div>
                  <div className="h-2 rounded-full bg-[#E3EBE1] overflow-hidden mt-1.5">
                    <div className="h-full bg-gradient-to-r from-[#2F6D49] to-[#459663] rounded-full" style={{ width: `${problem.aiAnalysis.confidenceScore}%` }} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Executive Summary', value: problem.aiAnalysis.summary },
                  { label: 'Severity Assessment', value: problem.aiAnalysis.severityAssessment },
                  { label: 'Evidence Analysis', value: problem.aiAnalysis.evidenceAnalysis },
                  { label: 'Recommended Action', value: problem.aiAnalysis.recommendedAction },
                ].map((item) => item.value && (
                  <div key={item.label}>
                    <div className="text-xs font-bold text-[#4E6858] mb-1">{item.label}</div>
                    <div className="text-xs text-[#283E31] bg-[#F9FBF8] border border-[#E2ECE1] rounded-xl p-3 leading-relaxed">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Research Results */}
          {problem.research && (
            <div className="glass-card p-6 bg-white border border-[#DCE5DA]">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EAF0E8]">
                <h3 className="font-bold text-base text-[#14261C]">Deep Civic Research Findings</h3>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EBF5EA] text-[#1D5432] border border-[#CCE2CA] inline-flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Research Completed
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Background Context', value: problem.research.backgroundInfo },
                  { label: 'Root Causes', value: problem.research.possibleCauses },
                  { label: 'Community Impact', value: problem.research.communityImpact },
                  { label: 'Responsible Authorities', value: problem.research.responsibleAuthority },
                  { label: 'Estimated Resolution Timeframe', value: problem.research.estimatedResolutionTime },
                ].map((item) => item.value && (
                  <div key={item.label}>
                    <div className="text-xs font-bold text-[#4E6858] mb-1">{item.label}</div>
                    <div className="text-xs text-[#283E31] bg-[#F9FBF8] border border-[#E2ECE1] rounded-xl p-3 leading-relaxed">{item.value}</div>
                  </div>
                ))}

                {problem.research.sources?.length > 0 && (
                  <div className="pt-2">
                    <div className="text-xs font-bold text-[#4E6858] mb-2">Verified Sources & Citations</div>
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {problem.research.sources.map((s: any) => (
                        <div key={s.id} className="p-3 rounded-xl bg-[#F6FAF5] border border-[#DCE6DA]">
                          <div className="text-xs font-bold text-[#14261C] truncate">{s.title}</div>
                          <div className="text-[11px] text-[#556F60] mt-0.5 line-clamp-2">{s.summary}</div>
                          <div className="text-[10px] font-mono font-bold text-[#235E39] mt-1">Relevance: {s.relevanceScore}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab 3: Civic Report ─────────────────────────────────────────────── */}
      {tab === 'report' && (
        <div className="space-y-6">
          {problem.civicReport ? (
            <div className="glass-card p-6 bg-white border border-[#DCE5DA]">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EAF0E8]">
                <h3 className="font-bold text-base text-[#14261C]">Official Civic Intelligence Report</h3>
                <div>
                  {editingReport ? (
                    <div className="flex gap-2">
                      <ActionButton label="Save Changes" icon={Save} onClick={() => handleAction('save-report')} loading={actionLoading === 'save-report'} />
                      <ActionButton label="Cancel" onClick={() => setEditingReport(false)} variant="secondary" />
                    </div>
                  ) : (
                    <ActionButton label="Edit Report" icon={Edit3} onClick={() => setEditingReport(true)} variant="secondary" />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'overview', label: 'Executive Overview', rows: 4 },
                  { key: 'whyItMatters', label: 'Why It Matters', rows: 3 },
                  { key: 'researchFindings', label: 'Key Research Findings', rows: 3 },
                  { key: 'recommendedAction', label: 'Recommended Action for Authorities', rows: 2 },
                  { key: 'responsibleAuthority', label: 'Accountable Government Body', rows: 2 },
                  { key: 'proposedPostContent', label: 'Social Media & Public Post Copy', rows: 2 },
                ].map(({ key, label, rows }) => (
                  <div key={key}>
                    <div className="text-xs font-bold text-[#4B6656] mb-1">{label}</div>
                    {editingReport ? (
                      <textarea
                        value={reportEdits[key] || ''}
                        onChange={(e) => setReportEdits({ ...reportEdits, [key]: e.target.value })}
                        className="input-civora resize-none text-xs w-full"
                        rows={rows}
                      />
                    ) : (
                      <div className="text-xs text-[#233A2D] bg-[#F8FAF7] border border-[#E2EBE1] rounded-xl p-3 leading-relaxed whitespace-pre-wrap">
                        {(problem.civicReport as any)[key] || '—'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-card p-16 text-center bg-white border border-[#DCE5DA]">
              <Newspaper className="w-10 h-10 text-[#718D7D] mx-auto mb-2" />
              <h3 className="font-bold text-[#14261C] mb-2">No Civic Report Generated Yet</h3>
              <p className="text-xs text-[#5C7566] mb-4">Run Deep Research in the AI Pipeline tab to generate the full dossier.</p>
              <button onClick={() => setTab('ai')} className="btn-primary text-xs">Go to AI Pipeline →</button>
            </div>
          )}
        </div>
      )}

      {/* ── Tab 4: Publishing ───────────────────────────────────────────────── */}
      {tab === 'publishing' && (
        <div className="space-y-6">
          <div className="glass-card p-6 bg-white border border-[#DCE5DA]">
            <h3 className="font-bold text-base text-[#14261C] mb-4 pb-2 border-b border-[#EAF0E8]">Platform Connectors</h3>
            {publishingStatus ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {Object.entries(publishingStatus.platforms as Record<string, boolean>).map(([platform, configured]) => (
                  <div
                    key={platform}
                    className={`p-3.5 rounded-xl border text-center ${
                      configured
                        ? 'bg-[#EBF5EA] border-[#CCE2CA]'
                        : 'bg-[#F9FAF8] border-[#E5ECE3]'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#14261C] capitalize mb-1">{platform}</div>
                    <div className={`text-[11px] font-bold ${configured ? 'text-[#1D5432]' : 'text-[#879E90]'}`}>
                      {configured ? '● Connected' : '○ Not set'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="skeleton h-24 rounded-xl mb-6" />
            )}

            {/* Active Published Links */}
            {publishingResults.length > 0 && (
              <div className="mb-6 space-y-3">
                <h4 className="text-xs font-bold text-[#4B6656] uppercase tracking-wider">Live Publications & History</h4>
                <div className="space-y-2">
                  {publishingResults.map((res: any) => (
                    <div
                      key={res.id}
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        res.status === 'published'
                          ? 'bg-[#EBF5EA] border-[#CCE2CA]'
                          : 'bg-[#FDF2F2] border-[#F9CACA]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#14261C] capitalize">
                            {res.platform} Portal
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              res.status === 'published'
                                ? 'bg-[#D6ECD3] text-[#1B4D2E]'
                                : 'bg-[#FBD5D5] text-[#9E1E1E]'
                            }`}
                          >
                            {res.status}
                          </span>
                        </div>
                        {res.publishedAt && (
                          <div className="text-[11px] text-[#556F60] mt-0.5">
                            Published: {new Date(res.publishedAt).toLocaleString()}
                          </div>
                        )}
                      </div>

                      {res.publishedUrl && (
                        <a
                          href={res.publishedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary text-xs px-3.5 py-1.5 rounded-lg shadow-xs inline-flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View Live Post
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Publishing Controls */}
            {['approved', 'published'].includes(problem.status) ? (
              <ActionButton
                label={problem.status === 'published' ? 'Re-publish Updates' : 'Publish to Connected Platforms'}
                icon={Globe}
                onClick={() => handleAction('publish')}
                loading={actionLoading === 'publish'}
              />
            ) : problem.status === 'awaiting_approval' ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl bg-[#EAF4E9] border border-[#CCE2CA]">
                <div className="flex-1 text-xs text-[#1E5231] font-semibold">
                  Civic report is approved and ready. Publish directly to connected platforms.
                </div>
                <ActionButton
                  label="Approve & Publish"
                  icon={CheckCircle2}
                  onClick={async () => {
                    setActionLoading('approve-publish');
                    try {
                      await api.reviewProblem(id, { action: 'approve', notes: reviewNotes });
                      await api.publishProblem(id);
                      setStatusMsg('Approved and published successfully!');
                      await fetch();
                    } catch (err: any) {
                      setStatusMsg(`Error: ${err.message}`);
                    } finally {
                      setActionLoading(null);
                    }
                  }}
                  loading={actionLoading === 'approve-publish'}
                />
              </div>
            ) : problem.civicReport ? (
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#FFF8EB] border border-[#FBE0B8]">
                <div className="text-xs text-[#8A560F] font-semibold">
                  Report is generated. Approve problem before publishing.
                </div>
                <ActionButton label="Approve Problem" icon={CheckCircle2} onClick={() => handleAction('approve')} loading={actionLoading === 'approve'} />
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-[#FFF8EB] border border-[#FBE0B8] text-xs font-semibold text-[#8A560F]">
                Complete the AI Pipeline (Evidence Analysis + Deep Research) first to generate the Civic Report before publishing.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab 5: History ──────────────────────────────────────────────────── */}
      {tab === 'history' && (
        <div className="glass-card p-6 bg-white border border-[#DCE5DA]">
          <h3 className="font-bold text-base text-[#14261C] mb-6 pb-2 border-b border-[#EAF0E8]">Audit Log & State Transitions</h3>
          <div className="space-y-2">
            {problem.statusHistory?.map((h: any) => (
              <div key={h.id} className="timeline-item">
                <div className="timeline-dot" />
                <div className="pb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#14261C]">
                      → {STATUS_LABELS[h.toStatus] || h.toStatus}
                    </span>
                    <span className="text-[11px] text-[#698575]">{new Date(h.createdAt).toLocaleString()}</span>
                  </div>
                  {h.changedByName && (
                    <div className="text-[11px] text-[#4E6657]">Action by: <strong>{h.changedByName}</strong></div>
                  )}
                  {h.notes && (
                    <div className="text-xs text-[#2A4133] mt-1 bg-[#F5FAF3] p-2.5 rounded-lg border border-[#E2EAE0]">
                      {h.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
