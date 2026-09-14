import React, { useState } from 'react';
import { ExperienceItem } from '../../types';
import { Plus, Trash2, ChevronDown, ChevronUp, Briefcase, Sparkles } from 'lucide-react';

interface Props {
  experiences: ExperienceItem[];
  onChange: (updated: ExperienceItem[]) => void;
}

const ACTION_BULLET_SUGGESTIONS = [
  'Spearheaded the design and delivery of key user-facing features, boosting engagement by 25%.',
  'Collaborated cross-functionally with product, design, and QA to streamline sprints and reduce bugs.',
  'Refactored legacy workflows, achieving a 40% reduction in processing latency and memory footprint.',
  'Mentored junior team members, conducted thorough code reviews, and fostered engineering best practices.',
  'Architected automated test suites and continuous delivery pipelines, resulting in 99.9% uptime.',
];

export const ExperienceEditor: React.FC<Props> = ({ experiences, onChange }) => {
  const [expandedId, setExpandedId] = useState<string | null>(experiences[0]?.id || null);

  const handleAdd = () => {
    const newItem: ExperienceItem = {
      id: 'exp_' + Date.now(),
      jobTitle: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      highlights: ['Led initiatives to improve operational efficiency and team productivity.'],
    };
    onChange([newItem, ...experiences]);
    setExpandedId(newItem.id);
  };

  const handleRemove = (id: string) => {
    onChange(experiences.filter((item) => item.id !== id));
  };

  const handleUpdate = (id: string, updates: Partial<ExperienceItem>) => {
    onChange(
      experiences.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= experiences.length) return;
    const copy = [...experiences];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    onChange(copy);
  };

  const handleAddBullet = (expId: string, customText?: string) => {
    const exp = experiences.find((e) => e.id === expId);
    if (!exp) return;
    const newBullet = customText || '';
    handleUpdate(expId, { highlights: [...exp.highlights, newBullet] });
  };

  const handleUpdateBullet = (expId: string, bulletIdx: number, text: string) => {
    const exp = experiences.find((e) => e.id === expId);
    if (!exp) return;
    const newHighlights = [...exp.highlights];
    newHighlights[bulletIdx] = text;
    handleUpdate(expId, { highlights: newHighlights });
  };

  const handleRemoveBullet = (expId: string, bulletIdx: number) => {
    const exp = experiences.find((e) => e.id === expId);
    if (!exp) return;
    handleUpdate(expId, {
      highlights: exp.highlights.filter((_, idx) => idx !== bulletIdx),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-500">
          List your career positions in reverse chronological order.
        </p>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Position
        </button>
      </div>

      {experiences.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
          <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500">No work experiences added yet.</p>
          <button
            type="button"
            onClick={handleAdd}
            className="mt-2 text-xs text-blue-600 font-semibold hover:underline"
          >
            + Add your first position
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {experiences.map((exp, index) => {
            const isExpanded = expandedId === exp.id;
            return (
              <div
                key={exp.id}
                className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs transition"
              >
                {/* Accordion header */}
                <div
                  className="px-3.5 py-2.5 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {index + 1}
                    </span>
                    <div className="truncate">
                      <span className="text-xs font-bold text-slate-800">
                        {exp.jobTitle || 'Untitled Position'}
                      </span>
                      {exp.company && (
                        <span className="text-xs text-slate-500 ml-1.5">
                          at {exp.company}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'up')}
                      className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                      title="Move up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === experiences.length - 1}
                      onClick={() => handleMove(index, 'down')}
                      className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                      title="Move down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(exp.id)}
                      className="p-1 text-rose-500 hover:text-rose-700 ml-1"
                      title="Delete position"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="p-3.5 space-y-3 border-t border-slate-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Job Title <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={exp.jobTitle}
                          onChange={(e) => handleUpdate(exp.id, { jobTitle: e.target.value })}
                          placeholder="e.g. Senior Software Engineer"
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Company / Organization <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleUpdate(exp.id, { company: e.target.value })}
                          placeholder="e.g. Acme Corp"
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => handleUpdate(exp.id, { location: e.target.value })}
                          placeholder="e.g. San Francisco, CA (or Remote)"
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[11px] font-semibold text-slate-700">Dates</label>
                          <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={exp.current}
                              onChange={(e) => handleUpdate(exp.id, { current: e.target.checked })}
                              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                            />
                            <span>Present</span>
                          </label>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) => handleUpdate(exp.id, { startDate: e.target.value })}
                            placeholder="Start (e.g. 2021)"
                            className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            disabled={exp.current}
                            value={exp.current ? 'Present' : exp.endDate}
                            onChange={(e) => handleUpdate(exp.id, { endDate: e.target.value })}
                            placeholder="End (e.g. 2023)"
                            className={`text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              exp.current ? 'bg-slate-100 text-slate-400' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bullet Points / Achievements */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[11px] font-semibold text-slate-700">
                          Key Achievements & Bullet Points
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddBullet(exp.id)}
                          className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Bullet
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {exp.highlights.map((bullet, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-1.5">
                            <span className="text-slate-400 mt-2 text-[10px]">•</span>
                            <textarea
                              rows={2}
                              value={bullet}
                              onChange={(e) => handleUpdateBullet(exp.id, bIdx, e.target.value)}
                              placeholder="Action verb + quantifiable achievement..."
                              className="flex-1 text-xs px-2 py-1 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 leading-snug"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveBullet(exp.id, bIdx)}
                              className="text-slate-300 hover:text-rose-500 p-1 mt-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Quick Suggestions Helper */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 bg-slate-50/50 p-2 rounded-lg">
                        <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 mb-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          Quick bullet templates:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {ACTION_BULLET_SUGGESTIONS.slice(0, 3).map((suggestion, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => handleAddBullet(exp.id, suggestion)}
                              className="text-[10px] bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-600 px-2 py-0.5 rounded text-left transition truncate max-w-xs"
                            >
                              + {suggestion.slice(0, 45)}...
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
