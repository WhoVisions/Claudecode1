/**
 * Resume Parser
 * Extracts structured data from resume text
 */

import { callMCPTool } from '../client';

export interface ParsedResume {
  name: string;
  email: string;
  phone?: string;
  location?: string;

  summary?: string;

  experience: WorkExperience[];
  education: Education[];
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
  };

  certifications?: Certification[];
  projects?: Project[];

  raw: string;
}

export interface WorkExperience {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string | 'Present';
  highlights: string[];
}

export interface Education {
  degree: string;
  institution: string;
  location?: string;
  graduationDate: string;
  gpa?: string;
  honors?: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  expirationDate?: string;
  credentialId?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  highlights: string[];
}

/**
 * Parse resume text into structured format
 * Uses Gemini AI for intelligent extraction
 */
export async function parseResume(resumeText: string): Promise<ParsedResume> {
  return callMCPTool<ParsedResume>('resume__parse', { resumeText });
}

/**
 * Direct implementation (called by MCP handler)
 */
export async function parseResumeDirect(resumeText: string): Promise<ParsedResume> {
  const { createGeminiService } = await import('../../lib/gemini');
  const { getGeminiApiKey } = await import('../../app/admin/actions');

  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const gemini = createGeminiService(apiKey);

  const prompt = `You are a resume parsing expert. Extract structured information from the following resume.

Resume:
${resumeText}

Return a JSON object with this structure:
{
  "name": "Full name",
  "email": "email@example.com",
  "phone": "Phone number if present",
  "location": "City, State if present",
  "summary": "Professional summary/objective if present",
  "experience": [
    {
      "title": "Job title",
      "company": "Company name",
      "location": "City, State",
      "startDate": "Month Year",
      "endDate": "Month Year or Present",
      "highlights": ["Achievement 1", "Achievement 2"]
    }
  ],
  "education": [
    {
      "degree": "Degree name",
      "institution": "University name",
      "location": "City, State",
      "graduationDate": "Month Year",
      "gpa": "GPA if present",
      "honors": ["Honor 1"] if present
    }
  ],
  "skills": {
    "technical": ["Skill 1", "Skill 2"],
    "soft": ["Communication", "Leadership"],
    "tools": ["Tool 1", "Tool 2"]
  },
  "certifications": [
    {
      "name": "Certification name",
      "issuer": "Issuing organization",
      "date": "Month Year"
    }
  ] if present,
  "projects": [
    {
      "name": "Project name",
      "description": "Brief description",
      "technologies": ["Tech 1", "Tech 2"],
      "highlights": ["Achievement 1"]
    }
  ] if present
}

Be thorough and extract all information. If a field is not present, omit it or use empty array.`;

  try {
    const response = await gemini.generateContent(prompt);
    const text = response.response.text();

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from Gemini response');
    }

    const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);

    return {
      ...parsed,
      raw: resumeText
    };
  } catch (error) {
    console.error('Resume parsing failed:', error);
    throw new Error('Failed to parse resume');
  }
}
