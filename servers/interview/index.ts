/**
 * Interview MCP Server
 * Mock interviews, question generation, follow-ups
 */

export * from './generator';

// MCP tool exports
export {
  generateInterviewQuestions,
  evaluateAnswer
} from './generator';

// Direct exports
export {
  generateInterviewQuestionsDirect
} from './generator';
