import React from 'react';
import { EducationItem } from '../../types';
import { Plus, Trash2, GraduationCap } from 'lucide-react';

interface Props {
  education: EducationItem[];
  onChange: (updated: EducationItem[]) => void;
}

export const EducationEditor: React.FC<Props> = ({ education, onChange }) => {
  const handleAdd = () => {
    const newItem: EducationItem = {
      id: 'edu_' + Date.now(),
      degree: '',
      institution: '',
      location: '',
      startYear: '',
      endYear: '',
      gpa: '',
      honors: '',
    };
    onChange([...education, newItem]);
  };

  const handleRemove = (id: string) => {
    onChange(education.filter((item) => item.id !== id));
  };

  const handleUpdate = (id: string, updates: Partial<EducationItem>) => {
    onChange(
      education.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-500">Add your degrees, universities, or academic courses.</p>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Education
        </button>
      </div>

      {education.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
          <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
          <p className="text-xs text-slate-500">No education entries added.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {education.map((edu) => (
            <div key={edu.id} className="p-3.5 border border-slate-200 rounded-xl bg-white space-y-3 shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  {edu.degree || 'Degree / Certificate'}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(edu.id)}
                  className="text-rose-500 hover:text-rose-700 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Degree / Field of Study <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleUpdate(edu.id, { degree: e.target.value })}
                    placeholder="e.g. B.S. in Computer Science"
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Institution / University <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => handleUpdate(edu.id, { institution: e.target.value })}
                    placeholder="e.g. Stanford University"
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Location</label>
                  <input
                    type="text"
                    value={edu.location}
                    onChange={(e) => handleUpdate(edu.id, { location: e.target.value })}
                    placeholder="e.g. Stanford, CA"
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Start Year</label>
                    <input
                      type="text"
                      value={edu.startYear}
                      onChange={(e) => handleUpdate(edu.id, { startYear: e.target.value })}
                      placeholder="2016"
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Graduation</label>
                    <input
                      type="text"
                      value={edu.endYear}
                      onChange={(e) => handleUpdate(edu.id, { endYear: e.target.value })}
                      placeholder="2020"
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">GPA (Optional)</label>
                  <input
                    type="text"
                    value={edu.gpa || ''}
                    onChange={(e) => handleUpdate(edu.id, { gpa: e.target.value })}
                    placeholder="e.g. 3.9 / 4.0"
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Honors / Minors</label>
                  <input
                    type="text"
                    value={edu.honors || ''}
                    onChange={(e) => handleUpdate(edu.id, { honors: e.target.value })}
                    placeholder="e.g. Magna Cum Laude"
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
