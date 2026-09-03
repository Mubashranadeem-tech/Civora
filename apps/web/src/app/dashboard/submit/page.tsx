'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const STEPS = ['Category', 'Problem Type', 'Description', 'Evidence', 'Location', 'Priority', 'Review'];

const PRIORITIES = [
  { value: 'low', label: 'Low', icon: '🟢', desc: 'Minor inconvenience, non-urgent' },
  { value: 'medium', label: 'Medium', icon: '🟡', desc: 'Moderate impact, needs attention' },
  { value: 'high', label: 'High', icon: '🟠', desc: 'Significant problem affecting many' },
  { value: 'critical', label: 'Critical', icon: '🔴', desc: 'Urgent danger or major impact' },
];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
      {STEPS.map((step, i) => (
        <div key={i} className="flex items-center gap-2 flex-shrink-0">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
              i < current
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : i === current
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-white/5 text-gray-600 border border-white/10'
            }`}
          >
            {i < current ? '✓' : i + 1}
          </div>
          <span className={`text-xs hidden sm:block ${i === current ? 'text-white' : 'text-gray-500'}`}>
            {step}
          </span>
          {i < STEPS.length - 1 && (
            <div className={`w-4 h-px ${i < current ? 'bg-green-500/30' : 'bg-white/10'}`} />
          )}
        </div>
      ))}
    </div>
  );
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

  const [form, setForm] = useState({
    categoryId: '',
    typeId: '',
    title: '',
    description: '',
    city: '',
    area: '',
    address: '',
    latitude: '',
    longitude: '',
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

  const tryGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((f) => ({
            ...f,
            latitude: pos.coords.latitude.toString(),
            longitude: pos.coords.longitude.toString(),
          }));
        },
        () => setError('Location access denied. Please enter location manually.'),
      );
    }
  };

  const handleSubmit = async () => {
    if (!form.categoryId || !form.typeId || !form.title || !form.city) {
      setError('Please complete all required fields');
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
      if (form.latitude) formData.append('latitude', form.latitude);
      if (form.longitude) formData.append('longitude', form.longitude);
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
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="glass-card p-12">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold text-white mb-3">Problem Submitted!</h1>
          <p className="text-gray-400 mb-6">Your civic problem has been successfully reported.</p>
          <div className="inline-block px-6 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <div className="text-xs text-gray-400 mb-1">Your Problem ID</div>
            <div className="text-2xl font-mono font-bold gradient-text">{submitted.civId}</div>
          </div>
          <p className="text-sm text-gray-500 mb-8">
            Save this ID to track your problem status. Our admin team has been notified.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => router.push('/dashboard/track')} className="btn-primary">
              Track This Problem
            </button>
            <button onClick={() => router.push('/dashboard/my-problems')} className="btn-secondary">
              View My Problems
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
    () => true, // evidence is optional
    () => form.city.trim().length >= 2,
    () => !!form.userPriority,
    () => true, // review step
  ][step]?.();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Report a Problem</h1>
        <p className="text-gray-400 text-sm">Submit a civic issue in your community</p>
      </div>

      <StepIndicator current={step} total={STEPS.length} />

      <div className="glass-card p-6 mb-6 min-h-64">
        {/* Step 0: Category */}
        {step === 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Select Problem Domain</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setForm({ ...form, categoryId: cat.id, typeId: '' });
                    setSelectedCategory(cat);
                    setSelectedType(null);
                  }}
                  className={`p-4 rounded-xl text-left transition-all border ${
                    form.categoryId === cat.id
                      ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                      : 'border-white/10 bg-white/3 hover:border-white/20 text-gray-300'
                  }`}
                >
                  <div className="text-xl mb-2">
                    {cat.slug === 'infrastructure' ? '🏗️' :
                     cat.slug === 'utilities' ? '⚡' :
                     cat.slug === 'sanitation' ? '🌿' :
                     cat.slug === 'education' ? '📚' :
                     cat.slug === 'healthcare' ? '🏥' :
                     cat.slug === 'transportation' ? '🚗' :
                     cat.slug === 'public-safety' ? '🛡️' :
                     cat.slug === 'community-services' ? '👥' : '📌'}
                  </div>
                  <div className="text-sm font-medium">{cat.name}</div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Problem Type */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">Select Problem Type</h2>
            <p className="text-sm text-gray-400 mb-4">
              Category: <span className="text-cyan-400">{selectedCategory?.name}</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {types.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setForm({ ...form, typeId: type.id });
                    setSelectedType(type);
                  }}
                  className={`p-3 rounded-xl text-left text-sm transition-all border ${
                    form.typeId === type.id
                      ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                      : 'border-white/10 bg-white/3 hover:border-white/20 text-gray-300'
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
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Describe the Problem</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Problem Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input-civora"
                  placeholder="E.g., Large pothole on Main Street causing traffic hazard"
                  maxLength={255}
                />
                <div className="text-xs text-gray-600 mt-1">{form.title.length}/255</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Detailed Description
                  <span className="ml-2 text-xs text-gray-500">(optional if you're uploading photos)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-civora resize-none"
                  rows={5}
                  placeholder="Describe the problem in detail. When did it start? How is it affecting people? Any relevant context..."
                  maxLength={5000}
                />
                <div className="text-xs text-gray-600 mt-1">{form.description.length}/5000</div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Evidence */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Upload Evidence</h2>
            <p className="text-sm text-gray-400 mb-4">
              Photos, documents, or any supporting files (max 10 files, 10MB each)
            </p>

            {/* Drop Zone */}
            <div
              className={`drop-zone mb-4 ${dragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <div className="text-4xl mb-3">📎</div>
              <p className="text-sm font-medium text-gray-300">Drag & drop files here or click to browse</p>
              <p className="text-xs text-gray-500 mt-1">Images (JPG, PNG, WebP), Documents (PDF, DOC, TXT)</p>
              <input
                id="file-input"
                type="file"
                multiple
                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                className="hidden"
                onChange={(e) => e.target.files && addFiles(e.target.files)}
              />
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-gray-400 mb-2">{files.length} file(s) selected</div>
                {files.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    {previews[i] ? (
                      <img src={previews[i]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-lg">
                        {file.type.includes('pdf') ? '📄' : file.type.includes('image') ? '🖼️' : '📁'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">{file.name}</div>
                      <div className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <button onClick={() => removeFile(i)} className="text-gray-500 hover:text-red-400 transition-colors p-1">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {files.length === 0 && (
              <div className="text-center py-4 text-sm text-gray-500">
                No files selected — you can still submit without attachments
              </div>
            )}
          </div>
        )}

        {/* Step 4: Location */}
        {step === 4 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Location</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    City <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="input-civora"
                    placeholder="Karachi, Lahore, Islamabad..."
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Area / Neighborhood</label>
                  <input
                    type="text"
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    className="input-civora"
                    placeholder="Defence, Gulberg, F-10..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Specific Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="input-civora"
                  placeholder="Street number, landmark, or specific location..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Latitude (optional)</label>
                  <input
                    type="text"
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                    className="input-civora"
                    placeholder="24.8607"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Longitude (optional)</label>
                  <input
                    type="text"
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                    className="input-civora"
                    placeholder="67.0011"
                  />
                </div>
              </div>

              <button
                onClick={tryGetLocation}
                className="btn-secondary text-sm"
                type="button"
              >
                📍 Use My Current Location
              </button>

              {form.latitude && form.longitude && (
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-400">
                  ✅ GPS coordinates captured: {form.latitude}, {form.longitude}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Priority */}
        {step === 5 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Set Priority</h2>
            <p className="text-sm text-gray-400 mb-4">
              How urgent is this problem? Admin/AI may adjust the final priority.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setForm({ ...form, userPriority: p.value })}
                  className={`p-4 rounded-xl text-left transition-all border ${
                    form.userPriority === p.value
                      ? 'border-cyan-500/50 bg-cyan-500/10'
                      : 'border-white/10 bg-white/3 hover:border-white/20'
                  }`}
                >
                  <div className="text-2xl mb-2">{p.icon}</div>
                  <div className="font-semibold text-sm text-white">{p.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Review */}
        {step === 6 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Review Your Report</h2>
            <div className="space-y-3">
              {[
                { label: 'Domain', value: selectedCategory?.name || form.categoryId },
                { label: 'Problem Type', value: selectedType?.name || form.typeId },
                { label: 'Title', value: form.title },
                { label: 'Description', value: form.description || '(No description)' },
                { label: 'Location', value: `${form.city}${form.area ? ', ' + form.area : ''}` },
                { label: 'Priority', value: form.userPriority.charAt(0).toUpperCase() + form.userPriority.slice(1) },
                { label: 'Attachments', value: `${files.length} file(s)` },
              ].map((row) => (
                <div key={row.label} className="flex gap-4 p-3 rounded-xl bg-white/3 border border-white/5">
                  <div className="text-xs font-medium text-gray-500 w-28 flex-shrink-0">{row.label}</div>
                  <div className="text-sm text-white flex-1">{row.value}</div>
                </div>
              ))}
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { setStep(Math.max(0, step - 1)); setError(''); }}
          disabled={step === 0}
          className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => { if (canProceed) { setStep(step + 1); setError(''); } }}
            disabled={!canProceed}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary disabled:opacity-40"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting...
              </span>
            ) : (
              '🚀 Submit Problem'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
