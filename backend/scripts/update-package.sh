#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Updating package.json files...${NC}"

# Update backend package.json
echo -e "${GREEN}Updating backend package.json...${NC}"
cd backend
npm pkg set scripts.clean="rm -rf dist" \
    scripts.build="npm run clean && tsc" \
    scripts.start="node dist/index.js" \
    scripts.dev="nodemon src/index.ts" \
    scripts.test="jest" \
    scripts.type-check="tsc --noEmit"

# Update data-ingestion package.json
echo -e "${GREEN}Updating data-ingestion package.json...${NC}"
cd data-ingestion
npm pkg set scripts.clean="rm -rf dist" \
    scripts.build="npm run clean && tsc" \
    scripts.start="node dist/index.js" \
    scripts.dev="ts-node src/index.ts"

# Update data-processor package.json
echo -e "${GREEN}Updating data-processor package.json...${NC}"
cd ../data-processor
npm pkg set scripts.clean="rm -rf dist" \
    scripts.build="npm run clean && tsc" \
    scripts.start="node dist/index.js" \
    scripts.dev="ts-node src/index.ts"

echo -e "${BLUE}All package.json files updated successfully!${NC}"