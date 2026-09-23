/**
 * resumeParser.ts
 *
 * Sends an uploaded resume file (PDF or DOCX) to the Gemini API using
 * inline base64 encoding and returns a fully structured ResumeData object
 * ready to populate the editor.
 */

import { GoogleGenAI } from '@google/genai';
import {
  ResumeData,
  PersonalInfo,
  ExperienceItem,
  EducationItem,
  SkillCategory,
  ProjectItem,
  CertificationItem,
} from '../types';

// ─── Supported MIME types ────────────────────────────────────────────────────
const SUPPORTED_MIME_TYPES: Record<string, string> = {
  'application/pdf': 'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword': 'application/msword',
};

export function isSupportedResumeFile(file: File): boolean {
  return (
    file.type in SUPPORTED_MIME_TYPES ||
    file.name.endsWith('.pdf') ||
    file.name.endsWith('.docx') ||
    file.name.endsWith('.doc') ||
    file.name.endsWith('.json') ||
    file.type === 'application/json'
  );
}

// ─── Convert file to base64 ──────────────────────────────────────────────────
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data URL prefix (e.g. "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// ─── The structured prompt ───────────────────────────────────────────────────
const EXTRACTION_PROMPT = `
You are a precise resume data extractor. Analyze the provided resume document and extract ALL information into a JSON object that strictly follows this TypeScript schema:

{
  "personalInfo": {
    "fullName": string,
    "jobTitle": string,          // Most recent or primary job title / headline
    "email": string,
    "phone": string,
    "location": string,          // City, State or City, Country
    "website": string,           // Personal website / portfolio URL, or ""
    "linkedin": string,          // LinkedIn URL or username, or ""
    "github": string,            // GitHub URL or username, or ""
    "summary": string            // Professional summary / objective. If none, write a short 2-sentence summary based on the resume content.
  },
  "experiences": [
    {
      "id": "exp_1",             // Use exp_1, exp_2, etc.
      "jobTitle": string,
      "company": string,
      "location": string,
      "startDate": string,       // e.g. "Jan 2021" or just "2021"
      "endDate": string,         // e.g. "Mar 2023" or "Present"
      "current": boolean,        // true if this is the current job
      "highlights": string[]     // Array of bullet point achievements. Each bullet is a complete sentence.
    }
  ],
  "education": [
    {
      "id": "edu_1",
      "degree": string,          // Full degree name e.g. "B.S. Computer Science"
      "institution": string,
      "location": string,
      "startYear": string,
      "endYear": string,
      "gpa": string,             // e.g. "3.8 / 4.0" or ""
      "honors": string           // e.g. "Magna Cum Laude" or ""
    }
  ],
  "skillCategories": [
    {
      "id": "skill_1",
      "name": string,            // Category name e.g. "Programming Languages", "Frameworks"
      "skills": string[]         // Individual skill names
    }
  ],
  "projects": [
    {
      "id": "proj_1",
      "title": string,
      "role": string,            // Role in project e.g. "Lead Developer" or ""
      "technologies": string[],
      "link": string,            // Live URL or ""
      "github": string,          // GitHub URL or ""
      "description": string,     // One or two sentence description
      "highlights": string[]     // Key achievements as bullet points
    }
  ],
  "certifications": [
    {
      "id": "cert_1",
      "name": string,
      "issuer": string,
      "issueDate": string,       // e.g. "2023" or "Jan 2023"
      "credentialUrl": string    // Verification URL or ""
    }
  ]
}

RULES:
- Return ONLY the raw JSON object. No markdown fences, no explanation, no preamble.
- If a field has no data, use an empty string "" for strings, false for booleans, and [] for arrays.
- Preserve the exact text from the resume — do not paraphrase bullet points.
- Group skills into logical categories (max 5 categories). If the resume has no categories, group them yourself.
- Sort experiences and education in reverse chronological order (most recent first).
- If projects section does not exist, leave the array empty.
- Ensure all id fields are unique and follow the pattern shown.
`;

// ─── Fallback: extract MIME type from file ───────────────────────────────────
function resolveMimeType(file: File): string {
  if (file.type && file.type in SUPPORTED_MIME_TYPES) return file.type;
  if (file.name.endsWith('.pdf')) return 'application/pdf';
  if (file.name.endsWith('.docx'))
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (file.name.endsWith('.doc')) return 'application/msword';
  return 'application/pdf';
}

// ─── Sanitize / validate parsed output ───────────────────────────────────────
function sanitizeResumeData(raw: Partial<ResumeData>): ResumeData {
  const pi = (raw.personalInfo ?? {}) as Partial<PersonalInfo>;

  const personalInfo: PersonalInfo = {
    fullName: pi.fullName ?? '',
    jobTitle: pi.jobTitle ?? '',
    email: pi.email ?? '',
    phone: pi.phone ?? '',
    location: pi.location ?? '',
    website: pi.website ?? '',
    linkedin: pi.linkedin ?? '',
    github: pi.github ?? '',
    summary: pi.summary ?? '',
  };

  const experiences: ExperienceItem[] = (raw.experiences ?? []).map((e, i) => ({
    id: e.id ?? `exp_${i + 1}`,
    jobTitle: e.jobTitle ?? '',
    company: e.company ?? '',
    location: e.location ?? '',
    startDate: e.startDate ?? '',
    endDate: e.endDate ?? '',
    current: e.current ?? false,
    highlights: Array.isArray(e.highlights) ? e.highlights.filter(Boolean) : [],
  }));

  const education: EducationItem[] = (raw.education ?? []).map((e, i) => ({
    id: e.id ?? `edu_${i + 1}`,
    degree: e.degree ?? '',
    institution: e.institution ?? '',
    location: e.location ?? '',
    startYear: e.startYear ?? '',
    endYear: e.endYear ?? '',
    gpa: e.gpa ?? '',
    honors: e.honors ?? '',
  }));

  const skillCategories: SkillCategory[] = (raw.skillCategories ?? []).map((s, i) => ({
    id: s.id ?? `skill_${i + 1}`,
    name: s.name ?? 'Skills',
    skills: Array.isArray(s.skills) ? s.skills.filter(Boolean) : [],
  }));

  const projects: ProjectItem[] = (raw.projects ?? []).map((p, i) => ({
    id: p.id ?? `proj_${i + 1}`,
    title: p.title ?? '',
    role: p.role ?? '',
    technologies: Array.isArray(p.technologies) ? p.technologies.filter(Boolean) : [],
    link: p.link ?? '',
    github: p.github ?? '',
    description: p.description ?? '',
    highlights: Array.isArray(p.highlights) ? p.highlights.filter(Boolean) : [],
  }));

  const certifications: CertificationItem[] = (raw.certifications ?? []).map((c, i) => ({
    id: c.id ?? `cert_${i + 1}`,
    name: c.name ?? '',
    issuer: c.issuer ?? '',
    issueDate: c.issueDate ?? '',
    credentialUrl: c.credentialUrl ?? '',
  }));

  return { personalInfo, experiences, education, skillCategories, projects, certifications };
}

// ─── Main export ─────────────────────────────────────────────────────────────
export async function parseResumeFile(
  file: File,
  apiKey: string
): Promise<ResumeData> {
  if (!apiKey) {
    throw new Error(
      'Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.'
    );
  }

  if (!isSupportedResumeFile(file)) {
    throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
  }

  const base64Data = await fileToBase64(file);
  const mimeType = resolveMimeType(file);

  const ai = new GoogleGenAI({ apiKey });

  const CANDIDATE_MODELS = [
    'gemini-3.6-flash',
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-2.0-flash',
  ];

  let rawText = '';
  let lastError: Error | null = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
              {
                text: EXTRACTION_PROMPT,
              },
            ],
          },
        ],
        config: {
          temperature: 0.1, // Low temperature for deterministic extraction
          maxOutputTokens: 4096,
        },
      });

      rawText = response.text?.trim() ?? '';
      if (rawText) {
        lastError = null;
        break;
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      // If 404 (model not found/deprecated), try next model
      if (String(err).includes('404') || String(err).includes('not found') || String(err).includes('no longer available')) {
        continue;
      }
      // For other errors (e.g. invalid key or network error), break immediately
      throw lastError;
    }
  }

  if (lastError && !rawText) {
    throw lastError;
  }

  if (!rawText) {
    throw new Error('Gemini returned an empty response. Please try again.');
  }

  // Strip markdown code fences if the model included them despite instructions
  const jsonText = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let parsed: Partial<ResumeData>;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    console.error('Raw Gemini response:', rawText);
    throw new Error(
      'Failed to parse the extracted data. The resume may be in an unreadable format.'
    );
  }

  return sanitizeResumeData(parsed);
}
