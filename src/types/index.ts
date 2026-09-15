export interface SocialLinks {
  github: string;
  linkedin: string;
  leetcode: string;
  email: string;
}

export interface PersonalInfo {
  name: string;
  role: string;
  college: string;
  degree: string;
  graduationYear: string;
  location: string;
  summary: string;
  socials: SocialLinks;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  duration: string;
  durationLength: string;
}

export interface SkillCategory {
  category: string;
  iconName: string;
  skills: string[];
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  longDescription?: string;
  problemStatement?: string;
  solution?: string;
  category?: string;
  tier: 'flagship' | 'core';
  technologies: string[];
  features?: string[];
  architecture?: string[];
  stats?: { label: string; value: string }[];
  liveUrl?: string;
  githubUrl: string;
  badge?: string;
  thumbnail?: string;
  image?: string;
}

export interface DsaTopic {
  name: string;
  category: 'Core' | 'Linear' | 'Non-Linear' | 'Advanced Algorithms';
}

export interface LearningItem {
  topic: string;
  status: 'In Progress' | 'Deepening';
  category: string;
}
