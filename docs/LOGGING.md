# Logging Infrastructure

This repository includes a continuous change logging system to track all file modifications, additions, and deletions.

## Overview

The logging agent monitors git status every 5 seconds and records changes to `logs/changes.log`. This provides:

- **Provenance tracking**: Complete history of who changed what and when
- **Audit trail**: Compliance-ready change logs
- **Development insights**: Understanding of code evolution
- **Integration ready**: JSON format for easy ingestion into observability tools

## Quick Start

### Running the Logging Agent

```bash
# Start the logging agent
npm run logging-agent

# You should see:
# 🔍 Logging agent started
# 📝 Log file: logs/changes.log
# ⏱️  Interval: 5000ms
# 🚫 Ignoring: logs/, node_modules/, .env, prisma/dev.db
```

### Stopping the Agent

Press `Ctrl+C` to gracefully shut down the agent.

## Configuration

The agent reads configuration from `docs/meta.json`:

```json
{
  "config": {
    "agent_interval_ms": 5000,
    "ignored_paths": ["logs/", "node_modules/", ".env", "prisma/dev.db"]
  },
  "logging_agent": {
    "log_file": "logs/changes.log"
  }
}
```

### Configuration Options

- `agent_interval_ms`: How often to check for changes (default: 5000ms)
- `ignored_paths`: Paths to ignore (logs, node_modules, etc.)
- `log_file`: Where to write the change log

## Log Format

The log file contains JSON entries:

```json
{
  "timestamp": "2025-11-12T00:10:00.000Z",
  "event": "files_changed",
  "branch": "claude/nextjs-react-tailwind-setup-011CV2s3PbMbgXFj4xUkTB7y",
  "commit": "860d2059f7120d5ab2cc7bafa806382ad5470d28",
  "changes": [
    {
      "status": "M",
      "file": "app/api/route.ts",
      "type": "modified"
    },
    {
      "status": "A",
      "file": "lib/newFeature.ts",
      "type": "added"
    }
  ]
}
```

### Event Types

- `agent_started`: Agent initialization
- `files_changed`: File modifications detected
- `agent_stopped`: Graceful shutdown

### Change Types

- `modified`: File was changed
- `added`: New file was created
- `deleted`: File was removed
- `renamed`: File was renamed
- `untracked`: New file not yet in git
- `conflict`: Merge conflict detected

## Integration with Observability

The JSON log format makes it easy to integrate with monitoring tools:

### Splunk/Datadog/Elasticsearch

```bash
# Tail the log file and forward to your ingestion endpoint
tail -f logs/changes.log | your-forwarder
```

### Custom Processing

```javascript
const fs = require('fs');

// Read the log file
const logs = fs.readFileSync('logs/changes.log', 'utf8')
  .split('\n')
  .filter(line => line.trim())
  .map(line => JSON.parse(line));

// Filter for specific events
const fileChanges = logs.filter(entry => entry.event === 'files_changed');

// Analyze change patterns
console.log(`Total change events: ${fileChanges.length}`);
```

## Security & Privacy

- The logs directory is git-ignored to prevent sensitive change history from being committed
- API keys, credentials, and environment files are excluded from tracking
- Logs contain only file paths and git metadata, not file contents
- For production deployments, consider encrypting logs at rest

## Metadata File

See `docs/meta.json` for repository metadata including:

- Actor information (developer name, email)
- Entity information (organization, ownership)
- Environment details (Node version, tooling)
- Git configuration
- Initial commit hash

## Best Practices

1. **Run during active development**: Start the agent when working on the project
2. **Review logs periodically**: Check for unexpected changes
3. **Archive old logs**: Rotate logs weekly/monthly to manage file size
4. **Integrate with CI/CD**: Consider running the agent in your build pipeline
5. **Monitor for conflicts**: Alert on `conflict` events

## Troubleshooting

### Agent not detecting changes

- Ensure you're in a git repository
- Check that files aren't in `.gitignore`
- Verify git is installed and working

### High memory usage

- Reduce `agent_interval_ms` to check less frequently
- Clear old log entries periodically
- Add more paths to `ignored_paths`

### Permission errors

```bash
# Make the script executable
chmod +x scripts/logging-agent.js
```

## Advanced Usage

### Running in Background

```bash
# Using nohup
nohup npm run logging-agent > /dev/null 2>&1 &

# Using PM2 (recommended for production)
pm2 start npm --name "logging-agent" -- run logging-agent
pm2 save
```

### Custom Log Rotation

```bash
# Add to crontab for weekly rotation
0 0 * * 0 mv logs/changes.log logs/changes-$(date +\%Y\%m\%d).log
```

## Future Enhancements

- [ ] Webhook notifications for critical changes
- [ ] Slack/Discord integration
- [ ] Web dashboard for visualizing change history
- [ ] Machine learning anomaly detection
- [ ] Automatic backup to cloud storage

---

**Note**: This logging infrastructure is designed for development and audit purposes. It does not replace proper version control practices.
