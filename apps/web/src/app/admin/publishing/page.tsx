'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminPublishingPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPublishingStatus().then(setStatus).catch(() => null).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="pb-2 border-b border-[#E2EBE0]">
        <h1 className="text-2xl font-extrabold text-[#13251A] tracking-tight">Multi-Channel Publishing Matrix</h1>
        <p className="text-sm text-[#546E5E]">Manage automated distribution connectors to WordPress, Twitter/X, and public portals.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { key: 'linkedin', name: 'LinkedIn', icon: '💼', desc: 'Publish executive alerts to municipal pages' },
          { key: 'twitter', name: 'Twitter / X', icon: '🐦', desc: 'Tweet public notices and official tags' },
          { key: 'wordpress', name: 'WordPress', icon: '📝', desc: 'Post full-length articles to civic blog' },
          { key: 'webhook', name: 'Custom Webhook', icon: '🔗', desc: 'Push JSON payloads to government portals' },
        ].map((item) => {
          const isConfigured = status?.platforms?.[item.key];
          return (
            <div key={item.key} className="glass-card p-5 bg-white border border-[#DCE5DA] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F0F6EE] border border-[#D8E6D7] flex items-center justify-center text-xl">
                    {item.icon}
                  </div>
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isConfigured ? 'bg-[#EBF5EA] text-[#1E5433] border border-[#CCE2CA]' : 'bg-[#F9FAF8] text-[#869E8F] border border-[#E3ECE2]'
                  }`}>
                    {isConfigured ? 'Connected' : 'Not Set'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#14261C] mb-1">{item.name}</h3>
                <p className="text-xs text-[#5C7566] mb-4">{item.desc}</p>
              </div>
              <div className="text-[11px] font-medium text-[#718C7C] border-t border-[#EAF0E8] pt-3">
                {isConfigured ? '● Active and ready to broadcast' : '○ Configure credentials in environment'}
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card p-6 md:p-8 bg-white border border-[#DCE5DA] shadow-xs">
        <h2 className="text-base font-bold text-[#14261C] mb-2">Publishing Workflow & Integrity</h2>
        <p className="text-xs text-[#526B5C] leading-relaxed">
          Civora enforces human-in-the-loop validation for all civic announcements. Once an issue is analyzed and researched by the autonomous AI engine, an administrator can review the generated civic intelligence report, make edits, and trigger automated cross-platform broadcasting directly from the Problem Studio.
        </p>
      </div>
    </div>
  );
}
