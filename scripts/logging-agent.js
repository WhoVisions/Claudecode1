#!/usr/bin/env node

/**
 * Logging Agent for Repository Change Tracking
 *
 * Monitors git status and logs all file changes to logs/changes.log
 * Run with: npm run logging-agent
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load config from meta.json
const metaPath = path.join(__dirname, '../docs/meta.json');
let config = {
  agent_interval_ms: 5000,
  log_file: 'logs/changes.log',
  ignored_paths: ['logs/', 'node_modules/', '.env', 'prisma/dev.db']
};

try {
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  if (meta.config) {
    config = { ...config, ...meta.config, log_file: meta.logging_agent.log_file };
  }
} catch (err) {
  console.warn('⚠️  Could not load meta.json, using defaults');
}

const LOG_FILE = path.join(__dirname, '..', config.log_file);
const INTERVAL_MS = config.agent_interval_ms;
const IGNORED_PATHS = config.ignored_paths;

// Ensure logs directory exists
const logsDir = path.dirname(LOG_FILE);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Initialize log file
if (!fs.existsSync(LOG_FILE)) {
  const initialEntry = {
    timestamp: new Date().toISOString(),
    event: 'agent_started',
    message: 'Logging agent initialized',
    config: config
  };
  fs.writeFileSync(LOG_FILE, JSON.stringify(initialEntry, null, 2) + '\n');
}

/**
 * Check if path should be ignored
 */
function shouldIgnore(filePath) {
  return IGNORED_PATHS.some(ignored => filePath.startsWith(ignored));
}

/**
 * Get current git status
 */
function getGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    const hash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();

    return {
      branch,
      hash,
      changes: status.split('\n').filter(line => line.trim()).map(line => {
        const status = line.substring(0, 2);
        const file = line.substring(3);
        return { status, file };
      }).filter(change => !shouldIgnore(change.file))
    };
  } catch (error) {
    return null;
  }
}

/**
 * Log changes to file
 */
function logChanges(gitStatus) {
  if (!gitStatus || gitStatus.changes.length === 0) {
    return;
  }

  const entry = {
    timestamp: new Date().toISOString(),
    event: 'files_changed',
    branch: gitStatus.branch,
    commit: gitStatus.hash,
    changes: gitStatus.changes.map(c => ({
      status: c.status.trim(),
      file: c.file,
      type: determineChangeType(c.status)
    }))
  };

  fs.appendFileSync(LOG_FILE, JSON.stringify(entry, null, 2) + '\n');

  // Also log to console
  console.log(`[${entry.timestamp}] ${entry.changes.length} file(s) changed`);
  entry.changes.forEach(change => {
    console.log(`  ${change.type.padEnd(10)} ${change.file}`);
  });
}

/**
 * Determine human-readable change type from git status
 */
function determineChangeType(status) {
  const s = status.trim();
  if (s === 'M' || s === 'MM') return 'modified';
  if (s === 'A' || s === 'AM') return 'added';
  if (s === 'D') return 'deleted';
  if (s === 'R') return 'renamed';
  if (s === '??') return 'untracked';
  if (s === 'UU') return 'conflict';
  return 'unknown';
}

/**
 * Main monitoring loop
 */
let lastChangesHash = '';

function monitor() {
  const gitStatus = getGitStatus();

  if (gitStatus && gitStatus.changes.length > 0) {
    const currentHash = JSON.stringify(gitStatus.changes);

    // Only log if changes are different from last check
    if (currentHash !== lastChangesHash) {
      logChanges(gitStatus);
      lastChangesHash = currentHash;
    }
  }
}

// Start monitoring
console.log('🔍 Logging agent started');
console.log(`📝 Log file: ${LOG_FILE}`);
console.log(`⏱️  Interval: ${INTERVAL_MS}ms`);
console.log(`🚫 Ignoring: ${IGNORED_PATHS.join(', ')}`);
console.log('');

// Run once immediately
monitor();

// Then run on interval
const intervalId = setInterval(monitor, INTERVAL_MS);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Logging agent stopped');
  clearInterval(intervalId);

  const shutdownEntry = {
    timestamp: new Date().toISOString(),
    event: 'agent_stopped',
    message: 'Logging agent shut down gracefully'
  };
  fs.appendFileSync(LOG_FILE, JSON.stringify(shutdownEntry, null, 2) + '\n');

  process.exit(0);
});
