/**
 * ResumeUploadButton.tsx
 *
 * A self-contained upload button that:
 *  1. Lets the user pick a PDF, DOCX, or JSON resume
 *  2. For JSON: instantly parses and prefills without API calls
 *  3. For PDF/DOCX: sends to Gemini for structured extraction
 *  4. Calls onDataParsed with the resulting ResumeData (and optional config)
 *
 * Shows a modal overlay with status during processing, API key prompt if needed,
 * and clear error states with retry options.
 */

import React, { useRef, useState } from 'react';
import { ResumeData, ResumeConfig } from '../types';
import { parseResumeFile, isSupportedResumeFile } from '../utils/resumeParser';
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
} from 'lucide-react';

interface Props {
  onDataParsed: (data: ResumeData, config?: ResumeConfig) => void;
  /** Optional extra className on the trigger button */
  className?: string;
}

type UploadState = 'idle' | 'need_key' | 'reading' | 'extracting' | 'done' | 'error';

const STATUS_MESSAGES: Record<UploadState, string> = {
  idle: '',
  need_key: 'Gemini API Key Required',
  reading: 'Reading resume file…',
  extracting: 'Extracting resume details with AI…',
  done: 'Resume data prefilled successfully!',
  error: '',
};

export const ResumeUploadButton: React.FC<Props> = ({ onDataParsed, className = '' }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(() => {
    try {
      return localStorage.getItem('gemini_api_key') || '';
    } catch {
      return '';
    }
  });

  // __GEMINI_API_KEY__ is injected at build/dev time by vite.config.ts
  const envApiKey = typeof __GEMINI_API_KEY__ !== 'undefined' ? __GEMINI_API_KEY__ : '';
  const effectiveApiKey = envApiKey || customApiKey;

  const reset = () => {
    setState('idle');
    setErrorMsg('');
    setFileName('');
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(reset, 200);
  };

  const processExtraction = async (file: File, keyToUse: string) => {
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isSupportedResumeFile(file)) {
      setErrorMsg('Unsupported file type. Please upload a PDF, DOCX, or JSON file.');
      setState('error');
      setShowModal(true);
      return;
    }

    setFileName(file.name);
    setSelectedFile(file);
    setShowModal(true);
    setErrorMsg('');

    // Instant local JSON file handling
    if (file.name.endsWith('.json') || file.type === 'application/json') {
      setState('reading');
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        const resumeData: ResumeData = json.data ? json.data : json;
        if (!resumeData || !resumeData.personalInfo) {
          throw new Error('Invalid JSON format: missing personalInfo section.');
        }
        setState('done');
        setTimeout(() => {
          onDataParsed(resumeData, json.config);
          closeModal();
        }, 900);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Failed to parse JSON file.');
        setState('error');
      } finally {
        if (inputRef.current) inputRef.current.value = '';
      }
      return;
    }

    // PDF or DOCX extraction requires Gemini API key
    if (!effectiveApiKey) {
      setState('need_key');
      return;
    }

    setState('reading');
    await processExtraction(file, effectiveApiKey);
    if (inputRef.current) inputRef.current.value = '';
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
      await processExtraction(selectedFile, trimmed);
    }
  };

  const triggerPick = () => inputRef.current?.click();

  const isBusy = state === 'reading' || state === 'extracting';
  const showProgressSteps = state === 'reading' || state === 'extracting' || state === 'done';

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.json,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/json"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Trigger button */}
      <button
        type="button"
        onClick={triggerPick}
        disabled={isBusy}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed
          bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs ${className}`}
        title="Import resume from PDF, DOCX, or JSON to prefill the editor"
      >
        {isBusy ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <FileUp className="w-3.5 h-3.5" />
        )}
        <span>Import Resume</span>
      </button>

      {/* Processing / Result Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-fade-in border border-slate-100">
            {/* Close button */}
            {!isBusy && (
              <button
                type="button"
                onClick={closeModal}
                className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Icon area */}
            <div className="flex justify-center mb-4">
              {state === 'done' ? (
                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
              ) : state === 'error' ? (
                <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-rose-500" />
                </div>
              ) : state === 'need_key' ? (
                <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
                  <Key className="w-7 h-7 text-amber-500" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-blue-500 animate-pulse" />
                </div>
              )}
            </div>

            {/* Title */}
            <h3 className="text-sm font-bold text-slate-900 text-center mb-1">
              {state === 'done'
                ? 'Resume Imported!'
                : state === 'error'
                ? 'Import Failed'
                : state === 'need_key'
                ? 'Gemini API Key Needed'
                : 'Importing Resume'}
            </h3>

            {/* File name pill */}
            {fileName && state !== 'error' && (
              <div className="flex items-center justify-center gap-1.5 mb-3">
                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-[11px] text-slate-500 truncate max-w-[220px]">{fileName}</span>
              </div>
            )}

            {/* Status message */}
            {state !== 'error' && state !== 'need_key' && (
              <p className="text-xs text-slate-500 text-center mb-2">
                {STATUS_MESSAGES[state]}
              </p>
            )}

            {/* API Key Prompt State */}
            {state === 'need_key' && (
              <div className="mt-3 space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed text-center">
                  To parse PDF and Word resumes with AI, provide a Gemini API key. It is stored locally in your browser.
                </p>
                <div className="space-y-1.5">
                  <input
                    type="password"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <div className="flex justify-end">
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      Get free key <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveApiKeyAndExtract}
                    disabled={!customApiKey.trim()}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
                  >
                    Save & Continue
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Progress bar */}
            {isBusy && (
              <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full animate-progress-indeterminate"
                  style={{ width: state === 'extracting' ? '75%' : '30%', transition: 'width 0.8s ease' }}
                />
              </div>
            )}

            {/* Progress Steps List */}
            {showProgressSteps && (
              <ul className="mt-4 space-y-2">
                {[
                  {
                    key: 'reading',
                    label: fileName.endsWith('.json') ? 'Reading JSON file' : 'Reading document file',
                  },
                  {
                    key: 'extracting',
                    label: fileName.endsWith('.json') ? 'Prefilling resume fields' : 'Extracting data with Gemini AI',
                  },
                ].map(({ key, label }) => {
                  const isActive = state === key;
                  const isDone =
                    (key === 'reading' && (state === 'extracting' || state === 'done')) ||
                    (key === 'extracting' && state === 'done');
                  return (
                    <li key={key} className="flex items-center gap-2 text-xs">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : isActive ? (
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-200 shrink-0" />
                      )}
                      <span
                        className={
                          isActive
                            ? 'text-slate-800 font-medium'
                            : isDone
                            ? 'text-slate-500'
                            : 'text-slate-400'
                        }
                      >
                        {label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Error Message + Retry */}
            {state === 'error' && (
              <div className="mt-2 space-y-3">
                <p className="text-xs text-rose-600 text-center leading-relaxed bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                  {errorMsg}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      closeModal();
                      setTimeout(triggerPick, 250);
                    }}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Success note */}
            {state === 'done' && (
              <p className="text-[11px] text-slate-500 text-center mt-3">
                All fields have been filled. You can now edit and customize your resume!
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
