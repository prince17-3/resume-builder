/**
 * ResumeUploadButton.tsx
 *
 * Multi-technique Resume Import & Cache Memory Manager:
 *  1. Text / File Parser: Paste text or upload .json/.txt without requiring any API key.
 *  2. Cache Memory & Presets: Save/restore drafts from browser cache memory & load role presets.
 *  3. AI Document Import: Upload PDF/Word with Gemini AI (models/gemini-3.6-flash).
 */

import React, { useRef, useState, useEffect } from 'react';
import { ResumeData, ResumeConfig } from '../types';
import { parseResumeFile } from '../utils/resumeParser';
import { parseResumeFromPlainText } from '../utils/textResumeParser';
import {
  getCachedDrafts,
  saveDraftToCache,
  deleteDraftFromCache,
  PRESET_ROLES,
  ResumeDraft,
} from '../utils/cacheManager';
import {
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  X,
  Sparkles,
  FileUp,
  Key,
  ExternalLink,
  ClipboardPaste,
  Database,
  Trash2,
  BookmarkPlus,
  ArrowRight,
} from 'lucide-react';

interface Props {
  onDataParsed: (data: ResumeData, config?: ResumeConfig) => void;
  currentData?: ResumeData;
  currentConfig?: ResumeConfig;
  className?: string;
}

type ModalTab = 'text_file' | 'cache_presets' | 'ai_file';
type UploadState = 'idle' | 'need_key' | 'reading' | 'extracting' | 'done' | 'error';

