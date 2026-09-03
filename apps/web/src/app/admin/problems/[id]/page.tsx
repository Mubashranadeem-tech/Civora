'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

const PRIORITY_ICONS: Record<string, string> = {
  critical: '🔴',
  high: '🟠',
  medium: '🟡',
  low: '🟢',
};

type Tab = 'overview' | 'ai' | 'report' | 'publishing' | 'history';

function TabButton({ label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
        active
          ? 'bg-white/10 text-white border border-white/15'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {label}
    </button>
  );
}

function ActionButton({ label, onClick, loading, variant = 'primary', disabled = false }: any) {
  const classes = ({
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ai: 'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-purple-500/15 text-purple-300 border border-purple-500/25 hover:bg-purple-500/25 transition-all cursor-pointer disabled:opacity-40',
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
          Working...
        </span>
      ) : label}
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
          setStatusMsg('✅ AI analysis completed successfully');
          break;
        case 'ai-research':
          await api.researchWithAI(id);
          setStatusMsg('✅ AI research & civic report generated');
          break;
        case 'verify':
          await api.reviewProblem(id, { action: 'verify', notes: reviewNotes });
          setStatusMsg('✅ Problem verified');
          break;
        case 'reject':
          await api.reviewProblem(id, { action: 'reject', notes: reviewNotes });
          setStatusMsg('❌ Problem rejected');
          break;
        case 'approve':
          await api.reviewProblem(id, { action: 'approve', notes: reviewNotes });
          setStatusMsg('✅ Problem approved for publication');
          break;
        case 'under_verification':
          await api.updateProblemStatus(id, { status: 'under_verification', notes: reviewNotes });
          setStatusMsg('🔍 Status updated to Under Verification');
          break;
        case 'in_progress':
          await api.updateProblemStatus(id, { status: 'in_progress', notes: reviewNotes });
          setStatusMsg('🔧 Status updated to In Progress');
          break;
        case 'resolved':
          await api.updateProblemStatus(id, { status: 'resolved', notes: reviewNotes });
          setStatusMsg('🎉 Problem marked as Resolved');
          break;
        case 'publish':
          await api.publishProblem(id);
          setStatusMsg('🌐 Published to configured platforms');
          break;
        case 'save-report':
          await api.updateCivicReport(id, reportEdits);
          setStatusMsg('✅ Civic report saved');
          setEditingReport(false);
          break;
      }
      await fetch();
    } catch (err: any) {
      setStatusMsg(`❌ Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-3" />
          <div className="text-sm text-gray-400">Loading problem...</div>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="text-4xl mb-4">❌</div>
        <div className="text-white font-semibold mb-2">Problem Not Found</div>
        <button onClick={() => router.push('/admin/problems')} className="btn-secondary mt-4">
          ← Back to Queue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => router.push('/admin/problems')} className="text-gray-500 hover:text-white transition-colors text-sm">
              ← Queue
            </button>
            <div className="w-px h-4 bg-white/15" />
            <span className="font-mono text-sm text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
              {problem.civId}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/10 text-gray-300">
              {STATUS_LABELS[problem.status] || problem.status}
            </span>
            <span className="text-sm">{PRIORITY_ICONS[problem.effectivePriority]}</span>
          </div>
          <h1 className="text-xl font-bold text-white">{problem.title}</h1>
          <div className="text-sm text-gray-400 mt-1">
            {problem.category?.name} › {problem.type?.name} · {problem.location?.city}
            {problem.location?.area && `, ${problem.location.area}`}
            · Submitted by {problem.submitter?.name}
          </div>
        </div>
      </div>

      {/* Status Message */}
      {statusMsg && (
        <div className={`mb-4 p-3 rounded-xl text-sm border ${
          statusMsg.startsWith('❌')
            ? 'bg-red-500/10 border-red-500/20 text-red-300'
            : 'bg-green-500/10 border-green-500/20 text-green-300'
        }`}>
          {statusMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['overview', 'ai', 'report', 'publishing', 'history'] as Tab[]).map((t) => (
          <TabButton
            key={t}
            label={{
              overview: '📋 Overview',
              ai: '🤖 AI Pipeline',
              report: '📰 Civic Report',
              publishing: '🌐 Publishing',
              history: '📜 History',
            }[t]}
            active={tab === t}
            onClick={() => setTab(t)}
          />
        ))}
      </div>

      {/* ── Overview Tab ──────────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Problem Details */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4">Problem Details</h3>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Category</div>
                    <div className="text-white">{problem.category?.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Type</div>
                    <div className="text-white">{problem.type?.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">User Priority</div>
                    <div className="text-white">{problem.userPriority?.toUpperCase()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Effective Priority</div>
                    <div className="text-white">{problem.effectivePriority?.toUpperCase()}</div>
                  </div>
                </div>
                {problem.description && (
                  <div>
                    <div className="text-xs text-gray-500 mb-2">Description</div>
                    <div className="text-gray-300 leading-relaxed bg-white/3 rounded-lg p-3 text-sm">
                      {problem.description}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            {problem.location && (
              <div className="glass-card p-6">
                <h3 className="font-semibold text-white mb-3">📍 Location</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">City:</span> <span className="text-white ml-1">{problem.location.city}</span></div>
                  {problem.location.area && <div><span className="text-gray-500">Area:</span> <span className="text-white ml-1">{problem.location.area}</span></div>}
                  {problem.location.address && <div className="col-span-2"><span className="text-gray-500">Address:</span> <span className="text-white ml-1">{problem.location.address}</span></div>}
                  {problem.location.latitude && (
                    <div className="col-span-2 text-xs text-gray-500">
                      GPS: {problem.location.latitude}, {problem.location.longitude}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Attachments */}
            {problem.attachments?.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="font-semibold text-white mb-3">📎 Evidence ({problem.attachments.length} files)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {problem.attachments.map((att: any) => (
                    <a
                      key={att.id}
                      href={att.signedUrl || att.storageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all"
                    >
                      {att.mimeType?.startsWith('image/') ? (
                        <img
                          src={att.signedUrl || att.storageUrl}
                          alt={att.originalName}
                          className="w-full h-24 object-cover group-hover:opacity-90 transition-opacity"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-24 flex items-center justify-center bg-white/5 text-3xl">
                          {att.mimeType?.includes('pdf') ? '📄' : '📁'}
                        </div>
                      )}
                      <div className="p-2">
                        <div className="text-xs text-gray-400 truncate">{att.originalName}</div>
                        <div className="text-xs text-gray-600">{(att.fileSize / 1024).toFixed(1)} KB</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Panel */}
          <div className="space-y-4">
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-4">Admin Actions</h3>

              <div className="space-y-2 mb-4">
                <div className="text-xs text-gray-400 mb-2">Notes (optional)</div>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="input-civora text-xs resize-none"
                  rows={3}
                  placeholder="Add notes for this action..."
                />
              </div>

              <div className="space-y-2">
                {problem.status === 'submitted' && (
                  <ActionButton label="🔍 Start Verification" onClick={() => handleAction('under_verification')} loading={actionLoading === 'under_verification'} />
                )}
                {['under_verification', 'more_info_needed'].includes(problem.status) && (
                  <>
                    <ActionButton label="✅ Verify Problem" onClick={() => handleAction('verify')} loading={actionLoading === 'verify'} />
                    <ActionButton label="❌ Reject Problem" onClick={() => handleAction('reject')} loading={actionLoading === 'reject'} variant="danger" />
                  </>
                )}
                {['verified', 'awaiting_approval'].includes(problem.status) && (
                  <ActionButton label="👍 Approve for Publishing" onClick={() => handleAction('approve')} loading={actionLoading === 'approve'} />
                )}
                {['published', 'approved'].includes(problem.status) && (
                  <ActionButton label="🔧 Mark In Progress" onClick={() => handleAction('in_progress')} loading={actionLoading === 'in_progress'} variant="secondary" />
                )}
                {['in_progress'].includes(problem.status) && (
                  <ActionButton label="🎉 Mark Resolved" onClick={() => handleAction('resolved')} loading={actionLoading === 'resolved'} />
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-3">Quick Timeline</h3>
              <div className="space-y-2">
                {problem.statusHistory?.slice(-5).map((h: any, i: number) => (
                  <div key={h.id} className="flex gap-2 text-xs">
                    <div className="text-gray-600">{new Date(h.createdAt).toLocaleDateString()}</div>
                    <div className="text-gray-400">→ {STATUS_LABELS[h.toStatus] || h.toStatus}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Tab ────────────────────────────────────────────────────────────── */}
      {tab === 'ai' && (
        <div className="space-y-6">
          {/* AI Pipeline Controls */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-2">AI Pipeline Controls</h3>
            <p className="text-sm text-gray-400 mb-6">
              Run AI analysis then research. AI will examine evidence, assess severity, and generate a complete civic report.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <div className="text-lg mb-2">🎯</div>
                <div className="font-semibold text-purple-300 text-sm mb-1">Step 1: Evidence Analysis</div>
                <div className="text-xs text-gray-400 mb-3">AI analyzes the evidence, assesses severity, validates category, and detects duplicates.</div>
                <ActionButton
                  label="🤖 Run AI Analysis"
                  onClick={() => handleAction('ai-analyze')}
                  loading={actionLoading === 'ai-analyze'}
                  variant="ai"
                />
              </div>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="text-lg mb-2">🔬</div>
                <div className="font-semibold text-blue-300 text-sm mb-1">Step 2: Deep Research</div>
                <div className="text-xs text-gray-400 mb-3">AI researches the civic issue, finds responsible authorities, and generates the civic report.</div>
                <ActionButton
                  label="🔬 Run AI Research"
                  onClick={() => handleAction('ai-research')}
                  loading={actionLoading === 'ai-research'}
                  variant="ai"
                  disabled={!problem.aiAnalysis}
                />
              </div>
            </div>

            {!problem.aiAnalysis && (
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-300">
                ⚠️ AI Analysis must be completed before running Research
              </div>
            )}
          </div>

          {/* AI Analysis Results */}
          {problem.aiAnalysis ? (
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-semibold text-white">AI Analysis Results</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Completed</span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Priority Recommendation</div>
                  <div className={`text-sm font-semibold ${problem.aiAnalysis.priorityRecommendation === 'critical' ? 'text-red-400' : problem.aiAnalysis.priorityRecommendation === 'high' ? 'text-orange-400' : 'text-yellow-400'}`}>
                    {PRIORITY_ICONS[problem.aiAnalysis.priorityRecommendation]} {problem.aiAnalysis.priorityRecommendation?.toUpperCase()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Confidence Score</div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 rounded-full bg-white/10 flex-1 overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full"
                        style={{ width: `${problem.aiAnalysis.confidenceScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-white">{problem.aiAnalysis.confidenceScore}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Summary', value: problem.aiAnalysis.summary },
                  { label: 'Severity Assessment', value: problem.aiAnalysis.severityAssessment },
                  { label: 'Evidence Analysis', value: problem.aiAnalysis.evidenceAnalysis },
                  { label: 'Category Validation', value: problem.aiAnalysis.categoryValidation },
                  { label: 'Recommended Action', value: problem.aiAnalysis.recommendedAction },
                ].map((item) => item.value && (
                  <div key={item.label}>
                    <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                    <div className="text-sm text-gray-300 bg-white/3 rounded-lg p-3 leading-relaxed">{item.value}</div>
                  </div>
                ))}

                {problem.aiAnalysis.missingInformation?.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 mb-2">Missing Information</div>
                    <ul className="space-y-1">
                      {problem.aiAnalysis.missingInformation.map((item: string, i: number) => (
                        <li key={i} className="text-xs text-yellow-300 flex gap-2">
                          <span>⚠️</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {problem.aiAnalysis.duplicateFlag && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <div className="text-xs text-red-400 font-semibold">
                      ⚠️ Possible Duplicate Detected ({problem.aiAnalysis.duplicateConfidence}% confidence)
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <div className="text-4xl mb-3">🤖</div>
              <div className="text-white font-semibold mb-2">No AI Analysis Yet</div>
              <div className="text-sm text-gray-400">Run AI Analysis above to process this problem.</div>
            </div>
          )}

          {/* Research Results */}
          {problem.research && (
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-semibold text-white">AI Research Results</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Completed</span>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Background', value: problem.research.backgroundInfo },
                  { label: 'Possible Causes', value: problem.research.possibleCauses },
                  { label: 'Community Impact', value: problem.research.communityImpact },
                  { label: 'Relevant Statistics', value: problem.research.relevantStatistics },
                  { label: 'Potential Solutions', value: problem.research.potentialSolutions },
                  { label: 'Responsible Authority', value: problem.research.responsibleAuthority },
                  { label: 'Estimated Resolution Time', value: problem.research.estimatedResolutionTime },
                ].map((item) => item.value && (
                  <div key={item.label}>
                    <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                    <div className="text-sm text-gray-300 bg-white/3 rounded-lg p-3 leading-relaxed">{item.value}</div>
                  </div>
                ))}

                {problem.research.sources?.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 mb-2">Sources</div>
                    <div className="space-y-2">
                      {problem.research.sources.map((source: any) => (
                        <div key={source.id} className="flex gap-3 p-3 rounded-lg bg-white/3 border border-white/5">
                          <div className="flex-1">
                            <div className="text-xs font-medium text-white">{source.title}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{source.summary}</div>
                          </div>
                          <div className="text-xs text-cyan-400">{source.relevanceScore}%</div>
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

      {/* ── Report Tab ───────────────────────────────────────────────────────── */}
      {tab === 'report' && (
        <div className="space-y-4">
          {problem.civicReport ? (
            <>
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Civic Intelligence Report</h3>
                  <div className="flex gap-2">
                    {editingReport ? (
                      <>
                        <ActionButton label="💾 Save" onClick={() => handleAction('save-report')} loading={actionLoading === 'save-report'} />
                        <ActionButton label="Cancel" onClick={() => setEditingReport(false)} variant="secondary" />
                      </>
                    ) : (
                      <ActionButton label="✏️ Edit Report" onClick={() => setEditingReport(true)} variant="secondary" />
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'overview', label: 'Overview', rows: 6 },
                    { key: 'whyItMatters', label: 'Why It Matters', rows: 4 },
                    { key: 'researchFindings', label: 'Research Findings', rows: 5 },
                    { key: 'recommendedAction', label: 'Recommended Action', rows: 3 },
                    { key: 'responsibleAuthority', label: 'Responsible Authority', rows: 2 },
                    { key: 'proposedPostContent', label: 'Social Media Post', rows: 3 },
                  ].map(({ key, label, rows }) => (
                    <div key={key}>
                      <div className="text-xs text-gray-500 mb-2">{label}</div>
                      {editingReport ? (
                        <textarea
                          value={reportEdits[key] || ''}
                          onChange={(e) => setReportEdits({ ...reportEdits, [key]: e.target.value })}
                          className="input-civora resize-none text-sm w-full"
                          rows={rows}
                        />
                      ) : (
                        <div className="text-sm text-gray-300 bg-white/3 rounded-lg p-3 leading-relaxed whitespace-pre-wrap">
                          {(problem.civicReport as any)[key] || '—'}
                        </div>
                      )}
                    </div>
                  ))}

                  {problem.civicReport.hashtags?.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-500 mb-2">Hashtags</div>
                      <div className="flex flex-wrap gap-2">
                        {problem.civicReport.hashtags.map((tag: string) => (
                          <span key={tag} className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Approve for publishing */}
              {problem.status === 'awaiting_approval' && (
                <div className="glass-card p-6 bg-gradient-to-r from-green-500/5 to-cyan-500/5 border border-green-500/10">
                  <h3 className="font-semibold text-white mb-2">Ready to Approve?</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Review the civic report above. Once approved, you can publish to configured platforms.
                  </p>
                  <div className="flex gap-3">
                    <ActionButton label="👍 Approve Report" onClick={() => handleAction('approve')} loading={actionLoading === 'approve'} />
                    <ActionButton label="❌ Reject" onClick={() => handleAction('reject')} loading={actionLoading === 'reject'} variant="danger" />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="glass-card p-16 text-center">
              <div className="text-5xl mb-4">📰</div>
              <h3 className="font-semibold text-white mb-2">No Civic Report Yet</h3>
              <p className="text-sm text-gray-400 mb-6">
                Complete AI Research (in the AI Pipeline tab) to generate a civic intelligence report.
              </p>
              <button onClick={() => setTab('ai')} className="btn-primary">
                Go to AI Pipeline →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Publishing Tab ────────────────────────────────────────────────────── */}
      {tab === 'publishing' && (
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-4">Platform Status</h3>
            {publishingStatus ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {Object.entries(publishingStatus.platforms as Record<string, boolean>).map(([platform, configured]) => (
                  <div
                    key={platform}
                    className={`p-3 rounded-xl border text-center ${
                      configured
                        ? 'bg-green-500/10 border-green-500/20'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="text-lg mb-1">
                      {platform === 'linkedin' ? '💼' : platform === 'twitter' ? '🐦' : platform === 'wordpress' ? '📝' : '🔗'}
                    </div>
                    <div className="text-xs font-medium text-white capitalize">{platform}</div>
                    <div className={`text-xs mt-1 ${configured ? 'text-green-400' : 'text-gray-600'}`}>
                      {configured ? '● Configured' : '○ Not set'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="skeleton h-24 rounded-xl mb-6" />
            )}

            {/* Publication Results & Links */}
            {publishingResults.length > 0 && (
              <div className="mb-6 space-y-3">
                <h4 className="text-sm font-semibold text-white">Publication Status & Links</h4>
                <div className="space-y-2">
                  {publishingResults.map((res: any) => (
                    <div
                      key={res.id}
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        res.status === 'published'
                          ? 'bg-green-500/10 border-green-500/20'
                          : res.status === 'failed'
                          ? 'bg-red-500/10 border-red-500/20'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white capitalize">
                            {res.platform === 'wordpress' ? '📝 WordPress' : res.platform === 'twitter' ? '🐦 Twitter' : res.platform === 'linkedin' ? '💼 LinkedIn' : '🔗 Webhook'}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              res.status === 'published'
                                ? 'bg-green-500/20 text-green-400'
                                : res.status === 'failed'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}
                          >
                            {res.status?.toUpperCase()}
                          </span>
                        </div>
                        {res.publishedAt && (
                          <div className="text-xs text-gray-400 mt-1">
                            Published at {new Date(res.publishedAt).toLocaleString()}
                          </div>
                        )}
                        {res.status === 'failed' && res.errorMessage && (
                          <div className="text-xs text-red-300 mt-1">
                            Error: {res.errorMessage}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {res.publishedUrl && (
                          <a
                            href={res.publishedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all"
                          >
                            <span>🔗 View Live Post</span>
                          </a>
                        )}
                        {res.status === 'failed' && res.jobId && (
                          <ActionButton
                            label="🔄 Retry"
                            onClick={async () => {
                              setActionLoading(`retry-${res.id}`);
                              try {
                                await api.retryPublishing(res.jobId);
                                setStatusMsg('🔄 Retried publishing job');
                                await fetch();
                              } catch (e: any) {
                                setStatusMsg(`❌ Retry failed: ${e.message}`);
                              } finally {
                                setActionLoading(null);
                              }
                            }}
                            loading={actionLoading === `retry-${res.id}`}
                            variant="secondary"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Publishing Action Controls */}
            {['approved', 'published'].includes(problem.status) ? (
              <ActionButton
                label={problem.status === 'published' ? '🔄 Re-publish / Publish Updates' : '🚀 Publish to All Configured Platforms'}
                onClick={() => handleAction('publish')}
                loading={actionLoading === 'publish'}
              />
            ) : problem.status === 'awaiting_approval' ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex-1 text-xs text-blue-200">
                  Civic report is ready! Approve this report to enable publishing.
                </div>
                <div className="flex gap-2">
                  <ActionButton
                    label="👍 Approve & Publish"
                    onClick={async () => {
                      setActionLoading('approve-publish');
                      try {
                        await api.reviewProblem(id, { action: 'approve', notes: reviewNotes });
                        await api.publishProblem(id);
                        setStatusMsg('🌐 Approved and published successfully!');
                        await fetch();
                      } catch (err: any) {
                        setStatusMsg(`❌ Error: ${err.message}`);
                      } finally {
                        setActionLoading(null);
                      }
                    }}
                    loading={actionLoading === 'approve-publish'}
                  />
                </div>
              </div>
            ) : problem.civicReport ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex-1 text-xs text-yellow-200">
                  Civic report exists. Please approve the problem before publishing.
                </div>
                <ActionButton
                  label="👍 Approve Problem"
                  onClick={() => handleAction('approve')}
                  loading={actionLoading === 'approve'}
                />
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-300">
                ⚠️ Complete the AI Pipeline (Evidence Analysis + Deep Research) first to generate the Civic Report before publishing.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── History Tab ──────────────────────────────────────────────────────── */}
      {tab === 'history' && (
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-6">Full Status History</h3>
          <div className="space-y-1">
            {problem.statusHistory?.map((h: any, i: number) => (
              <div key={h.id} className="timeline-item">
                <div className="timeline-dot" />
                <div className="pb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">
                      → {STATUS_LABELS[h.toStatus] || h.toStatus}
                    </span>
                    <span className="text-xs text-gray-500">{new Date(h.createdAt).toLocaleString()}</span>
                  </div>
                  {h.changedByName && (
                    <div className="text-xs text-gray-500">by {h.changedByName}</div>
                  )}
                  {h.notes && (
                    <div className="text-xs text-gray-400 mt-1 bg-white/3 p-2 rounded-lg">{h.notes}</div>
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
