/**
 * Job Analyzer
 * Vetting, red flags, company research
 */

import { callMCPTool } from '../client';
import { JobPosting } from './fetcher';

export interface JobAnalysis {
  matchScore: number; // 0-100 based on user profile
  redFlags: RedFlag[];
  positives: string[];
  companyInfo: CompanyInfo;
  salaryAnalysis: SalaryAnalysis;
  recommendApply: boolean;
  reasoning: string;
}

export interface RedFlag {
  type: 'compensation' | 'workload' | 'culture' | 'requirements' | 'other';
  severity: 'low' | 'medium' | 'high';
  description: string;
  evidence: string; // Quote from JD
}

export interface CompanyInfo {
  name: string;
  industry: string;
  size?: string; // e.g., "50-200 employees"
  founded?: string;
  recentNews?: string[];
  glassdoorRating?: number;
  glassdoorReviews?: {
    pros: string[];
    cons: string[];
  };
  missionStatement?: string;
}

export interface SalaryAnalysis {
  listed?: { min?: number; max?: number; currency: string };
  marketRange: { min: number; max: number; currency: string };
  percentile: number; // Where listed salary falls in market range
  recommendation: string;
}

/**
 * Analyze job posting for red flags and fit
 */
export async function analyzeJob(
  job: JobPosting,
  userProfile?: any
): Promise<JobAnalysis> {
  return callMCPTool<JobAnalysis>('jobs__analyze', { job, userProfile });
}

/**
 * Direct implementation
 */
export async function analyzeJobDirect(
  job: JobPosting,
  userProfile?: any
): Promise<JobAnalysis> {
  const { createGeminiService } = await import('../../lib/gemini');
  const { getGeminiApiKey } = await import('../../app/admin/actions');

  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const gemini = createGeminiService(apiKey);

  const prompt = `You are a career advisor analyzing a job posting. Identify red flags, positives, and overall fit.

Job Posting:
${JSON.stringify(job, null, 2)}

${userProfile ? `User Profile:\n${JSON.stringify(userProfile, null, 2)}` : ''}

Red Flag Categories to Check:
1. **Compensation**: No salary listed, below market, "competitive" without range
2. **Workload**: "Fast-paced", "wear many hats", excessive hours
3. **Culture**: "Work hard play hard", "ninja/rockstar", buzzword overload
4. **Requirements**: Unrealistic (10 years exp for junior role), contradictory
5. **Other**: Vague responsibilities, high turnover signals

Positive Signals:
- Clear growth path
- Specific technologies/projects
- Transparent compensation
- Emphasis on work-life balance
- Strong mission alignment

Return JSON:
{
  "matchScore": 85,
  "redFlags": [
    {
      "type": "requirements",
      "severity": "medium",
      "description": "Unrealistic experience requirement for junior role",
      "evidence": "5+ years required for Junior Developer position"
    }
  ],
  "positives": [
    "Clear tech stack and specific projects mentioned",
    "Salary range provided and competitive",
    "Emphasis on mentorship and learning"
  ],
  "companyInfo": {
    "name": "${job.company}",
    "industry": "Technology",
    "size": "Estimate from description"
  },
  "salaryAnalysis": {
    ${job.salary ? `"listed": ${JSON.stringify(job.salary)},` : ''}
    "marketRange": { "min": 90000, "max": 130000, "currency": "USD" },
    "percentile": 65,
    "recommendation": "Salary is at 65th percentile for this role/location. Room to negotiate."
  },
  "recommendApply": true,
  "reasoning": "Strong match with only minor red flags. Company shows good signs."
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
    console.error('Job analysis failed:', error);
    throw new Error('Failed to analyze job posting');
  }
}

/**
 * Generate "Why I'm a Good Fit" summary
 */
export async function generateFitSummary(
  job: JobPosting,
  resume: any
): Promise<{ points: string[]; explanation: string }> {
  return callMCPTool('jobs__fit_summary', { job, resume });
}

/**
 * Direct implementation
 */
export async function generateFitSummaryDirect(
  job: JobPosting,
  resume: any
): Promise<{ points: string[]; explanation: string }> {
  const { createGeminiService } = await import('../../lib/gemini');
  const { getGeminiApiKey } = await import('../../app/admin/actions');

  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const gemini = createGeminiService(apiKey);

  const prompt = `You are writing a "Why I'm a Good Fit" summary for a job application.

Job Requirements (Top 3):
${job.requirements.slice(0, 3).join('\n')}

Candidate's Experience:
${JSON.stringify(resume.experience, null, 2)}
${JSON.stringify(resume.skills, null, 2)}

Create 3 bullet points that directly map the candidate's experience to the job's top requirements.
Each bullet should:
- Start with the requirement
- Show specific experience that matches
- Quantify when possible

Return JSON:
{
  "points": [
    "Requirement: Python expertise → I have 5 years of Python development, building production APIs handling 10M+ requests/day",
    "Requirement: Cloud infrastructure → I architected and deployed 15+ microservices on AWS, reducing costs by 40%",
    "Requirement: Team leadership → I led a team of 4 engineers, mentoring junior developers and implementing Agile practices"
  ],
  "explanation": "Strong alignment across core requirements with proven track record of delivery and impact."
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
    console.error('Fit summary generation failed:', error);
    throw new Error('Failed to generate fit summary');
  }
}
