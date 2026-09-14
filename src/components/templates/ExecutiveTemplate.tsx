import React from 'react';
import { ResumeConfig, ResumeData } from '../../types';

interface TemplateProps {
  data: ResumeData;
  config: ResumeConfig;
}

export const ExecutiveTemplate: React.FC<TemplateProps> = ({ data, config }) => {
  const { personalInfo, experiences, education, skillCategories, projects, certifications } = data;
  const { primaryColor, spacing } = config;

  const spacingClass =
    spacing === 'compact' ? 'space-y-3' : spacing === 'spacious' ? 'space-y-6' : 'space-y-4';
  const itemSpacing = spacing === 'compact' ? 'space-y-2' : 'space-y-3';

  return (
    <div className={`w-full bg-white text-slate-900 font-serif-elegant ${spacingClass}`}>
      {/* Centered Editorial Header */}
      <header className="text-center pb-3 border-b-2" style={{ borderColor: primaryColor }}>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 uppercase font-serif-elegant">
          {personalInfo.fullName || 'Candidate Name'}
        </h1>
        <p className="text-sm italic font-medium mt-1 tracking-wide" style={{ color: primaryColor }}>
          {personalInfo.jobTitle || 'Executive Professional'}
        </p>

        {/* Contact info list */}
        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 mt-2.5 text-xs text-slate-700 font-sans-clean">
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.location && personalInfo.phone && <span>•</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.phone && personalInfo.email && <span>•</span>}
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.linkedin && (
            <>
              <span>•</span>
              <span>{personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
            </>
          )}
          {personalInfo.website && (
            <>
              <span>•</span>
              <span>{personalInfo.website.replace(/^https?:\/\//, '')}</span>
            </>
          )}
        </div>

        {personalInfo.summary && (
          <p className="mt-3 text-xs leading-relaxed text-slate-700 text-justify max-w-2xl mx-auto font-sans-clean">
            {personalInfo.summary}
          </p>
        )}
      </header>

      {/* Sections */}
      <div className="space-y-4 font-sans-clean">
        {/* Experience */}
        {experiences.length > 0 && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-widest pb-1 mb-2 border-b border-slate-300 font-serif-elegant"
              style={{ color: primaryColor }}
            >
              Professional Experience
            </h2>

            <div className={itemSpacing}>
              {experiences.map((exp) => (
                <div key={exp.id} className="text-xs">
                  <div className="flex justify-between items-baseline">
                    <div className="font-bold text-slate-900 text-sm">{exp.company}</div>
                    <div className="text-slate-600 text-[11px] font-medium">
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-slate-700 italic mb-1">
                    <span>{exp.jobTitle}</span>
                    {exp.location && <span className="text-[11px] not-italic text-slate-500">{exp.location}</span>}
                  </div>
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-1 text-slate-800">
                      {exp.highlights.map((bullet, idx) => (
                        <li key={idx} className="leading-relaxed">
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

        {/* Education */}
        {education.length > 0 && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-widest pb-1 mb-2 border-b border-slate-300 font-serif-elegant"
              style={{ color: primaryColor }}
            >
              Education & Honors
            </h2>
            <div className="space-y-2 text-xs">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline">
                    <div className="font-bold text-slate-900">{edu.institution}</div>
                    <div className="text-slate-600 text-[11px]">
                      {edu.startYear} – {edu.endYear}
                    </div>
                  </div>
                  <div className="flex justify-between text-slate-700 italic">
                    <span>{edu.degree}</span>
                    {edu.gpa && <span className="not-italic text-slate-500">GPA: {edu.gpa}</span>}
                  </div>
                  {edu.honors && <div className="text-[11px] text-slate-600 mt-0.5">{edu.honors}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-widest pb-1 mb-2 border-b border-slate-300 font-serif-elegant"
              style={{ color: primaryColor }}
            >
              Selected Engagements & Projects
            </h2>
            <div className={itemSpacing}>
              {projects.map((proj) => (
                <div key={proj.id} className="text-xs">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>
                      {proj.title} {proj.role && <span className="font-normal italic text-slate-600">| {proj.role}</span>}
                    </span>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <span className="text-[11px] font-normal text-slate-500">
                        {proj.technologies.slice(0, 4).join(', ')}
                      </span>
                    )}
                  </div>
                  {proj.description && <p className="text-slate-700 mt-0.5 leading-snug">{proj.description}</p>}
                  {proj.highlights && proj.highlights.length > 0 && (
                    <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-slate-800">
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

        {/* Skills & Certifications */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {skillCategories.length > 0 && (
            <section>
              <h2
                className="text-xs font-bold uppercase tracking-widest pb-1 mb-2 border-b border-slate-300 font-serif-elegant"
                style={{ color: primaryColor }}
              >
                Areas of Expertise
              </h2>
              <div className="space-y-1.5 text-xs">
                {skillCategories.map((cat) => (
                  <div key={cat.id}>
                    <span className="font-semibold text-slate-900">{cat.name}: </span>
                    <span className="text-slate-700">{cat.skills.join(', ')}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {certifications.length > 0 && (
            <section>
              <h2
                className="text-xs font-bold uppercase tracking-widest pb-1 mb-2 border-b border-slate-300 font-serif-elegant"
                style={{ color: primaryColor }}
              >
                Certifications
              </h2>
              <div className="space-y-1.5 text-xs">
                {certifications.map((cert) => (
                  <div key={cert.id} className="flex justify-between items-baseline">
                    <span className="font-medium text-slate-900">{cert.name}</span>
                    <span className="text-slate-500 text-[11px] ml-2">{cert.issueDate}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
