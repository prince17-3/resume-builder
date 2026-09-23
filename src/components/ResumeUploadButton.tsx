/**
 * ResumeUploadButton.tsx
 *
 * A self-contained upload button that:
 *  1. Lets the user pick a PDF or DOCX resume
 *  2. Sends it to Gemini for structured extraction
 *  3. Calls onDataParsed with the resulting ResumeData
 *
 * Shows a modal overlay with status during processing and an error
 * state with a retry option if something goes wrong.
 */

import React, { useRef, useState } from 'react';
import { ResumeData } from '../types';
import { parseResumeFile, isSupportedResumeFile } from '../utils/resumeParser';
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  X,
  Sparkles,
  FileUp,
} from 'lucide-react';

interface Props {
  onDataParsed: (data: ResumeData) => void;
  /** Optional extra className on the trigger button */
  className?: string;
}

type UploadState = 'idle' | 'reading' | 'extracting' | 'done' | 'error';

const STATUS_MESSAGES: Record<UploadState, string> = {
  idle: '',
  reading: 'Reading file…',
  extracting: 'Extracting resume data with AI…',
  done: 'Data extracted successfully!',
  error: '',
};

export const ResumeUploadButton: React.FC<Props> = ({ onDataParsed, className = '' }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [fileName, setFileName] = useState('');
  const [showModal, setShowModal] = useState(false);

  // __GEMINI_API_KEY__ is injected at build/dev time by vite.config.ts —
  // it resolves VITE_GEMINI_API_KEY or GEMINI_API_KEY (AI Studio environments)
  const apiKey = (typeof __GEMINI_API_KEY__ !== 'undefined' ? __GEMINI_API_KEY__ : '');

  const reset = () => {
    setState('idle');
    setErrorMsg('');
    setFileName('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const closeModal = () => {
    setShowModal(false);
    // Small delay so modal fades before state resets
    setTimeout(reset, 200);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isSupportedResumeFile(file)) {
      setErrorMsg('Unsupported file type. Please upload a PDF or DOCX file.');
      setState('error');
      setShowModal(true);
      return;
    }

    setFileName(file.name);
    setShowModal(true);
    setState('reading');
    setErrorMsg('');

    try {
      setState('extracting');
      const parsed = await parseResumeFile(file, apiKey);
      setState('done');
      // Brief pause so the user sees the success state before modal closes
      setTimeout(() => {
        onDataParsed(parsed);
        closeModal();
      }, 1200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMsg(msg);
      setState('error');
    } finally {
      // Always clear the file input so the same file can be re-selected
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const triggerPick = () => inputRef.current?.click();

  const isProcessing = state === 'reading' || state === 'extracting';

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Trigger button */}
      <button
        type="button"
        onClick={triggerPick}
        disabled={isProcessing}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed
          bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs ${className}`}
        title="Upload an existing resume to auto-fill all fields"
      >
        {isProcessing ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <FileUp className="w-3.5 h-3.5" />
        )}
        <span>Import Resume</span>
      </button>

      {/* Processing / result modal overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-fade-in">
            {/* Close — only when not processing */}
            {!isProcessing && (
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
            {state !== 'error' && (
              <p className="text-xs text-slate-500 text-center mb-2">
                {STATUS_MESSAGES[state]}
              </p>
            )}

            {/* Progress bar (visible while processing) */}
            {isProcessing && (
              <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full animate-progress-indeterminate"
                  style={{ width: state === 'extracting' ? '75%' : '30%', transition: 'width 0.8s ease' }}
                />
              </div>
            )}

            {/* Steps list (visible while processing) */}
            {isProcessing && (
              <ul className="mt-4 space-y-2">
                {[
                  { key: 'reading', label: 'Reading file' },
                  { key: 'extracting', label: 'Extracting data with Gemini AI' },
                ].map(({ key, label }) => {
                  const isActive = state === key;
                  const isDone =
                    (key === 'reading' && state === 'extracting') ||
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
                            ? 'text-slate-500 line-through'
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

            {/* Error message + retry */}
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
                      // Re-open file picker after modal close animation
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
              <p className="text-[11px] text-slate-400 text-center mt-3">
                All fields have been filled — review and edit as needed.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
