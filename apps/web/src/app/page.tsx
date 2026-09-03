'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Paperclip,
  TrendingUp,
  Cpu
} from 'lucide-react';

const categories = [
  { name: 'Infrastructure', icon: Building2, desc: 'Roads, bridges, streetlights & drainage' },
  { name: 'Utilities', icon: Zap, desc: 'Power cuts, water shortage & gas lines' },
  { name: 'Sanitation', icon: TreePine, desc: 'Waste management, parks & cleanliness' },
  { name: 'Education', icon: GraduationCap, desc: 'Fee violations, school facilities & admissions' },
  { name: 'Healthcare', icon: Hospital, desc: 'Hospitals, dispensaries & emergency response' },
  { name: 'Transportation', icon: Car, desc: 'Traffic flow, public transit & road hazards' },
  { name: 'Public Safety', icon: ShieldAlert, desc: 'Open manholes, street safety & hazards' },
  { name: 'Municipal', icon: Landmark, desc: 'District administration & citizen services' },
];

const stats = [
  { label: 'Problems Verified', value: '14,820', icon: CheckCircle2 },
  { label: 'Avg AI Verification', value: '3.2s', icon: Activity },
  { label: 'Resolution Rate', value: '88.4%', icon: Target },
  { label: 'Active Municipalities', value: '48', icon: Building },
];

const steps = [
  {
    step: '01',
    title: 'Citizen Report',
    desc: 'Citizens document real-world issues with GPS coordinates, photos, and evidence.',
    icon: FileText,
    badge: 'Step 1',
  },
  {
    step: '02',
    title: 'AI Verification',
    desc: 'AI assesses evidence quality, validates severity, and flags potential duplicates.',
    icon: BrainCircuit,
    badge: 'Step 2',
  },
  {
    step: '03',
    title: 'Deep Civic Research',
    desc: 'Autonomous research maps responsible authorities, local precedents, and solutions.',
    icon: Search,
    badge: 'Step 3',
  },
  {
    step: '04',
    title: 'Public Resolution',
    desc: 'Approved civic reports are published to official channels & social media for accountability.',
    icon: Send,
    badge: 'Step 4',
  },
];

