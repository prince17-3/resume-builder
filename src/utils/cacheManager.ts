/**
 * cacheManager.ts
 *
 * Provides client-side local cache memory storage for resumes:
 * - Save multiple named resume drafts/snapshots in browser memory
 * - Quick restoration of previous drafts from cache
 * - Pre-packaged industry role presets ready to load in 1 click
 */

import { ResumeData, ResumeConfig } from '../types';
import { sampleResumeData, defaultResumeConfig } from '../data/initialData';

export interface ResumeDraft {
  id: string;
  name: string;
  savedAt: string;
  data: ResumeData;
  config: ResumeConfig;
}

const STORAGE_KEY_DRAFTS = 'resume_builder_cached_drafts_v1';

export function getCachedDrafts(): ResumeDraft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DRAFTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveDraftToCache(
  name: string,
  data: ResumeData,
  config: ResumeConfig
): ResumeDraft[] {
  const drafts = getCachedDrafts();
  const newDraft: ResumeDraft = {
    id: 'draft_' + Date.now(),
    name: name.trim() || Draft ,
    savedAt: new Date().toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    data,
    config,
  };
  const updated = [newDraft, ...drafts.slice(0, 9)]; // Keep up to 10 drafts in cache
  try {
    localStorage.setItem(STORAGE_KEY_DRAFTS, JSON.stringify(updated));
  } catch {
    // storage full or disabled
  }
  return updated;
}

