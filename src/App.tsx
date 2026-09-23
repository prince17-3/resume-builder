/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  ResumeConfig,
  ResumeData,
  PersonalInfo,
  ExperienceItem,
  EducationItem,
  SkillCategory,
  ProjectItem,
  CertificationItem,
} from './types';
import {
  sampleResumeData,
  emptyResumeData,
  defaultResumeConfig,
  colorPresets,
} from './data/initialData';
import { generateResumePdf, triggerDirectDownload, PdfGenerationResult } from './utils/pdfGenerator';
import { ResumeDocument } from './components/ResumeDocument';
import { PersonalInfoEditor } from './components/ResumeEditor/PersonalInfoEditor';
import { ExperienceEditor } from './components/ResumeEditor/ExperienceEditor';
import { EducationEditor } from './components/ResumeEditor/EducationEditor';
import { SkillsEditor } from './components/ResumeEditor/SkillsEditor';
import { ProjectsEditor } from './components/ResumeEditor/ProjectsEditor';
import { CertificationsEditor } from './components/ResumeEditor/CertificationsEditor';
import { TemplateCustomizer } from './components/ResumeEditor/TemplateCustomizer';
import { PdfViewerModal } from './components/PdfViewerModal';
import { ResumeUploadButton } from './components/ResumeUploadButton';

import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  Palette,
  Download,
  Eye,
  RotateCcw,
  Printer,
  Sparkles,
  FileText,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
  Upload,
} from 'lucide-react';

type EditorTab =
  | 'personal'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'template';

const LOCAL_STORAGE_KEY_DATA = 'resume_builder_data_v1';
const LOCAL_STORAGE_KEY_CONFIG = 'resume_builder_config_v1';

