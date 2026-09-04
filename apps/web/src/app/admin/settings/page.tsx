'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { api } from '@/lib/api';
import { Cpu, Database, UserCheck, Zap, ShieldCheck } from 'lucide-react';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [aiStatus, setAiStatus] = useState<any>(null);

  useEffect(() => {
    api.getAiStatus().then(setAiStatus).catch(() => null);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2EBE0]">
        <div>
          <h1 className="text-2xl font-extrabold text-[#13251A] tracking-tight">Platform Settings</h1>
          <p className="text-sm text-[#546E5E]">System configuration, AI pipeline models, and cloud storage telemetry.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#D5E4D4] text-xs font-semibold text-[#255C3A] shadow-xs">
          <ShieldCheck className="w-4 h-4 text-[#2F7A4C]" />
          System Operational
        </div>
      </div>

      <div className="space-y-6">
        {/* AI Engine Configuration Card */}
        <div className="glass-card p-6 md:p-8 bg-white border border-[#DCE5DA] shadow-xs">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#EAF0E8]">
            <div className="w-10 h-10 rounded-xl bg-[#EAF4E8] text-[#215735] flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#14261C]">AI Engine & Inference</h2>
              <p className="text-xs text-[#5D7666]">Autonomous dual-stage reasoning, verification, and deep research pipeline</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F6FAF5] border border-[#DEE7DC] flex items-center justify-between gap-4">
            <div>
              <span className="font-bold text-[#557161] text-xs uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#2B7347]" />
                Inference Engine
              </span>
              <span className="text-sm font-extrabold text-[#14261C]">
                Groq High-Speed LPU Engine
              </span>
              <div className="text-xs text-[#547361] mt-0.5">
                Ultra-fast autonomous processing (3.2s avg response)
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EBF5EA] text-[#1E5433] border border-[#CCE3CA] shadow-2xs">
              ACTIVE & ONLINE
            </span>
          </div>
        </div>

        {/* Cloud Storage Card */}
        <div className="glass-card p-6 md:p-8 bg-white border border-[#DCE5DA] shadow-xs">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#EAF0E8]">
            <div className="w-10 h-10 rounded-xl bg-[#EAF4E8] text-[#215735] flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#14261C]">Storage & Evidence Infrastructure</h2>
              <p className="text-xs text-[#5D7666]">Media evidence and incident document storage</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F6FAF5] border border-[#DEE7DC] text-xs">
            <span className="font-bold text-[#557161] uppercase tracking-wider block mb-1">Active Storage Driver</span>
            <span className="text-sm font-bold text-[#14261C]">Local Storage Adapter with Signed URL Streamer</span>
            <div className="text-[11px] text-[#547361] mt-1">Protected multi-part upload buffer (max 10MB per image)</div>
          </div>
        </div>

        {/* Admin Session Card */}
        <div className="glass-card p-6 md:p-8 bg-white border border-[#DCE5DA] shadow-xs">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#EAF0E8]">
            <div className="w-10 h-10 rounded-xl bg-[#EAF4E8] text-[#215735] flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#14261C]">Administrative Authority Session</h2>
              <p className="text-xs text-[#5D7666]">Current authenticated session credentials</p>
            </div>
          </div>

          <p className="text-xs text-[#526B5C]">
            Signed in as: <strong className="text-[#14261C] font-mono font-bold text-sm bg-[#EBF5EA] px-2.5 py-1 rounded-lg border border-[#D0E6CF] text-[#1E5433] ml-1">{user?.email}</strong> (Super Administrator)
          </p>
        </div>
      </div>
    </div>
  );
}
