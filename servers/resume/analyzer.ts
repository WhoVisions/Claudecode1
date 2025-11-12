/**
 * Resume Analyzer
 * Skills gap analysis and resume scoring
 */

import { callMCPTool } from '../client';
import { ParsedResume } from './parser';

export interface SkillGap {
  skill: string;
  category: 'required' | 'preferred' | 'nice-to-have';
  present: boolean;
  relatedSkills?: string[]; // Skills user has that are related
  priority: 'high' | 'medium' | 'low';
}

export interface SkillGapAnalysis {
  jobTitle: string;
  requiredSkills: SkillGap[];
  matchScore: number; // 0-100
  missingCount: number;
  recommendations: string[];
  learningPath?: {
    skill: string;
    estimatedTime: string; // e.g., "2 weeks", "1 month"
    resources: string[];
  }[];
}

/**
 * Analyze skill gaps between resume and job description
 */
export async function analyzeSkillGaps(
  resume: ParsedResume | string,
  jobDescription: string
): Promise<SkillGapAnalysis> {
  return callMCPTool<SkillGapAnalysis>('resume__analyze_gaps', { resume, jobDescription });
}

/**
 * Direct implementation
 */
export async function analyzeSkillGapsDirect(
  resume: ParsedResume | string,
  jobDescription: string
): Promise<SkillGapAnalysis> {
  const { createGeminiService } = await import('../../lib/gemini');
  const { getGeminiApiKey } = await import('../../app/admin/actions');
  const { parseResumeDirect } = await import('./parser');

  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const gemini = createGeminiService(apiKey);

  const parsed = typeof resume === 'string'
    ? await parseResumeDirect(resume)
    : resume;

  const prompt = `You are a career advisor analyzing skill gaps. Compare the candidate's resume against a job description.

Job Description:
${jobDescription}

Candidate's Resume:
Name: ${parsed.name}
Skills: ${JSON.stringify(parsed.skills, null, 2)}
Experience: ${parsed.experience.map(exp => `${exp.title} at ${exp.company}`).join(', ')}

Task:
1. Extract all required skills, technologies, and qualifications from the JD
2. Categorize each as: required, preferred, or nice-to-have
3. Check if the candidate has each skill (or closely related skill)
4. Calculate overall match score
5. Provide learning recommendations for missing skills

Return JSON:
{
  "jobTitle": "Job title from JD",
  "requiredSkills": [
    {
      "skill": "Python",
      "category": "required",
      "present": true,
      "relatedSkills": ["Programming", "Scripting"],
      "priority": "high"
    },
    {
      "skill": "Kubernetes",
      "category": "required",
      "present": false,
      "priority": "high"
    }
  ],
  "matchScore": 75,
  "missingCount": 3,
  "recommendations": [
    "Strong match for core requirements",
    "Missing Kubernetes - critical for role",
    "Consider highlighting cloud experience more prominently"
  ],
  "learningPath": [
    {
      "skill": "Kubernetes",
      "estimatedTime": "3 weeks",
      "resources": [
        "Official Kubernetes documentation",
        "Kubernetes in Action book",
        "Hands-on lab: Deploy a microservices app"
      ]
    }
  ]
}`;

  try {
    const response = await gemini.generateContent(prompt);
    const text = response.response.text();

    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from response');
    }

    return JSON.parse(jsonMatch[1] || jsonMatch[0]);
  } catch (error) {
    console.error('Skill gap analysis failed:', error);
    throw new Error('Failed to analyze skill gaps');
  }
}

/**
 * Score resume quality (ATS and human readability)
 */
export async function scoreResume(resume: ParsedResume | string): Promise<{
  atsScore: number;
  humanScore: number;
  overallScore: number;
  feedback: {
    category: string;
    score: number;
    issues: string[];
    improvements: string[];
  }[];
}> {
  return callMCPTool('resume__score', { resume });
}
