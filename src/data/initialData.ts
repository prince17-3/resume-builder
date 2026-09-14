import { ResumeConfig, ResumeData } from '../types';

export const sampleResumeData: ResumeData = {
  personalInfo: {
    fullName: 'Alexander Vance',
    jobTitle: 'Senior Software Engineer & Architect',
    email: 'alex.vance@example.com',
    phone: '+1 (555) 349-8201',
    location: 'San Francisco, CA',
    website: 'https://alexvance.dev',
    linkedin: 'linkedin.com/in/alexvance-eng',
    github: 'github.com/alexvance',
    summary:
      'Passionate full-stack systems engineer with 7+ years of experience designing scalable distributed applications, microservices, and interactive modern user experiences. Track record of improving system uptime to 99.98% and driving a 40% latency reduction across core user workflows.',
  },
  experiences: [
    {
      id: 'exp-1',
      jobTitle: 'Staff Full-Stack Engineer',
      company: 'Apex Cloud Systems',
      location: 'San Francisco, CA',
      startDate: '2022',
      endDate: 'Present',
      current: true,
      highlights: [
        'Spearheaded the redesign of the core analytics ingestion pipeline handling over 120M events per day using Node.js, Go, and Kafka.',
        'Mentored 8 junior and mid-level software engineers through code reviews, 1:1 architectural sessions, and system design guilds.',
        'Championed automated CI/CD deployment workflows, reducing production deployment rollbacks by 65%.',
      ],
    },
    {
      id: 'exp-2',
      jobTitle: 'Senior Frontend Developer',
      company: 'Vanguard Interactive',
      location: 'Seattle, WA',
      startDate: '2019',
      endDate: '2022',
      current: false,
      highlights: [
        'Built interactive enterprise dashboard software in React, TypeScript, and Tailwind, serving 45,000+ daily business users.',
        'Optimized critical rendering paths and bundle payloads, achieving a 98+ Google Lighthouse performance score across all main routes.',
        'Standardized a reusable company-wide component library that decreased design-to-production turnaround time by 30%.',
      ],
    },
    {
      id: 'exp-3',
      jobTitle: 'Software Engineer',
      company: 'Northstar Labs',
      location: 'Austin, TX',
      startDate: '2017',
      endDate: '2019',
      current: false,
      highlights: [
        'Engineered responsive RESTful and GraphQL endpoints powering mobile and web applications.',
        'Collaborated closely with product designers to implement pixel-perfect, accessible UI components adhering to WCAG 2.1 AA standards.',
      ],
    },
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'B.S. in Computer Science & Applied Mathematics',
      institution: 'University of Washington',
      location: 'Seattle, WA',
      startYear: '2013',
      endYear: '2017',
      gpa: '3.88 / 4.0',
      honors: 'Dean’s List (all quarters), Magna Cum Laude',
    },
  ],
  skillCategories: [
    {
      id: 'skill-1',
      name: 'Languages & Core',
      skills: ['TypeScript', 'JavaScript (ESNext)', 'Python', 'Go', 'SQL', 'HTML5/CSS3'],
    },
    {
      id: 'skill-2',
      name: 'Frameworks & Libraries',
      skills: ['React', 'Next.js', 'Node.js', 'Express', 'Tailwind CSS', 'GraphQL', 'Redux / Zustand'],
    },
    {
      id: 'skill-3',
      name: 'Cloud & DevOps',
      skills: ['Docker', 'Kubernetes', 'AWS (S3, EC2, Lambda)', 'PostgreSQL', 'Redis', 'GitHub Actions'],
    },
    {
      id: 'skill-4',
      name: 'Methodologies',
      skills: ['System Architecture', 'Microservices', 'Test-Driven Development (TDD)', 'Agile / Scrum', 'CI/CD Pipelines'],
    },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'DevMetrics - Distributed APM Suite',
      role: 'Lead Architect',
      technologies: ['React', 'Go', 'TimescaleDB', 'Docker'],
      link: 'https://devmetrics.io',
      github: 'github.com/alexvance/devmetrics',
      description:
        'An open-source real-time application performance monitoring platform supporting tracing, metric aggregation, and anomaly alerts.',
      highlights: [
        'Achieved sub-15ms query times over 50M time-series data points.',
        'Over 2,400 stars on GitHub and adopted by 15+ developer teams.',
      ],
    },
    {
      id: 'proj-2',
      title: 'PulseUI - Design System Kit',
      role: 'Creator & Maintainer',
      technologies: ['TypeScript', 'Tailwind CSS', 'Storybook', 'Radix Primitives'],
      link: 'https://pulse-ui.dev',
      github: 'github.com/alexvance/pulse-ui',
      description: 'Accessible, themeable, high-performance UI library built with clean primitives and keyboard navigation.',
      highlights: [
        'Zero external runtime dependencies; 100% test coverage with Vitest.',
      ],
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services',
      issueDate: '2023',
      credentialUrl: 'aws.amazon.com/verify/10928301',
    },
    {
      id: 'cert-2',
      name: 'Certified Kubernetes Administrator (CKA)',
      issuer: 'Cloud Native Computing Foundation (CNCF)',
      issueDate: '2022',
      credentialUrl: 'cncf.io/verify/cka-88219',
    },
  ],
};

export const emptyResumeData: ResumeData = {
  personalInfo: {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    summary: '',
  },
  experiences: [],
  education: [],
  skillCategories: [],
  projects: [],
  certifications: [],
};

export const defaultResumeConfig: ResumeConfig = {
  templateId: 'modern',
  primaryColor: '#2563eb', // Indigo / Royal Blue
  fontStyle: 'sans',
  spacing: 'normal',
  showIcons: true,
};

export const colorPresets = [
  { name: 'Royal Blue', value: '#2563eb', ring: 'ring-blue-500' },
  { name: 'Slate Dark', value: '#0f172a', ring: 'ring-slate-900' },
  { name: 'Forest Teal', value: '#0d9488', ring: 'ring-teal-600' },
  { name: 'Emerald', value: '#059669', ring: 'ring-emerald-600' },
  { name: 'Deep Burgundy', value: '#9f1239', ring: 'ring-rose-800' },
  { name: 'Warm Amber', value: '#d97706', ring: 'ring-amber-600' },
  { name: 'Modern Violet', value: '#7c3aed', ring: 'ring-violet-600' },
];
