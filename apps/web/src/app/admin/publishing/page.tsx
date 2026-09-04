'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Share2, Send, FileText, Webhook, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

export default function AdminPublishingPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPublishingStatus().then(setStatus).catch(() => null).finally(() => setLoading(false));
  }, []);

  const PLATFORMS = [
    { key: 'linkedin', name: 'LinkedIn', icon: Share2, desc: 'Publish executive alerts to municipal pages and official leadership channels' },
    { key: 'twitter', name: 'Twitter / X', icon: Send, desc: 'Broadcast instant public notices, civic tags, and geotagged incident alerts' },
    { key: 'wordpress', name: 'WordPress', icon: FileText, desc: 'Post full-length editorial civic intelligence articles to WordPress portals' },
    { key: 'webhook', name: 'Webhook', icon: Webhook, desc: 'Push structured JSON payloads directly to municipal API endpoints & external services' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2EBE0]">
        <div>
          <h1 className="text-2xl font-extrabold text-[#13251A] tracking-tight">Multi-Channel Publishing Matrix</h1>
          <p className="text-sm text-[#546E5E]">Manage automated distribution connectors to WordPress, Twitter/X, and municipal portals.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#D5E4D4] text-xs font-semibold text-[#255C3A] shadow-xs">
          <ShieldCheck className="w-4 h-4 text-[#2F7A4C]" />
          Human-in-the-Loop Gateway
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLATFORMS.map((item) => {
          const Icon = item.icon;
          const isConfigured = status?.platforms?.[item.key];
          return (
            <div key={item.key} className="glass-card p-6 bg-white border border-[#DCE5DA] hover:border-[#ADC7B0] transition-all flex flex-col justify-between group shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[#F0F6EE] border border-[#D8E6D7] flex items-center justify-center text-[#235837] group-hover:bg-[#E5F1E3] transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${
                    isConfigured ? 'bg-[#EBF5EA] text-[#1E5433] border border-[#CCE2CA]' : 'bg-[#F9FAF8] text-[#869E8F] border border-[#E3ECE2]'
                  }`}>
                    {isConfigured ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-[#2F7A4C]" />
                        Active
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 text-[#94A99C]" />
                        Pending
                      </>
                    )}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#14261C] mb-1.5 group-hover:text-[#235837] transition-colors">{item.name}</h3>
                <p className="text-xs text-[#5C7566] leading-relaxed mb-4">{item.desc}</p>
              </div>
              <div className="text-[11px] font-semibold text-[#577564] border-t border-[#EAF0E8] pt-3.5 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-[#328352] animate-pulse' : 'bg-[#C2D4C6]'}`} />
                {isConfigured ? 'Verified & ready to broadcast' : 'Configure credentials in environment'}
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card-elevated p-8 bg-white border border-[#DCE5DA]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF4E8] text-[#245D3B] flex items-center justify-center font-bold flex-shrink-0">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#14261C] mb-2">Publishing Workflow & Civic Integrity Engine</h2>
            <p className="text-xs text-[#526B5C] leading-relaxed mb-4">
              Civora enforces human-in-the-loop validation for all civic announcements. Once an issue is analyzed and researched by the autonomous AI engine, an administrator can review the generated civic intelligence report, make adjustments, and trigger automated cross-platform broadcasting directly from the Problem Studio with one click.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[#F6FAF5] border border-[#E0EBE0] text-xs font-semibold text-[#274E35]">
                1. AI Pre-Drafting & Synthesis
              </div>
              <div className="p-3 rounded-xl bg-[#F6FAF5] border border-[#E0EBE0] text-xs font-semibold text-[#274E35]">
                2. Authority Review & Approval
              </div>
              <div className="p-3 rounded-xl bg-[#F6FAF5] border border-[#E0EBE0] text-xs font-semibold text-[#274E35]">
                3. Instant Multi-Channel Dispatch
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
