#!/bin/bash

# API Test Script - Tests all CRUD endpoints

BASE_URL="http://localhost:4000"
echo "🧪 Testing Project Insight Hub API"
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test authentication
echo -e "\n📝 Testing Authentication..."
AUTH_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jdeegan@gainclarity.com","password":"password"}')

if echo "$AUTH_RESPONSE" | grep -q "Login successful"; then
    echo -e "${GREEN}✓ Login successful${NC}"
    USER_ID=$(echo "$AUTH_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "  User ID: $USER_ID"
else
    echo -e "${RED}✗ Login failed${NC}"
    exit 1
fi

# Test Projects
echo -e "\n📁 Testing Projects..."
PROJECT_RESPONSE=$(curl -s -X POST $BASE_URL/api/projects \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Project\",\"description\":\"API Test\",\"ownerId\":\"$USER_ID\"}")

PROJECT_ID=$(echo "$PROJECT_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ ! -z "$PROJECT_ID" ]; then
    echo -e "${GREEN}✓ Project created${NC}"
    echo "  Project ID: $PROJECT_ID"
else
    echo -e "${RED}✗ Project creation failed${NC}"
fi

# Test Notes
echo -e "\n📝 Testing Notes..."
NOTE_RESPONSE=$(curl -s -X POST $BASE_URL/api/notes \
  -H "Content-Type: application/json" \
  -d "{\"projectId\":\"$PROJECT_ID\",\"content\":\"Test note\"}")

NOTE_ID=$(echo "$NOTE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ ! -z "$NOTE_ID" ]; then
    echo -e "${GREEN}✓ Note created${NC}"
    echo "  Note ID: $NOTE_ID"
else
    echo -e "${RED}✗ Note creation failed${NC}"
fi

# Test Docs
echo -e "\n📄 Testing Docs..."
DOC_RESPONSE=$(curl -s -X POST $BASE_URL/api/docs \
  -H "Content-Type: application/json" \
  -d "{\"projectId\":\"$PROJECT_ID\",\"title\":\"Test Doc\",\"url\":\"https://example.com/doc.pdf\"}")

DOC_ID=$(echo "$DOC_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ ! -z "$DOC_ID" ]; then
    echo -e "${GREEN}✓ Doc created${NC}"
    echo "  Doc ID: $DOC_ID"
else
    echo -e "${RED}✗ Doc creation failed${NC}"
fi

# Test Connections
echo -e "\n🔌 Testing Connections..."
CONN_RESPONSE=$(curl -s -X POST $BASE_URL/api/connections \
  -H "Content-Type: application/json" \
  -d "{\"projectId\":\"$PROJECT_ID\",\"name\":\"Twilio\",\"type\":\"api_key\",\"config\":\"encrypted_data\"}")

CONN_ID=$(echo "$CONN_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ ! -z "$CONN_ID" ]; then
    echo -e "${GREEN}✓ Connection created${NC}"
    echo "  Connection ID: $CONN_ID"
else
    echo -e "${RED}✗ Connection creation failed${NC}"
fi

# Test Costs
echo -e "\n💰 Testing Costs..."
COST_RESPONSE=$(curl -s -X POST $BASE_URL/api/costs \
  -H "Content-Type: application/json" \
  -d "{\"projectId\":\"$PROJECT_ID\",\"service\":\"AWS\",\"amount\":125.50,\"period\":\"monthly\"}")

COST_ID=$(echo "$COST_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ ! -z "$COST_ID" ]; then
    echo -e "${GREEN}✓ Cost created${NC}"
    echo "  Cost ID: $COST_ID"
else
    echo -e "${RED}✗ Cost creation failed${NC}"
fi

# Test Tasks
echo -e "\n✅ Testing Tasks..."
TASK_RESPONSE=$(curl -s -X POST $BASE_URL/api/tasks \
  -H "Content-Type: application/json" \
  -d "{\"projectId\":\"$PROJECT_ID\",\"title\":\"Parent Task\",\"completed\":false}")

TASK_ID=$(echo "$TASK_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ ! -z "$TASK_ID" ]; then
    echo -e "${GREEN}✓ Task created${NC}"
    echo "  Task ID: $TASK_ID"
    
    # Create a subtask
    SUBTASK_RESPONSE=$(curl -s -X POST $BASE_URL/api/tasks \
      -H "Content-Type: application/json" \
      -d "{\"projectId\":\"$PROJECT_ID\",\"parentId\":\"$TASK_ID\",\"title\":\"Child Task\",\"completed\":false}")
    
    SUBTASK_ID=$(echo "$SUBTASK_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ ! -z "$SUBTASK_ID" ]; then
        echo -e "${GREEN}✓ Subtask created${NC}"
        echo "  Subtask ID: $SUBTASK_ID"
    fi
else
    echo -e "${RED}✗ Task creation failed${NC}"
fi

# Test Time Logs
echo -e "\n⏱️  Testing Time Logs..."
TIMELOG_RESPONSE=$(curl -s -X POST $BASE_URL/api/timelogs \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\",\"projectId\":\"$PROJECT_ID\",\"taskId\":\"$TASK_ID\",\"duration\":3600,\"notes\":\"API testing\"}")

TIMELOG_ID=$(echo "$TIMELOG_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ ! -z "$TIMELOG_ID" ]; then
    echo -e "${GREEN}✓ Time log created${NC}"
    echo "  Time Log ID: $TIMELOG_ID"
else
    echo -e "${RED}✗ Time log creation failed${NC}"
fi

# Summary
echo -e "\n=================================="
echo -e "${GREEN}✅ All API tests completed!${NC}"
echo -e "\nYou can now wire the frontend to these endpoints."
echo -e "API Documentation: server/README.md"
