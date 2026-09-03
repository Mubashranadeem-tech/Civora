'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const categories = [
  { name: 'Infrastructure', icon: '🏗️', desc: 'Roads, bridges, buildings', color: 'from-orange-500/20 to-orange-500/5' },
  { name: 'Utilities', icon: '⚡', desc: 'Electricity, water, gas', color: 'from-yellow-500/20 to-yellow-500/5' },
  { name: 'Sanitation', icon: '🌿', desc: 'Waste, pollution, parks', color: 'from-green-500/20 to-green-500/5' },
  { name: 'Education', icon: '📚', desc: 'Schools, colleges, facilities', color: 'from-purple-500/20 to-purple-500/5' },
  { name: 'Healthcare', icon: '🏥', desc: 'Hospitals, clinics, emergency', color: 'from-red-500/20 to-red-500/5' },
  { name: 'Transportation', icon: '🚗', desc: 'Traffic, roads, signals', color: 'from-cyan-500/20 to-cyan-500/5' },
  { name: 'Public Safety', icon: '🛡️', desc: 'Hazards, manholes, safety', color: 'from-rose-500/20 to-rose-500/5' },
  { name: 'Community', icon: '👥', desc: 'Municipal services, offices', color: 'from-pink-500/20 to-pink-500/5' },
];

const stats = [
  { label: 'Problems Reported', value: '12,847', icon: '📋' },
  { label: 'Issues Verified', value: '9,234', icon: '✅' },
  { label: 'Resolved', value: '7,891', icon: '🎯' },
  { label: 'Cities Covered', value: '145', icon: '🏙️' },
];

const steps = [
  {
    step: '01',
    title: 'Report',
    desc: 'Citizens submit civic problems with photos, documents, and location data.',
    icon: '📸',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    bgColor: 'bg-blue-500/10',
  },
  {
    step: '02',
    title: 'Verify',
    desc: 'AI analyzes evidence and assesses priority. Admin confirms or adjusts.',
    icon: '🤖',
    color: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    bgColor: 'bg-purple-500/10',
  },
  {
    step: '03',
    title: 'Research',
    desc: 'AI researches the issue, finds causes, impact, and responsible authorities.',
    icon: '🔬',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    bgColor: 'bg-cyan-500/10',
  },
  {
    step: '04',
    title: 'Resolve',
    desc: 'Admin approves the civic report and publishes it across platforms.',
    icon: '🚀',
    color: 'text-green-400',
    borderColor: 'border-green-500/30',
    bgColor: 'bg-green-500/10',
  },
];

