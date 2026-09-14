import React from 'react';
import { ResumeConfig, ResumeData } from '../../types';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

interface TemplateProps {
  data: ResumeData;
  config: ResumeConfig;
}

export const CreativeTemplate: React.FC<TemplateProps> = ({ data, config }) => {
  const { personalInfo, experiences, education, skillCategories, projects, certifications } = data;
  const { primaryColor, spacing, showIcons } = config;

  const itemSpacing = spacing === 'compact' ? 'space-y-2' : 'space-y-3.5';

  return (
    <div className="w-full bg-white text-slate-800 grid grid-cols-12 min-h-full">
      {/* Left Sidebar (35%) */}
      <aside className="col-span-4 bg-slate-50 p-4 border-r border-slate-200 flex flex-col justify-between space-y-4 text-xs">
        <div>
          {/* Candidate Name & Title */}
          <div className="pb-3 border-b border-slate-200">
            <h1 className="text-xl font-black tracking-tight text-slate-900 leading-tight">
              {personalInfo.fullName || 'Candidate Name'}
            </h1>
            <p className="text-xs font-semibold mt-1" style={{ color: primaryColor }}>
              {personalInfo.jobTitle || 'Creative Specialist'}
            </p>
          </div>

          {/* Contact Details */}
          <div className="mt-3 space-y-1.5 text-[11px] text-slate-600">
            {personalInfo.email && (
              <div className="flex items-center gap-1.5 break-all">
                {showIcons && <Mail className="w-3 h-3 shrink-0 text-slate-400" />}
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-1.5">
                {showIcons && <Phone className="w-3 h-3 shrink-0 text-slate-400" />}
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.location && (
              <div className="flex items-center gap-1.5">
                {showIcons && <MapPin className="w-3 h-3 shrink-0 text-slate-400" />}
                <span>{personalInfo.location}</span>
              </div>
            )}
            {personalInfo.website && (
              <div className="flex items-center gap-1.5 break-all">
                {showIcons && <Globe className="w-3 h-3 shrink-0 text-slate-400" />}
                <span>{personalInfo.website.replace(/^https?:\/\//, '')}</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center gap-1.5 break-all">
                {showIcons && <Linkedin className="w-3 h-3 shrink-0 text-slate-400" />}
                <span>{personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
              </div>
            )}
            {personalInfo.github && (
              <div className="flex items-center gap-1.5 break-all">
                {showIcons && <Github className="w-3 h-3 shrink-0 text-slate-400" />}
                <span>{personalInfo.github.replace(/^https?:\/\//, '')}</span>
              </div>
            )}
          </div>

          {/* Skills */}
          {skillCategories.length > 0 && (
            <div className="mt-5">
              <h2
                className="text-[11px] font-bold uppercase tracking-wider pb-1 mb-2 border-b border-slate-200"
                style={{ color: primaryColor }}
              >
                Skills & Stack
              </h2>
              <div className="space-y-2">
                {skillCategories.map((cat) => (
                  <div key={cat.id}>
                    <p className="font-semibold text-slate-800 text-[11px] mb-1">{cat.name}</p>
                    <div className="flex flex-wrap gap-1">
                      {cat.skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-white border border-slate-200 text-slate-700 font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className="mt-5">
              <h2
                className="text-[11px] font-bold uppercase tracking-wider pb-1 mb-2 border-b border-slate-200"
                style={{ color: primaryColor }}
              >
                Education
              </h2>
              <div className="space-y-2.5">
                {education.map((edu) => (
                  <div key={edu.id} className="text-[11px]">
                    <p className="font-bold text-slate-900 leading-tight">{edu.degree}</p>
                    <p className="text-slate-600">{edu.institution}</p>
                    <p className="text-slate-400 text-[10px] mt-0.5">
                      {edu.startYear} – {edu.endYear} {edu.gpa && `• GPA: ${edu.gpa}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div className="mt-5">
              <h2
                className="text-[11px] font-bold uppercase tracking-wider pb-1 mb-2 border-b border-slate-200"
                style={{ color: primaryColor }}
              >
                Credentials
              </h2>
              <div className="space-y-1.5 text-[11px]">
                {certifications.map((cert) => (
                  <div key={cert.id}>
                    <p className="font-medium text-slate-800 leading-tight">{cert.name}</p>
                    <p className="text-[10px] text-slate-500">
                      {cert.issuer} ({cert.issueDate})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Right Column (65%) */}
      <main className="col-span-8 p-4 pl-5 space-y-4 text-xs">
        {/* Profile Summary */}
        {personalInfo.summary && (
          <section className="pb-3 border-b border-slate-100">
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 mb-1.5"
              style={{ color: primaryColor }}
            >
              Profile
            </h2>
            <p className="text-slate-700 leading-relaxed text-justify">{personalInfo.summary}</p>
          </section>
        )}

        {/* Experience */}
        {experiences.length > 0 && (
          <section>
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b border-slate-200 flex items-center justify-between"
              style={{ color: primaryColor }}
            >
              <span>Experience</span>
            </h2>

            <div className={itemSpacing}>
              {experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-slate-900 text-sm">{exp.jobTitle}</h3>
                    <span className="text-[11px] font-medium text-slate-500">
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 mb-1.5 font-medium">
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
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b border-slate-200"
              style={{ color: primaryColor }}
            >
              Featured Projects
            </h2>

            <div className={itemSpacing}>
              {projects.map((proj) => (
                <div key={proj.id}>
                  <div className="flex justify-between items-baseline font-semibold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <span>{proj.title}</span>
                      {proj.role && <span className="font-normal text-xs text-slate-500">({proj.role})</span>}
                    </div>
                    {proj.link && (
                      <span className="text-[10px] text-slate-400">{proj.link.replace(/^https?:\/\//, '')}</span>
                    )}
                  </div>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="text-[10px] text-slate-500 my-0.5">
                      Technologies: {proj.technologies.join(' • ')}
                    </div>
                  )}
                  {proj.description && <p className="text-slate-700 leading-snug">{proj.description}</p>}
                  {proj.highlights && proj.highlights.length > 0 && (
                    <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-slate-700">
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
      </main>
    </div>
  );
};
