import React from 'react';
import { ResumeConfig, ResumeData } from '../../types';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Calendar } from 'lucide-react';

interface TemplateProps {
  data: ResumeData;
  config: ResumeConfig;
}

export const ModernTemplate: React.FC<TemplateProps> = ({ data, config }) => {
  const { personalInfo, experiences, education, skillCategories, projects, certifications } = data;
  const { primaryColor, spacing, showIcons } = config;

  const spacingClass =
    spacing === 'compact' ? 'space-y-4' : spacing === 'spacious' ? 'space-y-7' : 'space-y-5';
  const itemSpacing = spacing === 'compact' ? 'space-y-3' : 'space-y-4';

  return (
    <div className={`w-full bg-white text-slate-800 ${spacingClass}`}>
      {/* Header */}
      <header className="border-b pb-4 border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {personalInfo.fullName || 'Your Full Name'}
            </h1>
            <p className="text-lg font-medium mt-1" style={{ color: primaryColor }}>
              {personalInfo.jobTitle || 'Your Professional Title'}
            </p>
          </div>
        </div>

        {/* Contact details */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-600">
          {personalInfo.email && (
            <span className="flex items-center gap-1">
              {showIcons && <Mail className="w-3.5 h-3.5 text-slate-400" />}
              {personalInfo.email}
            </span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1">
              {showIcons && <Phone className="w-3.5 h-3.5 text-slate-400" />}
              {personalInfo.phone}
            </span>
          )}
          {personalInfo.location && (
            <span className="flex items-center gap-1">
              {showIcons && <MapPin className="w-3.5 h-3.5 text-slate-400" />}
              {personalInfo.location}
            </span>
          )}
          {personalInfo.website && (
            <span className="flex items-center gap-1">
              {showIcons && <Globe className="w-3.5 h-3.5 text-slate-400" />}
              {personalInfo.website.replace(/^https?:\/\//, '')}
            </span>
          )}
          {personalInfo.linkedin && (
            <span className="flex items-center gap-1">
              {showIcons && <Linkedin className="w-3.5 h-3.5 text-slate-400" />}
              {personalInfo.linkedin.replace(/^https?:\/\//, '')}
            </span>
          )}
          {personalInfo.github && (
            <span className="flex items-center gap-1">
              {showIcons && <Github className="w-3.5 h-3.5 text-slate-400" />}
              {personalInfo.github.replace(/^https?:\/\//, '')}
            </span>
          )}
        </div>

        {/* Summary */}
        {personalInfo.summary && (
          <p className="mt-3 text-xs leading-relaxed text-slate-700">
            {personalInfo.summary}
          </p>
        )}
      </header>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 gap-5">
        {/* Experience */}
        {experiences.length > 0 && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 mb-3 border-b flex items-center gap-2"
              style={{ color: primaryColor, borderColor: `${primaryColor}30` }}
            >
              <span>Work Experience</span>
            </h2>

            <div className={itemSpacing}>
              {experiences.map((exp) => (
                <div key={exp.id} className="text-xs" data-pdf-block="true">
                  <div className="flex justify-between items-baseline">
                    <div className="font-semibold text-slate-900 text-sm">{exp.jobTitle}</div>
                    <div className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 mb-1.5 font-medium">
                    <span>{exp.company}</span>
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
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 mb-3 border-b flex items-center gap-2"
              style={{ color: primaryColor, borderColor: `${primaryColor}30` }}
            >
              <span>Key Projects</span>
            </h2>

            <div className={itemSpacing}>
              {projects.map((proj) => (
                <div key={proj.id} className="text-xs" data-pdf-block="true">
                  <div className="flex justify-between items-baseline">
                    <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                      <span>{proj.title}</span>
                      {proj.role && <span className="text-slate-500 font-normal text-xs">({proj.role})</span>}
                    </div>
                    {(proj.link || proj.github) && (
                      <span className="text-[11px] text-slate-500">
                        {proj.link ? proj.link.replace(/^https?:\/\//, '') : proj.github}
                      </span>
                    )}
                  </div>

                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 my-1">
                      {proj.technologies.map((t, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {proj.description && (
                    <p className="text-slate-700 leading-snug mb-1">{proj.description}</p>
                  )}

                  {proj.highlights && proj.highlights.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700">
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

        {/* Education & Skills in 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Education */}
          {education.length > 0 && (
            <section>
              <h2
                className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b"
                style={{ color: primaryColor, borderColor: `${primaryColor}30` }}
              >
                Education
              </h2>
              <div className="space-y-2 text-xs">
                {education.map((edu) => (
                  <div key={edu.id} data-pdf-block="true">
                    <div className="font-semibold text-slate-900">{edu.degree}</div>
                    <div className="text-slate-600">{edu.institution}</div>
                    <div className="flex justify-between text-slate-500 text-[11px] mt-0.5">
                      <span>{edu.startYear} – {edu.endYear}</span>
                      {edu.gpa && <span>GPA: {edu.gpa}</span>}
                    </div>
                    {edu.honors && <div className="text-[11px] text-slate-500 italic mt-0.5">{edu.honors}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {skillCategories.length > 0 && (
            <section>
              <h2
                className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b"
                style={{ color: primaryColor, borderColor: `${primaryColor}30` }}
              >
                Skills & Competencies
              </h2>
              <div className="space-y-2 text-xs">
                {skillCategories.map((cat) => (
                  <div key={cat.id}>
                    <span className="font-semibold text-slate-800">{cat.name}: </span>
                    <span className="text-slate-600">{cat.skills.join(', ')}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Certifications */}
        {certifications.length > 0 && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b"
              style={{ color: primaryColor, borderColor: `${primaryColor}30` }}
            >
              Certifications & Credentials
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {certifications.map((cert) => (
                <div key={cert.id} className="flex justify-between items-baseline" data-pdf-block="true">
                  <div>
                    <span className="font-medium text-slate-900">{cert.name}</span>
                    <span className="text-slate-500 text-[11px]"> — {cert.issuer}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 ml-2">{cert.issueDate}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
