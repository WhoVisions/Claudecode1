#!/bin/bash
# Environment setup for Agentverse deployment
# Source this file: . ./agentverse/set_env.sh

# GCP Project Configuration
export PROJECT_ID="${PROJECT_ID:-your-project-id}"
export PROJECT_NUMBER="${PROJECT_NUMBER:-123456789}"
export REGION="${REGION:-us-central1}"

# Agent Configuration
export GUARDIAN_AGENT_URL="https://guardian-agent-${PROJECT_NUMBER}.${REGION}.run.app"
export ORCHESTRATOR_AGENT_URL="https://orchestrator-agent-${PROJECT_NUMBER}.${REGION}.run.app"

# Database Configuration
export DATABASE_URL="${DATABASE_URL:-postgresql://user:pass@host:5432/dbname}"

# Gemini API Configuration
export GEMINI_API_KEY="${GEMINI_API_KEY:-your-gemini-api-key}"

# Monitoring Configuration
export PROMETHEUS_ENDPOINT="${PROMETHEUS_ENDPOINT:-}"
export ENABLE_METRICS="${ENABLE_METRICS:-true}"

# Security
export API_KEY_PREFIX="ak_"
export JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 32)}"

# Development vs Production
export NODE_ENV="${NODE_ENV:-production}"

# Logging
export LOG_LEVEL="${LOG_LEVEL:-info}"
export LOG_FORMAT="${LOG_FORMAT:-json}"

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Agentverse Environment Loaded${NC}"
echo -e "${BLUE}Project ID:${NC} $PROJECT_ID"
echo -e "${BLUE}Region:${NC} $REGION"
echo -e "${BLUE}Guardian Agent:${NC} $GUARDIAN_AGENT_URL"
echo -e "${BLUE}Orchestrator Agent:${NC} $ORCHESTRATOR_AGENT_URL"
echo ""
echo -e "${YELLOW}Reminder:${NC} Update PROJECT_ID and PROJECT_NUMBER with your actual values"