export default function App() {
  // Initialize resume data from localStorage or sample
  const [data, setData] = useState<ResumeData>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_DATA);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return sampleResumeData;
  });

  // Initialize config
  const [config, setConfig] = useState<ResumeConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return defaultResumeConfig;
  });

  const [activeTab, setActiveTab] = useState<EditorTab>('personal');
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [zoomScale, setZoomScale] = useState<number>(0.85);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfResult, setPdfResult] = useState<PdfGenerationResult | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Hidden file input for JSON import
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Ref for the resume container to capture
  const resumeContainerRef = useRef<HTMLDivElement>(null);

  // Save to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_DATA, JSON.stringify(data));
    } catch {
      // ignore
    }
  }, [data]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch {
      // ignore
    }
  }, [config]);

  // Handle PDF Generation & View in Modal
  const handleViewPdf = async () => {
    if (!resumeContainerRef.current) {
      alert('Resume element not found.');
      return;
    }
    setIsGeneratingPdf(true);
    try {
      const result = await generateResumePdf(
        resumeContainerRef.current,
        data.personalInfo.fullName || 'Candidate'
      );
      setPdfResult(result);
      setIsPdfModalOpen(true);
    } catch (err) {
      console.error('Error generating PDF for preview:', err);
      alert('Unable to generate PDF preview. You can also click Print to Save as PDF directly.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Immediate Download PDF
  const handleImmediateDownload = async () => {
    if (!resumeContainerRef.current) {
      alert('Resume element not found.');
      return;
    }
    setIsGeneratingPdf(true);
    try {
      const result = await generateResumePdf(
        resumeContainerRef.current,
        data.personalInfo.fullName || 'Candidate'
      );
      result.download();
    } catch (err) {
      console.error('Error in direct download:', err);
      alert('Unable to generate PDF download. You can also click Print to Save as PDF directly.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Handle Direct Browser Print
  const handlePrint = () => {
    window.print();
  };

  // Reset to Sample Data
  const handleLoadSample = () => {
    setData(sampleResumeData);
    setConfig(defaultResumeConfig);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // Clear Form
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all resume details?')) {
      setData(emptyResumeData);
    }
  };

  // Handle parsed resume data from AI or file import
  const handleResumeImport = (imported: ResumeData, importedConfig?: ResumeConfig) => {
    setData(imported);
    if (importedConfig) setConfig(importedConfig);
    // Jump to personal info tab so the user sees the filled data immediately
    setActiveTab('personal');
  };

  // Export JSON backup
  const handleExportJson = () => {
    const jsonStr = JSON.stringify({ data, config }, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(data.personalInfo.fullName || 'Resume').replace(/\s+/g, '_')}_data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.data) setData(parsed.data);
        if (parsed.config) setConfig(parsed.config);
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const tabs: { id: EditorTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'personal', label: 'Personal', icon: <User className="w-4 h-4" /> },
    {
      id: 'experience',
      label: 'Experience',
      icon: <Briefcase className="w-4 h-4" />,
      badge: data.experiences.length,
    },
    {
      id: 'education',
      label: 'Education',
      icon: <GraduationCap className="w-4 h-4" />,
      badge: data.education.length,
    },
    {
      id: 'skills',
      label: 'Skills',
      icon: <Wrench className="w-4 h-4" />,
      badge: data.skillCategories.length,
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: <FolderGit2 className="w-4 h-4" />,
      badge: data.projects.length,
    },
    {
      id: 'certifications',
      label: 'Certs',
      icon: <Award className="w-4 h-4" />,
      badge: data.certifications.length,
    },
    { id: 'template', label: 'Template & Style', icon: <Palette className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans-clean">
      {/* Hidden file input for JSON import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportJson}
        accept=".json"
        className="hidden"
      />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900">
                  Resume Builder
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 hidden sm:inline-block">
                  PDF Ready
                </span>
              </div>
            </div>
          </div>

          {/* Quick utility actions & Main Export CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Load Sample / Reset */}
            <button
              type="button"
              onClick={handleLoadSample}
              className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              title="Fill with professional example data"
            >
              {copyFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">Loaded!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Sample Data</span>
                </>
              )}
            </button>

            {/* Import / Export JSON */}
            <div className="hidden lg:flex items-center gap-1 border-l pl-2 border-slate-200">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-slate-500 hover:text-slate-700 rounded-md hover:bg-slate-100"
                title="Import resume JSON"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleExportJson}
                className="p-1.5 text-slate-500 hover:text-slate-700 rounded-md hover:bg-slate-100"
                title="Backup / Export JSON"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Import Resume & Cache Manager */}
            <ResumeUploadButton
              onDataParsed={handleResumeImport}
              currentData={data}
              currentConfig={config}
              className="hidden sm:inline-flex"
            />

            {/* Print button */}
            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition"
              title="Print document directly"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </button>

            {/* View PDF Button */}
            <button
              type="button"
              disabled={isGeneratingPdf}
              onClick={handleViewPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs transition disabled:opacity-50"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isGeneratingPdf ? 'Generating...' : 'View PDF'}</span>
            </button>

            {/* Immediate Download PDF CTA */}
            <button
              type="button"
              disabled={isGeneratingPdf}
              onClick={handleImmediateDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Mobile View Toggle Switch */}
        <div className="flex md:hidden border-t border-slate-200 bg-slate-50 px-4 py-1.5 justify-center gap-2">
          <ResumeUploadButton
            onDataParsed={handleResumeImport}
            currentData={data}
            currentConfig={config}
            className="shrink-0"
          />
          <button
            type="button"
            onClick={() => setMobileView('editor')}
            className={`flex-1 py-1 text-xs font-semibold rounded-md transition ${
              mobileView === 'editor'
                ? 'bg-white shadow-2xs text-blue-600'
                : 'text-slate-600'
            }`}
          >
            Edit Details
          </button>
          <button
            type="button"
            onClick={() => setMobileView('preview')}
            className={`flex-1 py-1 text-xs font-semibold rounded-md transition ${
              mobileView === 'preview'
                ? 'bg-white shadow-2xs text-blue-600'
                : 'text-slate-600'
            }`}
          >
            Live Preview
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left Column: Editor Panel */}
        <div
          className={`md:col-span-6 lg:col-span-5 flex flex-col space-y-4 no-print ${
            mobileView === 'preview' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Section Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-2xs">
            <div className="flex flex-wrap gap-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isActive
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Section Form Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                {tabs.find((t) => t.id === activeTab)?.icon}
                <span>
                  {activeTab === 'personal' && 'Personal Information'}
                  {activeTab === 'experience' && 'Work Experience'}
                  {activeTab === 'education' && 'Education & Degrees'}
                  {activeTab === 'skills' && 'Skills & Competencies'}
                  {activeTab === 'projects' && 'Key Projects'}
                  {activeTab === 'certifications' && 'Certifications & Honors'}
                  {activeTab === 'template' && 'Template & Visual Styling'}
                </span>
              </h2>

              {activeTab !== 'template' && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[11px] text-slate-400 hover:text-rose-500 flex items-center gap-1"
                  title="Clear all fields"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {/* Tab Body */}
            <div>
              {activeTab === 'personal' && (
                <PersonalInfoEditor
                  info={data.personalInfo}
                  onChange={(updated) => setData({ ...data, personalInfo: updated })}
                />
              )}

              {activeTab === 'experience' && (
                <ExperienceEditor
                  experiences={data.experiences}
                  onChange={(updated) => setData({ ...data, experiences: updated })}
                />
              )}

              {activeTab === 'education' && (
                <EducationEditor
                  education={data.education}
                  onChange={(updated) => setData({ ...data, education: updated })}
                />
              )}

              {activeTab === 'skills' && (
                <SkillsEditor
                  skillCategories={data.skillCategories}
                  onChange={(updated) => setData({ ...data, skillCategories: updated })}
                />
              )}

              {activeTab === 'projects' && (
                <ProjectsEditor
                  projects={data.projects}
                  onChange={(updated) => setData({ ...data, projects: updated })}
                />
              )}

              {activeTab === 'certifications' && (
                <CertificationsEditor
                  certifications={data.certifications}
                  onChange={(updated) => setData({ ...data, certifications: updated })}
                />
              )}

              {activeTab === 'template' && (
                <TemplateCustomizer config={config} onChange={setConfig} />
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Resume Preview */}
        <div
          className={`md:col-span-6 lg:col-span-7 flex flex-col space-y-3 ${
            mobileView === 'editor' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Preview Controls Bar */}
          <div className="bg-white rounded-xl border border-slate-200 px-3.5 py-2 flex items-center justify-between shadow-2xs no-print">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">Live Preview</span>
              <span className="text-[11px] text-slate-400">• Standard A4</span>
              <span
                className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0 ml-1"
                style={{ backgroundColor: config.primaryColor }}
                title={`Accent: ${config.primaryColor}`}
              />
            </div>

            <div className="flex items-center gap-1.5">
              {/* Zoom Out */}
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.max(0.5, prev - 0.1))}
                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <span className="text-[11px] font-mono-code text-slate-600 w-12 text-center">
                {Math.round(zoomScale * 100)}%
              </span>

              {/* Zoom In */}
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.min(1.2, prev + 0.1))}
                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              {/* Reset to fit */}
              <button
                type="button"
                onClick={() => setZoomScale(0.8)}
                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded ml-1"
                title="Reset zoom"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scaled Preview Canvas Wrapper */}
          <div className="bg-slate-200/70 border border-slate-300/80 rounded-2xl p-4 sm:p-6 overflow-auto flex justify-center items-start min-h-[600px] max-h-[85vh]">
            <div
              style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
              }}
              className="shrink-0"
            >
              <ResumeDocument
                ref={resumeContainerRef}
                data={data}
                config={config}
              />
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer & Download Modal */}
      <PdfViewerModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        pdfResult={pdfResult}
        candidateName={data.personalInfo.fullName || 'Resume'}
      />
    </div>
  );
}
