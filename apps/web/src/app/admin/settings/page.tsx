'use client';

import { useAuth } from '@/contexts/auth.context';

export default function AdminSettingsPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Platform Settings</h1>
        <p className="text-gray-400 text-sm">System configuration, AI models, and infrastructure parameters</p>
      </div>

      <div className="space-y-6">
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-white mb-3">AI Engine Configuration</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-xl bg-white/2 border border-white/5">
              <span className="text-xs text-gray-500 block">Current Model</span>
              <span className="text-white font-medium">GPT-4o / Alibaba Cloud Qwen Compatible</span>
            </div>
            <div className="p-3 rounded-xl bg-white/2 border border-white/5">
              <span className="text-xs text-gray-500 block">Temperature / Hallucination Guard</span>
              <span className="text-white font-medium">0.3 (Strict Factual Verification)</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-white mb-3">Cloud Storage Infrastructure</h2>
          <div className="p-3 rounded-xl bg-white/2 border border-white/5 text-sm">
            <span className="text-xs text-gray-500 block">Storage Engine</span>
            <span className="text-white font-medium">Alibaba Cloud Object Storage Service (OSS) / Local Fallback Adapter</span>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-white mb-3">Admin Account</h2>
          <p className="text-sm text-gray-400">Signed in as <span className="text-white font-medium">{user?.email}</span></p>
        </div>
      </div>
    </div>
  );
}
