import React, { useState } from 'react';
import { SkillCategory } from '../../types';
import { Plus, Trash2, X, Wrench } from 'lucide-react';

interface Props {
  skillCategories: SkillCategory[];
  onChange: (updated: SkillCategory[]) => void;
}

export const SkillsEditor: React.FC<Props> = ({ skillCategories, onChange }) => {
  const [newSkillInputs, setNewSkillInputs] = useState<Record<string, string>>({});

  const handleAddCategory = () => {
    const newCat: SkillCategory = {
      id: 'cat_' + Date.now(),
      name: 'New Skill Category',
      skills: ['Skill 1', 'Skill 2'],
    };
    onChange([...skillCategories, newCat]);
  };

  const handleRemoveCategory = (id: string) => {
    onChange(skillCategories.filter((c) => c.id !== id));
  };

  const handleUpdateCategoryName = (id: string, name: string) => {
    onChange(
      skillCategories.map((c) => (c.id === id ? { ...c, name } : c))
    );
  };

  const handleAddSkill = (catId: string) => {
    const raw = (newSkillInputs[catId] || '').trim();
    if (!raw) return;
    const cat = skillCategories.find((c) => c.id === catId);
    if (!cat) return;

    // Split by comma if user pasted multiple
    const splitSkills = raw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !cat.skills.includes(s));

    onChange(
      skillCategories.map((c) =>
        c.id === catId ? { ...c, skills: [...c.skills, ...splitSkills] } : c
      )
    );
    setNewSkillInputs((prev) => ({ ...prev, [catId]: '' }));
  };

  const handleRemoveSkill = (catId: string, skillIdx: number) => {
    onChange(
      skillCategories.map((c) =>
        c.id === catId
          ? { ...c, skills: c.skills.filter((_, idx) => idx !== skillIdx) }
          : c
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-500">Group your skills into clear, targeted categories.</p>
        <button
          type="button"
          onClick={handleAddCategory}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Category
        </button>
      </div>

      {skillCategories.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
          <Wrench className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
          <p className="text-xs text-slate-500">No skill categories added.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {skillCategories.map((cat) => (
            <div key={cat.id} className="p-3.5 border border-slate-200 rounded-xl bg-white space-y-2.5 shadow-xs">
              <div className="flex justify-between items-center gap-2">
                <input
                  type="text"
                  value={cat.name}
                  onChange={(e) => handleUpdateCategoryName(cat.id, e.target.value)}
                  placeholder="Category Name (e.g. Programming Languages)"
                  className="text-xs font-bold text-slate-800 px-2 py-1 border border-transparent hover:border-slate-200 focus:border-blue-500 rounded focus:outline-none flex-1"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(cat.id)}
                  className="text-rose-500 hover:text-rose-700 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap items-center gap-1.5">
                {cat.skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-md transition"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(cat.id, sIdx)}
                      className="text-slate-400 hover:text-rose-600 ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Input for adding new skills */}
              <div className="flex gap-1.5 pt-1">
                <input
                  type="text"
                  value={newSkillInputs[cat.id] || ''}
                  onChange={(e) =>
                    setNewSkillInputs((prev) => ({ ...prev, [cat.id]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(cat.id);
                    }
                  }}
                  placeholder="Type a skill and press Enter (or comma-separated)..."
                  className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill(cat.id)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
