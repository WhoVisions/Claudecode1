/**
 * Learning Resource Finder
 * Find tutorials, docs, courses for skill gaps
 */

import { callMCPTool } from '../client';

export interface LearningResource {
  type: 'tutorial' | 'documentation' | 'course' | 'book' | 'video' | 'article' | 'interactive';
  title: string;
  url: string;
  provider: string; // e.g., "MDN", "Coursera", "YouTube"
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: string; // e.g., "2 hours", "4 weeks"
  rating?: number; // 0-5
  isFree: boolean;
  description: string;
}

export interface LearningPath {
  skill: string;
  currentLevel: 'none' | 'beginner' | 'intermediate' | 'advanced';
  targetLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';

  resources: LearningResource[];
  milestones: {
    title: string;
    description: string;
    estimatedTime: string;
    resources: LearningResource[];
  }[];

  totalEstimatedTime: string;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Find learning resources for a skill
 * Uses Google Search API to find current, high-quality resources
 */
export async function findLearningResources(
  skill: string,
  level?: 'beginner' | 'intermediate' | 'advanced'
): Promise<LearningResource[]> {
  return callMCPTool<LearningResource[]>('learning__find_resources', { skill, level });
}

/**
 * Direct implementation
 */
export async function findLearningResourcesDirect(
  skill: string,
  level: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
): Promise<LearningResource[]> {
  const { createGeminiService } = await import('../../lib/gemini');
  const { getGeminiApiKey } = await import('../../app/admin/actions');

  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const gemini = createGeminiService(apiKey);

  // In production, this would use Google Search API
  // For now, using Gemini to generate curated recommendations
  const prompt = `You are a learning resource curator. Find the best current resources for learning ${skill} at ${level} level.

Skill: ${skill}
Level: ${level}

Provide a curated list of 5-10 high-quality learning resources from various types:
- Official documentation
- Interactive tutorials (freeCodeCamp, Codecademy, etc.)
- Video courses (YouTube, Coursera, Udemy)
- Books (O'Reilly, Manning, etc.)
- Articles and guides

Prioritize:
1. **Current** (2023-2025 content)
2. **Free** when possible
3. **Highly rated** (4+ stars)
4. **Interactive** and hands-on

Return JSON array:
[
  {
    "type": "documentation",
    "title": "Official ${skill} Documentation",
    "url": "https://...",
    "provider": "Official",
    "difficulty": "${level}",
    "estimatedTime": "Self-paced",
    "rating": 5,
    "isFree": true,
    "description": "Comprehensive official docs with examples"
  },
  {
    "type": "interactive",
    "title": "Learn ${skill} - Interactive Tutorial",
    "url": "https://...",
    "provider": "freeCodeCamp",
    "difficulty": "${level}",
    "estimatedTime": "8 hours",
    "rating": 4.5,
    "isFree": true,
    "description": "Hands-on exercises with immediate feedback"
  }
]`;

  try {
    const response = await gemini.generateContent(prompt);
    const text = response.response.text();

    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from response');
    }

    return JSON.parse(jsonMatch[1] || jsonMatch[0]);
  } catch (error) {
    console.error('Learning resource finding failed:', error);
    throw new Error('Failed to find learning resources');
  }
}

/**
 * Create personalized learning path
 */
export async function createLearningPath(
  skill: string,
  currentLevel: LearningPath['currentLevel'],
  targetLevel: LearningPath['targetLevel'],
  timeCommitment?: string // e.g., "5 hours/week"
): Promise<LearningPath> {
  return callMCPTool<LearningPath>('learning__create_path', {
    skill,
    currentLevel,
    targetLevel,
    timeCommitment
  });
}

/**
 * Direct implementation
 */
export async function createLearningPathDirect(
  skill: string,
  currentLevel: LearningPath['currentLevel'],
  targetLevel: LearningPath['targetLevel'],
  timeCommitment = '5 hours/week'
): Promise<LearningPath> {
  const { createGeminiService } = await import('../../lib/gemini');
  const { getGeminiApiKey } = await import('../../app/admin/actions');

  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const gemini = createGeminiService(apiKey);

  // Find resources first
  const resources = await findLearningResourcesDirect(skill,
    currentLevel === 'none' ? 'beginner' : currentLevel);

  const prompt = `You are a learning path designer. Create a structured learning path for ${skill}.

Skill: ${skill}
Current Level: ${currentLevel}
Target Level: ${targetLevel}
Time Commitment: ${timeCommitment}

Available Resources:
${JSON.stringify(resources, null, 2)}

Create a structured learning path with:
1. Clear milestones (e.g., "Fundamentals", "Practical Application", "Advanced Concepts")
2. Specific resources for each milestone
3. Realistic time estimates
4. Progressive difficulty

Return JSON:
{
  "skill": "${skill}",
  "currentLevel": "${currentLevel}",
  "targetLevel": "${targetLevel}",
  "resources": ${JSON.stringify(resources)},
  "milestones": [
    {
      "title": "Milestone 1: Fundamentals",
      "description": "Learn core concepts and syntax",
      "estimatedTime": "2 weeks",
      "resources": [/* subset of resources array */]
    }
  ],
  "totalEstimatedTime": "8 weeks",
  "priority": "high"
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
    console.error('Learning path creation failed:', error);
    throw new Error('Failed to create learning path');
  }
}