export const ResumeUploadButton: React.FC<Props> = ({
  onDataParsed,
  currentData,
  currentConfig,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<ModalTab>('text_file');
  const [state, setState] = useState<UploadState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [draftName, setDraftName] = useState('');
  const [cachedDrafts, setCachedDrafts] = useState<ResumeDraft[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const [customApiKey, setCustomApiKey] = useState(() => {
    try {
      return localStorage.getItem('gemini_api_key') || '';
    } catch {
      return '';
    }
  });

  const envApiKey = typeof __GEMINI_API_KEY__ !== 'undefined' ? __GEMINI_API_KEY__ : '';
  const effectiveApiKey = envApiKey || customApiKey;

  useEffect(() => {
    if (showModal) {
      setCachedDrafts(getCachedDrafts());
    }
  }, [showModal]);

  const reset = () => {
    setState('idle');
    setErrorMsg('');
    setFileName('');
    setSelectedFile(null);
    setPastedText('');
    setSaveSuccessMsg('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(reset, 200);
  };

  // 1. Text Parsing (Zero API Key)
  const handleParsePastedText = () => {
    const text = pastedText.trim();
    if (!text) {
      setErrorMsg('Please paste some resume text first.');
      return;
    }
    setState('reading');
    setErrorMsg('');
    try {
      const parsed = parseResumeFromPlainText(text);
      if (!parsed.personalInfo.fullName && parsed.experiences.length === 0 && parsed.education.length === 0) {
        throw new Error('Could not identify resume sections in pasted text.');
      }
      setState('done');
      setTimeout(() => {
        onDataParsed(parsed);
        closeModal();
      }, 900);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to parse text.');
      setState('error');
    }
  };

  // 2. Local File Picker (.json, .txt, .pdf, .docx)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setSelectedFile(file);
    setErrorMsg('');

    // Handle .json (100% Client-side, No API key)
    if (file.name.endsWith('.json') || file.type === 'application/json') {
      setState('reading');
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        const resumeData: ResumeData = json.data ? json.data : json;
        if (!resumeData || !resumeData.personalInfo) {
          throw new Error('Invalid JSON format: missing personalInfo.');
        }
        setState('done');
        setTimeout(() => {
          onDataParsed(resumeData, json.config);
          closeModal();
        }, 800);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Invalid JSON file.');
        setState('error');
      } finally {
        if (inputRef.current) inputRef.current.value = '';
      }
      return;
    }

    // Handle .txt (100% Client-side, No API key)
    if (file.name.endsWith('.txt') || file.type === 'text/plain') {
      setState('reading');
      try {
        const text = await file.text();
        const parsed = parseResumeFromPlainText(text);
        setState('done');
        setTimeout(() => {
          onDataParsed(parsed);
          closeModal();
        }, 800);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Failed to parse text file.');
        setState('error');
      } finally {
        if (inputRef.current) inputRef.current.value = '';
      }
      return;
    }

    // PDF or DOCX -> switch to AI tab
    setActiveTab('ai_file');
    if (!effectiveApiKey) {
      setState('need_key');
      return;
    }

    setState('reading');
    await runAiExtraction(file, effectiveApiKey);
    if (inputRef.current) inputRef.current.value = '';
  };

  // 3. AI Extraction
  const runAiExtraction = async (file: File, keyToUse: string) => {
    setState('extracting');
    setErrorMsg('');
    try {
      const parsed = await parseResumeFile(file, keyToUse);
      setState('done');
      setTimeout(() => {
        onDataParsed(parsed);
        closeModal();
      }, 1200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMsg(msg);
      setState('error');
    }
  };

  const handleSaveApiKeyAndExtract = async () => {
    const trimmed = customApiKey.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a valid Gemini API key.');
      return;
    }
    try {
      localStorage.setItem('gemini_api_key', trimmed);
    } catch {
      // ignore
    }
    if (selectedFile) {
      setState('reading');
      await runAiExtraction(selectedFile, trimmed);
    }
  };

  // 4. Cache Memory Drafts
  const handleSaveCurrentToCache = () => {
    if (!currentData || !currentConfig) return;
    const name = draftName.trim() || currentData.personalInfo.fullName || 'My Resume';
    const updated = saveDraftToCache(name, currentData, currentConfig);
    setCachedDrafts(updated);
    setDraftName('');
    setSaveSuccessMsg('Saved snapshot to browser cache memory!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleRestoreDraft = (draft: ResumeDraft) => {
    onDataParsed(draft.data, draft.config);
    closeModal();
  };

  const handleDeleteDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteDraftFromCache(id);
    setCachedDrafts(updated);
  };

  const handleLoadPreset = (preset: typeof PRESET_ROLES[0]) => {
    onDataParsed(preset.data, preset.config);
    closeModal();
  };

  const isBusy = state === 'reading' || state === 'extracting';
  const showProgressSteps = state === 'reading' || state === 'extracting' || state === 'done';

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.json,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/json,text/plain"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setShowModal(true);
          setState('idle');
          setErrorMsg('');
        }}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition
          bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs ${className}`}
        title="Import resume, paste text, or load from saved cache"
      >
        <FileUp className="w-3.5 h-3.5" />
        <span>Import Resume</span>
      </button>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col relative animate-fade-in border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <FileUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Import & Fill Resume</h3>
                  <p className="text-[11px] text-slate-500">Pick any method to populate your resume editor</p>
                </div>
              </div>
              {!isBusy && (
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-white px-4 pt-2 gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setActiveTab('text_file'); setState('idle'); setErrorMsg(''); }}
                className={`pb-2.5 px-2 flex items-center gap-1.5 border-b-2 transition ${
                  activeTab === 'text_file'
                    ? 'border-emerald-600 text-emerald-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span>Text / File (No API Key)</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('cache_presets'); setState('idle'); setErrorMsg(''); }}
                className={`pb-2.5 px-2 flex items-center gap-1.5 border-b-2 transition ${
                  activeTab === 'cache_presets'
                    ? 'border-emerald-600 text-emerald-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Cache Memory & Presets</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('ai_file'); setState('idle'); setErrorMsg(''); }}
                className={`pb-2.5 px-2 flex items-center gap-1.5 border-b-2 transition ${
                  activeTab === 'ai_file'
                    ? 'border-emerald-600 text-emerald-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>AI File (PDF / Word)</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {/* TAB 1: TEXT & FILE PARSER (NO API KEY) */}
              {activeTab === 'text_file' && (
                <div className="space-y-4">
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">100% Free & Private (No API Key Required):</span>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        Upload a <code className="font-mono bg-white px-1 rounded">.json</code> or <code className="font-mono bg-white px-1 rounded">.txt</code> file, or paste text directly below from LinkedIn or your existing resume.
                      </p>
                    </div>
                  </div>

                  {/* Option A: Quick Upload File */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="flex-1 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-3 text-center transition group bg-slate-50/50 hover:bg-emerald-50/20"
                    >
                      <FileText className="w-5 h-5 mx-auto text-slate-400 group-hover:text-emerald-600 mb-1" />
                      <span className="text-xs font-bold text-slate-800 block">Choose JSON or TXT file</span>
                      <span className="text-[10px] text-slate-500">Fast client-side import without AI</span>
                    </button>
                  </div>

                  {/* Option B: Paste Text */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Or Paste Resume Text:
                    </label>
                    <textarea
                      rows={6}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="Paste your resume here (e.g. John Doe, Software Engineer, Experience, Education, Skills...)"
                      className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono resize-none leading-relaxed"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[11px] text-slate-400">
                        {pastedText ? `${pastedText.split(/\s+/).filter(Boolean).length} words` : 'Auto-detects contact, jobs & skills'}
                      </span>
                      <button
                        type="button"
                        onClick={handleParsePastedText}
                        disabled={!pastedText.trim() || isBusy}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
                      >
                        {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ClipboardPaste className="w-3.5 h-3.5" />}
                        <span>Parse & Prefill Resume</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CACHE MEMORY & ROLE PRESETS */}
              {activeTab === 'cache_presets' && (
                <div className="space-y-4">
                  {/* Save current snapshot to cache */}
                  {currentData && currentConfig && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <BookmarkPlus className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-slate-800">Save Current Resume to Cache Memory</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                          placeholder="e.g. Frontend Engineer Draft"
                          className="flex-1 text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={handleSaveCurrentToCache}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
                        >
                          Save Snapshot
                        </button>
                      </div>
                      {saveSuccessMsg && (
                        <p className="text-[11px] text-emerald-600 font-semibold">{saveSuccessMsg}</p>
                      )}
                    </div>
                  )}

                  {/* Saved Drafts in Cache */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
                      <span>Saved Drafts in Browser Cache ({cachedDrafts.length})</span>
                      <span className="text-[10px] text-slate-400 font-normal">Stored in local browser storage</span>
                    </h4>
                    {cachedDrafts.length === 0 ? (
                      <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-lg text-center">
                        No saved drafts yet. Save snapshots above or load a pre-built role preset below.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {cachedDrafts.map((draft) => (
                          <div
                            key={draft.id}
                            onClick={() => handleRestoreDraft(draft)}
                            className="flex items-center justify-between p-2.5 border border-slate-200 hover:border-emerald-500 rounded-lg bg-white hover:bg-emerald-50/20 cursor-pointer transition group"
                          >
                            <div>
                              <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 block">
                                {draft.name}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {draft.data.personalInfo.fullName || 'Candidate'} • Saved {draft.savedAt}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                                Load <ArrowRight className="w-3 h-3" />
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteDraft(draft.id, e)}
                                className="p-1 text-slate-300 hover:text-rose-500 rounded"
                                title="Delete draft"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ready-to-use Role Presets */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-2">
                      Pre-Built Role Presets (1-Click Fill)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {PRESET_ROLES.map((preset) => (
                        <div
                          key={preset.id}
                          onClick={() => handleLoadPreset(preset)}
                          className="border border-slate-200 hover:border-emerald-500 p-2.5 rounded-xl bg-white hover:bg-emerald-50/20 cursor-pointer transition group text-left"
                        >
                          <span className="text-xs font-bold text-slate-900 block group-hover:text-emerald-700">
                            {preset.title}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-medium block">
                            {preset.role}
                          </span>
                          <span className="text-[10px] text-slate-400 line-clamp-2 mt-1">
                            {preset.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: AI FILE EXTRACTION (PDF / WORD) */}
              {activeTab === 'ai_file' && (
                <div className="space-y-4">
                  <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Multimodal AI Extraction (Gemini 3.6 Flash):</span>
                      <p className="text-[11px] text-blue-800 mt-0.5">
                        Upload your PDF or Word resume. Gemini extracts full career history, education, and bullet highlights.
                      </p>
                    </div>
                  </div>

                  {/* Pick PDF/Word */}
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={isBusy}
                    className="w-full border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-5 text-center transition group bg-slate-50/50 hover:bg-blue-50/20"
                  >
                    <FileUp className="w-6 h-6 mx-auto text-slate-400 group-hover:text-blue-600 mb-1.5" />
                    <span className="text-xs font-bold text-slate-800 block">Choose PDF or Word Document</span>
                    <span className="text-[10px] text-slate-500">Supports .pdf, .docx, and .doc</span>
                  </button>

                  {/* API Key Configuration Section */}
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-slate-500" />
                        <span>Gemini API Key</span>
                      </label>
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        Get free key <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={customApiKey}
                        onChange={(e) => setCustomApiKey(e.target.value)}
                        placeholder={envApiKey ? 'Configured via environment' : 'Paste AIzaSy...'}
                        className="flex-1 text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.setItem('gemini_api_key', customApiKey.trim());
                          alert('API Key saved to browser storage!');
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition"
                      >
                        Save Key
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress and status display */}
              {isBusy && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      {state === 'reading' ? 'Reading Resume File…' : 'Extracting Data…'}
                    </h4>
                    <p className="text-[11px] text-slate-500">{fileName || 'Processing…'}</p>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full animate-progress-indeterminate"
                      style={{ width: state === 'extracting' ? '80%' : '35%', transition: 'width 0.5s' }}
                    />
                  </div>
                </div>
              )}

              {/* Success Alert */}
              {state === 'done' && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-1.5">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                  <h4 className="text-xs font-bold text-emerald-900">Resume Prefilled Successfully!</h4>
                  <p className="text-[11px] text-emerald-700">Opening editor tabs…</p>
                </div>
              )}

              {/* Error Message */}
              {state === 'error' && (
                <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 space-y-2">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-rose-700 leading-relaxed">{errorMsg}</p>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setState('idle')}
                      className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