function Counter({ end, duration = 2000 }: { end: string; duration?: number }) {
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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
      if (window.scrollY > 350) setStatsVisible(true);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackCivId.trim()) return;
    router.push(`/dashboard/track?id=${encodeURIComponent(trackCivId.trim())}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-[#16251D] selection:bg-[#2E6845] selection:text-white overflow-x-hidden">
      {/* ── Navbar ───────────────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass border-b border-[#E2EAE1] py-3 shadow-xs' : 'py-5 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1C4830] to-[#2F6D49] flex items-center justify-center text-white text-base font-bold shadow-sm">
              C
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#16281E]">
                Civ<span className="gradient-text">ora</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-[#EBF4EC] text-[#245B3A] border border-[#D5E8D8]">
                Civic Intelligence
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-[#4D6355]">
            <a href="#portal-selector" className="hover:text-[#183925] transition-colors">Portals</a>
            <a href="#how-it-works" className="hover:text-[#183925] transition-colors">How It Works</a>
            <a href="#categories" className="hover:text-[#183925] transition-colors">Categories</a>
            <a href="#ai-intelligence" className="hover:text-[#183925] transition-colors">AI Engine</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-bold text-[#324B3B] hover:text-[#152B1E] px-4 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="btn-primary text-xs px-5 py-2.5 rounded-xl shadow-xs"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ─────────────────────────────────────────────────────── */}
      <section className="hero-gradient pt-32 pb-20 relative overflow-hidden border-b border-[#E5EDE4]">
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-[#E2EFE0]/60 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-[#E9F4E7]/70 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-[#D4E3D3] shadow-xs text-xs font-semibold text-[#255C3B] mb-8 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-[#2F7349]" />
            <span>AI-Driven Civic Accountability Platform</span>
            <span className="text-[#9DB3A3]">|</span>
            <span className="text-[#516C5B]">2026 Edition</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#132219] mb-6 leading-[1.12]">
            Transform Citizen Reports into{' '}
            <br className="hidden sm:inline" />
            <span className="gradient-text">Verified Civic Action.</span>
          </h1>

          <p className="text-lg md:text-xl text-[#4A6153] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Civora bridges the gap between community grievances and public authorities using autonomous AI verification, in-depth root-cause research, and automated public publishing.
          </p>

          {/* Quick Track Search Box */}
          <div className="max-w-xl mx-auto mb-14">
            <form onSubmit={handleTrack} className="flex items-center gap-2 p-2 bg-white rounded-2xl border border-[#D3E2D2] shadow-md focus-within:border-[#2D6946] focus-within:ring-3 focus-within:ring-[#2D6946]/10 transition-all">
              <Search className="w-5 h-5 text-[#658171] ml-3 flex-shrink-0" />
              <input
                type="text"
                value={trackCivId}
                onChange={(e) => setTrackCivId(e.target.value)}
                placeholder="Track by Ticket ID (e.g. CIV-2026-000004)..."
                className="w-full bg-transparent border-none text-xs font-semibold text-[#14261C] placeholder-[#8EA394] focus:outline-none px-2"
              />
              <button type="submit" className="btn-primary text-xs px-5 py-2.5 rounded-xl whitespace-nowrap shadow-xs">
                Track Status
              </button>
            </form>
          </div>

          {/* ── Portal Selector (The Split Cards) ─────────────────────────────── */}
          <div id="portal-selector" className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left mb-16">
            {/* Citizen Portal Card */}
            <div className="glass-card-elevated p-8 relative overflow-hidden group hover:border-[#ADC7B0] transition-all">
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-[#EBF5EA] to-transparent rounded-bl-full pointer-events-none" />
              <div className="w-12 h-12 rounded-2xl bg-[#E8F4E7] border border-[#CDE3CB] flex items-center justify-center text-[#245D3B] mb-5">
                <User className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2D6B47]">For Community & Residents</span>
              </div>
              <h3 className="text-2xl font-bold text-[#14261C] mb-2">Citizen Portal</h3>
              <p className="text-sm text-[#52695C] leading-relaxed mb-6">
                Submit problems with photo evidence and GPS location. Receive automatic AI tracking, live progress updates, and resolution alerts.
              </p>
              <div className="flex flex-wrap gap-3 items-center pt-2">
                <Link
                  href="/login?role=citizen"
                  className="btn-primary text-xs px-6 py-3 rounded-xl inline-flex items-center gap-1.5 shadow-xs"
                >
                  Submit / Track Problem
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/register"
                  className="btn-secondary text-xs px-5 py-3 rounded-xl"
                >
                  Create Account
                </Link>
              </div>
            </div>

            {/* Admin Command Console Card */}
            <div className="glass-card-elevated p-8 relative overflow-hidden group hover:border-[#96B89B] transition-all bg-gradient-to-br from-white to-[#F6FAF5]">
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-[#DCEBD9] to-transparent rounded-bl-full pointer-events-none" />
              <div className="w-12 h-12 rounded-2xl bg-[#1C472F] text-white flex items-center justify-center mb-5 shadow-xs">
                <Shield className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1F5434]">For Authorities & Reviewers</span>
              </div>
              <h3 className="text-2xl font-bold text-[#14261C] mb-2">Admin Command Console</h3>
              <p className="text-sm text-[#52695C] leading-relaxed mb-6">
                Full triage queue, multi-stage AI analysis verification, Deep Research generation, and automated multi-channel WordPress & social publishing.
              </p>
              <div className="flex flex-wrap gap-3 items-center pt-2">
                <Link
                  href="/login?role=admin"
                  className="btn-primary text-xs px-6 py-3 rounded-xl bg-gradient-to-r from-[#173D27] to-[#255D3A] shadow-xs"
                >
                  Open Admin Console
                </Link>
                <Link
                  href="/admin/problems"
                  className="btn-secondary text-xs px-5 py-3 rounded-xl"
                >
                  View Live Queue
                </Link>
              </div>
            </div>
          </div>

          {/* Key Metric Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="glass-card p-5 text-center">
                  <div className="w-10 h-10 rounded-xl bg-[#F0F6EE] border border-[#D9E7D8] flex items-center justify-center text-[#235837] mx-auto mb-2">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-extrabold text-[#193F2A]">
                    {statsVisible ? <Counter end={s.value} /> : s.value}
                  </div>
                  <div className="text-xs font-bold text-[#5E7567] mt-1">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EAF4E9] border border-[#D1E5CF] text-[#245D3A] text-xs font-bold uppercase tracking-wide mb-3">
            Autonomous Pipeline
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#132419] mb-4">
            How Civora <span className="gradient-text">Solves Civic Problems</span>
          </h2>
          <p className="text-[#516B5C] max-w-2xl mx-auto text-base">
            From citizen observation to official resolution in four synchronized steps.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="glass-card p-7 text-left relative group hover:border-[#A4C4A7] transition-all"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#EAF3E8] border border-[#CEE2CC] flex items-center justify-center text-[#245D3B]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#2A6644] bg-[#E8F4E6] px-2.5 py-1 rounded-full border border-[#D0E6CD]">
                    {step.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#14261C] mb-2">{step.title}</h3>
                <p className="text-xs text-[#546E5F] leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Problem Categories ────────────────────────────────────────────────── */}
      <section id="categories" className="py-24 bg-[#F2F6F1] border-y border-[#E2EAE0]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#D3E3D1] text-[#235837] text-xs font-bold uppercase tracking-wide mb-3 shadow-xs">
              Coverage Domains
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#132419] mb-4">
              What Can You <span className="gradient-text">Report?</span>
            </h2>
            <p className="text-[#516B5C] max-w-2xl mx-auto text-base">
              Civora supports all primary public domains with tailored AI evaluation parameters.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <div
                  key={i}
                  className="glass-card p-6 bg-white hover:border-[#9FC2A3] transition-all group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#F0F6EE] border border-[#D5E6D3] flex items-center justify-center text-[#235C3A] mb-4 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-[#15281D] group-hover:text-[#235C3A] transition-colors mb-1">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#5D7667] leading-relaxed">{cat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── AI Intelligence Showcase ──────────────────────────────────────────── */}
      <section id="ai-intelligence" className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EBF4EA] border border-[#CFE4CD] text-[#215735] text-xs font-bold uppercase tracking-wide mb-4">
              <Cpu className="w-3.5 h-3.5" />
              Dual-Stage AI Pipeline
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#132419] mb-6 leading-tight">
              Evidence-Based Civic Analysis,{' '}
              <span className="gradient-text">Powered by AI.</span>
            </h2>
            <p className="text-[#4E6758] mb-8 leading-relaxed text-sm">
              Civora does not merely log tickets. It autonomously evaluates evidence authenticity, validates severity, detects duplicates, researches regional precedents, and formats complete civic intelligence dossiers ready for publication.
            </p>

            <div className="space-y-3.5">
              {[
                { icon: CheckCircle2, title: 'Evidence & Severity Analysis', desc: 'Validates file evidence, calculates confidence scores, and prevents duplicate submissions.' },
                { icon: Search, title: 'Deep Civic Research', desc: 'Queries background statistics, cites precedents, and identifies exact accountable government bodies.' },
                { icon: FileText, title: 'Civic Intelligence Reports', desc: 'Synthesizes executive summaries, why-it-matters statements, and auto-generated social copy.' },
                { icon: Send, title: 'Multi-Channel Publishing', desc: 'Direct 1-click publishing to WordPress portals, social channels, and webhooks.' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white border border-[#E0E9DF] shadow-xs">
                    <div className="w-9 h-9 rounded-lg bg-[#F0F6EE] border border-[#D5E3D3] flex items-center justify-center text-[#245D3B] flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#14261C] mb-1">{item.title}</h4>
                      <p className="text-xs text-[#597163] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Visual Card */}
          <div className="glass-card-elevated p-8 bg-white border border-[#D5E3D3]">
            <div className="flex items-center justify-between pb-6 border-b border-[#EAF0E8] mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EAF4E8] text-[#245D3B] flex items-center justify-center font-bold">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#14261C]">Civora AI Engine</div>
                  <div className="text-[11px] text-[#307049] font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#358354] animate-pulse" />
                    Operational · Groq Ultra-Fast Inference
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[#EBF5EA] text-[#1E5632] border border-[#CEE3CD]">
                CIV-2026-000004
              </span>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-[#4E6657]">Evidence Quality & Verification</span>
                  <span className="text-[#1A452C] font-mono font-bold">92%</span>
                </div>
                <div className="h-2 rounded-full bg-[#EAEFE8] overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#2F6B47] to-[#459062] rounded-full w-[92%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-[#4E6657]">Severity & Community Impact</span>
                  <span className="text-[#C25008] font-mono font-bold">HIGH SEVERITY</span>
                </div>
                <div className="h-2 rounded-full bg-[#EAEFE8] overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#DF7631] to-[#C25008] rounded-full w-[80%]" />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F4F9F2] border border-[#D5E7D3] text-xs text-[#2A4936] leading-relaxed mb-4">
              <span className="font-bold text-[#1A452C]">Executive Summary: </span>
              High institutional fee surcharge reported without transparent schedule breakdown. Recommended escalation to Capital Territory Higher Education Authority.
            </div>

            <div className="flex items-center justify-between text-xs text-[#5D7666] pt-2">
              <span>Verified Sources: 4 Citations</span>
              <span className="font-bold text-[#255C3A]">Status: Ready for Publishing</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Call to Action ───────────────────────────────────────────────────── */}
      <section className="py-20 max-w-5xl mx-auto px-6 text-center">
        <div className="glass-card-elevated p-12 sm:p-16 relative overflow-hidden bg-gradient-to-br from-[#F5FAF3] to-[#E9F3E7] border border-[#CADDC7]">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#132419] mb-4">
            Build Stronger, Accountable Communities.
          </h2>
          <p className="text-[#4D6757] max-w-xl mx-auto text-sm mb-8 leading-relaxed">
            Report civic issues in under 2 minutes or monitor live city queues with administrative precision.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/login?role=citizen"
              className="btn-primary text-xs px-8 py-3.5 rounded-xl shadow-md inline-flex items-center gap-1.5"
            >
              Report a Civic Problem
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/login?role=admin"
              className="btn-secondary text-xs px-8 py-3.5 rounded-xl"
            >
              Admin Console Access
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#DFE7DD] bg-white py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5E7566]">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#1D4A31] flex items-center justify-center text-white text-xs font-bold">
              C
            </div>
            <span className="font-bold text-[#14261C] text-sm">Civora</span>
            <span>— AI-Driven Civic Intelligence Platform</span>
          </div>
          <div>
            © 2026 Civora. Powered by Autonomous LLM Intelligence.
          </div>
        </div>
      </footer>
    </div>
  );
}