export function deleteDraftFromCache(id: string): ResumeDraft[] {
  const drafts = getCachedDrafts();
  const updated = drafts.filter((d) => d.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY_DRAFTS, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

export interface RolePreset {
  id: string;
  title: string;
  role: string;
  description: string;
  data: ResumeData;
  config: ResumeConfig;
}

export const PRESET_ROLES: RolePreset[] = [
  {
    id: 'software-engineer',
    title: 'Senior Software Engineer',
    role: 'Full Stack & Cloud',
    description: 'TypeScript, React, Node.js, AWS, and Distributed Systems',
    data: sampleResumeData,
    config: defaultResumeConfig,
  },
  {
    id: 'product-manager',
    title: 'Lead Product Manager',
    role: 'Product Strategy & Growth',
    description: 'Roadmapping, User Research, Analytics, and Cross-functional Leadership',
    data: {
      personalInfo: {
        fullName: 'Sarah Jenkins',
        jobTitle: 'Lead Product Manager',
        email: 'sarah.jenkins@example.com',
        phone: '+1 (555) 432-8976',
        location: 'New York, NY',
        linkedin: 'https://linkedin.com/in/sarahjenkins-pm',
        summary:
          'Data-driven Product Leader with 7+ years directing B2B and consumer SaaS products from discovery to + ARR scale. Expert in user-centric roadmap prioritization, A/B experimentation, and leading cross-functional squads of engineers, designers, and marketers.',
      },
      experiences: [
        {
          id: 'pm_exp_1',
          jobTitle: 'Principal Product Manager',
          company: 'FinTech Innovations Inc.',
          location: 'New York, NY',
          startDate: '2022',
          endDate: 'Present',
          current: true,
          highlights: [
            'Spearheaded enterprise checkout overhaul, increasing conversion rate by 24% and generating .5M in incremental annual revenue.',
            'Defined multi-year product roadmap across 4 engineering teams and 22 developers.',
            'Instituted continuous customer discovery loops, conducting 50+ user interviews per quarter.',
          ],
        },
        {
          id: 'pm_exp_2',
          jobTitle: 'Senior Product Manager',
          company: 'Acme Cloud Solutions',
          location: 'Boston, MA',
          startDate: '2019',
          endDate: '2022',
          current: false,
          highlights: [
            'Launched self-service team workspace tier that grew from 0 to 120,000 monthly active users in 9 months.',
            'Partnered with product analytics to build real-time retention telemetry and cohort churn prediction models.',
          ],
        },
      ],
      education: [
        {
          id: 'pm_edu_1',
          degree: 'M.B.A., Technology & Strategy',
          institution: 'Columbia Business School',
          location: 'New York, NY',
          startYear: '2017',
          endYear: '2019',
        },
        {
          id: 'pm_edu_2',
          degree: 'B.S. in Economics',
          institution: 'Boston University',
          location: 'Boston, MA',
          startYear: '2013',
          endYear: '2017',
        },
      ],
      skillCategories: [
        {
          id: 'pm_sk_1',
          name: 'Product Leadership',
          skills: ['Product Discovery', 'Roadmapping', 'User Research', 'A/B Testing', 'OKRs & KPIs', 'Agile/Scrum'],
        },
        {
          id: 'pm_sk_2',
          name: 'Analytics & Tools',
          skills: ['Amplitude', 'Mixpanel', 'SQL', 'Jira', 'Figma', 'Tableau', 'Google Analytics'],
        },
      ],
      projects: [
        {
          id: 'pm_proj_1',
          title: 'Global Payment Gateway Expansion',
          role: 'Product Lead',
          technologies: ['Stripe', 'SEPA', 'Multi-currency', 'Fraud Engine'],
          description: 'Unified payment orchestration platform deployed across 14 European markets.',
          highlights: [
            'Cut international cart abandonment by 18%.',
            'Negotiated gateway partner integrations saving  annually in transaction fees.',
          ],
        },
      ],
      certifications: [
        {
          id: 'pm_cert_1',
          name: 'Certified Scrum Product Owner (CSPO)',
          issuer: 'Scrum Alliance',
          issueDate: '2021',
        },
      ],
    },
    config: {
      templateId: 'executive',
      primaryColor: '#0f766e',
      fontStyle: 'serif',
      spacing: 'normal',
      showIcons: true,
    },
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist & ML Engineer',
    role: 'Machine Learning & Predictive AI',
    description: 'Python, PyTorch, SQL, LLM Fine-tuning, and BigQuery',
    data: {
      personalInfo: {
        fullName: 'Dr. Michael Chen',
        jobTitle: 'Senior Data Scientist / ML Engineer',
        email: 'michael.chen.ai@example.com',
        phone: '+1 (555) 789-3210',
        location: 'Seattle, WA',
        github: 'https://github.com/mchen-ml',
        summary:
          'Quantitative Data Scientist with 6+ years deploying deep learning, predictive pipelines, and production NLP systems in high-throughput cloud environments. Strong mathematical foundation with proven record of translating ambiguity into high-ROI ML products.',
      },
      experiences: [
        {
          id: 'ds_exp_1',
          jobTitle: 'Staff Machine Learning Engineer',
          company: 'Predictive Health AI',
          location: 'Seattle, WA',
          startDate: '2021',
          endDate: 'Present',
          current: true,
          highlights: [
            'Architected real-time risk classification model reducing false positives in diagnostic alerts by 38%.',
            'Deployed low-latency PyTorch model inference serving 50M+ predictions daily via Kubernetes and Triton.',
            'Mentored 6 junior data scientists and established team coding & experiment tracking standards.',
          ],
        },
      ],
      education: [
        {
          id: 'ds_edu_1',
          degree: 'Ph.D. in Statistics & Machine Learning',
          institution: 'University of Washington',
          location: 'Seattle, WA',
          startYear: '2016',
          endYear: '2020',
        },
      ],
      skillCategories: [
        {
          id: 'ds_sk_1',
          name: 'Machine Learning & AI',
          skills: ['PyTorch', 'TensorFlow', 'Scikit-Learn', 'Transformers', 'MLOps', 'Vector Databases'],
        },
        {
          id: 'ds_sk_2',
          name: 'Data Engineering & Stack',
          skills: ['Python', 'SQL', 'PostgreSQL', 'Snowflake', 'Docker', 'AWS SageMaker', 'Airflow'],
        },
      ],
      projects: [
        {
          id: 'ds_proj_1',
          title: 'Retrieval-Augmented Medical Knowledge Bot',
          role: 'Creator & Lead',
          technologies: ['LangChain', 'ChromaDB', 'Llama-3', 'FastAPI'],
          description: 'Production vector search and semantic verification system answering clinical queries.',
          highlights: ['Achieved 94.2% factual precision on clinical benchmark tests.'],
        },
      ],
      certifications: [
        {
          id: 'ds_cert_1',
          name: 'AWS Certified Machine Learning – Specialty',
          issuer: 'Amazon Web Services',
          issueDate: '2022',
        },
      ],
    },
    config: {
      templateId: 'tech',
      primaryColor: '#4f46e5',
      fontStyle: 'mono',
      spacing: 'normal',
      showIcons: true,
    },
  },
];
