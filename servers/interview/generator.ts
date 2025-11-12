/**
 * Interview Question Generator
 * Generate mock interview questions and follow-ups
 */

import { callMCPTool } from '../client';
import { JobPosting } from '../jobs/fetcher';

export interface InterviewQuestion {
  id: string;
  type: 'behavioral' | 'technical' | 'situational' | 'case-study' | 'coding';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  context?: string; // Additional context for the question
  expectedAnswer?: string; // Example good answer
  evaluationCriteria: string[]; // What to look for in answer
  followUps?: string[]; // Potential follow-up questions
}

export interface MockInterview {
  jobTitle: string;
  company: string;
  questions: InterviewQuestion[];
  estimatedDuration: number; // minutes
}

/**
 * Generate interview questions based on job description
 */
export async function generateInterviewQuestions(
  job: JobPosting,
  interviewType: 'phone-screen' | 'technical' | 'behavioral' | 'final',
  count: number = 10
): Promise<MockInterview> {
  return callMCPTool<MockInterview>('interview__generate_questions', {
    job,
    interviewType,
    count
  });
}

/**
 * Direct implementation
 */
export async function generateInterviewQuestionsDirect(
  job: JobPosting,
  interviewType: 'phone-screen' | 'technical' | 'behavioral' | 'final',
  count: number = 10
): Promise<MockInterview> {
  const { createGeminiService } = await import('../../lib/gemini');
  const { getGeminiApiKey } = await import('../../app/admin/actions');

  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const gemini = createGeminiService(apiKey);

  const typeGuidance = {
    'phone-screen': 'Focus on basic qualifications, motivation, and culture fit. Mix of behavioral and light technical.',
    'technical': 'Deep technical questions, coding problems, system design. Focus on skills from JD.',
    'behavioral': 'STAR method questions about past experiences, teamwork, conflict resolution, leadership.',
    'final': 'Mix of strategic thinking, culture fit, and scenario-based questions. Executive-level reasoning.'
  };

  const prompt = `You are an interview coach generating realistic interview questions for this role.

Job Description:
Title: ${job.title}
Company: ${job.company}
Requirements: ${job.requirements.join(', ')}
Responsibilities: ${job.responsibilities.join(', ')}

Interview Type: ${interviewType}
Guidance: ${typeGuidance[interviewType]}

Generate ${count} realistic interview questions that:
1. Directly relate to the job requirements
2. Progress from easier to harder
3. Include technical and behavioral mix (appropriate to interview type)
4. Have clear evaluation criteria

Return JSON:
{
  "jobTitle": "${job.title}",
  "company": "${job.company}",
  "questions": [
    {
      "id": "q1",
      "type": "technical",
      "difficulty": "medium",
      "question": "Explain how you would design a scalable API for...",
      "context": "Based on the requirements for ${job.title}",
      "expectedAnswer": "A good answer would cover: REST principles, authentication, rate limiting, caching...",
      "evaluationCriteria": [
        "Mentions scalability considerations",
        "Discusses trade-offs",
        "Shows understanding of API design patterns"
      ],
      "followUps": [
        "How would you handle versioning?",
        "What caching strategy would you use?"
      ]
    }
  ],
  "estimatedDuration": ${count * 5}
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
    console.error('Interview generation failed:', error);
    throw new Error('Failed to generate interview questions');
  }
}

/**
 * Evaluate interview answer
 */
export async function evaluateAnswer(
  question: InterviewQuestion,
  answer: string
): Promise<{
  score: number; // 0-10
  feedback: string;
  strengths: string[];
  improvements: string[];
  suggestedAnswer?: string;
}> {
  return callMCPTool('interview__evaluate_answer', { question, answer });
}