function Counter({ end, duration = 2000 }: { end: string; duration?: number }) {
  const [current, setCurrent] = useState('0');

  useEffect(() => {
    const numericEnd = parseInt(end.replace(/,/g, ''));
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * numericEnd);
      setCurrent(current.toLocaleString());
      if (progress >= 1) clearInterval(timer);
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{current}</span>;
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      if (window.scrollY > 400) setStatsVisible(true);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#080d14] text-white overflow-x-hidden">
      {/* ── Navbar ───────────────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass border-b border-white/5 py-3' : 'py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-sm font-bold">
              C
            </div>
            <span className="text-xl font-bold tracking-tight">
              Civ<span className="gradient-text">ora</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#categories" className="hover:text-white transition-colors">Categories</a>
            <a href="#ai" className="hover:text-white transition-colors">AI Intelligence</a>
            <a href="#impact" className="hover:text-white transition-colors">Impact</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary text-sm px-5 py-2 rounded-lg">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="hero-gradient min-h-screen flex items-center relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-700/10 blur-3xl pointer-events-none" />

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-cyan-400/20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-cyan-500/20 text-xs text-cyan-400 mb-8 font-medium">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Powered by AI — Built for Alibaba Cloud Hackathon 2026
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Report.{' '}
            <span className="gradient-text">Verify.</span>
            <br />
            Research.{' '}
            <span className="gradient-text">Resolve.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-4 leading-relaxed">
            Turn community problems into verified, actionable civic intelligence
            with the power of AI.
          </p>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto mb-12">
            Civora empowers citizens to report real-world civic problems — from broken roads to healthcare failures —
            and uses AI to verify, research, and drive resolution through the right channels.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #0d4a7a 0%, #0ea5c9 100%)',
                boxShadow: '0 4px 30px rgba(14, 165, 201, 0.3)',
              }}
            >
              <span className="text-xl">👤</span>
              Continue as Citizen
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>

            <Link
              href="/admin"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-base glass border border-white/10 hover:border-white/20 transition-all duration-200"
            >
              <span className="text-xl">⚙️</span>
              Admin Dashboard
            </Link>
          </div>

          {/* Live Stats preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="glass-card p-4 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-xl font-bold gradient-text">{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600 text-xs animate-bounce">
          <span>Scroll to explore</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 10.7L1.6 4.3 0.3 5.7l7.7 7.7 7.7-7.7-1.3-1.4z" />
          </svg>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
            The Civora Process
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            How Civora <span className="gradient-text">Works</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A complete end-to-end pipeline from citizen report to public resolution.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

          {steps.map((step, i) => (
            <div
              key={i}
              className={`glass-card p-6 text-center animate-fade-in`}
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className={`w-16 h-16 ${step.bgColor} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 relative`}>
                {step.icon}
                <span className={`absolute -top-1 -right-1 text-xs font-mono font-bold ${step.color}`}>
                  {step.step}
                </span>
              </div>
              <h3 className={`text-lg font-bold mb-2 ${step.color}`}>{step.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Problem Categories ────────────────────────────────────────────────── */}
      <section id="categories" className="py-24 bg-gradient-to-b from-transparent to-[#0a1017]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-4">
              Civic Domains
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              What Can You <span className="gradient-text-gold">Report?</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Civora covers all major civic problem domains with specialized AI analysis for each.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <div
                key={i}
                className={`glass-card p-6 cursor-pointer group animate-fade-in`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  {cat.icon}
                </div>
                <h3 className="font-semibold mb-1 text-sm text-white group-hover:text-cyan-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-500">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Intelligence ───────────────────────────────────────────────────── */}
      <section id="ai" className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-6">
              🤖 AI Intelligence Layer
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              AI That Actually{' '}
              <span className="gradient-text">Understands</span>{' '}
              Civic Problems
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Civora's AI doesn't just label problems — it deeply analyzes them, researches their
              impact, finds responsible authorities, and generates professional civic reports ready
              for public communication.
            </p>

            <div className="space-y-4">
              {[
                { icon: '🎯', title: 'Evidence Analysis', desc: 'Analyzes photos, documents, and text to assess problem validity and severity' },
                { icon: '📊', title: 'Priority Assessment', desc: 'AI recommends priority (Low to Critical) based on impact analysis' },
                { icon: '🔍', title: 'Duplicate Detection', desc: 'Identifies when multiple citizens report the same issue' },
                { icon: '📰', title: 'Research & Reports', desc: 'Generates complete civic intelligence reports with sources' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 glass-card">
                  <div className="text-2xl flex-shrink-0">{item.icon}</div>
                  <div>
                    <h4 className="font-semibold text-sm text-white mb-1">{item.title}</h4>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Visualization Card */}
          <div className="relative">
            <div className="glass-card p-6 animate-pulse-glow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-xl">🤖</div>
                <div>
                  <div className="font-semibold text-sm">Civora AI Engine</div>
                  <div className="text-xs text-purple-400">Analyzing Problem...</div>
                </div>
                <div className="ml-auto flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Evidence Quality', value: 87, color: 'bg-green-500' },
                  { label: 'Confidence Score', value: 92, color: 'bg-cyan-500' },
                  { label: 'Priority Match', value: 78, color: 'bg-orange-500' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">{item.label}</span>
                      <span className="text-white font-medium">{item.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="text-xs text-green-400 font-semibold mb-1">✅ AI Recommendation</div>
                <div className="text-xs text-gray-300">
                  Problem verified as HIGH priority. Recommend escalation to Municipal Infrastructure Department.
                  Evidence is clear and actionable.
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="text-xs text-blue-400 font-semibold mb-1">🔍 Research Status</div>
                <div className="flex gap-2 flex-wrap">
                  {['Background ✓', 'Impact ✓', 'Authority ✓', 'Solutions ✓'].map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Impact Stats ──────────────────────────────────────────────────────── */}
      <section id="impact" className="py-24 bg-gradient-to-b from-[#0a1017] to-[#080d14]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium mb-6">
            📊 Real Impact
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Civic Intelligence at <span className="gradient-text">Scale</span>
          </h2>
          <p className="text-gray-400 mb-16 max-w-2xl mx-auto">
            Every problem reported strengthens communities. Every resolved issue builds trust.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '12,847', label: 'Problems Reported', icon: '📋', color: 'text-blue-400' },
              { value: '9,234', label: 'Issues Verified', icon: '✅', color: 'text-green-400' },
              { value: '7,891', label: 'Resolved', icon: '🎯', color: 'text-cyan-400' },
              { value: '145', label: 'Cities Covered', icon: '🏙️', color: 'text-purple-400' },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-8 text-center">
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className={`text-3xl md:text-4xl font-bold ${stat.color} mb-2`}>
                  {statsVisible ? <Counter end={stat.value} /> : '0'}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────────────────────────────── */}
      <section className="py-24 max-w-5xl mx-auto px-6 text-center">
        <div className="glass-card p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-700/5" />
          <div className="relative z-10">
            <div className="text-5xl mb-6">🏙️</div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Your City. Your Voice.
              <br />
              <span className="gradient-text">Your Impact.</span>
            </h2>
            <p className="text-gray-400 mb-10 max-w-2xl mx-auto text-lg">
              Join thousands of citizens who are making their communities better, one report at a time.
              AI-powered. Professionally managed. Publicly accountable.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="group inline-flex items-center gap-3 px-10 py-4 rounded-xl font-bold text-base transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #0d4a7a 0%, #0ea5c9 100%)',
                  boxShadow: '0 4px 30px rgba(14, 165, 201, 0.3)',
                }}
              >
                Start Reporting
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                href="/dashboard/track"
                className="inline-flex items-center gap-3 px-10 py-4 rounded-xl font-semibold text-base glass border border-white/10 hover:border-white/20 transition-all"
              >
                Track a Problem
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-sm font-bold">
                  C
                </div>
                <span className="font-bold">Civ<span className="gradient-text">ora</span></span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                AI-powered civic intelligence platform transforming how communities report and resolve problems.
              </p>
            </div>

            {[
              {
                title: 'Platform',
                links: ['Submit Problem', 'Track Problem', 'My Reports', 'Notifications'],
              },
              {
                title: 'Admin',
                links: ['Dashboard', 'Problem Queue', 'AI Pipeline', 'Publishing'],
              },
              {
                title: 'Legal',
                links: ['Privacy Policy', 'Terms of Service', 'Data Policy', 'Contact'],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-sm mb-3 text-white">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
            <div>© 2026 Civora. Built for Alibaba Cloud Hackathon.</div>
            <div className="flex items-center gap-2">
              <span>Powered by</span>
              <span className="text-orange-400 font-semibold">☁️ Alibaba Cloud</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
