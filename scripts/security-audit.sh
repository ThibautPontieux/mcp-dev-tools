#!/bin/bash

# Security Check Script for MCP Dev Tools
# Vérifie les vulnérabilités et packages dépréciés

set -e

echo "🔒 MCP Dev Tools - Security Audit"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

echo "📦 Step 1: Checking for deprecated packages..."
DEPRECATED=$(npm outdated --json 2>/dev/null || echo "{}")
if [ "$DEPRECATED" != "{}" ]; then
    echo -e "${YELLOW}⚠ Warning: Some packages are outdated${NC}"
    npm outdated
    ((WARNINGS++))
else
    echo -e "${GREEN}✓ All packages are up to date${NC}"
fi

echo ""
echo "🔍 Step 2: Running npm audit (production only)..."
if npm audit --production --audit-level=moderate; then
    echo -e "${GREEN}✓ No security vulnerabilities found${NC}"
else
    echo -e "${RED}✗ Security vulnerabilities detected!${NC}"
    echo ""
    echo "Run 'npm audit fix' to attempt automatic fixes"
    echo "Or 'npm audit fix --force' for breaking changes"
    ((ERRORS++))
fi

echo ""
echo "📋 Step 3: Checking package versions..."

# Check Node version
NODE_VERSION=$(node --version | cut -d'v' -f2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
if [ "$NODE_MAJOR" -ge 18 ]; then
    echo -e "${GREEN}✓ Node.js version: v$NODE_VERSION (>= 18)${NC}"
else
    echo -e "${RED}✗ Node.js version: v$NODE_VERSION (requires >= 18)${NC}"
    ((ERRORS++))
fi

# Check for known vulnerable packages
echo ""
echo "🛡️ Step 4: Checking for known vulnerable packages..."

VULNERABLE_PACKAGES=(
    "eslint@8"
    "chokidar"
    "node-fetch@2"
)

for pkg in "${VULNERABLE_PACKAGES[@]}"; do
    if npm list "$pkg" >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠ Warning: Potentially vulnerable package found: $pkg${NC}"
        ((WARNINGS++))
    fi
done

echo ""
echo "=================================="
echo "📊 AUDIT SUMMARY"
echo "=================================="
echo -e "Errors: ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Security audit passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Security audit failed - please fix errors above${NC}"
    exit 1
fi
