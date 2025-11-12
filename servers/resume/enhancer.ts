/**
 * Resume Enhancer
 * Improves resume content, keywords, and formatting
 */

import { callMCPTool } from '../client';
import { ParsedResume } from './parser';

export interface EnhancementConfig {
  resume: ParsedResume | string;
  targetRole?: string;
  targetIndustry?: string;
  focusAreas?: ('achievements' | 'keywords' | 'formatting' | 'ats-optimization')[];
}

export interface EnhancedResume {
  enhanced: ParsedResume;
  original: ParsedResume;
  changes: ResumeChange[];
  atsScore: number; // 0-100
  suggestions: string[];
}

export interface ResumeChange {
  section: 'summary' | 'experience' | 'education' | 'skills' | 'projects';
  type: 'added' | 'modified' | 'removed' | 'improved';
  before: string;
  after: string;
  reason: string;
}

/**
 * Enhance resume content and formatting
 */
export async function enhanceResume(config: EnhancementConfig): Promise<EnhancedResume> {
  return callMCPTool<EnhancedResume>('resume__enhance', config);
}

/**
 * Direct implementation
 */
export async function enhanceResumeDirect(config: EnhancementConfig): Promise<EnhancedResume> {
  const { createGeminiService } = await import('../../lib/gemini');
  const { getGeminiApiKey } = await import('../../app/admin/actions');
  const { parseResumeDirect } = await import('./parser');

  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const gemini = createGeminiService(apiKey);

  // Parse if raw text provided
  const original = typeof config.resume === 'string'
    ? await parseResumeDirect(config.resume)
    : config.resume;

  const focusAreas = config.focusAreas || ['achievements', 'keywords', 'ats-optimization'];

  const prompt = `You are a professional resume enhancement expert. Improve this resume to make it more impactful and ATS-friendly.

Original Resume:
${JSON.stringify(original, null, 2)}

${config.targetRole ? `Target Role: ${config.targetRole}` : ''}
${config.targetIndustry ? `Target Industry: ${config.targetIndustry}` : ''}

Focus Areas: ${focusAreas.join(', ')}

Guidelines:
1. **Achievements**: Use STAR method (Situation, Task, Action, Result). Quantify everything.
2. **Keywords**: Include industry-standard keywords and skills from job descriptions.
3. **Formatting**: Use consistent formatting, strong action verbs, concise bullets.
4. **ATS Optimization**: Ensure all content is machine-readable and keyword-rich.

For each work experience bullet:
- Start with strong action verbs (Led, Developed, Implemented, Achieved)
- Quantify results (percentages, numbers, dollar amounts)
- Show impact on business (revenue, efficiency, customer satisfaction)

Return JSON:
{
  "enhanced": { /* Enhanced ParsedResume object */ },
  "changes": [
    {
      "section": "experience",
      "type": "improved",
      "before": "Worked on features",
      "after": "Developed 15+ customer-facing features, increasing user engagement by 35%",
      "reason": "Added quantification and impact"
    }
  ],
  "atsScore": 85,
  "suggestions": [
    "Add more technical keywords for ${config.targetRole || 'target role'}",
    "Quantify achievements in Education section"
  ]
}`;

  try {
    const response = await gemini.generateContent(prompt);
    const text = response.response.text();

    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from response');
    }

    const result = JSON.parse(jsonMatch[1] || jsonMatch[0]);

    return {
      ...result,
      original
    };
  } catch (error) {
    console.error('Resume enhancement failed:', error);
    throw new Error('Failed to enhance resume');
  }
}

/**
 * Tailor resume to specific job description
 */
export async function tailorResume(
  resume: ParsedResume | string,
  jobDescription: string
): Promise<EnhancedResume> {
  return callMCPTool<EnhancedResume>('resume__tailor', { resume, jobDescription });
}

/**
 * Direct implementation for tailoring
 */
export async function tailorResumeDirect(
  resume: ParsedResume | string,
  jobDescription: string
): Promise<EnhancedResume> {
  const { createGeminiService } = await import('../../lib/gemini');
  const { getGeminiApiKey } = await import('../../app/admin/actions');
  const { parseResumeDirect } = await import('./parser');

  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const gemini = createGeminiService(apiKey);

  const original = typeof resume === 'string'
    ? await parseResumeDirect(resume)
    : resume;

  const prompt = `You are an expert at tailoring resumes to specific job descriptions. Your goal is to maximize the match between the resume and the job requirements while maintaining truthfulness.

Job Description:
${jobDescription}

Current Resume:
${JSON.stringify(original, null, 2)}

Instructions:
1. **Identify Keywords**: Extract key skills, technologies, and qualifications from the JD.
2. **Match Skills**: Highlight existing skills that match the JD. Add synonyms if applicable.
3. **Rewrite Summary**: Tailor the professional summary to directly address the role.
4. **Optimize Bullets**: Reorder and rewrite experience bullets to emphasize relevant achievements.
5. **ATS Keywords**: Ensure all critical keywords from the JD appear naturally in the resume.

IMPORTANT: Only include skills/experience the candidate actually has. Do not fabricate.

Return JSON with the same structure as resume enhancement, focusing on JD alignment.`;

  try {
    const response = await gemini.generateContent(prompt);
    const text = response.response.text();

    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from response');
    }

    const result = JSON.parse(jsonMatch[1] || jsonMatch[0]);

    return {
      ...result,
      original
    };
  } catch (error) {
    console.error('Resume tailoring failed:', error);
    throw new Error('Failed to tailor resume');
  }
}
