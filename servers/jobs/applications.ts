/**
 * Job Applications
 * Track and manage job applications
 */

import { callMCPTool } from '../client';
import { JobPosting } from './fetcher';

export interface Application {
  id: string;
  userId: string;

  job: JobPosting;

  // Application materials
  tailoredResume: string; // Enhanced resume JSON
  coverLetter: string;
  fitSummary: string[];

  // Status tracking
  status: 'draft' | 'applied' | 'screening' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn';
  appliedAt?: Date;
  lastUpdated: Date;

  // Follow-ups
  followUps: FollowUp[];

  // Interviews
  interviews: Interview[];

  // Notes
  notes?: string;
}

export interface FollowUp {
  id: string;
  type: 'thank-you' | 'check-in' | 'accept-offer' | 'decline-offer' | 'withdraw';
  sentAt: Date;
  emailSubject: string;
  emailBody: string;
  response?: string;
}

export interface Interview {
  id: string;
  round: number;
  type: 'phone-screen' | 'technical' | 'behavioral' | 'onsite' | 'final';
  scheduledAt: Date;
  duration: number; // minutes
  interviewers?: {
    name: string;
    title: string;
    linkedinUrl?: string;
    notes?: string;
  }[];
  questions?: string[];
  feedback?: string;
  outcome?: 'passed' | 'failed' | 'pending';
}

/**
 * Create new job application
 */
export async function createApplication(
  userId: string,
  job: JobPosting,
  materials: {
    tailoredResume: string;
    coverLetter: string;
    fitSummary: string[];
  }
): Promise<Application> {
  return callMCPTool<Application>('jobs__create_application', {
    userId,
    job,
    materials
  });
}

/**
 * Get all applications for user
 */
export async function getApplications(
  userId: string,
  filters?: {
    status?: Application['status'];
    company?: string;
    fromDate?: Date;
  }
): Promise<Application[]> {
  return callMCPTool<Application[]>('jobs__get_applications', { userId, filters });
}

/**
 * Update application status
 */
export async function updateApplicationStatus(
  applicationId: string,
  status: Application['status'],
  notes?: string
): Promise<Application> {
  return callMCPTool<Application>('jobs__update_status', {
    applicationId,
    status,
    notes
  });
}

/**
 * Add interview to application
 */
export async function addInterview(
  applicationId: string,
  interview: Omit<Interview, 'id'>
): Promise<Application> {
  return callMCPTool<Application>('jobs__add_interview', {
    applicationId,
    interview
  });
}

/**
 * Generate application analytics
 */
export async function getApplicationStats(userId: string): Promise<{
  total: number;
  byStatus: Record<Application['status'], number>;
  responseRate: number; // % that moved past 'applied'
  interviewRate: number; // % that reached interview
  offerRate: number; // % that received offer
  avgTimeToResponse: number; // days
  topCompanies: { company: string; count: number }[];
}> {
  return callMCPTool('jobs__get_stats', { userId });
}
