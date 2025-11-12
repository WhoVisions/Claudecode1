# Agent System Design

**Project**: AI-Powered API Builder
**Pattern**: Agentverse Hybrid Architecture
**Owner**: Dave Meralus (Cool Visions LLC)

## Overview

This document defines the agent system architecture for the AI-Powered API Builder, following Google's Agentverse patterns while maintaining a pragmatic hybrid approach.

## Architecture Pattern: Hybrid Agentverse

```
┌─────────────────────────────────────────────────┐
│  Frontend Layer (Next.js 16)                    │
│  - User interface                                │
│  - Admin dashboard                               │
│  - API key management UI                         │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│  Guardian Agent (Entry Point)                   │
│  - Accepts API creation requests                │
│  - Routes to orchestrator                       │
│  - Returns results to user                      │
│  - Locus URL: guardian-agent-${PROJECT}.run.app │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│  Orchestrator Agent                             │
│  - Sequential/parallel task execution           │
│  - Schema generation workflow                   │
│  - API deployment workflow                      │
│  - Error handling and retries                   │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│  MCP Tool Servers                               │
│  ├── Gemini Server (AI operations)             │
│  ├── Prisma Server (DB operations)             │
│  ├── ApiKey Server (Auth operations)           │
│  └── Sandbox Server (Code execution)           │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│  Monitoring & Logging                           │
│  - Prometheus (vLLM metrics)                    │
│  - Cloud Run dashboard                          │
│  - Logging agent (file changes)                 │
│  - Error tracking                               │
└─────────────────────────────────────────────────┘
```

## Agent Roles

### 1. Guardian Agent

**Purpose**: Public entry point for all API creation requests

**Responsibilities**:
- Accept JSON payloads with API specifications
- Validate input format and requirements
- Route to orchestrator
- Return formatted responses
- Handle errors gracefully

**Input Format**:
```json
{
  "task": "create_api",
  "spec": {
    "name": "products",
    "mode": "ai" | "manual",
    "description": "Store product catalog with prices",
    "schema": { ... },
    "requiresAuth": true
  }
}
```

**Output Format**:
```json
{
  "success": true,
  "apiUrl": "/api/products",
  "apiKey": "ak_...",
  "message": "API created successfully"
}
```

**Deployment**: Cloud Run service

### 2. Orchestrator Agent

**Purpose**: Coordinate multi-step API creation workflows

**Workflows**:

**AI-Powered Creation**:
1. Receive spec from Guardian
2. Call Gemini MCP server for schema generation
3. Validate generated schema
4. Call Prisma MCP server to create model
5. If auth required, call ApiKey MCP server
6. Test API in sandbox
7. Return success or error

**Manual Creation**:
1. Receive spec from Guardian
2. Validate provided schema
3. Call Prisma MCP server to create model
4. If auth required, call ApiKey MCP server
5. Test API in sandbox
6. Return success or error

**Error Handling**:
- Retry failed MCP calls up to 3 times
- Rollback on failure (delete created resources)
- Log all errors to monitoring

**Deployment**: Cloud Run service or serverless function

### 3. MCP Tool Servers

**Gemini Server** (`servers/gemini/`)
- `generateSchema`: AI schema generation
- `suggestApiName`: API naming suggestions
- `testApiKey`: Validate Gemini credentials

**Prisma Server** (`servers/prisma/`)
- `createModel`: Create API model
- `getModels`: List all APIs
- `deleteModel`: Remove API
- `createApiKey`: Generate auth key
- `getApiKeys`: List keys
- `toggleApiKey`: Enable/disable key

**ApiKey Server** (`servers/apikey/`)
- `generate`: Create secure keys
- `validate`: Check key format

**Sandbox Server** (`servers/sandbox/`)
- `executeCode`: Run code safely
- `testApi`: Validate API endpoints
- `runTests`: Execute test suite

## Tool Discovery

### Progressive Disclosure

Agents load tool definitions on-demand:

```typescript
import { searchMCPTools } from './servers';

// Search for schema-related tools
const tools = await searchMCPTools('schema');
// Returns: gemini__generate_schema, prisma__create_model, etc.

// Load only what's needed
import * as gemini from './servers/gemini';
const schema = await gemini.generateSchema({...});
```

### Context Efficiency

- **Direct tool calls**: 150k tokens
- **MCP code execution**: 2k tokens
- **Reduction**: 98%

## Sandbox Rules

**Critical**: All agent-generated code MUST run in sandbox

```typescript
import { executeSafely } from './servers/sandbox';

const result = await executeSafely({
  code: generatedCode,
  timeout: 5000,
  memoryLimit: '128MB',
  allowNetwork: false
});
```

**Never** execute arbitrary code on host system.

## Deployment

### Cloud Run Services

```bash
# Set environment
. ./agentverse/set_env.sh

# Deploy Guardian
gcloud run deploy guardian-agent \
  --source . \
  --region ${REGION} \
  --allow-unauthenticated

# Deploy Orchestrator
gcloud run deploy orchestrator-agent \
  --source . \
  --region ${REGION} \
  --no-allow-unauthenticated

# Get Locus URLs
echo "Guardian: https://guardian-agent-${PROJECT_NUMBER}.${REGION}.run.app"
echo "Orchestrator: https://orchestrator-${PROJECT_NUMBER}.${REGION}.run.app"
```

### CI/CD Pipeline

```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/guardian-agent', '.']

  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/guardian-agent']

  - name: 'gcr.io/cloud-builders/gcloud'
    args: ['run', 'deploy', 'guardian-agent', '--image', 'gcr.io/$PROJECT_ID/guardian-agent']
```

## Monitoring

### Prometheus Dashboard

- Open vLLM Prometheus Overview dashboard
- Monitor token usage, latency, errors
- Set alerts for failures

### Cloud Run Dashboard

- Request count and latency
- Error rates
- Resource usage
- Autoscaling metrics

### Logging Agent

- File change tracking
- Git commit correlation
- JSON format for integration

## Quality Enforcement

### Evaluation Suite

```bash
# Run tests before deployment
pytest tests/agent_eval.py

# Tests cover:
# - Schema generation accuracy
# - API creation success rate
# - Authentication flow
# - Error handling
# - Performance benchmarks
```

### Rules Enforcement

See `GEMINI.md` for agent behavior rules.

## Development Workflow

1. Define task spec (JSON or MD)
2. Update agent design if needed
3. Implement in code
4. Run evaluation suite
5. Deploy to Cloud Run
6. Monitor with Prometheus
7. Iterate based on metrics

## Security

- Sandbox all code execution
- Validate all inputs
- Use API key auth for agents
- Monitor for suspicious activity
- Rate limit public endpoints
- Log all agent decisions

## Future Evolution

- [ ] Add more MCP servers (Git, CI/CD, Analytics)
- [ ] Implement multi-agent collaboration
- [ ] Add feedback loops for self-improvement
- [ ] Deploy on Cloud Run with autoscaling
- [ ] Integrate with Vertex AI for model hosting
- [ ] Build agent memory/state persistence

---

**Last Updated**: 2025-11-12
**Version**: 1.0.0
**Status**: In Development
