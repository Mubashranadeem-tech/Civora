'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  Building2, Zap, TreePine, GraduationCap, Hospital, Car, ShieldAlert, Landmark,
  FileText, UploadCloud, Check, ArrowRight, ArrowLeft, CheckCircle2, Paperclip,
  MapPin, CreditCard, AlertTriangle, ChevronRight, X, Shield, Send, Activity,
} from 'lucide-react';

const STEPS = [
  { label: 'Category', desc: 'Choose civic domain' },
  { label: 'Sub-Type', desc: 'Specify problem type' },
  { label: 'Describe', desc: 'Detail the issue' },
  { label: 'Evidence', desc: 'Upload proof' },
  { label: 'Location', desc: 'Pinpoint area' },
  { label: 'Review', desc: 'Confirm & submit' },
];

const CATEGORY_META: Record<string, { icon: any; color: string; bg: string; glow: string }> = {
  infrastructure:       { icon: Building2,   color: '#1C4830', bg: 'linear-gradient(135deg,#EAF5E9,#D6EDD4)', glow: 'rgba(28,72,48,0.18)'   },
  utilities:            { icon: Zap,          color: '#7A4A00', bg: 'linear-gradient(135deg,#FFF8E6,#FDEDC7)', glow: 'rgba(200,130,0,0.18)'  },
  sanitation:           { icon: TreePine,     color: '#165E3A', bg: 'linear-gradient(135deg,#E9F7EE,#D1EEDD)', glow: 'rgba(22,94,58,0.18)'   },
  education:            { icon: GraduationCap,color: '#2A3F8F', bg: 'linear-gradient(135deg,#EEF2FF,#DBEAFE)', glow: 'rgba(42,63,143,0.18)'  },
  healthcare:           { icon: Hospital,     color: '#8B1A1A', bg: 'linear-gradient(135deg,#FFF1F1,#FFE0E0)', glow: 'rgba(139,26,26,0.18)'  },
  transportation:       { icon: Car,          color: '#3D2C8A', bg: 'linear-gradient(135deg,#F3F0FF,#E5DBFF)', glow: 'rgba(61,44,138,0.18)'  },
  'public-safety':      { icon: ShieldAlert,  color: '#8A3500', bg: 'linear-gradient(135deg,#FFF4EE,#FFE4D1)', glow: 'rgba(138,53,0,0.18)'   },
  'community-services': { icon: Landmark,     color: '#005F5F', bg: 'linear-gradient(135deg,#E6F7F7,#CCEEEE)', glow: 'rgba(0,95,95,0.18)'    },
};

function getCategoryMeta(slug: string) {
  return CATEGORY_META[slug] || { icon: FileText, color: '#3D4F45', bg: 'linear-gradient(135deg,#F3F6F2,#E6EBE4)', glow: 'rgba(61,79,69,0.12)' };
}

const PRIORITIES = [
  { value: 'low',      label: 'Low',      color: '#1E6E3B', bg: '#EAF6EE', border: '#CDECD6' },
  { value: 'medium',   label: 'Medium',   color: '#A86518', bg: '#FEF6E8', border: '#FCE5BE' },
  { value: 'high',     label: 'High',     color: '#C25008', bg: '#FFF1E6', border: '#FCD7BE' },
  { value: 'critical', label: 'Critical', color: '#C52222', bg: '#FDE8E8', border: '#F8B4B4' },
];

