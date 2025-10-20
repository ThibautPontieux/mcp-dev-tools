#!/bin/bash

# Pre-Commit Validation Script
# Ensures code quality before declaring work complete

set -e

echo "🔍 MCP Dev Tools - Pre-Commit Validation"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

# Step 1: Type Check
echo -e "${BLUE}📝 Step 1: TypeScript Type Checking...${NC}"
if npm run type-check --silent; then
    echo -e "${GREEN}✓ Type check passed${NC}"
else
    echo -e "${RED}✗ Type check failed${NC}"
    ((ERRORS++))
fi
echo ""

# Step 2: Build
echo -e "${BLUE}🔨 Step 2: Building Project...${NC}"
if npm run build --silent; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    ((ERRORS++))
fi
echo ""

# Step 3: Verify Build Output
echo -e "${BLUE}📦 Step 3: Verifying Build Output...${NC}"

if [ -d "dist" ]; then
    echo -e "${GREEN}✓ dist/ directory exists${NC}"
    
    # Check for key files
    KEY_FILES=("index.js" "server.js" "utils/config.js" "tools/file-operations.js")
    for file in "${KEY_FILES[@]}"; do
        if [ -f "dist/$file" ]; then
            echo -e "${GREEN}  ✓ dist/$file${NC}"
        else
            echo -e "${RED}  ✗ dist/$file missing${NC}"
            ((ERRORS++))
        fi
    done
else
    echo -e "${RED}✗ dist/ directory not found${NC}"
    ((ERRORS++))
fi
echo ""

# Step 4: Check Version
echo -e "${BLUE}🔖 Step 4: Checking Version...${NC}"
PACKAGE_VERSION=$(node -p "require('./package.json').version")
echo "Package version: $PACKAGE_VERSION"

if grep -q "version: '$PACKAGE_VERSION'" dist/server.js; then
    echo -e "${GREEN}✓ Version matches in compiled code${NC}"
else
    echo -e "${YELLOW}⚠ Warning: Version mismatch in compiled code${NC}"
    ((WARNINGS++))
fi
echo ""

# Step 5: Count Tools (SIMPLIFIED - just count case statements)
echo -e "${BLUE}🔧 Step 5: Verifying Tools Count...${NC}"

# Count case statements in the tool handler (more reliable)
TOOL_COUNT=$(grep -c "case '[a-z_]*':" dist/server.js || echo "0")

echo "Tool handlers found in compiled code: $TOOL_COUNT"

# We expect 12 tools + 1 default case = 13 case statements
# But we'll just verify >= 12 to be safe
if [ "$TOOL_COUNT" -ge 12 ]; then
    echo -e "${GREEN}✓ All expected tools present (found $TOOL_COUNT handlers)${NC}"
else
    echo -e "${RED}✗ Expected at least 12 tool handlers, found $TOOL_COUNT${NC}"
    ((ERRORS++))
fi
echo ""

# Step 6: Verify specific critical tools exist
echo -e "${BLUE}🔍 Step 6: Verifying Critical Tools...${NC}"

CRITICAL_TOOLS=("rename_file" "list_directory" "search_files")
MISSING_TOOLS=0

for tool in "${CRITICAL_TOOLS[@]}"; do
    if grep -q "'$tool'" dist/server.js; then
        echo -e "${GREEN}  ✓ $tool${NC}"
    else
        echo -e "${RED}  ✗ $tool missing${NC}"
        ((MISSING_TOOLS++))
    fi
done

if [ "$MISSING_TOOLS" -eq 0 ]; then
    echo -e "${GREEN}✓ All critical tools present${NC}"
else
    echo -e "${RED}✗ $MISSING_TOOLS critical tool(s) missing${NC}"
    ((ERRORS++))
fi
echo ""

# Step 7: Security Audit
echo -e "${BLUE}🔒 Step 7: Security Audit...${NC}"
if npm audit --production --audit-level=moderate --silent 2>/dev/null; then
    echo -e "${GREEN}✓ No security vulnerabilities${NC}"
else
    AUDIT_EXIT=$?
    if [ $AUDIT_EXIT -eq 0 ]; then
        echo -e "${GREEN}✓ No security vulnerabilities${NC}"
    else
        echo -e "${YELLOW}⚠ Warning: Security vulnerabilities found${NC}"
        echo "Run 'npm audit' for details"
        ((WARNINGS++))
    fi
fi
echo ""

# Step 8: Check for Common Issues
echo -e "${BLUE}🐛 Step 8: Checking for Common Issues...${NC}"

# Check for duplicate exports
if grep -r "error TS2308" dist/ 2>/dev/null; then
    echo -e "${RED}✗ Duplicate exports detected${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✓ No duplicate exports${NC}"
fi

# Check for missing modules
if grep -r "error TS2307" dist/ 2>/dev/null; then
    echo -e "${RED}✗ Missing module errors detected${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✓ No missing module errors${NC}"
fi
echo ""

# Summary
echo "=========================================="
echo -e "${BLUE}📊 VALIDATION SUMMARY${NC}"
echo "=========================================="
echo -e "Errors: ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo ""
    echo "The code is ready to be committed/deployed."
    echo ""
    echo "Next steps:"
    echo "1. Restart Claude Desktop if MCP server"
    echo "2. Test the new features"
    echo "3. Update CHANGELOG.md if needed"
    exit 0
else
    echo -e "${RED}❌ VALIDATION FAILED${NC}"
    echo ""
    echo "Please fix the errors above before proceeding."
    echo ""
    echo "Common fixes:"
    echo "- Type errors: Check TypeScript types"
    echo "- Build errors: Check for syntax errors"
    echo "- Missing files: Ensure all files are created"
    echo "- Duplicate exports: Check type definitions"
    exit 1
fi
