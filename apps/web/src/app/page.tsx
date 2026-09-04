'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { 
  Building2, 
  Zap, 
  TreePine, 
  GraduationCap, 
  Hospital, 
  Car, 
  ShieldAlert, 
  Landmark, 
  CheckCircle2, 
  Activity, 
  Target, 
  Building,
  FileText,
  BrainCircuit,
  Search,
  Send,
  User,
  Shield,
  ArrowRight,
  Sparkles,
  Layers,
  Cpu,
  Share2,
  ChevronRight,
  Flame,
  Check,
  HelpCircle,
  BarChart3,
  Globe,
  Radio,
  Clock,
  ShieldCheck,
  Eye,
  Terminal,
  ExternalLink
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Infrastructure', icon: Building2, desc: 'Roads, bridges, streetlights, sinkholes & structural hazards' },
  { name: 'Utilities & Power', icon: Zap, desc: 'Blackouts, water pipeline bursts, gas line leaks & grid failures' },
  { name: 'Sanitation & Parks', icon: TreePine, desc: 'Illegal dumping, hazardous waste, park upkeep & clean air' },
  { name: 'Higher Education', icon: GraduationCap, desc: 'Fee overcharges, campus safety, facility deficits & admissions' },
  { name: 'Healthcare & EMS', icon: Hospital, desc: 'Dispensaries, ambulance delays, clinic supply shortages' },
  { name: 'Transportation', icon: Car, desc: 'Traffic gridlocks, illegal parking, public transit & road hazards' },
  { name: 'Public Safety', icon: ShieldAlert, desc: 'Open manholes, unsafe construction zones & night lighting' },
  { name: 'Municipal Authority', icon: Landmark, desc: 'District governance, administrative delays & permit issues' },
];

const STATS = [
  { label: 'Active Pipeline Queue', value: '0', icon: CheckCircle2, sub: 'Real-time telemetry' },
  { label: 'Avg AI Verification', value: '3.2s', icon: Activity, sub: 'High-Speed Triage' },
  { label: 'Publishing Connectors', value: '3', icon: Target, sub: 'WordPress, Webhook, X' },
  { label: 'Connected Districts', value: '1', icon: Building, sub: 'Capital Territory Live' },
];

const PIPELINE_STEPS = [
  {
    step: '01',
    title: 'Citizen Geo-Report',
    badge: 'Step 1 · Ingestion',
    desc: 'Citizens submit incidents with photo evidence, GPS coordinates, and descriptions in under 60 seconds.',
    icon: FileText,
  },
  {
    step: '02',
    title: 'AI Multi-Agent Triage',
    badge: 'Step 2 · Verification',
    desc: 'Autonomous LLM assesses authenticity, scores severity (1-100), and eliminates duplicate spam.',
    icon: BrainCircuit,
  },
  {
    step: '03',
    title: 'Deep Civic Research',
    badge: 'Step 3 · Authority Mapping',
    desc: 'Engine cross-references local statutes, past precedents, and pinpoints the exact accountable government desk.',
    icon: Search,
  },
  {
    step: '04',
    title: 'Multi-Channel Accountability',
    badge: 'Step 4 · Public Action',
    desc: 'Verified dossiers are dispatched with 1-click to WordPress civic portals, Twitter/X, and municipal APIs.',
    icon: Send,
  },
];

const QUICK_TICKETS = [
  { id: 'CIV-2026-000004', title: 'High University Fee Surcharge', domain: 'Education' },
  { id: 'CIV-2026-000003', title: 'Commercial Blockade & Illegal Parking', domain: 'Transportation' },
  { id: 'CIV-2026-000002', title: 'Critical Road Collapse on Sector G', domain: 'Infrastructure' },
];

const FAQ_ITEMS = [
  {
    q: 'How does Civora’s AI prevent fake or duplicate submissions?',
    a: 'Civora uses a multi-modal analysis pipeline. It verifies image metadata, performs perceptual similarity checks against historical local reports to flag duplicates, and runs automated plausibility evaluation before any ticket is advanced to review.',
  },
  {
    q: 'Can citizens submit and track reports anonymously?',
    a: 'Yes. Citizens can lodge grievances with full privacy. Every report is assigned a unique cryptographic Civic Ticket ID (e.g. CIV-2026-000004) allowing real-time timeline tracking without exposing personal contact details.',
  },
  {
    q: 'How does the Multi-Channel Publishing feature enforce accountability?',
    a: 'Once an administrator validates the AI Civic Dossier, Civora automatically posts formatted articles to public WordPress portals, broadcasts geotagged alerts to Twitter/X tagging the responsible ministry, and dispatches JSON payloads to municipal webhooks.',
  },
  {
    q: 'What LLM engines power Civora?',
    a: 'Civora is powered by ultra-fast inference through Groq (Llama-3 70B/8B) and OpenAI vision models, delivering thorough civic intelligence synthesis in under 3.5 seconds.',
  },
];

