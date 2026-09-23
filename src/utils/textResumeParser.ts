/**
 * textResumeParser.ts
 *
 * A 100% client-side, zero-API-key resume parser that extracts structured
 * ResumeData from plain text (pasted from LinkedIn, Word, or text files).
 */

import {
  ResumeData,
  PersonalInfo,
  ExperienceItem,
  EducationItem,
  SkillCategory,
  ProjectItem,
  CertificationItem,
} from '../types';

export function parseResumeFromPlainText(rawText: string): ResumeData {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const personalInfo: PersonalInfo = {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    summary: '',
  };

  // 1. Extract contact details across the entire text
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) personalInfo.email = emailMatch[0];

  const phoneMatch = rawText.match(
    /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{10,14}/
  );
  if (phoneMatch) personalInfo.phone = phoneMatch[0].trim();

  // Note: hyphen must be at end of character class to be treated as literal
  const linkedinMatch = rawText.match(
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_%.-]+)/i
  );
  if (linkedinMatch) personalInfo.linkedin = linkedinMatch[0];

  const githubMatch = rawText.match(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_%.-]+)/i
  );
  if (githubMatch) personalInfo.github = githubMatch[0];

  const websiteMatch = rawText.match(
    /(?:https?:\/\/)(?!.*(?:linkedin|github)\.com)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/i
  );
  if (websiteMatch) personalInfo.website = websiteMatch[0];

  // 2. Extract Candidate Name and Title from top lines
  const topLines = lines.slice(0, 6).filter((line) => {
    if (line.includes('@')) return false;
    if (/^(\+|phone|\(|http)/i.test(line)) return false;
    if (/resume|curriculum vitae|cv/i.test(line)) return false;
    return true;
  });

  if (topLines.length > 0) personalInfo.fullName = topLines[0];
  if (topLines.length > 1 && topLines[1].length < 60) personalInfo.jobTitle = topLines[1];

  // 3. Segment document into sections
  type SectionType =
    | 'summary'
    | 'experience'
    | 'education'
    | 'skills'
    | 'projects'
    | 'certifications'
    | 'unknown';

  const sectionHeaders: { type: SectionType; regex: RegExp }[] = [
    { type: 'summary', regex: /^(professional\s+summary|summary|profile|about\s+me|objective)/i },
    {
      type: 'experience',
      regex: /^(experience|work\s+experience|employment\s+history|professional\s+experience)/i,
    },
    { type: 'education', regex: /^(education|academic\s+background|academic\s+history)/i },
    {
      type: 'skills',
      regex: /^(skills|technical\s+skills|skills\s+&\s+competencies|core\s+competencies)/i,
    },
    {
      type: 'projects',
      regex: /^(projects|personal\s+projects|key\s+projects|academic\s+projects)/i,
    },
    {
      type: 'certifications',
      regex: /^(certifications|honors\s+&\s+certifications|certificates|licenses)/i,
    },
  ];

  interface SectionBlock {
    type: SectionType;
    lines: string[];
  }

  const sections: SectionBlock[] = [];
  let currentSection: SectionBlock = { type: 'unknown', lines: [] };

  for (const line of lines) {
    let matchedHeader: SectionType | null = null;
    const cleanHeader = line.replace(/[:\-_#]/g, '').trim();
    for (const h of sectionHeaders) {
      if (h.regex.test(cleanHeader)) {
        matchedHeader = h.type;
        break;
      }
    }
    if (matchedHeader) {
      if (currentSection.lines.length > 0) sections.push(currentSection);
      currentSection = { type: matchedHeader, lines: [] };
    } else {
      currentSection.lines.push(line);
    }
  }
  if (currentSection.lines.length > 0) sections.push(currentSection);

  const experiences: ExperienceItem[] = [];
  const education: EducationItem[] = [];
  const skillCategories: SkillCategory[] = [];
  const projects: ProjectItem[] = [];
  const certifications: CertificationItem[] = [];

  const dateRegex =
    /\b(19\d\d|20\d\d|Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\b.*?\b(Present|Current|19\d\d|20\d\d)\b/i;

  for (const sec of sections) {
    switch (sec.type) {
      case 'summary': {
        personalInfo.summary = sec.lines.join(' ');
        break;
      }

      case 'skills': {
        const collectedSkills: string[] = [];
        for (const line of sec.lines) {
          const parts = line
            .split(/[,|•·\t]/)
            .map((p) => p.trim())
            .filter((p) => p.length > 1);
          collectedSkills.push(...parts);
        }
        if (collectedSkills.length > 0) {
          skillCategories.push({
            id: 'skill_1',
            name: 'Core Skills',
            skills: Array.from(new Set(collectedSkills)),
          });
        }
        break;
      }

      case 'experience': {
        let expIdx = 1;
        let currentExp: Partial<ExperienceItem> | null = null;

        const flushExp = () => {
          if (currentExp && currentExp.jobTitle) {
            experiences.push({
              id: `exp_${expIdx++}`,
              jobTitle: currentExp.jobTitle || 'Role',
              company: currentExp.company || '',
              location: currentExp.location || '',
              startDate: currentExp.startDate || '2021',
              endDate: currentExp.endDate || 'Present',
              current: currentExp.current ?? true,
              highlights: currentExp.highlights || [],
            });
          }
        };

        for (const line of sec.lines) {
          const isBullet = /^[•\-*·]\s*/.test(line);
          const hasDate = dateRegex.test(line);

          if (!isBullet && (hasDate || line.includes('|') || line.includes(' - '))) {
            flushExp();
            const dateMatch = line.match(dateRegex);
            const dateText = dateMatch ? dateMatch[0] : '';
            const lineWithoutDate = line.replace(dateRegex, '').trim();
            const titleCompanyParts = lineWithoutDate.split(/[-–|at]\s+/);
            currentExp = {
              jobTitle: titleCompanyParts[0]?.trim() || lineWithoutDate,
              company: titleCompanyParts[1]?.trim() || '',
              startDate: dateText.split(/[-–to]/)[0]?.trim() || '2021',
              endDate: dateText.split(/[-–to]/)[1]?.trim() || 'Present',
              current: /present|current/i.test(dateText),
              highlights: [],
            };
          } else if (isBullet && currentExp) {
            const cleanBullet = line.replace(/^[•\-*·]\s*/, '').trim();
            if (cleanBullet) currentExp.highlights?.push(cleanBullet);
          } else if (currentExp && !currentExp.highlights?.length && line.length > 20) {
            currentExp.highlights?.push(line);
          }
        }
        flushExp();
        break;
      }

      case 'education': {
        let eduIdx = 1;
        for (const line of sec.lines) {
          if (line.length < 5) continue;
          const yearMatch = line.match(/\b(19\d\d|20\d\d)\b/g);
          const years = yearMatch || ['2020'];
          education.push({
            id: `edu_${eduIdx++}`,
            degree: line.split(/[-–,|at]/)[0]?.trim() || line,
            institution: line.split(/[-–,|at]/)[1]?.trim() || '',
            location: '',
            startYear: years[0] || '2018',
            endYear: years[1] || years[0] || '2022',
          });
        }
        break;
      }

      case 'projects': {
        let projIdx = 1;
        let currentProj: Partial<ProjectItem> | null = null;

        const flushProj = () => {
          if (currentProj && currentProj.title) {
            projects.push({
              id: `proj_${projIdx++}`,
              title: currentProj.title,
              role: currentProj.role || '',
              technologies: currentProj.technologies || [],
              link: currentProj.link || '',
              github: currentProj.github || '',
              description: currentProj.description || '',
              highlights: currentProj.highlights || [],
            });
          }
        };

        for (const line of sec.lines) {
          const isBullet = /^[•\-*·]\s*/.test(line);
          if (!isBullet && line.length < 60) {
            flushProj();
            currentProj = {
              title: line,
              role: '',
              technologies: [],
              description: '',
              highlights: [],
            };
          } else if (currentProj) {
            const clean = line.replace(/^[•\-*·]\s*/, '').trim();
            if (isBullet) {
              currentProj.highlights?.push(clean);
            } else if (!currentProj.description) {
              currentProj.description = clean;
            } else {
              currentProj.highlights?.push(clean);
            }
          }
        }
        flushProj();
        break;
      }

      case 'certifications': {
        let certIdx = 1;
        for (const line of sec.lines) {
          if (line.length < 5) continue;
          const yearMatch = line.match(/\b(20\d\d|19\d\d)\b/);
          const parts = line.split(/[-–—|]/);
          certifications.push({
            id: `cert_${certIdx++}`,
            name: parts[0]?.trim() || line,
            issuer: parts[1]?.trim() || '',
            issueDate: yearMatch ? yearMatch[0] : '2023',
          });
        }
        break;
      }

      default:
        break;
    }
  }

  if (!personalInfo.summary && lines.length > 2) {
    personalInfo.summary = lines.slice(2, 5).join(' ');
  }

  return {
    personalInfo,
    experiences,
    education,
    skillCategories,
    projects,
    certifications,
  };
}
