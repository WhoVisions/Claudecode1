/**
 * Health check endpoint for Cloud Run
 * Returns service status and agent role
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const agentRole = process.env.AGENT_ROLE || 'standalone';
  const uptime = process.uptime();

  return NextResponse.json({
    status: 'healthy',
    agentRole,
    uptime: Math.floor(uptime),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
}