function Counter({ end, duration = 1800 }: { end: string; duration?: number }) {
  const [current, setCurrent] = useState('0');

  useEffect(() => {
    const numericEnd = parseInt(end.replace(/,/g, ''));
    if (isNaN(numericEnd)) {
      setCurrent(end);
      return;
    }
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(eased * numericEnd);
      setCurrent(currentVal.toLocaleString());
      if (progress >= 1) clearInterval(timer);
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{current}</span>;
}

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [trackCivId, setTrackCivId] = useState('');
  const [liveProblemCount, setLiveProblemCount] = useState<string>('0');
  const [activeDemoTab, setActiveDemoTab] = useState<'triage' | 'research' | 'dossier' | 'broadcast'>('triage');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    api.listProblems({ limit: 1 }).then((res: any) => {
      if (res?.total !== undefined) {
        setLiveProblemCount(String(res.total));
      } else if (res?.items) {
        setLiveProblemCount(String(res.items.length));
      }
    }).catch(() => null);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      if (window.scrollY > 250) setStatsVisible(true);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTrack = (e: React.FormEvent, customId?: string) => {
    if (e) e.preventDefault();
    const idToTrack = (customId || trackCivId).trim();
    if (!idToTrack) return;
    router.push(`/dashboard/track?id=${encodeURIComponent(idToTrack)}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-[#14261C] selection:bg-[#255D3A] selection:text-white overflow-x-hidden font-sans">
      
      {/* ── Top Floating Navigation ────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'glass py-3.5 shadow-sm border-b border-[#DFE8DE]' 
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1A452C] via-[#245D3B] to-[#3B7F54] flex items-center justify-center text-white text-base font-black shadow-sm group-hover:scale-105 transition-transform">
              C
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-tight text-[#14261C] flex items-center gap-1.5">
                <span>Civora</span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-[#E8F4E6] text-[#215735] border border-[#CCE3CB]">
                  v2.4
                </span>
              </div>
              <div className="hidden sm:block text-[11px] font-semibold text-[#5A7363]">
                Autonomous Civic Intelligence
              </div>
            </div>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-[#4E6757]">
            <a href="#portal-selector" className="hover:text-[#183D26] transition-colors">Portals</a>
            <a href="#interactive-cockpit" className="hover:text-[#183D26] transition-colors">AI Engine</a>
            <a href="#how-it-works" className="hover:text-[#183D26] transition-colors">Pipeline</a>
            <a href="#domains" className="hover:text-[#183D26] transition-colors">Domains</a>
            <a href="#comparison" className="hover:text-[#183D26] transition-colors">Why Civora</a>
            <a href="#faq" className="hover:text-[#183D26] transition-colors">FAQ</a>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-bold text-[#324D3D] hover:text-[#142B1E] px-3.5 py-2 transition-colors rounded-xl hover:bg-[#EEF5ED]"
            >
              Sign In
            </Link>
            <Link
              href="/login?role=citizen"
              className="btn-primary text-xs px-5 py-2.5 rounded-xl shadow-xs inline-flex items-center gap-1.5 font-bold"
            >
              Submit Issue
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ─────────────────────────────────────────────────────── */}
      <section className="hero-gradient pt-32 sm:pt-36 pb-20 relative overflow-hidden border-b border-[#E3EBE0] bg-dot-grid-subtle">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-[#DFEFE0]/80 via-[#EAF4EB]/50 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 right-5 w-80 h-80 bg-[#E0EFE0]/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-5 w-80 h-80 bg-[#EAF4EB]/60 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          
          {/* Hackathon Grade Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#D0E2D0] shadow-xs text-xs font-semibold text-[#1F5734] mb-8 animate-fade-in hover:border-[#ADCBAF] transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-[#2A6D44]" />
            <span>Autonomous Civic Action Engine</span>
            <span className="text-[#A4BCA9] font-light">•</span>
            <span className="font-mono text-[#547360] font-medium">Real-Time Civic Intelligence</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#112418] mb-6 leading-[1.08] max-w-5xl mx-auto">
            Transform Citizen Grievances Into{' '}
            <span className="gradient-text block sm:inline">Autonomous Action.</span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-[#4A6455] max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Civora bridges grassroots community reports and municipal accountability in real time — powered by automated vision triage, deep civic precedent research, and 1-click multi-channel public broadcasting.
          </p>

          {/* ── Quick Tracker Bar & Quick Lookup Chips ────────────────────── */}
          <div className="max-w-2xl mx-auto mb-14">
            <form onSubmit={(e) => handleTrack(e)} className="flex items-center gap-2 p-2 bg-white rounded-2xl border border-[#CFDFCE] shadow-lg shadow-[#1C4830]/5 focus-within:border-[#2C6944] focus-within:ring-4 focus-within:ring-[#2C6944]/10 transition-all">
              <Search className="w-5 h-5 text-[#5F7D6B] ml-3.5 flex-shrink-0" />
              <input
                type="text"
                value={trackCivId}
                onChange={(e) => setTrackCivId(e.target.value.toUpperCase())}
                placeholder="Enter Ticket ID (e.g. CIV-2026-000004)..."
                className="w-full bg-transparent border-none text-xs sm:text-sm font-semibold text-[#14261C] placeholder-[#8BA393] focus:outline-none px-2 uppercase font-mono"
              />
              <button 
                type="submit" 
                className="btn-primary text-xs px-6 py-3 rounded-xl whitespace-nowrap shadow-xs font-bold inline-flex items-center gap-1.5"
              >
                Track Status
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5 text-xs">
              <span className="text-[#647F6F] font-medium text-[11px]">Quick Track Demos:</span>
              {QUICK_TICKETS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTrackCivId(t.id);
                    router.push(`/dashboard/track?id=${t.id}`);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/90 border border-[#D5E4D4] hover:border-[#2C6944] text-[#1E5231] font-mono text-[11px] font-bold transition-all shadow-2xs hover:bg-[#F2F8F1] inline-flex items-center gap-1"
                >
                  <Search className="w-2.5 h-2.5 text-[#377A50]" />
                  {t.id}
                </button>
              ))}
            </div>
          </div>

          {/* ── Interactive Dual Portal Split Cards (Citizen vs Admin) ───────── */}
          <div id="portal-selector" className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto text-left mb-16">
            
            {/* Citizen Portal Card (High Luxury Porcelain Glass) */}
            <div className="glass-card-elevated p-8 sm:p-9 relative overflow-hidden group hover:border-[#96BD99] transition-all bg-white flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#EBF5EA] via-[#F4FAF3] to-transparent rounded-bl-full pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-13 h-13 rounded-2xl bg-[#EAF4E8] border border-[#CEE3CC] flex items-center justify-center text-[#215735] shadow-xs group-hover:scale-105 transition-transform">
                    <User className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#EBF5EA] text-[#1F5734] border border-[#CCE3CB]">
                    Resident Gateway
                  </span>
                </div>

                <div className="text-xs font-bold uppercase tracking-wider text-[#2D6C48] mb-1.5">
                  For Community & Citizens
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#13251A] mb-3">
                  Citizen Portal
                </h3>
                <p className="text-xs sm:text-sm text-[#50685A] leading-relaxed mb-6">
                  Report infrastructure failures, utility breakdowns, and public safety issues in under 60 seconds with GPS lock, automated AI verification, and live resolution timelines.
                </p>

                {/* Feature checklist */}
                <div className="space-y-2.5 mb-8 text-xs font-semibold text-[#274633]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2E7548] flex-shrink-0" />
                    <span>Instant photo & GPS evidence ingestion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2E7548] flex-shrink-0" />
                    <span>Automated AI severity scoring & duplicate filtering</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2E7548] flex-shrink-0" />
                    <span>Live step-by-step progress tracking with SMS/Web alerts</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 items-center pt-2 border-t border-[#EDF3EC]">
                <Link
                  href="/login?role=citizen"
                  className="btn-primary text-xs px-6 py-3.5 rounded-xl inline-flex items-center gap-2 shadow-xs font-bold"
                >
                  Submit / Track Problem
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/register"
                  className="btn-secondary text-xs px-5 py-3.5 rounded-xl font-bold"
                >
                  Create Account
                </Link>
              </div>
            </div>

            {/* Admin Command Console Card (Deep High-Tech Emerald Glass) */}
            <div className="glass-dark p-8 sm:p-9 relative overflow-hidden group border border-[#346F4B]/40 transition-all rounded-3xl flex flex-col justify-between text-white shadow-xl">
              <div className="absolute top-0 right-0 w-52 h-52 bg-gradient-to-bl from-[#2F6F48]/40 via-transparent to-transparent rounded-bl-full pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#3A8559]/15 rounded-full blur-2xl pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#235838] to-[#367E51] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform border border-white/10">
                    <Shield className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#204930] text-[#A6E2B9] border border-[#3A7550]">
                    Authority Command
                  </span>
                </div>

                <div className="text-xs font-bold uppercase tracking-wider text-[#7ED49C] mb-1.5">
                  For Municipal Officers & Reviewers
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
                  Admin Command Console
                </h3>
                <p className="text-xs sm:text-sm text-[#B2CEBC] leading-relaxed mb-6">
                  Unified operations console with real-time triage queues, autonomous legal & municipal research dossiers, and automated multi-channel publication engines.
                </p>

                {/* Feature checklist */}
                <div className="space-y-2.5 mb-8 text-xs font-semibold text-[#D4EBDC]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#68C589] flex-shrink-0" />
                    <span>Real-time live incoming triage queue & severity matrix</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#68C589] flex-shrink-0" />
                    <span>Autonomous civic precedent research & legal citations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#68C589] flex-shrink-0" />
                    <span>1-Click multi-channel WordPress, Twitter/X & Webhook dispatch</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 items-center pt-2 border-t border-white/10">
                <Link
                  href="/login?role=admin"
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#2B774A] to-[#459F67] hover:from-[#24663E] hover:to-[#3A8958] text-white text-xs font-bold inline-flex items-center gap-2 shadow-md transition-all"
                >
                  Open Admin Console
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/admin/problems"
                  className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 transition-all"
                >
                  View Live Queue
                </Link>
              </div>
            </div>

          </div>

          {/* ── Key Performance Metrics Bar ─────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { label: 'Active Pipeline Queue', value: liveProblemCount, icon: CheckCircle2, sub: 'Real-time telemetry' },
              { label: 'Avg AI Verification', value: '3.2s', icon: Activity, sub: 'High-Speed Triage' },
              { label: 'Publishing Connectors', value: '3', icon: Target, sub: 'WordPress, Webhook, X' },
              { label: 'Connected Districts', value: '1', icon: Building, sub: 'Capital Territory Live' },
            ].map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="glass-card p-5 text-center bg-white shadow-2xs hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl bg-[#F0F6EE] border border-[#D9E7D8] flex items-center justify-center text-[#215735] mx-auto mb-2.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#133822] tracking-tight">
                    {statsVisible ? <Counter end={s.value} /> : s.value}
                  </div>
                  <div className="text-xs font-bold text-[#192F22] mt-0.5">{s.label}</div>
                  <div className="text-[10px] font-semibold text-[#668271] mt-0.5">{s.sub}</div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── Interactive Live AI Pipeline Cockpit / Playground ────────────────── */}
      <section id="interactive-cockpit" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EBF5EA] border border-[#CCE4CA] text-[#1E5632] text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
            <Cpu className="w-3.5 h-3.5" />
            Interactive AI Engine Demo
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#122418] mb-4 tracking-tight">
            See the Autonomous Engine <span className="gradient-text">In Action</span>
          </h2>
          <p className="text-[#516C5C] max-w-2xl mx-auto text-sm sm:text-base">
            Click through the 4 live stages of Civora's autonomous pipeline to see how raw complaints are converted into published civic intelligence in seconds.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto mb-8 p-1.5 bg-white rounded-2xl border border-[#D5E3D4] shadow-xs">
          {[
            { id: 'triage', label: '1. AI Vision & Triage', icon: BrainCircuit },
            { id: 'research', label: '2. Precedent Research', icon: Search },
            { id: 'dossier', label: '3. Intelligence Dossier', icon: FileText },
            { id: 'broadcast', label: '4. Multi-Channel Dispatch', icon: Send },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeDemoTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveDemoTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#1C4830] text-white shadow-sm'
                    : 'text-[#4F6859] hover:text-[#14261C] hover:bg-[#F2F7F1]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Interactive Studio Preview Card */}
        <div className="glass-card-elevated p-6 sm:p-10 bg-white border border-[#D5E3D4] max-w-5xl mx-auto shadow-md">
          {activeDemoTab === 'triage' && (
            <div className="grid md:grid-cols-2 gap-8 items-center animate-fade-in">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#255C3A]">
                  <span className="w-2 h-2 rounded-full bg-[#2F7A4C] animate-pulse" />
                  Stage 1: Multi-Modal Ingestion & Analysis
                </div>
                <h3 className="text-2xl font-black text-[#13251A]">
                  Evidence Authentication & Severity Scoring
                </h3>
                <p className="text-xs sm:text-sm text-[#546E5F] leading-relaxed">
                  Upon submission, the AI vision engine analyzes uploaded photos to ensure authenticity, detects duplicate incidents within a 500m radius, and computes an objective 100-point severity score.
                </p>
                
                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-[#4E6657]">Evidence Authenticity & Quality</span>
                      <span className="text-[#1E5632] font-mono">94% Confidence</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#EAEFE8] overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#2F6B47] to-[#459062] rounded-full w-[94%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-[#4E6657]">Community Severity Metric</span>
                      <span className="text-[#C25008] font-mono">High Priority (86/100)</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#EAEFE8] overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#DF7631] to-[#C25008] rounded-full w-[86%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulated Code/Card Output */}
              <div className="p-6 rounded-2xl bg-[#F6FAF5] border border-[#D5E4D4] font-mono text-xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#E0EBE0] text-[11px] text-[#557262]">
                  <span className="font-bold text-[#14261C]">CIV-2026-000004_TRIAGE.JSON</span>
                  <span className="text-[#205833] font-bold">STATUS: VERIFIED</span>
                </div>
                <div className="text-[#264D35] space-y-1 text-[11px]">
                  <div><span className="text-[#728F7E]">"geo_coordinates":</span> "33.7294° N, 73.0931° E"</div>
                  <div><span className="text-[#728F7E]">"duplicate_check":</span> "0 matching open reports"</div>
                  <div><span className="text-[#728F7E]">"category_detected":</span> "Higher Education Fee Violation"</div>
                  <div><span className="text-[#728F7E]">"ai_inference_time":</span> "1,420 ms"</div>
                  <div><span className="text-[#728F7E]">"urgency_rating":</span> "ESCALATE_TO_ADMIN"</div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#D8E6D7] text-[11px] text-[#1E4D30] font-sans">
                  <strong>AI Summary:</strong> High institutional fee surcharge lodged without public fee breakdown. High community impact affecting 800+ enrolled students.
                </div>
              </div>
            </div>
          )}

          {activeDemoTab === 'research' && (
            <div className="grid md:grid-cols-2 gap-8 items-center animate-fade-in">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#255C3A]">
                  <span className="w-2 h-2 rounded-full bg-[#2F7A4C] animate-pulse" />
                  Stage 2: Deep Civic Precedent Research
                </div>
                <h3 className="text-2xl font-black text-[#13251A]">
                  Autonomous Legal & Authority Mapping
                </h3>
                <p className="text-xs sm:text-sm text-[#546E5F] leading-relaxed">
                  Civora autonomously cross-references municipal charters, previous court judgments, and regional precedents to identify the exact department responsible for resolution.
                </p>

                <div className="space-y-2.5 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#F6FAF5] border border-[#E0EBE0] flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-[#205833] flex-shrink-0" />
                    <div>
                      <div className="font-bold text-[#14261C]">Accountable Body Mapped</div>
                      <div className="text-[11px] text-[#557161]">Capital Territory Higher Education Commission (HEC)</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F6FAF5] border border-[#E0EBE0] flex items-center gap-3">
                    <Landmark className="w-4 h-4 text-[#205833] flex-shrink-0" />
                    <div>
                      <div className="font-bold text-[#14261C]">Statutory Precedent</div>
                      <div className="text-[11px] text-[#557161]">National Student Protection Directive, Sec. 14-B (2024)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Research Dossier Card */}
              <div className="p-6 rounded-2xl bg-[#F6FAF5] border border-[#D5E4D4] text-xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#E0EBE0]">
                  <span className="font-bold text-xs text-[#14261C]">Identified Precedent Matrix</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-[#215735] border border-[#CCE3CB]">4 Citations</span>
                </div>
                <div className="space-y-2 text-xs text-[#3E5C4A]">
                  <div className="p-3 rounded-xl bg-white border border-[#DCE8DB]">
                    <div className="font-bold text-[#14261C] mb-1">Precedent #1: Islamabad High Court (2023)</div>
                    <p className="text-[11px] text-[#5A7565]">Mandated transparent fee schedules for all federally chartered university departments.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#DCE8DB]">
                    <div className="font-bold text-[#14261C] mb-1">Precedent #2: HEC Notification No. 492</div>
                    <p className="text-[11px] text-[#5A7565]">Requires 60-day prior written notice for laboratory and internship surcharge fees.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeDemoTab === 'dossier' && (
            <div className="grid md:grid-cols-2 gap-8 items-center animate-fade-in">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#255C3A]">
                  <span className="w-2 h-2 rounded-full bg-[#2F7A4C] animate-pulse" />
                  Stage 3: Executive Civic Intelligence Dossier
                </div>
                <h3 className="text-2xl font-black text-[#13251A]">
                  Synthesized Dossier Ready for Review
                </h3>
                <p className="text-xs sm:text-sm text-[#546E5F] leading-relaxed">
                  The LLM synthesizes an executive summary, a concise "Why It Matters" statement, proposed remediations, and auto-generated social copy ready for 1-click authority approval.
                </p>

                <div className="space-y-2 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#F6FAF5] border border-[#E0EBE0]">
                    <span className="font-bold text-[#14261C] block mb-1">Why It Matters:</span>
                    <p className="text-[11px] text-[#557161] leading-relaxed">
                      Undue student financial friction without regulatory adherence undermines institutional trust and breaches student protections.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F6FAF5] border border-[#E0EBE0]">
                    <span className="font-bold text-[#14261C] block mb-1">Recommended Remediation:</span>
                    <p className="text-[11px] text-[#557161] leading-relaxed">
                      Issue official compliance inquiry and freeze surcharge collection pending review.
                    </p>
                  </div>
                </div>
              </div>

              {/* Dossier Visual Preview */}
              <div className="p-6 rounded-2xl bg-[#173D28] text-white text-xs space-y-3.5 shadow-md">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="font-mono text-xs text-[#98E0B0] font-bold">CIVIC DOSSIER #CIV-2026-000004</span>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white">READY FOR APPROVAL</span>
                </div>
                <div className="space-y-2 text-xs text-[#D1E6D8]">
                  <div className="text-sm font-bold text-white">
                    High Internship Fee Charged by Air University
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#B7D4C1]">
                    <strong>Executive Findings:</strong> Investigation reveals a mandatory internship surcharge of PKR 15,000 levied across third-year engineering students without prior syndication approval.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-between text-[11px] border-t border-white/10 text-[#85C49B]">
                  <span>Evidence Files: 2 Attached</span>
                  <span className="font-bold text-white">Human-in-the-Loop Approved</span>
                </div>
              </div>
            </div>
          )}

          {activeDemoTab === 'broadcast' && (
            <div className="grid md:grid-cols-2 gap-8 items-center animate-fade-in">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#255C3A]">
                  <span className="w-2 h-2 rounded-full bg-[#2F7A4C] animate-pulse" />
                  Stage 4: Automated Multi-Channel Publishing
                </div>
                <h3 className="text-2xl font-black text-[#13251A]">
                  Public Accountability & Broadcast
                </h3>
                <p className="text-xs sm:text-sm text-[#546E5F] leading-relaxed">
                  Once approved by the review officer, Civora automatically broadcasts the verified civic dossier to official WordPress portals, Twitter/X channels, and government webhooks.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#F6FAF5] border border-[#E0EBE0] text-center">
                    <FileText className="w-5 h-5 text-[#205833] mx-auto mb-1" />
                    <div className="font-bold text-[#14261C]">WordPress</div>
                    <div className="text-[10px] text-[#5B7565]">Full Editorial Article</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F6FAF5] border border-[#E0EBE0] text-center">
                    <Send className="w-5 h-5 text-[#205833] mx-auto mb-1" />
                    <div className="font-bold text-[#14261C]">Twitter / X</div>
                    <div className="text-[10px] text-[#5B7565]">Geotagged Public Notice</div>
                  </div>
                </div>
              </div>

              {/* Broadcast Preview Card */}
              <div className="p-6 rounded-2xl bg-[#F6FAF5] border border-[#D5E4D4] text-xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#E0EBE0]">
                  <span className="font-bold text-[#14261C]">Live Broadcast Dispatcher</span>
                  <span className="text-[10px] font-bold text-[#1B6334] bg-[#EAF6EE] px-2 py-0.5 rounded border border-[#CCE7D3]">
                    3 CHANNELS DISPATCHED
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-[#DCE8DB] text-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-[#245D3B] font-bold text-[11px]">
                    <Send className="w-3.5 h-3.5" />
                    <span>Twitter / X Alert Published:</span>
                  </div>
                  <p className="text-[11px] text-[#334E3F] leading-relaxed">
                    "CIVIC ALERT: Complaint logged regarding tuition & internship surcharge at Air University. Case CIV-2026-000004 referred to @HECPakistan for compliance review. civora.org/track/CIV-2026-000004"
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-[#DCE8DB] text-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-[#245D3B] font-bold text-[11px]">
                    <FileText className="w-3.5 h-3.5" />
                    <span>WordPress Blog Article:</span>
                  </div>
                  <p className="text-[11px] text-[#334E3F]">
                    "Civic Intelligence Report: Regulatory Breakdown & Fee Surcharge at Air University" [Published ID #1042]
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── How It Works (4-Stage Pipeline) ─────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-[#F2F7F1] border-y border-[#E2EAE0]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#D0E3CE] text-[#1E5433] text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
              System Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#132419] mb-4 tracking-tight">
              The 4-Stage <span className="gradient-text">Accountability Pipeline</span>
            </h2>
            <p className="text-[#516C5C] max-w-2xl mx-auto text-sm sm:text-base">
              Engineered to eliminate government red tape and transform community observations into verified municipal action.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PIPELINE_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="glass-card p-7 text-left relative group hover:border-[#9FC5A3] transition-all bg-white flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-[#EAF4E8] border border-[#CEE3CC] flex items-center justify-center text-[#215735] group-hover:scale-105 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="font-mono text-xs font-bold text-[#205834] bg-[#E8F4E6] px-2.5 py-1 rounded-full border border-[#D0E6CD]">
                        {step.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#14261C] mb-2">{step.title}</h3>
                    <p className="text-xs text-[#526B5C] leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Problem Categories Matrix ────────────────────────────────────────── */}
      <section id="domains" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EBF5EA] border border-[#CCE4CA] text-[#1E5632] text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
            Coverage Matrix
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#132419] mb-4 tracking-tight">
            Comprehensive <span className="gradient-text">Civic Domains</span>
          </h2>
          <p className="text-[#516C5C] max-w-2xl mx-auto text-sm sm:text-base">
            Civora supports all municipal, educational, utility, and safety sectors with customized AI evaluation parameters.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <div
                key={i}
                className="glass-card p-6 bg-white hover:border-[#9AC09E] transition-all group shadow-2xs hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-[#F0F6EE] border border-[#D5E6D3] flex items-center justify-center text-[#215735] mb-4 group-hover:bg-[#E2F0E0] group-hover:scale-105 transition-all">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-[#14261C] group-hover:text-[#215735] transition-colors mb-1.5">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#587263] leading-relaxed mb-4">{cat.desc}</p>
                <Link
                  href="/login?role=citizen"
                  className="text-[11px] font-bold text-[#255C3A] inline-flex items-center gap-1 group-hover:gap-1.5 transition-all"
                >
                  Submit in this domain
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Comparison Section: Legacy Bureaucracy vs. Civora ───────────────── */}
      <section id="comparison" className="py-24 bg-[#F2F7F1] border-y border-[#E2EAE0]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#D0E3CE] text-[#1E5433] text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
              Why Civora
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#132419] mb-4 tracking-tight">
              Legacy Bureaucracy vs. <span className="gradient-text">Civora AI</span>
            </h2>
            <p className="text-[#516C5C] max-w-2xl mx-auto text-sm sm:text-base">
              See why traditional municipal ticketing portals fail and how Civora redefines community accountability.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Legacy Box */}
            <div className="glass-card p-8 bg-white border border-[#E5DDD8] shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#F0EAE6]">
                <div className="w-10 h-10 rounded-xl bg-[#FDF1F1] text-[#B92E2E] flex items-center justify-center font-bold">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#2E1A1A]">Traditional Municipal Portals</h3>
                  <div className="text-xs text-[#8C5E5E]">The status quo in most cities</div>
                </div>
              </div>

              <div className="space-y-4 text-xs text-[#5E4D4D]">
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#B92E2E] mt-1.5 flex-shrink-0" />
                  <div><strong>Weeks of delay:</strong> Manual paper filing and slow bureaucratic routing across departments.</div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#B92E2E] mt-1.5 flex-shrink-0" />
                  <div><strong>No evidence validation:</strong> Fraudulent or duplicate reports overwhelm administrative queues.</div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#B92E2E] mt-1.5 flex-shrink-0" />
                  <div><strong>Zero public accountability:</strong> Grievances disappear into internal silos with no public record.</div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#B92E2E] mt-1.5 flex-shrink-0" />
                  <div><strong>Frustrated residents:</strong> No real-time timeline, status updates, or resolution notifications.</div>
                </div>
              </div>
            </div>

            {/* Civora Box */}
            <div className="glass-card p-8 bg-[#FAFCF9] border-2 border-[#2C6944] shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-[#2C6944] text-white text-[10px] font-bold rounded-bl-xl uppercase tracking-wider">
                Civora Advantage
              </div>

              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#D8E6D7]">
                <div className="w-10 h-10 rounded-xl bg-[#EAF4E8] text-[#215735] flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#14261C]">Civora Autonomous Platform</h3>
                  <div className="text-xs text-[#35734A] font-semibold">AI-Powered Civic Intelligence</div>
                </div>
              </div>

              <div className="space-y-4 text-xs text-[#294B37]">
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#2C6944] mt-0.5 flex-shrink-0 font-bold" />
                  <div><strong>3.2-second verification:</strong> Automated multi-modal vision triage and severity scoring.</div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#2C6944] mt-0.5 flex-shrink-0 font-bold" />
                  <div><strong>Autonomous legal mapping:</strong> Maps responsible authorities, laws, and past precedents.</div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#2C6944] mt-0.5 flex-shrink-0 font-bold" />
                  <div><strong>Public multi-channel publishing:</strong> 1-Click push to WordPress portals, Twitter/X, and webhooks.</div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#2C6944] mt-0.5 flex-shrink-0 font-bold" />
                  <div><strong>Cryptographic ticket tracking:</strong> Complete transparency with real-time status timelines.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ──────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EBF5EA] border border-[#CCE4CA] text-[#1E5632] text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
            Frequently Asked Questions
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#132419] mb-3 tracking-tight">
            Got Questions? We Have Answers.
          </h2>
          <p className="text-[#516C5C] text-sm">
            Everything you need to know about the Civora platform architecture and accountability workflow.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="glass-card bg-white border border-[#D5E3D4] overflow-hidden transition-all shadow-2xs"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#14261C] hover:text-[#215735] transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-[#4D6F5B] transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? 'rotate-90 text-[#215735]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-[#50685A] leading-relaxed border-t border-[#EDF4EC] pt-3 animate-fade-in">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Final High-Impact Call to Action ─────────────────────────────────── */}
      <section className="py-20 max-w-5xl mx-auto px-6 text-center">
        <div className="glass-card-elevated p-10 sm:p-16 relative overflow-hidden bg-gradient-to-br from-[#F4FAF2] via-[#E8F4E6] to-[#DCEFD9] border border-[#BBD7B9] shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1A482E] to-[#2E6B47] text-white flex items-center justify-center mx-auto mb-6 shadow-md">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#122518] mb-4 tracking-tight">
            Ready to Build an Accountable City?
          </h2>
          <p className="text-xs sm:text-base text-[#466252] max-w-xl mx-auto mb-8 leading-relaxed">
            Report local grievances in seconds or supervise city-wide municipal resolution queues with high-speed autonomous intelligence.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/login?role=citizen"
              className="btn-primary text-xs px-8 py-4 rounded-xl shadow-md inline-flex items-center gap-2 font-bold"
            >
              Report a Civic Grievance
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login?role=admin"
              className="btn-secondary text-xs px-8 py-4 rounded-xl font-bold"
            >
              Enter Authority Console
            </Link>
          </div>
        </div>
      </section>

      {/* ── High-End Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-[#DDE7DC] bg-white py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#5A7363]">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#1C4830] to-[#2F6D49] flex items-center justify-center text-white text-xs font-black shadow-2xs">
              C
            </div>
            <span className="font-extrabold text-[#14261C] text-sm">Civora</span>
            <span className="text-[#92AFA0]">|</span>
            <span>Autonomous Civic Intelligence & Accountability Platform</span>
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <a href="#portal-selector" className="hover:text-[#183925] transition-colors">Portals</a>
            <a href="#interactive-cockpit" className="hover:text-[#183925] transition-colors">AI Studio</a>
            <a href="#how-it-works" className="hover:text-[#183925] transition-colors">Pipeline</a>
            <Link href="/login" className="hover:text-[#183925] transition-colors">Sign In</Link>
          </div>

          <div className="font-mono text-[11px] text-[#698473]">
            © 2026 Civora. Global Civic Hackathon Edition.
          </div>
        </div>
      </footer>

    </div>
  );
}
