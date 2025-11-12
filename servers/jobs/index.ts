/**
 * Jobs MCP Server
 * Job search, vetting, application tracking
 */

export * from './fetcher';
export * from './analyzer';
export * from './applications';

// Re-export MCP tools
export {
  fetchJobFromUrl,
  searchJobs,
  analyzeJob,
  generateFitSummary,
  createApplication,
  getApplications,
  updateApplicationStatus,
  addInterview,
  getApplicationStats
} from './applications';

// Re-export direct implementations
export {
  fetchJobFromUrlDirect,
  analyzeJobDirect,
  generateFitSummaryDirect
} from './analyzer';
