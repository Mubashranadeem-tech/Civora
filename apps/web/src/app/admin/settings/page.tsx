'use client';

import { useAuth } from '@/contexts/auth.context';

export default function AdminSettingsPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-2 border-b border-[#E2EBE0]">
        <h1 className="text-2xl font-extrabold text-[#13251A] tracking-tight">Platform Settings</h1>
        <p className="text-sm text-[#546E5E]">System configuration, AI pipeline models, and cloud storage parameters.</p>
      </div>

      <div className="space-y-6">
        <div className="glass-card p-6 md:p-8 bg-white border border-[#DCE5DA] shadow-xs">
          <h2 className="text-base font-bold text-[#14261C] mb-3 pb-2 border-b border-[#EAF0E8]">
            AI Engine Configuration
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#F6FAF5] border border-[#DEE7DC]">
              <span className="font-bold text-[#557161] uppercase tracking-wider block mb-1">Inference Engine</span>
              <span className="text-sm font-bold text-[#14261C]">Groq High-Speed LPU API</span>
            </div>
            <div className="p-4 rounded-xl bg-[#F6FAF5] border border-[#DEE7DC]">
              <span className="font-bold text-[#557161] uppercase tracking-wider block mb-1">Active Model</span>
              <span className="text-sm font-bold text-[#14261C]">openai/gpt-oss-120b</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 md:p-8 bg-white border border-[#DCE5DA] shadow-xs">
          <h2 className="text-base font-bold text-[#14261C] mb-3 pb-2 border-b border-[#EAF0E8]">
            Cloud Storage & Media Infrastructure
          </h2>
          <div className="p-4 rounded-xl bg-[#F6FAF5] border border-[#DEE7DC] text-xs">
            <span className="font-bold text-[#557161] uppercase tracking-wider block mb-1">Storage Driver</span>
            <span className="text-sm font-bold text-[#14261C]">Local Storage Adapter with Signed URL Streamer</span>
          </div>
        </div>

        <div className="glass-card p-6 md:p-8 bg-white border border-[#DCE5DA] shadow-xs">
          <h2 className="text-base font-bold text-[#14261C] mb-3 pb-2 border-b border-[#EAF0E8]">
            Active Administrative Session
          </h2>
          <p className="text-xs text-[#526B5C]">
            Signed in as: <strong className="text-[#14261C] font-semibold">{user?.email}</strong> (Super Administrator)
          </p>
        </div>
      </div>
    </div>
  );
}
