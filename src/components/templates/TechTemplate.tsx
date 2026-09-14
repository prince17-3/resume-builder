import React from 'react';
import { ResumeConfig, ResumeData } from '../../types';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, ExternalLink } from 'lucide-react';

interface TemplateProps {
  data: ResumeData;
  config: ResumeConfig;
}

export const TechTemplate: React.FC<TemplateProps> = ({ data, config }) => {
  const { personalInfo, experiences, education, skillCategories, projects, certifications } = data;
  const { primaryColor, spacing, showIcons } = config;

  const itemSpacing = spacing === 'compact' ? 'space-y-2' : 'space-y-3';

  return (
    <div className="w-full bg-white text-slate-800 text-xs space-y-4">
      {/* Terminal / Tech Style Header */}
      <header className="border-l-4 pl-3 py-1" style={{ borderColor: primaryColor }}>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-mono-code">
              {personalInfo.fullName || 'Dev Candidate'}
            </h1>
            <p className="text-sm font-semibold tracking-wide font-mono-code mt-0.5" style={{ color: primaryColor }}>
              // {personalInfo.jobTitle || 'Full Stack Engineer'}
            </p>
          </div>
          {personalInfo.location && (
            <div className="text-slate-500 font-mono-code text-[11px] mt-1 sm:mt-0 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              {personalInfo.location}
            </div>
          )}
        </div>

        {/* Links bar */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px] font-mono-code text-slate-600">
          {personalInfo.email && (
            <span className="flex items-center gap-1">
              {showIcons && <Mail className="w-3 h-3 text-slate-400" />}
              {personalInfo.email}
            </span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1">
              {showIcons && <Phone className="w-3 h-3 text-slate-400" />}
              {personalInfo.phone}
            </span>
          )}
          {personalInfo.github && (
            <span className="flex items-center gap-1">
              {showIcons && <Github className="w-3 h-3 text-slate-400" />}
              {personalInfo.github.replace(/^https?:\/\//, '')}
            </span>
          )}
          {personalInfo.linkedin && (
            <span className="flex items-center gap-1">
              {showIcons && <Linkedin className="w-3 h-3 text-slate-400" />}
              {personalInfo.linkedin.replace(/^https?:\/\//, '')}
            </span>
          )}
          {personalInfo.website && (
            <span className="flex items-center gap-1">
              {showIcons && <Globe className="w-3 h-3 text-slate-400" />}
              {personalInfo.website.replace(/^https?:\/\//, '')}
            </span>
          )}
        </div>

        {personalInfo.summary && (
          <p className="mt-2.5 text-xs leading-relaxed text-slate-700">
            {personalInfo.summary}
          </p>
        )}
      </header>

      {/* Technical Skills Box */}
      {skillCategories.length > 0 && (
        <section className="bg-slate-50 p-2.5 rounded border border-slate-200">
          <div className="text-[11px] font-bold font-mono-code uppercase tracking-wider mb-2 text-slate-700 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
            Tech Stack & Core Capabilities
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {skillCategories.map((cat) => (
              <div key={cat.id} className="flex flex-col">
                <span className="font-semibold text-slate-800 text-[11px] font-mono-code">{cat.name}:</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {cat.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono-code text-slate-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {experiences.length > 0 && (
        <section>
          <h2 className="text-xs font-bold font-mono-code uppercase tracking-wider pb-1 mb-2 border-b border-slate-200 flex items-center justify-between text-slate-900">
            <span>// Work Experience</span>
          </h2>
          <div className={itemSpacing}>
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-sm">{exp.jobTitle}</span>
                  <span className="font-mono-code text-[11px] text-slate-500">
                    [{exp.startDate} – {exp.current ? 'Present' : exp.endDate}]
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600 font-medium mb-1">
                  <span style={{ color: primaryColor }}>{exp.company}</span>
                  {exp.location && <span className="text-[11px] text-slate-400">{exp.location}</span>}
                </div>
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="list-disc list-outside ml-4 space-y-1 text-slate-700">
                    {exp.highlights.map((bullet, idx) => (
                      <li key={idx} className="leading-snug">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section>
          <h2 className="text-xs font-bold font-mono-code uppercase tracking-wider pb-1 mb-2 border-b border-slate-200 text-slate-900">
            <span>// Open Source & Featured Projects</span>
          </h2>
          <div className={itemSpacing}>
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline font-semibold text-slate-900">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold">{proj.title}</span>
                    {proj.role && <span className="font-normal text-xs text-slate-500">[{proj.role}]</span>}
                  </div>
                  {proj.link && (
                    <span className="text-[11px] font-mono-code text-slate-500 flex items-center gap-0.5">
                      {proj.link.replace(/^https?:\/\//, '')}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 my-1">
                    {proj.technologies.map((t, idx) => (
                      <span key={idx} className="text-[10px] font-mono-code text-slate-600 bg-slate-100 px-1 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
                {proj.description && <p className="text-slate-700 leading-snug">{proj.description}</p>}
                {proj.highlights && proj.highlights.length > 0 && (
                  <ul className="list-disc list-outside ml-4 mt-0.5 space-y-0.5 text-slate-700">
                    {proj.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education & Certifications */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {education.length > 0 && (
          <section>
            <h2 className="text-xs font-bold font-mono-code uppercase tracking-wider pb-1 mb-2 border-b border-slate-200 text-slate-900">
              // Education
            </h2>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="font-semibold text-slate-900">{edu.degree}</div>
                  <div className="text-slate-600">{edu.institution}</div>
                  <div className="text-[11px] font-mono-code text-slate-500 mt-0.5">
                    {edu.startYear} – {edu.endYear} {edu.gpa && `| GPA ${edu.gpa}`}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {certifications.length > 0 && (
          <section>
            <h2 className="text-xs font-bold font-mono-code uppercase tracking-wider pb-1 mb-2 border-b border-slate-200 text-slate-900">
              // Certifications
            </h2>
            <div className="space-y-1.5">
              {certifications.map((cert) => (
                <div key={cert.id} className="flex justify-between items-baseline">
                  <span className="font-medium text-slate-900">{cert.name}</span>
                  <span className="font-mono-code text-[11px] text-slate-500">{cert.issueDate}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
