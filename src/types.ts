export type TemplateId = 'modern' | 'executive' | 'creative' | 'tech' | 'nordic';

export type FontStyle = 'sans' | 'serif' | 'mono';
export type SpacingMode = 'compact' | 'normal' | 'spacious';

export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  summary: string;
}

export interface ExperienceItem {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  highlights: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startYear: string;
  endYear: string;
  gpa?: string;
  honors?: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  role?: string;
  technologies: string[];
  link?: string;
  github?: string;
  description: string;
  highlights: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  experiences: ExperienceItem[];
  education: EducationItem[];
  skillCategories: SkillCategory[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
}

export interface ResumeConfig {
  templateId: TemplateId;
  primaryColor: string;
  fontStyle: FontStyle;
  spacing: SpacingMode;
  showIcons: boolean;
}
