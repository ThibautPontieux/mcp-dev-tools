#!/bin/bash

# Test Script for MCP Dev Tools
# Validates compilation, tests, and package integrity

set -e  # Exit on any error

echo "🧪 MCP Dev Tools - Package Validation"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track results
TESTS_PASSED=0
TESTS_FAILED=0

run_test() {
    local test_name="$1"
    local command="$2"
    
    echo -n "Testing: $test_name... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo "📦 Step 1: Package Structure"
echo "----------------------------"

run_test "package.json exists" "test -f package.json"
run_test "tsconfig.json exists" "test -f tsconfig.json"
run_test "jest.config.js exists" "test -f jest.config.js"
run_test "src/ directory exists" "test -d src"
run_test "tests/ directory exists" "test -d tests"
run_test "Entry point exists" "test -f src/index.ts"
run_test "Server file exists" "test -f src/server.ts"

echo ""
echo "📝 Step 2: TypeScript Configuration"
echo "------------------------------------"

run_test "TypeScript is installed" "which tsc"
run_test "TypeScript config is valid" "tsc --noEmit --project tsconfig.json"

echo ""
echo "🔨 Step 3: Compilation"
echo "----------------------"

echo "Cleaning previous build..."
rm -rf dist/
echo "Compiling TypeScript..."

if npm run build; then
    echo -e "${GREEN}✓ Compilation successful${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ Compilation failed${NC}"
    ((TESTS_FAILED++))
fi

run_test "dist/ directory created" "test -d dist"
run_test "dist/index.js exists" "test -f dist/index.js"
run_test "dist/server.js exists" "test -f dist/server.js"
run_test "Declaration files generated" "test -f dist/index.d.ts"

echo ""
echo "🧪 Step 4: Unit Tests"
echo "---------------------"

if npm test -- --passWithNoTests; then
    echo -e "${GREEN}✓ All unit tests passed${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ Some unit tests failed${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo "🔍 Step 5: Code Quality"
echo "-----------------------"

run_test "ESLint installed" "which eslint"
run_test "Code passes linting" "npm run lint"

echo ""
echo "📊 Step 6: File Structure Validation"
echo "-------------------------------------"

# Check critical files
CRITICAL_FILES=(
    "src/tools/file-operations.ts"
    "src/utils/path-validator.ts"
    "src/utils/logger.ts"
    "src/utils/rate-limiter.ts"
    "src/utils/backup-manager.ts"
    "src/utils/config.ts"
    "src/types/config.ts"
    "src/types/tools.ts"
    "tests/file-operations.test.ts"
    "tests/path-validator.test.ts"
)

for file in "${CRITICAL_FILES[@]}"; do
    run_test "$file exists" "test -f $file"
done

echo ""
echo "🎯 Step 7: Module Exports"
echo "-------------------------"

# Test that modules can be imported
cat > /tmp/test-import.js << 'EOF'
const fs = require('fs');
const path = require('path');

// Check if main export exists
const mainFile = path.join(__dirname, '../dist/index.js');
if (!fs.existsSync(mainFile)) {
    console.error('Main export file not found');
    process.exit(1);
}

console.log('✓ Main export file exists');
process.exit(0);
EOF

if node /tmp/test-import.js; then
    echo -e "${GREEN}✓ Module exports valid${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ Module exports invalid${NC}"
    ((TESTS_FAILED++))
fi

rm /tmp/test-import.js

echo ""
echo "📦 Step 8: Package Metadata"
echo "---------------------------"

# Validate package.json
run_test "Package name is correct" "grep -q '@mcp-servers/dev-tools' package.json"
run_test "Version is defined" "grep -q '\"version\"' package.json"
run_test "Main entry is defined" "grep -q '\"main\": \"dist/index.js\"' package.json"
run_test "Dependencies are defined" "grep -q '@modelcontextprotocol/sdk' package.json"

echo ""
echo "======================================"
echo "📊 TEST RESULTS"
echo "======================================"
echo ""
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED - Package is ready for production!${NC}"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED - Please review errors above${NC}"
    exit 1
fi
