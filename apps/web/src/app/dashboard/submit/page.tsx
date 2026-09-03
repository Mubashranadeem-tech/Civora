'use client';

import { useState, useEffect, useCallback } from 'react';
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
  FileText, 
  UploadCloud, 
  Check, 
  ArrowRight,
  CheckCircle2,
  Paperclip,
  Trash2
} from 'lucide-react';

const STEPS = ['Category', 'Problem Type', 'Description', 'Evidence', 'Location & ID', 'Review'];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
      {STEPS.map((step, i) => (
        <div key={i} className="flex items-center gap-2 flex-shrink-0">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
              i < current
                ? 'bg-[#EAF5E9] text-[#1E5433] border border-[#CDE4CB] shadow-xs'
                : i === current
                ? 'bg-[#1C4830] text-white border border-[#163C27] shadow-xs'
                : 'bg-[#F2F6F1] text-[#7A9384] border border-[#DEE7DD]'
            }`}
          >
            {i < current ? <Check className="w-3.5 h-3.5" /> : i + 1}
          </div>
          <span className={`text-xs font-bold ${i === current ? 'text-[#14261C]' : 'text-[#688273]'}`}>
            {step}
          </span>
          {i < STEPS.length - 1 && (
            <div className={`w-4 h-0.5 ${i < current ? 'bg-[#2D6C48]' : 'bg-[#DEE7DD]'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function getCategoryIcon(slug: string) {
  switch (slug) {
    case 'infrastructure': return Building2;
    case 'utilities': return Zap;
    case 'sanitation': return TreePine;
    case 'education': return GraduationCap;
    case 'healthcare': return Hospital;
    case 'transportation': return Car;
    case 'public-safety': return ShieldAlert;
    case 'community-services': return Landmark;
    default: return FileText;
  }
}

export default function SubmitProblemPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ civId: string } | null>(null);
  const [error, setError] = useState('');

  const [declared, setDeclared] = useState(false);

  const [form, setForm] = useState({
    categoryId: '',
    typeId: '',
    title: '',
    description: '',
    city: '',
    area: '',
    address: '',
    cnic: '',
    userPriority: 'medium',
  });

  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<any>(null);

  useEffect(() => {
    api.getCategories().then((data: any) => setCategories(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    if (form.categoryId) {
      api.getCategoryTypes(form.categoryId).then((data: any) => setTypes(Array.isArray(data) ? data : []));
    }
  }, [form.categoryId]);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const validFiles: File[] = [];
    const maxSize = 10 * 1024 * 1024;
    Array.from(newFiles).forEach((file) => {
      if (file.size > maxSize) {
        setError(`File "${file.name}" exceeds 10MB limit`);
        return;
      }
      validFiles.push(file);
    });

    const combined = [...files, ...validFiles].slice(0, 10);
    setFiles(combined);

    combined.forEach((file, i) => {
      if (!previews[i] && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews((prev) => {
            const updated = [...prev];
            updated[i] = e.target?.result as string;
            return updated;
          });
        };
        reader.readAsDataURL(file);
      }
    });
  }, [files, previews]);

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!form.categoryId || !form.typeId || !form.title || !form.city) {
      setError('Please complete all required fields');
      return;
    }
    if (!declared) {
      setError('Please confirm the declaration checkbox before submitting');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('categoryId', form.categoryId);
      formData.append('typeId', form.typeId);
      formData.append('title', form.title);
      if (form.description) formData.append('description', form.description);
      formData.append('userPriority', form.userPriority);
      formData.append('city', form.city);
      if (form.area) formData.append('area', form.area);
      if (form.address) formData.append('address', form.address);
      if (form.cnic) formData.append('cnic', form.cnic);
      files.forEach((file) => formData.append('files', file));

      const result = await api.createProblem(formData) as any;
      setSubmitted({ civId: result.civId });
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="glass-card p-12 bg-white border border-[#CADDC7] shadow-md">
          <div className="w-16 h-16 rounded-2xl bg-[#EAF5EA] text-[#1E5433] flex items-center justify-center mx-auto mb-4 border border-[#CCE2CA]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#132419] mb-2">Problem Reported Successfully</h1>
          <p className="text-[#516B5C] text-xs mb-6">
            Your civic complaint has been registered into the AI verification pipeline.
          </p>
          <div className="inline-block px-6 py-4 rounded-2xl bg-[#F0F7EE] border border-[#CEE2CC] mb-6">
            <div className="text-[11px] font-bold text-[#557161] uppercase tracking-wider mb-1">Your Tracking ID</div>
            <div className="text-2xl font-mono font-extrabold text-[#194D2F]">{submitted.civId}</div>
          </div>
          <p className="text-xs text-[#637C6D] mb-8 max-w-md mx-auto">
            Please save this Ticket ID to track the real-time AI analysis and municipal escalation status.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push(`/dashboard/track?id=${submitted.civId}`)}
              className="btn-primary text-xs px-6 py-3 rounded-xl shadow-xs"
            >
              Track Live Status
            </button>
            <button
              onClick={() => router.push('/dashboard/my-problems')}
              className="btn-secondary text-xs px-6 py-3 rounded-xl"
            >
              View My Reports
            </button>
          </div>
        </div>
      </div>
    );
  }

  const canProceed = [
    () => !!form.categoryId,
    () => !!form.typeId,
    () => form.title.trim().length >= 5,
    () => true,
    () => form.city.trim().length >= 2,
    () => true,
  ][step]?.();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="pb-2 border-b border-[#E2EBE0]">
        <h1 className="text-2xl font-extrabold text-[#13251A] tracking-tight">Report a Community Problem</h1>
        <p className="text-sm text-[#546E5E]">Provide problem details for autonomous verification and escalation.</p>
      </div>

      <StepIndicator current={step} total={STEPS.length} />

      <div className="glass-card p-6 md:p-8 bg-white border border-[#DCE5DA] shadow-xs min-h-64">
        {/* Step 0: Category */}
        {step === 0 && (
          <div>
            <h2 className="text-lg font-bold text-[#14261C] mb-1">Select Civic Domain</h2>
            <p className="text-xs text-[#5C7566] mb-4">Choose the category that best classifies the observed issue.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((cat) => {
                const Icon = getCategoryIcon(cat.slug);
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setForm({ ...form, categoryId: cat.id, typeId: '' });
                      setSelectedCategory(cat);
                      setSelectedType(null);
                    }}
                    className={`p-4 rounded-xl text-left transition-all border ${
                      form.categoryId === cat.id
                        ? 'border-[#2D6C48] bg-[#EBF5EA] text-[#1B4D2E] shadow-xs'
                        : 'border-[#DEE6DD] bg-[#FAFDF9] hover:border-[#ADC5AF] text-[#16271D]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#D5E4D3] flex items-center justify-center text-[#245D3B] mb-3 shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold">{cat.name}</div>
                    <div className="text-[11px] text-[#5E7868] mt-1 line-clamp-2">{cat.description}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 1: Problem Type */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold text-[#14261C] mb-1">Select Specific Sub-Type</h2>
            <p className="text-xs text-[#5C7566] mb-4">
              Selected Domain: <strong className="text-[#205433]">{selectedCategory?.name}</strong>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {types.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setForm({ ...form, typeId: type.id });
                    setSelectedType(type);
                  }}
                  className={`p-3.5 rounded-xl text-left text-xs font-bold transition-all border ${
                    form.typeId === type.id
                      ? 'border-[#2D6C48] bg-[#EBF5EA] text-[#1B4D2E] shadow-xs'
                      : 'border-[#DEE6DD] bg-[#FAFDF9] hover:border-[#ADC5AF] text-[#16271D]'
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Description */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#14261C] mb-1">Describe the Issue</h2>
            <div>
              <label className="block text-xs font-bold text-[#4E6857] uppercase tracking-wider mb-2">
                Problem Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-civora font-semibold"
                placeholder="E.g., Severe water leakage flooding 42nd Street near municipal park"
                maxLength={255}
              />
              <div className="text-[11px] text-[#718B7C] mt-1">{form.title.length}/255 characters</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4E6857] uppercase tracking-wider mb-2">
                Detailed Context & Observations
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-civora resize-none text-xs leading-relaxed"
                rows={5}
                placeholder="Include details: How long has this issue existed? Who is impacted? Any previous complaints filed?"
                maxLength={5000}
              />
              <div className="text-[11px] text-[#718B7C] mt-1">{form.description.length}/5000 characters</div>
            </div>
          </div>
        )}

        {/* Step 3: Evidence */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-bold text-[#14261C] mb-1">Upload Photo & Document Evidence</h2>
            <p className="text-xs text-[#5C7566] mb-4">
              Clear photos increase AI verification confidence and expedite admin triage.
            </p>

            {/* Drop Zone */}
            <div
              className={`drop-zone mb-4 ${dragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <div className="w-12 h-12 rounded-2xl bg-[#EAF4E8] text-[#245D3B] flex items-center justify-center mx-auto mb-2 border border-[#CCE2CA]">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-[#172D20]">Drag & drop files here or click to browse</p>
              <p className="text-[11px] text-[#637C6D] mt-1">Images (JPG, PNG, WebP) & Documents (PDF) up to 10MB</p>
              <input
                id="file-input"
                type="file"
                multiple
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => e.target.files && addFiles(e.target.files)}
              />
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#4B6655] mb-2">{files.length} file(s) attached</div>
                {files.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#F6FAF5] border border-[#DEE7DC]">
                    {previews[i] ? (
                      <img src={previews[i]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-white border border-[#D5E3D3] flex items-center justify-center text-[#4B6655]">
                        <Paperclip className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-[#14261C] truncate">{file.name}</div>
                      <div className="text-[11px] text-[#698374]">{(file.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <button onClick={() => removeFile(i)} className="text-[#88A292] hover:text-[#C52222] transition-colors p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Location */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#14261C] mb-1">Location & Citizen Verification</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#4E6857] uppercase tracking-wider mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="input-civora"
                  placeholder="Islamabad, Rawalpindi, Lahore..."
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#4E6857] uppercase tracking-wider mb-2">
                  Area / Sector / Neighborhood
                </label>
                <input
                  type="text"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  className="input-civora"
                  placeholder="Sector F-8, Gulberg, Defence..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4E6857] uppercase tracking-wider mb-2">
                Street Address / Nearest Landmark
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="input-civora"
                placeholder="Near Main Market, Opp. Community Dispensary..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4E6857] uppercase tracking-wider mb-2">
                Citizen National ID / CNIC (Optional)
              </label>
              <input
                type="text"
                value={form.cnic}
                onChange={(e) => setForm({ ...form, cnic: e.target.value })}
                className="input-civora font-mono"
                placeholder="61101-1234567-1"
                maxLength={15}
              />
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#14261C] mb-1">Review Report Submission</h2>
            <div className="space-y-2.5 text-xs">
              {[
                { label: 'Domain', value: selectedCategory?.name || form.categoryId },
                { label: 'Problem Type', value: selectedType?.name || form.typeId },
                { label: 'Title', value: form.title },
                { label: 'Description', value: form.description || '(No description)' },
                { label: 'Location', value: `${form.city}${form.area ? ', ' + form.area : ''}${form.address ? ' (' + form.address + ')' : ''}` },
                { label: 'Attached Files', value: `${files.length} document(s)` },
              ].map((row) => (
                <div key={row.label} className="flex items-start gap-4 p-3 rounded-xl bg-[#F6FAF5] border border-[#DEE7DC]">
                  <div className="font-bold text-[#557161] w-28 flex-shrink-0 uppercase tracking-wider">{row.label}</div>
                  <div className="font-semibold text-[#14261C] flex-1">{row.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 rounded-xl bg-[#EBF5EA] border border-[#CCE2CA] flex items-start gap-3">
              <input
                type="checkbox"
                id="user-declaration"
                checked={declared}
                onChange={(e) => setDeclared(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#1C4830] focus:ring-[#1C4830] cursor-pointer accent-[#1C4830]"
              />
              <label htmlFor="user-declaration" className="text-xs text-[#1D4A2E] leading-relaxed cursor-pointer font-medium select-none">
                I hereby declare that this report is submitted in good faith, accurately describes a real civic problem, and includes genuine evidence.
              </label>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[#FDEEEE] border border-[#F8B4B4] text-[#B92E2E] text-xs font-semibold">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { setStep(Math.max(0, step - 1)); setError(''); }}
          disabled={step === 0}
          className="btn-secondary text-xs px-5 py-2.5 rounded-xl disabled:opacity-30"
        >
          ← Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => { if (canProceed) { setStep(step + 1); setError(''); } }}
            disabled={!canProceed}
            className="btn-primary text-xs px-6 py-2.5 rounded-xl disabled:opacity-40 inline-flex items-center gap-1.5"
          >
            Continue
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || !declared}
            className="btn-primary text-xs px-7 py-2.5 rounded-xl disabled:opacity-40 shadow-xs"
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        )}
      </div>
    </div>
  );
}
