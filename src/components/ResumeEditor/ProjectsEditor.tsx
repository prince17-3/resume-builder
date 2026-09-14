import React, { useState } from 'react';
import { ProjectItem } from '../../types';
import { Plus, Trash2, FolderGit2, X } from 'lucide-react';

interface Props {
  projects: ProjectItem[];
  onChange: (updated: ProjectItem[]) => void;
}

export const ProjectsEditor: React.FC<Props> = ({ projects, onChange }) => {
  const [techInputs, setTechInputs] = useState<Record<string, string>>({});

  const handleAdd = () => {
    const newProj: ProjectItem = {
      id: 'proj_' + Date.now(),
      title: '',
      role: '',
      technologies: ['React', 'TypeScript'],
      link: '',
      github: '',
      description: '',
      highlights: ['Built key product architecture and improved core metrics.'],
    };
    onChange([...projects, newProj]);
  };

  const handleRemove = (id: string) => {
    onChange(projects.filter((p) => p.id !== id));
  };

  const handleUpdate = (id: string, updates: Partial<ProjectItem>) => {
    onChange(projects.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const handleAddTech = (projId: string) => {
    const raw = (techInputs[projId] || '').trim();
    if (!raw) return;
    const proj = projects.find((p) => p.id === projId);
    if (!proj) return;
    const items = raw.split(',').map((t) => t.trim()).filter(Boolean);
    handleUpdate(projId, { technologies: [...proj.technologies, ...items] });
    setTechInputs((prev) => ({ ...prev, [projId]: '' }));
  };

  const handleRemoveTech = (projId: string, index: number) => {
    const proj = projects.find((p) => p.id === projId);
    if (!proj) return;
    handleUpdate(projId, {
      technologies: proj.technologies.filter((_, idx) => idx !== index),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-500">Showcase your notable open-source, client, or personal projects.</p>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
          <FolderGit2 className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
          <p className="text-xs text-slate-500">No projects added yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((proj) => (
            <div key={proj.id} className="p-3.5 border border-slate-200 rounded-xl bg-white space-y-3 shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FolderGit2 className="w-3.5 h-3.5 text-blue-600" />
                  {proj.title || 'Untitled Project'}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(proj.id)}
                  className="text-rose-500 hover:text-rose-700 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Project Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={proj.title}
                    onChange={(e) => handleUpdate(proj.id, { title: e.target.value })}
                    placeholder="e.g. Distributed Analytics Suite"
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Role (Optional)</label>
                  <input
                    type="text"
                    value={proj.role || ''}
                    onChange={(e) => handleUpdate(proj.id, { role: e.target.value })}
                    placeholder="e.g. Creator & Lead Engineer"
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Live Demo URL</label>
                  <input
                    type="text"
                    value={proj.link || ''}
                    onChange={(e) => handleUpdate(proj.id, { link: e.target.value })}
                    placeholder="https://myproject.com"
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">GitHub / Source Repo</label>
                  <input
                    type="text"
                    value={proj.github || ''}
                    onChange={(e) => handleUpdate(proj.id, { github: e.target.value })}
                    placeholder="github.com/user/project"
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Description</label>
                <textarea
                  rows={2}
                  value={proj.description}
                  onChange={(e) => handleUpdate(proj.id, { description: e.target.value })}
                  placeholder="Summary of what the project solves and its key features..."
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 leading-snug"
                />
              </div>

              {/* Technologies Tag List */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Technologies Used</label>
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {proj.technologies.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-medium rounded"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(proj.id, tIdx)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={techInputs[proj.id] || ''}
                    onChange={(e) =>
                      setTechInputs((prev) => ({ ...prev, [proj.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTech(proj.id);
                      }
                    }}
                    placeholder="Add technology (e.g. Next.js, Redis)..."
                    className="flex-1 text-xs px-2.5 py-1 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTech(proj.id)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
