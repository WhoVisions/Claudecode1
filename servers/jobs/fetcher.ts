/**
 * Job Fetcher
 * Scrapes and fetches job descriptions from URLs
 */

import { callMCPTool } from '../client';

export interface JobPosting {
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  salary?: {
    min?: number;
    max?: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  responsibilities: string[];
  niceToHave?: string[];
  url: string;
  postedDate?: string;
  applicationDeadline?: string;
}

/**
 * Fetch job description from URL
 * Uses Gemini Context API to ingest the page
 */
export async function fetchJobFromUrl(url: string): Promise<JobPosting> {
  return callMCPTool<JobPosting>('jobs__fetch', { url });
}

/**
 * Direct implementation
 */
export async function fetchJobFromUrlDirect(url: string): Promise<JobPosting> {
  const { createGeminiService } = await import('../../lib/gemini');
  const { getGeminiApiKey } = await import('../../app/admin/actions');

  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const gemini = createGeminiService(apiKey);

  // Fetch the job page content
  let pageContent: string;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch job page: ${response.statusText}`);
    }
    pageContent = await response.text();
  } catch (error) {
    throw new Error(`Failed to fetch job URL: ${error}`);
  }

  const prompt = `You are a job posting parser. Extract structured information from this job posting HTML.

URL: ${url}

HTML Content:
${pageContent.substring(0, 50000)}

Extract and return JSON:
{
  "title": "Job title",
  "company": "Company name",
  "location": "City, State or Remote",
  "type": "full-time" | "part-time" | "contract" | "internship" | "remote",
  "salary": {
    "min": 100000,
    "max": 150000,
    "currency": "USD"
  } if mentioned,
  "description": "Full job description text",
  "requirements": [
    "Bachelor's degree in Computer Science",
    "5+ years of experience with Python"
  ],
  "responsibilities": [
    "Design and implement features",
    "Collaborate with cross-functional teams"
  ],
  "niceToHave": ["PhD", "Open source contributions"] if mentioned,
  "url": "${url}",
  "postedDate": "Date posted if available",
  "applicationDeadline": "Deadline if mentioned"
}

Be thorough. Extract all requirements and responsibilities as separate items.`;

  try {
    const response = await gemini.generateContent(prompt);
    const text = response.response.text();

    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from response');
    }

    return JSON.parse(jsonMatch[1] || jsonMatch[0]);
  } catch (error) {
    console.error('Job fetching failed:', error);
    throw new Error('Failed to fetch and parse job posting');
  }
}

/**
 * Search for jobs by criteria
 * Note: Requires integration with job board APIs (Indeed, LinkedIn, etc.)
 */
export async function searchJobs(criteria: {
  keywords: string;
  location?: string;
  type?: string;
  remote?: boolean;
  limit?: number;
}): Promise<JobPosting[]> {
  return callMCPTool<JobPosting[]>('jobs__search', criteria);
}