/* ── Step Indicator ──────────────────────────────────────────────────────── */
function StepIndicator({ current }: { current: number }) {
  return (
    <div style={{ position: 'relative', marginBottom: 40 }}>
      <div style={{ position: 'absolute', top: 18, left: '4%', right: '4%', height: 2, background: '#E2EBE0', borderRadius: 2 }} />
      <div style={{ position: 'absolute', top: 18, left: '4%', width: `${(current / (STEPS.length - 1)) * 92}%`, height: 2, background: 'linear-gradient(90deg,#1C4830,#2A6443)', borderRadius: 2, transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
        {STEPS.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                background: done || active ? 'linear-gradient(135deg,#1C4830,#2A6443)' : '#FFFFFF',
                color: done || active ? '#FFF' : '#8C9F92',
                border: active || done ? '2px solid #1C4830' : '2px solid #D6E2D5',
                boxShadow: active ? '0 0 0 4px rgba(28,72,48,0.12),0 4px 12px rgba(28,72,48,0.2)' : done ? '0 2px 6px rgba(28,72,48,0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
                transform: active ? 'scale(1.12)' : 'scale(1)',
              }}>
                {done ? <Check style={{ width: 14, height: 14 }} /> : i + 1}
              </div>
              <div style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? '#1C4830' : done ? '#2A6443' : '#8C9F92', lineHeight: 1.2, transition: 'color 0.3s', textAlign: 'center' }}
                className="hidden sm:block">{s.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Success Screen ───────────────────────────────────────────────────────── */
function SuccessScreen({ civId, onTrack, onMyProblems }: { civId: string; onTrack: () => void; onMyProblems: () => void }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 80); return () => clearTimeout(t); }, []);
  return (
    <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center', padding: '32px 0', opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)' }}>
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 28 }}>
        <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg,#1C4830,#2A6443)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', boxShadow: '0 0 0 12px rgba(28,72,48,0.08),0 0 0 24px rgba(28,72,48,0.04)' }}>
          <CheckCircle2 style={{ width: 44, height: 44, color: '#fff' }} />
        </div>
        <div style={{ position: 'absolute', top: -6, right: -6, width: 28, height: 28, borderRadius: '50%', background: '#EAF5EC', border: '2px solid #CCE5D0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Check style={{ width: 13, height: 13, color: '#1C4830' }} />
        </div>
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#132219', marginBottom: 8, letterSpacing: '-0.5px' }}>Report Submitted!</h1>
      <p style={{ fontSize: 13, color: '#58695F', marginBottom: 28, lineHeight: 1.6 }}>
        Your complaint is now in the AI verification pipeline and will be escalated to the relevant authority.
      </p>
      <div style={{ background: 'linear-gradient(135deg,#EBF5EA,#DDF0DB)', border: '1px solid #CDECD6', borderRadius: 16, padding: '20px 24px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '40%', background: 'radial-gradient(circle at 100% 50%,rgba(28,72,48,0.06),transparent)', pointerEvents: 'none' }} />
        <div style={{ fontSize: 10, fontWeight: 700, color: '#557161', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Your Tracking ID</div>
        <div style={{ fontSize: 28, fontFamily: 'monospace', fontWeight: 800, color: '#1C4830', letterSpacing: 2 }}>{civId}</div>
        <div style={{ fontSize: 11, color: '#6B8572', marginTop: 6 }}>Save this ID to monitor resolution progress</div>
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={onTrack} className="btn-primary" style={{ fontSize: 13, padding: '12px 28px', borderRadius: 14 }}>
          <ArrowRight className="w-4 h-4" /> Track Live Status
        </button>
        <button onClick={onMyProblems} className="btn-secondary" style={{ fontSize: 13, padding: '12px 28px', borderRadius: 14 }}>
          View My Reports
        </button>
      </div>
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────────────────── */
export default function SubmitProblemPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [animDir, setAnimDir] = useState<'fwd' | 'bwd'>('fwd');
  const [visible, setVisible] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ civId: string } | null>(null);
  const [error, setError] = useState('');
  const [declared, setDeclared] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    categoryId: '', typeId: '', title: '', description: '',
    city: '', area: '', address: '', cnic: '', userPriority: 'medium',
  });
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<any>(null);

  useEffect(() => { api.getCategories().then((d: any) => setCategories(Array.isArray(d) ? d : [])); }, []);
  useEffect(() => {
    if (form.categoryId) api.getCategoryTypes(form.categoryId).then((d: any) => setTypes(Array.isArray(d) ? d : []));
  }, [form.categoryId]);

  const goStep = (next: number) => {
    setAnimDir(next > step ? 'fwd' : 'bwd');
    setVisible(false);
    setTimeout(() => { setStep(next); setError(''); setVisible(true); }, 220);
  };

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const valid: File[] = [];
    Array.from(newFiles).forEach((f) => {
      if (f.size > 10 * 1024 * 1024) { setError(`"${f.name}" exceeds 10MB`); return; }
      valid.push(f);
    });
    const combined = [...files, ...valid].slice(0, 10);
    setFiles(combined);
    combined.forEach((file, i) => {
      if (!previews[i] && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreviews((prev) => { const u = [...prev]; u[i] = e.target?.result as string; return u; });
        reader.readAsDataURL(file);
      }
    });
  }, [files, previews]);

  const removeFile = (i: number) => {
    setFiles(files.filter((_, idx) => idx !== i));
    setPreviews(previews.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    if (!form.categoryId || !form.typeId || !form.title || !form.city) { setError('Please complete all required fields.'); return; }
    if (!declared) { setError('Please confirm the declaration before submitting.'); return; }
    setSubmitting(true); setError('');
    try {
      const fd = new FormData();
      fd.append('categoryId', form.categoryId); fd.append('typeId', form.typeId);
      fd.append('title', form.title);
      if (form.description) fd.append('description', form.description);
      fd.append('userPriority', form.userPriority); fd.append('city', form.city);
      if (form.area) fd.append('area', form.area);
      if (form.address) fd.append('address', form.address);
      if (form.cnic) fd.append('cnic', form.cnic);
      files.forEach((f) => fd.append('files', f));
      const result = await api.createProblem(fd) as any;
      setSubmitted({ civId: result.civId });
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  const isCityValid = /^[a-zA-Z\s.-]{2,50}$/.test(form.city.trim());
  const cnicDigits = (form.cnic || '').replace(/\D/g, '');
  const isCnicValid = cnicDigits.length === 0 || cnicDigits.length === 13;
  const canProceed = [
    () => !!form.categoryId,
    () => !!form.typeId,
    () => form.title.trim().length >= 5,
    () => true,
    () => isCityValid && isCnicValid,
    () => true,
  ][step]?.();

  if (submitted) {
    return (
      <SuccessScreen
        civId={submitted.civId}
        onTrack={() => router.push(`/dashboard/track?id=${submitted.civId}`)}
        onMyProblems={() => router.push('/dashboard/my-problems')}
      />
    );
  }

  const slide: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateX(0)' : animDir === 'fwd' ? 'translateX(-26px)' : 'translateX(26px)',
    transition: 'opacity 0.22s ease,transform 0.22s ease',
  };

  const STEP_TITLES = ['Select Civic Domain', 'Select Specific Sub-Type', 'Describe the Issue', 'Upload Evidence', 'Location & Identity', 'Review & Submit'];

  return (
    <div style={{ maxWidth: 740, margin: '0 auto' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .cat-card:hover:not(.active) { transform: translateY(-2px) scale(1.01) !important; box-shadow: 0 8px 24px rgba(28,72,48,0.10) !important; border-color: #ADC5AF !important; }
        .type-btn:hover:not(.active)  { transform: translateY(-1px) !important; box-shadow: 0 4px 12px rgba(28,72,48,0.08) !important; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg,#1C4830,#2A6443)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(28,72,48,0.22)', flexShrink: 0 }}>
            <FileText style={{ width: 17, height: 17, color: '#fff' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 21, fontWeight: 800, color: '#132219', letterSpacing: '-0.4px', lineHeight: 1 }}>Report a Community Problem</h1>
            <p style={{ fontSize: 12, color: '#58695F', marginTop: 3 }}>Powered by AI verification &amp; municipal escalation</p>
          </div>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: '#EAF5EC', border: '1px solid #CCE5D0', fontSize: 11, fontWeight: 600, color: '#1C4830' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#1C4830' }} />
          Autonomous Triage &amp; Verification Active
        </div>
      </div>

      <StepIndicator current={step} />

      {/* Card */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E1ECE2', borderRadius: 24, boxShadow: '0 4px 32px -4px rgba(20,48,30,0.07),0 1px 4px rgba(0,0,0,0.02)', overflow: 'hidden', minHeight: 360 }}>
        {/* Progress stripe */}
        <div style={{ height: 4, background: `linear-gradient(90deg,#1C4830 0%,#2A6443 ${((step+1)/STEPS.length)*100}%,#E2EBE0 ${((step+1)/STEPS.length)*100}%,#E2EBE0 100%)`, transition: 'background 0.5s ease' }} />

        <div style={{ padding: '28px 32px 24px' }}>
          {/* Step label */}
          <div style={{ marginBottom: 22, ...slide }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#2A6443', textTransform: 'uppercase' as any, letterSpacing: 1.5, background: '#EAF5E9', border: '1px solid #CDECD6', padding: '2px 9px', borderRadius: 20 }}>
                Step {step + 1} of {STEPS.length}
              </span>
              <span style={{ fontSize: 10, color: '#8C9F92' }}>— {STEPS[step].desc}</span>
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#132219', letterSpacing: '-0.3px' }}>{STEP_TITLES[step]}</h2>
          </div>

          {/* STEP 0 — Category */}
          {step === 0 && (
            <div style={slide}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(175px,1fr))', gap: 12 }}>
                {categories.map((cat) => {
                  const meta = getCategoryMeta(cat.slug);
                  const Icon = meta.icon;
                  const active = form.categoryId === cat.id;
                  return (
                    <button key={cat.id}
                      className={`cat-card${active ? ' active' : ''}`}
                      onClick={() => { setForm({ ...form, categoryId: cat.id, typeId: '' }); setSelectedCategory(cat); setSelectedType(null); }}
                      style={{ padding: '17px 15px', borderRadius: 16, textAlign: 'left', border: active ? `2px solid ${meta.color}` : '1.5px solid #E1ECE2', background: active ? meta.bg : '#FAFDF9', cursor: 'pointer', transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)', boxShadow: active ? `0 0 0 3px ${meta.glow},0 6px 20px ${meta.glow}` : '0 1px 3px rgba(0,0,0,0.03)', transform: active ? 'translateY(-2px) scale(1.01)' : 'none', position: 'relative', overflow: 'hidden' }}>
                      {active && (
                        <div style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%', background: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check style={{ width: 10, height: 10, color: '#fff' }} />
                        </div>
                      )}
                      <div style={{ width: 42, height: 42, borderRadius: 11, background: active ? '#fff' : '#F0F5EF', border: `1.5px solid ${active ? meta.color + '40' : '#E1ECE2'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, transition: 'all 0.2s', boxShadow: active ? `0 4px 12px ${meta.glow}` : 'none' }}>
                        <Icon style={{ width: 19, height: 19, color: active ? meta.color : '#6B8572' }} />
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: active ? meta.color : '#17261D', marginBottom: 3, lineHeight: 1.2 }}>{cat.name}</div>
                      <div style={{ fontSize: 10, color: active ? meta.color + 'CC' : '#7A9384', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{cat.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 1 — Sub-Type */}
          {step === 1 && (
            <div style={slide}>
              {selectedCategory && (() => {
                const m = getCategoryMeta(selectedCategory.slug);
                const Icon = m.icon;
                return (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 13px', borderRadius: 20, background: m.bg, border: `1px solid ${m.color}30`, marginBottom: 18 }}>
                    <Icon style={{ width: 13, height: 13, color: m.color }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: m.color }}>{selectedCategory.name}</span>
                  </div>
                );
              })()}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 10 }}>
                {types.map((type) => {
                  const active = form.typeId === type.id;
                  return (
                    <button key={type.id}
                      className={`type-btn${active ? ' active' : ''}`}
                      onClick={() => { setForm({ ...form, typeId: type.id }); setSelectedType(type); }}
                      style={{ padding: '13px 15px', borderRadius: 13, textAlign: 'left', border: active ? '2px solid #1C4830' : '1.5px solid #E1ECE2', background: active ? 'linear-gradient(135deg,#EAF5E9,#D6EDD4)' : '#FAFDF9', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)', boxShadow: active ? '0 0 0 3px rgba(28,72,48,0.10),0 4px 14px rgba(28,72,48,0.12)' : '0 1px 3px rgba(0,0,0,0.03)', transform: active ? 'translateY(-1px)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: active ? '#1C4830' : '#17261D', flex: 1 }}>{type.name}</span>
                      {active
                        ? <Check style={{ width: 13, height: 13, color: '#1C4830', flexShrink: 0 }} />
                        : <ChevronRight style={{ width: 13, height: 13, color: '#A5B8AE', flexShrink: 0 }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2 — Describe */}
          {step === 2 && (
            <div style={{ ...slide, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#4E6857', textTransform: 'uppercase' as any, letterSpacing: 1.2, marginBottom: 8 }}>
                  Problem Title <span style={{ color: '#C52222' }}>*</span>
                </label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-civora" style={{ fontWeight: 600 }} placeholder="E.g., Severe water leakage flooding 42nd Street near municipal park" maxLength={255} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                  <div style={{ fontSize: 10, color: form.title.trim().length < 5 && form.title.length > 0 ? '#C52222' : '#8C9F92' }}>
                    {form.title.trim().length < 5 && form.title.length > 0 ? `${5 - form.title.trim().length} more character(s) needed` : 'Minimum 5 characters'}
                  </div>
                  <div style={{ fontSize: 10, color: '#8C9F92' }}>{form.title.length}/255</div>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#4E6857', textTransform: 'uppercase' as any, letterSpacing: 1.2, marginBottom: 8 }}>
                  Detailed Context &amp; Observations
                </label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-civora" style={{ resize: 'none', fontSize: 13, lineHeight: 1.6 }} rows={5} placeholder="Include details: How long has this issue existed? Who is impacted? Any previous complaints filed?" maxLength={5000} />
                <div style={{ textAlign: 'right', fontSize: 10, color: '#8C9F92', marginTop: 4 }}>{form.description.length}/5000</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#4E6857', textTransform: 'uppercase' as any, letterSpacing: 1.2, marginBottom: 8 }}>Perceived Urgency</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {PRIORITIES.map((p) => (
                    <button key={p.value} onClick={() => setForm({ ...form, userPriority: p.value })}
                      style={{ padding: '7px 16px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${form.userPriority === p.value ? p.border : '#E1ECE2'}`, background: form.userPriority === p.value ? p.bg : '#FAFDF9', color: form.userPriority === p.value ? p.color : '#8C9F92', transition: 'all 0.18s ease', transform: form.userPriority === p.value ? 'scale(1.05)' : 'scale(1)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {form.userPriority === p.value && <Check style={{ width: 10, height: 10 }} />}
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — Evidence */}
          {step === 3 && (
            <div style={slide}>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}
                style={{ border: `2px dashed ${dragOver ? '#2A6443' : '#C8D8C7'}`, borderRadius: 18, padding: '40px 24px', textAlign: 'center', cursor: 'pointer', background: dragOver ? '#EAF5E9' : '#FAFDF9', transition: 'all 0.22s ease', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 100%,rgba(28,72,48,0.04),transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ width: 60, height: 60, borderRadius: 18, background: dragOver ? 'linear-gradient(135deg,#1C4830,#2A6443)' : '#EAF5E9', border: `1.5px solid ${dragOver ? '#1C4830' : '#CDECD6'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', transition: 'all 0.22s', boxShadow: dragOver ? '0 8px 24px rgba(28,72,48,0.2)' : 'none' }}>
                  <UploadCloud style={{ width: 26, height: 26, color: dragOver ? '#fff' : '#2A6443' }} />
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#17261D', marginBottom: 5 }}>{dragOver ? 'Drop files to upload' : 'Drag & drop files here or click to browse'}</p>
                <p style={{ fontSize: 11, color: '#6B8572' }}>Images (JPG, PNG, WebP) &amp; PDFs — Max 10MB — Up to 10 files</p>
                <input ref={fileInputRef} type="file" multiple accept="image/*,application/pdf" style={{ display: 'none' }} onChange={(e) => e.target.files && addFiles(e.target.files)} />
              </div>
              {files.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#4B6655', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Paperclip style={{ width: 12, height: 12 }} />{files.length} file{files.length > 1 ? 's' : ''} attached
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {files.map((file, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 13, background: '#F6FAF5', border: '1px solid #DEE7DC' }}>
                        {previews[i]
                          ? <img src={previews[i]} alt="" style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', border: '1px solid #DEE7DC' }} />
                          : <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff', border: '1px solid #DEE7DC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Paperclip style={{ width: 15, height: 15, color: '#6B8572' }} /></div>}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#17261D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                          <div style={{ fontSize: 10, color: '#7A9384', marginTop: 2 }}>{(file.size / 1024).toFixed(1)} KB</div>
                        </div>
                        <button onClick={() => removeFile(i)} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#A5B8AE', transition: 'color 0.15s', display: 'flex' }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#C52222')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#A5B8AE')}>
                          <X style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4 — Location */}
          {step === 4 && (
            <div style={{ ...slide, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#4E6857', textTransform: 'uppercase' as any, letterSpacing: 1.2, marginBottom: 8 }}>
                    City <span style={{ color: '#C52222' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <MapPin style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#7A9384', pointerEvents: 'none' }} />
                    <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value.replace(/[0-9]/g, '') })} className="input-civora" style={{ paddingLeft: 34, borderColor: form.city && !isCityValid ? '#F5C6C6' : undefined }} placeholder="Islamabad, Lahore..." />
                  </div>
                  {form.city && !isCityValid && <p style={{ fontSize: 10, color: '#C52222', marginTop: 4, fontWeight: 500 }}>Letters only — no numbers allowed</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#4E6857', textTransform: 'uppercase' as any, letterSpacing: 1.2, marginBottom: 8 }}>Area / Sector</label>
                  <input type="text" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="input-civora" placeholder="Sector F-8, Gulberg..." />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#4E6857', textTransform: 'uppercase' as any, letterSpacing: 1.2, marginBottom: 8 }}>Street Address / Nearest Landmark</label>
                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-civora" placeholder="Near Main Market, Opp. Community Dispensary..." />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#4E6857', textTransform: 'uppercase' as any, letterSpacing: 1.2, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CreditCard style={{ width: 12, height: 12 }} />CNIC / National ID
                    <span style={{ fontSize: 9, fontWeight: 500, color: '#8C9F92', textTransform: 'none', letterSpacing: 0 }}>(Optional)</span>
                  </div>
                </label>
                <div style={{ position: 'relative' }}>
                  <Shield style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#7A9384', pointerEvents: 'none' }} />
                  <input type="text" inputMode="numeric" value={form.cnic}
                    onChange={(e) => {
                      const d = e.target.value.replace(/\D/g, '').slice(0, 13);
                      let f = d;
                      if (d.length > 5 && d.length <= 12) f = `${d.slice(0,5)}-${d.slice(5)}`;
                      else if (d.length > 12) f = `${d.slice(0,5)}-${d.slice(5,12)}-${d.slice(12,13)}`;
                      setForm({ ...form, cnic: f });
                    }}
                    className="input-civora" style={{ fontFamily: 'monospace', paddingLeft: 34, borderColor: cnicDigits.length > 0 && cnicDigits.length < 13 ? '#FCE5BE' : undefined }} placeholder="61101-1234567-1" maxLength={15} />
                </div>
                {cnicDigits.length > 0 && cnicDigits.length < 13
                  ? <p style={{ fontSize: 10, color: '#A86518', marginTop: 4, fontWeight: 500 }}>{13 - cnicDigits.length} more digit{13 - cnicDigits.length === 1 ? '' : 's'} needed</p>
                  : <p style={{ fontSize: 10, color: '#8C9F92', marginTop: 4 }}>Format: 61101-1234567-1 (13 digits)</p>}
              </div>
            </div>
          )}

          {/* STEP 5 — Review */}
          {step === 5 && (
            <div style={{ ...slide, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {([
                  { label: 'Domain',       value: selectedCategory?.name || form.categoryId, icon: Building2 },
                  { label: 'Problem Type', value: selectedType?.name || form.typeId,         icon: ChevronRight },
                  { label: 'Title',        value: form.title,                                icon: FileText },
                  { label: 'Description',  value: form.description || '(No description provided)', icon: FileText },
                  { label: 'Location',     value: `${form.city}${form.area ? ', '+form.area : ''}${form.address ? ' · '+form.address : ''}`, icon: MapPin },
                  { label: 'Priority',     value: PRIORITIES.find((p) => p.value === form.userPriority)?.label || form.userPriority, icon: AlertTriangle },
                  { label: 'Evidence',     value: `${files.length} file${files.length !== 1 ? 's' : ''} attached`, icon: Paperclip },
                ] as { label: string; value: string; icon: any }[]).map((row) => {
                  const Icon = row.icon;
                  return (
                    <div key={row.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 11, padding: '11px 13px', borderRadius: 13, background: '#F6FAF5', border: '1px solid #E2EBE0' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: '#EAF5E9', border: '1px solid #CDECD6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon style={{ width: 12, height: 12, color: '#2A6443' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#6B8572', textTransform: 'uppercase' as any, letterSpacing: 1.2, marginBottom: 2 }}>{row.label}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#17261D', wordBreak: 'break-word' }}>{row.value}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Declaration */}
              <div onClick={() => setDeclared(!declared)}
                style={{ padding: '13px 15px', borderRadius: 13, background: declared ? 'linear-gradient(135deg,#EAF5E9,#DDF0DB)' : '#F6FAF5', border: `1.5px solid ${declared ? '#CDECD6' : '#E2EBE0'}`, display: 'flex', alignItems: 'flex-start', gap: 11, transition: 'all 0.22s', cursor: 'pointer' }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${declared ? '#1C4830' : '#B5C7BA'}`, background: declared ? '#1C4830' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, transition: 'all 0.18s' }}>
                  {declared && <Check style={{ width: 11, height: 11, color: '#fff' }} />}
                </div>
                <label style={{ fontSize: 12, color: '#1D4A2E', lineHeight: 1.6, cursor: 'pointer', fontWeight: 500 }}>
                  I hereby declare that this report is submitted in good faith, accurately describes a real civic problem, and includes genuine evidence.
                </label>
              </div>

              {error && (
                <div style={{ padding: '11px 13px', borderRadius: 12, background: '#FDEEEE', border: '1px solid #F8B4B4', color: '#B92E2E', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle style={{ width: 14, height: 14, flexShrink: 0 }} />{error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
        <button onClick={() => goStep(Math.max(0, step - 1))} disabled={step === 0} className="btn-secondary"
          style={{ fontSize: 12, padding: '10px 20px', borderRadius: 12, opacity: step === 0 ? 0.35 : 1 }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        {/* Dot progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ width: i === step ? 20 : 6, height: 6, borderRadius: 3, background: i < step ? '#2A6443' : i === step ? '#1C4830' : '#E2EBE0', transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)' }} />
          ))}
        </div>

        {step < STEPS.length - 1 ? (
          <button onClick={() => { if (canProceed) goStep(step + 1); }} disabled={!canProceed} className="btn-primary"
            style={{ fontSize: 12, padding: '10px 22px', borderRadius: 12, opacity: canProceed ? 1 : 0.4 }}>
            Continue <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting || !declared} className="btn-primary"
            style={{ fontSize: 12, padding: '10px 24px', borderRadius: 12, opacity: submitting || !declared ? 0.4 : 1, minWidth: 140, display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
            {submitting ? (
              <>
                <div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Submitting...
              </>
            ) : (
              <><Send className="w-3.5 h-3.5" /> Submit Report</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
