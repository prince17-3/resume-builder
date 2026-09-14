import React from 'react';
import { PersonalInfo } from '../../types';
import { User, Mail, Phone, MapPin, Globe, Linkedin, Github, FileText } from 'lucide-react';

interface Props {
  info: PersonalInfo;
  onChange: (updated: PersonalInfo) => void;
}

export const PersonalInfoEditor: React.FC<Props> = ({ info, onChange }) => {
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({
      ...info,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={info.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            placeholder="e.g. Jane Doe"
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Professional Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={info.jobTitle}
            onChange={(e) => handleChange('jobTitle', e.target.value)}
            placeholder="e.g. Senior Product Designer"
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            Email Address <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            value={info.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="jane.doe@example.com"
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            Phone Number
          </label>
          <input
            type="tel"
            value={info.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            Location (City, Country/State)
          </label>
          <input
            type="text"
            value={info.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="New York, NY or London, UK"
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            Website / Portfolio
          </label>
          <input
            type="url"
            value={info.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="https://janedoe.me"
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Linkedin className="w-3.5 h-3.5 text-slate-400" />
            LinkedIn Profile
          </label>
          <input
            type="text"
            value={info.linkedin || ''}
            onChange={(e) => handleChange('linkedin', e.target.value)}
            placeholder="linkedin.com/in/janedoe"
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Github className="w-3.5 h-3.5 text-slate-400" />
            GitHub / Portfolio Profile
          </label>
          <input
            type="text"
            value={info.github || ''}
            onChange={(e) => handleChange('github', e.target.value)}
            placeholder="github.com/janedoe"
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
          <span>Executive Summary / Bio</span>
          <span className="text-[11px] text-slate-400 font-normal">2-4 concise sentences recommended</span>
        </label>
        <textarea
          rows={3}
          value={info.summary}
          onChange={(e) => handleChange('summary', e.target.value)}
          placeholder="Briefly state your core expertise, career highlights, and what you bring to high-impact teams..."
          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white leading-relaxed"
        />
      </div>
    </div>
  );
};
