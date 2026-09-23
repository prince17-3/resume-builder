import React from 'react';
import { ResumeConfig, ResumeData } from '../../types';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

interface TemplateProps {
  data: ResumeData;
  config: ResumeConfig;
}

export const NordicTemplate: React.FC<TemplateProps> = ({ data, config }) => {
  const { personalInfo, experiences, education, skillCategories, projects, certifications } = data;
  const { primaryColor, spacing, showIcons } = config;

  const itemSpacing = spacing === 'compact' ? 'space-y-3' : 'space-y-4';

  return (
    <div className="w-full bg-white text-stone-800 text-xs space-y-5">
      {/* Nordic Minimalist Top Banner */}
      <header className="pb-3 border-b border-stone-200">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-2">
          <div>
            <h1 className="text-3xl font-light tracking-wide text-stone-900 uppercase">
              {personalInfo.fullName || 'Nordic Candidate'}
            </h1>
            <p className="text-xs font-semibold tracking-widest uppercase mt-1" style={{ color: primaryColor }}>
              {personalInfo.jobTitle || 'Design & Strategy Lead'}
            </p>
          </div>
          <div className="flex flex-wrap sm:flex-col sm:items-end gap-x-3 gap-y-0.5 text-[11px] text-stone-500">
            {personalInfo.email && (
              <span className="flex items-center gap-1">
                {showIcons && <Mail className="w-3 h-3 text-stone-400" />}
                {personalInfo.email}
              </span>
            )}
            {personalInfo.phone && (
              <span className="flex items-center gap-1">
                {showIcons && <Phone className="w-3 h-3 text-stone-400" />}
                {personalInfo.phone}
              </span>
            )}
            {personalInfo.location && (
              <span className="flex items-center gap-1">
                {showIcons && <MapPin className="w-3 h-3 text-stone-400" />}
                {personalInfo.location}
              </span>
            )}
          </div>
        </div>

        {/* External links */}
        {(personalInfo.website || personalInfo.linkedin || personalInfo.github) && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-stone-500">
            {personalInfo.website && (
              <span className="flex items-center gap-1">
                {showIcons && <Globe className="w-3 h-3 text-stone-400" />}
                {personalInfo.website.replace(/^https?:\/\//, '')}
              </span>
            )}
            {personalInfo.linkedin && (
              <span className="flex items-center gap-1">
                {showIcons && <Linkedin className="w-3 h-3 text-stone-400" />}
                {personalInfo.linkedin.replace(/^https?:\/\//, '')}
              </span>
            )}
            {personalInfo.github && (
              <span className="flex items-center gap-1">
                {showIcons && <Github className="w-3 h-3 text-stone-400" />}
                {personalInfo.github.replace(/^https?:\/\//, '')}
              </span>
            )}
          </div>
        )}

        {personalInfo.summary && (
          <p className="mt-3 text-xs leading-relaxed text-stone-600 font-light">
            {personalInfo.summary}
          </p>
        )}
      </header>

      {/* Experience */}
      {experiences.length > 0 && (
        <section>
          <h2
            className="text-[11px] font-semibold uppercase tracking-widest pb-1 mb-2 border-b border-stone-200"
            style={{ color: primaryColor }}
          >
            Experience
          </h2>
          <div className={itemSpacing}>
            {experiences.map((exp) => (
              <div key={exp.id} data-pdf-block="true">
                <div className="flex justify-between items-baseline">
                  <div className="font-semibold text-stone-900 text-sm">{exp.jobTitle}</div>
                  <div className="text-stone-400 text-[11px]">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </div>
                </div>
                <div className="text-stone-600 font-medium mb-1">
                  {exp.company} {exp.location && `· ${exp.location}`}
                </div>
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="list-disc list-outside ml-4 space-y-1 text-stone-600">
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
            className="text-[11px] font-semibold uppercase tracking-widest pb-1 mb-2 border-b border-stone-200"
            style={{ color: primaryColor }}
          >
            Key Projects
          </h2>
          <div className={itemSpacing}>
            {projects.map((proj) => (
              <div key={proj.id} data-pdf-block="true">
                <div className="flex justify-between items-baseline font-medium text-stone-900">
                  <span>
                    {proj.title} {proj.role && <span className="text-stone-500 font-normal">({proj.role})</span>}
                  </span>
                  {proj.link && <span className="text-[11px] text-stone-400">{proj.link.replace(/^https?:\/\//, '')}</span>}
                </div>
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="text-[10px] text-stone-500 my-0.5">
                    {proj.technologies.join(' · ')}
                  </div>
                )}
                {proj.description && <p className="text-stone-600 leading-snug">{proj.description}</p>}
                {proj.highlights && proj.highlights.length > 0 && (
                  <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-stone-600">
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
              className="text-[11px] font-semibold uppercase tracking-widest pb-1 mb-2 border-b border-stone-200"
              style={{ color: primaryColor }}
            >
              Education
            </h2>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id} data-pdf-block="true">
                  <div className="font-semibold text-stone-900">{edu.degree}</div>
                  <div className="text-stone-600">{edu.institution}</div>
                  <div className="text-stone-400 text-[11px] mt-0.5">
                    {edu.startYear} – {edu.endYear} {edu.gpa && `• ${edu.gpa}`}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skillCategories.length > 0 && (
          <section>
            <h2
              className="text-[11px] font-semibold uppercase tracking-widest pb-1 mb-2 border-b border-stone-200"
              style={{ color: primaryColor }}
            >
              Expertise & Tools
            </h2>
            <div className="space-y-2">
              {skillCategories.map((cat) => (
                <div key={cat.id}>
                  <div className="font-medium text-stone-800 text-[11px]">{cat.name}</div>
                  <div className="text-stone-600 text-[11px] mt-0.5">{cat.skills.join(', ')}</div>
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
            className="text-[11px] font-semibold uppercase tracking-widest pb-1 mb-2 border-b border-stone-200"
            style={{ color: primaryColor }}
          >
            Honors & Certifications
          </h2>
          <div className="space-y-1 text-stone-600">
            {certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between items-baseline" data-pdf-block="true">
                <span>{cert.name} — <span className="text-stone-500">{cert.issuer}</span></span>
                <span className="text-stone-400 text-[11px]">{cert.issueDate}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
