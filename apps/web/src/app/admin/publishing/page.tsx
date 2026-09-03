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
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Multi-Channel Publishing Matrix</h1>
        <p className="text-gray-400 text-sm">Manage API connections for automatic civic report distribution</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { key: 'linkedin', name: 'LinkedIn', icon: '💼', desc: 'Publish executive alerts to municipal pages' },
          { key: 'twitter', name: 'Twitter / X', icon: '🐦', desc: 'Tweet public notices and official tags' },
          { key: 'wordpress', name: 'WordPress', icon: '📝', desc: 'Post full-length articles to civic blog' },
          { key: 'webhook', name: 'Custom Webhook', icon: '🔗', desc: 'Push JSON payloads to government portals' },
        ].map((item) => {
          const isConfigured = status?.platforms?.[item.key];
          return (
            <div key={item.key} className="glass-card p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    isConfigured ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 text-gray-500 border border-white/10'
                  }`}>
                    {isConfigured ? 'Connected' : 'Not Configured'}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white mb-1">{item.name}</h3>
                <p className="text-xs text-gray-400 mb-4">{item.desc}</p>
              </div>
              <div className="text-xs text-gray-500 border-t border-white/5 pt-3">
                {isConfigured ? 'Ready to broadcast' : 'Configure keys in .env'}
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Publishing Workflow</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          Civora uses human-in-the-loop validation for all civic announcements. Once an issue is researched by the AI engine, an administrator can review the proposed summary, edit the content, and trigger automated cross-platform broadcasting from the problem management view.
        </p>
      </div>
    </div>
  );
}
