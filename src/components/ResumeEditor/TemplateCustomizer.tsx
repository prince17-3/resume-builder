import React from 'react';
import { FontStyle, ResumeConfig, SpacingMode, TemplateId } from '../../types';
import { colorPresets } from '../../data/initialData';
import { LayoutTemplate, Palette, Type, AlignJustify } from 'lucide-react';

interface Props {
  config: ResumeConfig;
  onChange: (updated: ResumeConfig) => void;
}

const TEMPLATES: { id: TemplateId; name: string; tag: string; desc: string }[] = [
  {
    id: 'modern',
    name: 'Modern Clean',
    tag: 'Popular',
    desc: 'Structured contemporary layout with crisp headers and clean section dividers.',
  },
  {
    id: 'executive',
    name: 'Executive Classic',
    tag: 'Formal',
    desc: 'Traditional centered masthead with serif typography suited for corporate leaders.',
  },
  {
    id: 'creative',
    name: 'Creative Studio',
    tag: 'Modern',
    desc: 'Sidebar layout with dedicated contact & skills panel for designers & specialists.',
  },
  {
    id: 'tech',
    name: 'Tech Grid',
    tag: 'Engineers',
    desc: 'Developer-focused layout with monospace accents, stack tags, and repo links.',
  },
  {
    id: 'nordic',
    name: 'Nordic Minimalist',
    tag: 'Minimal',
    desc: 'Airy Scandinavian aesthetic focusing on generous whitespace and light geometry.',
  },
];

const FONT_OPTIONS: { id: FontStyle; name: string; preview: string; fontClass: string }[] = [
  { id: 'sans', name: 'Sans-Serif', preview: 'Clean & Contemporary', fontClass: 'font-sans-clean' },
  { id: 'serif', name: 'Editorial Serif', preview: 'Formal & Prestigious', fontClass: 'font-serif-elegant' },
  { id: 'mono', name: 'Technical Mono', preview: 'Developer & Precision', fontClass: 'font-mono-code' },
];

const SPACING_OPTIONS: { id: SpacingMode; label: string; desc: string }[] = [
  { id: 'compact', label: 'Compact', desc: 'Fits more content per page' },
  { id: 'normal', label: 'Balanced', desc: 'Standard balanced spacing' },
  { id: 'spacious', label: 'Spacious', desc: 'Generous breathable layout' },
];

export const TemplateCustomizer: React.FC<Props> = ({ config, onChange }) => {
  const update = (patch: Partial<ResumeConfig>) => {
    onChange({ ...config, ...patch });
  };

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div>
        <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
          <LayoutTemplate className="w-3.5 h-3.5 text-blue-600" />
          Choose Resume Template
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {TEMPLATES.map((tmpl) => {
            const isSelected = config.templateId === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => update({ templateId: tmpl.id })}
                className={`p-3 rounded-xl text-left border transition relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{tmpl.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tmpl.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{tmpl.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accent Color Selection */}
      <div>
        <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-blue-600" />
          Accent Color
        </label>
        <div className="flex flex-wrap items-center gap-2.5">
          {colorPresets.map((preset) => {
            const isSelected = config.primaryColor.toLowerCase() === preset.value.toLowerCase();
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => update({ primaryColor: preset.value })}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
                  isSelected
                    ? 'border-slate-800 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: preset.value }}
                />
                <span>{preset.name}</span>
              </button>
            );
          })}

          {/* Custom Color Input */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-lg">
            <span className="text-[11px] text-slate-500 font-medium">Custom:</span>
            <input
              type="color"
              value={config.primaryColor}
              onChange={(e) => update({ primaryColor: e.target.value })}
              className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Typography Style */}
      <div>
        <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-blue-600" />
          Font Family
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {FONT_OPTIONS.map((f) => {
            const isSelected = config.fontStyle === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => update({ fontStyle: f.id })}
                className={`p-2.5 rounded-xl border text-left transition ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">{f.name}</div>
                <div className={`text-[11px] text-slate-500 mt-0.5 ${f.fontClass}`}>{f.preview}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Layout Density & Icons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-200">
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
            <AlignJustify className="w-3.5 h-3.5 text-blue-600" />
            Page Spacing
          </label>
          <div className="flex gap-1.5">
            {SPACING_OPTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => update({ spacing: s.id })}
                className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg border text-center transition ${
                  config.spacing === s.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">Contact Icons</label>
          <label className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={config.showIcons}
              onChange={(e) => update({ showIcons: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
            />
            <span className="text-xs text-slate-700">Display mini contact icons in header</span>
          </label>
        </div>
      </div>
    </div>
  );
};
