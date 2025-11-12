#!/bin/bash
# Deployment script for Agentverse agents
# Usage: ./agentverse/deploy.sh [guardian|orchestrator|all]

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Load environment
if [ -f "./agentverse/set_env.sh" ]; then
  source ./agentverse/set_env.sh
else
  echo -e "${RED}Error: set_env.sh not found${NC}"
  exit 1
fi

# Check gcloud is installed
if ! command -v gcloud &> /dev/null; then
  echo -e "${RED}Error: gcloud CLI not found${NC}"
  echo "Install from: https://cloud.google.com/sdk/docs/install"
  exit 1
fi

# Check project ID is set
if [ "$PROJECT_ID" = "your-project-id" ]; then
  echo -e "${RED}Error: PROJECT_ID not configured${NC}"
  echo "Update PROJECT_ID in agentverse/set_env.sh"
  exit 1
fi

# Function to deploy Guardian agent
deploy_guardian() {
  echo -e "${BLUE}Deploying Guardian Agent...${NC}"

  gcloud run deploy guardian-agent \
    --source . \
    --region "$REGION" \
    --project "$PROJECT_ID" \
    --platform managed \
    --allow-unauthenticated \
    --max-instances 10 \
    --memory 512Mi \
    --cpu 1 \
    --timeout 60s \
    --set-env-vars "NODE_ENV=production,AGENT_ROLE=guardian,GEMINI_API_KEY=$GEMINI_API_KEY,DATABASE_URL=$DATABASE_URL"

  echo -e "${GREEN}✓ Guardian Agent deployed${NC}"
  echo -e "${BLUE}URL:${NC} $GUARDIAN_AGENT_URL"
}

# Function to deploy Orchestrator agent
deploy_orchestrator() {
  echo -e "${BLUE}Deploying Orchestrator Agent...${NC}"

  gcloud run deploy orchestrator-agent \
    --source . \
    --region "$REGION" \
    --project "$PROJECT_ID" \
    --platform managed \
    --no-allow-unauthenticated \
    --max-instances 20 \
    --memory 1Gi \
    --cpu 2 \
    --timeout 300s \
    --set-env-vars "NODE_ENV=production,AGENT_ROLE=orchestrator,GEMINI_API_KEY=$GEMINI_API_KEY,DATABASE_URL=$DATABASE_URL"

  echo -e "${GREEN}✓ Orchestrator Agent deployed${NC}"
  echo -e "${BLUE}URL:${NC} $ORCHESTRATOR_AGENT_URL"
}

# Main deployment logic
case "${1:-all}" in
  guardian)
    deploy_guardian
    ;;
  orchestrator)
    deploy_orchestrator
    ;;
  all)
    deploy_guardian
    echo ""
    deploy_orchestrator
    ;;
  *)
    echo -e "${RED}Usage: $0 [guardian|orchestrator|all]${NC}"
    exit 1
    ;;
esac

echo ""
echo -e "${GREEN}Deployment complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Test Guardian Agent: curl $GUARDIAN_AGENT_URL/api/health"
echo "2. Monitor logs: gcloud logging tail \"resource.type=cloud_run_revision\""
echo "3. View metrics: Open Cloud Run dashboard in Console"
