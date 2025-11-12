# Agentverse Deployment

This directory contains deployment scripts and configuration for the AI-Powered API Builder Agentverse architecture.

## Architecture

```
Guardian Agent (Public)
    ↓
Orchestrator Agent (Internal)
    ↓
MCP Tool Servers (Gemini, Prisma, ApiKey, Sandbox)
    ↓
Monitoring (Prometheus, Cloud Run Dashboard)
```

## Prerequisites

1. **Google Cloud SDK**
   ```bash
   # Install gcloud CLI
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   gcloud init
   ```

2. **Project Setup**
   ```bash
   # Set your project
   gcloud config set project YOUR_PROJECT_ID

   # Enable required APIs
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

3. **Environment Configuration**
   ```bash
   # Edit agentverse/set_env.sh with your values
   nano agentverse/set_env.sh

   # Update these variables:
   # - PROJECT_ID: Your GCP project ID
   # - PROJECT_NUMBER: Your GCP project number
   # - REGION: Deployment region (default: us-central1)
   # - GEMINI_API_KEY: Your Google Gemini API key
   # - DATABASE_URL: PostgreSQL connection string
   ```

## Deployment

### Quick Start

```bash
# 1. Load environment
source ./agentverse/set_env.sh

# 2. Deploy all agents
./agentverse/deploy.sh all
```

### Deploy Individual Agents

```bash
# Guardian only (public entry point)
./agentverse/deploy.sh guardian

# Orchestrator only (internal coordinator)
./agentverse/deploy.sh orchestrator
```

### Using Cloud Build (CI/CD)

```bash
# Trigger Cloud Build pipeline
gcloud builds submit --config=cloudbuild.yaml

# Monitor build progress
gcloud builds list --limit=5
gcloud builds log <BUILD_ID>
```

## Agent URLs (Locus Pattern)

After deployment, your agents will be available at:

- **Guardian Agent**: `https://guardian-agent-<PROJECT_NUMBER>.<REGION>.run.app`
- **Orchestrator Agent**: `https://orchestrator-agent-<PROJECT_NUMBER>.<REGION>.run.app`

## Testing

### Health Check

```bash
# Test Guardian Agent
curl https://guardian-agent-<PROJECT_NUMBER>.<REGION>.run.app/api/health

# Expected response:
# {
#   "status": "healthy",
#   "agentRole": "guardian",
#   "uptime": 123,
#   "timestamp": "2025-11-12T...",
#   "environment": "production"
# }
```

### Create API Test

```bash
# Send API creation request to Guardian
curl -X POST https://guardian-agent-<PROJECT_NUMBER>.<REGION>.run.app/api/guardian \
  -H "Content-Type: application/json" \
  -d '{
    "task": "create_api",
    "spec": {
      "name": "products",
      "mode": "ai",
      "description": "Product catalog with prices",
      "requiresAuth": true
    }
  }'
```

## Monitoring

### View Logs

```bash
# Guardian logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=guardian-agent" --limit=50

# Orchestrator logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=orchestrator-agent" --limit=50

# Tail logs in real-time
gcloud logging tail "resource.type=cloud_run_revision" --format=json
```

### Metrics Dashboard

1. Open [Cloud Run Console](https://console.cloud.google.com/run)
2. Select your agent service
3. View metrics: Requests, Latency, Errors, Container instances

### Prometheus (vLLM Metrics)

If using vLLM for model serving:
1. Enable Prometheus metrics in vLLM deployment
2. Configure Prometheus to scrape vLLM endpoint
3. Import vLLM dashboard to Grafana

## Configuration

### Environment Variables

Set via `--set-env-vars` in deploy.sh:

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (production/development) | Yes |
| `AGENT_ROLE` | Agent role (guardian/orchestrator) | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret for JWT signing | No |
| `LOG_LEVEL` | Logging level (info/debug/error) | No |

### Resource Limits

**Guardian Agent:**
- Memory: 512Mi
- CPU: 1
- Timeout: 60s
- Max Instances: 10
- Access: Public (unauthenticated)

**Orchestrator Agent:**
- Memory: 1Gi
- CPU: 2
- Timeout: 300s (5 minutes)
- Max Instances: 20
- Access: Private (requires authentication)

## Security

### Authentication

- Guardian Agent: Public (validates API keys)
- Orchestrator Agent: Private (requires IAM authentication)

### Network Security

```bash
# Allow only Guardian to call Orchestrator
gcloud run services add-iam-policy-binding orchestrator-agent \
  --member="serviceAccount:guardian-agent@YOUR_PROJECT.iam.gserviceaccount.com" \
  --role="roles/run.invoker" \
  --region=$REGION
```

### Secrets Management

Use Secret Manager for sensitive values:

```bash
# Create secret
echo -n "your-gemini-api-key" | gcloud secrets create gemini-api-key --data-file=-

# Grant access
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Reference in Cloud Run
gcloud run deploy guardian-agent \
  --update-secrets=GEMINI_API_KEY=gemini-api-key:latest
```

## Troubleshooting

### Build Failures

```bash
# Check Cloud Build logs
gcloud builds log <BUILD_ID>

# Common issues:
# - Missing dependencies: Check package.json
# - Build timeout: Increase timeout in cloudbuild.yaml
# - Permission errors: Check IAM roles
```

### Deployment Failures

```bash
# Describe service
gcloud run services describe guardian-agent --region=$REGION

# Check revision status
gcloud run revisions list --service=guardian-agent --region=$REGION

# View error details
gcloud run revisions describe <REVISION> --region=$REGION
```

### Runtime Errors

```bash
# Check logs for errors
gcloud logging read "resource.type=cloud_run_revision AND severity>=ERROR" --limit=50

# Common issues:
# - Database connection: Check DATABASE_URL
# - API key errors: Verify GEMINI_API_KEY
# - Memory limits: Increase in deploy.sh
```

## Rollback

```bash
# List revisions
gcloud run revisions list --service=guardian-agent --region=$REGION

# Rollback to previous revision
gcloud run services update-traffic guardian-agent \
  --to-revisions=<PREVIOUS_REVISION>=100 \
  --region=$REGION
```

## Cost Optimization

- Use `--min-instances=0` for low-traffic agents
- Set appropriate `--max-instances` limits
- Use `--memory=512Mi` for Guardian (lighter workload)
- Use `--cpu-throttling` for non-latency-sensitive tasks

## Next Steps

1. Set up Prometheus monitoring
2. Configure alerting (error rate, latency)
3. Implement CI/CD triggers on git push
4. Add integration tests
5. Set up staging environment

---

**Last Updated**: 2025-11-12
**Version**: 1.0.0
**Owner**: Cool Visions LLC
