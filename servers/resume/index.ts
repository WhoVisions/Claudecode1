/**
 * Resume MCP Server
 * Complete resume management: parsing, enhancement, tailoring, analysis
 */

export * from './parser';
export * from './enhancer';
export * from './analyzer';

// MCP tool exports (these call the MCP layer)
export {
  parseResume,
  enhanceResume,
  tailorResume,
  analyzeSkillGaps,
  scoreResume
} from './analyzer';

// Direct exports (these bypass MCP for internal use)
export {
  parseResumeDirect,
  enhanceResumeDirect,
  tailorResumeDirect,
  analyzeSkillGapsDirect
} from './analyzer';
