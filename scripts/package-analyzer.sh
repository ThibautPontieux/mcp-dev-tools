#!/bin/bash

# Package Analyzer & Manager for MCP Dev Tools
# Analyzes dependencies, detects issues, and suggests fixes

# NOTE: Don't use set -e because npm outdated returns error codes even when successful

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Timeout configuration (seconds)
TIMEOUT_SECONDS=30

# Function to run command with timeout
run_with_timeout() {
    local timeout=$1
    shift
    local cmd="$@"
    
    # Run command in background
    eval "$cmd" &
    local pid=$!
    
    # Wait for command with timeout
    local count=0
    while kill -0 $pid 2>/dev/null; do
        if [ $count -ge $timeout ]; then
            kill -9 $pid 2>/dev/null
            return 124  # timeout exit code
        fi
        sleep 1
        ((count++))
    done
    
    # Get actual exit code
    wait $pid
    return $?
}

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   📦 MCP Dev Tools - Package Analyzer & Manager          ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Counters
DEPRECATED_COUNT=0
OUTDATED_COUNT=0
SECURITY_COUNT=0
UNUSED_COUNT=0
ACTIONS_NEEDED=0
TIMEOUT_COUNT=0

# Known deprecated packages database
declare -A DEPRECATED_PACKAGES=(
    ["eslint@<9"]="eslint@9+ (breaking changes in config format)"
    ["request@*"]="axios or node-fetch"
    ["node-sass@*"]="sass (Dart Sass)"
    ["colors@1.4.1"]="chalk or picocolors (colors was compromised)"
    ["colors@1.4.2"]="chalk or picocolors"
    ["babel-eslint@*"]="@babel/eslint-parser"
    ["tslint@*"]="eslint with @typescript-eslint"
)

# ============================================================================
# STEP 1: Environment Check
# ============================================================================
echo -e "${BLUE}[1/8]${NC} ${MAGENTA}Checking environment...${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    exit 1
fi

NPM_VERSION=$(npm --version)
NODE_VERSION=$(node --version)

echo -e "${GREEN}✓ npm: v${NPM_VERSION}${NC}"
echo -e "${GREEN}✓ Node.js: ${NODE_VERSION}${NC}"
echo ""

# ============================================================================
# STEP 2: Analyze Current Dependencies
# ============================================================================
echo -e "${BLUE}[2/8]${NC} ${MAGENTA}Analyzing current dependencies...${NC}"
echo ""

# Read package.json
if [ ! -f "package.json" ]; then
    echo -e "${RED}✗ package.json not found${NC}"
    exit 1
fi

# Production dependencies
echo -e "${CYAN}Production Dependencies:${NC}"
PROD_DEPS=$(node -p "JSON.stringify(Object.entries(require('./package.json').dependencies || {}), null, 2)" 2>/dev/null)
echo "$PROD_DEPS" | grep -v "^\[" | grep -v "^\]"

echo ""
echo -e "${CYAN}Development Dependencies:${NC}"
DEV_DEPS=$(node -p "JSON.stringify(Object.entries(require('./package.json').devDependencies || {}), null, 2)" 2>/dev/null)
echo "$DEV_DEPS" | grep -v "^\[" | grep -v "^\]"

TOTAL_DEPS=$(node -p "Object.keys(require('./package.json').dependencies || {}).length + Object.keys(require('./package.json').devDependencies || {}).length")
echo ""
echo -e "${BLUE}Total packages: ${TOTAL_DEPS}${NC}"
echo ""

# ============================================================================
# STEP 3: Check for Deprecated Packages
# ============================================================================
echo -e "${BLUE}[3/8]${NC} ${MAGENTA}Checking for deprecated packages...${NC}"

for pkg_pattern in "${!DEPRECATED_PACKAGES[@]}"; do
    pkg_name="${pkg_pattern%@*}"
    version_check="${pkg_pattern#*@}"
    
    if npm list "$pkg_name" --depth=0 &>/dev/null; then
        INSTALLED_VERSION=$(npm list "$pkg_name" --depth=0 2>/dev/null | grep "$pkg_name@" | sed 's/.*@//' | cut -d' ' -f1 || echo "unknown")
        
        IS_DEPRECATED=false
        
        if [ "$version_check" = "*" ]; then
            IS_DEPRECATED=true
        elif [[ "$version_check" =~ ^\<([0-9]+) ]]; then
            threshold="${BASH_REMATCH[1]}"
            major_version=$(echo "$INSTALLED_VERSION" | cut -d'.' -f1)
            if [ "$major_version" -lt "$threshold" ] 2>/dev/null; then
                IS_DEPRECATED=true
            fi
        elif [ "$version_check" = "$INSTALLED_VERSION" ]; then
            IS_DEPRECATED=true
        fi
        
        if [ "$IS_DEPRECATED" = true ]; then
            echo -e "${RED}✗ DEPRECATED: ${pkg_name}@${INSTALLED_VERSION}${NC}"
            echo -e "  ${CYAN}→ Recommended: ${DEPRECATED_PACKAGES[$pkg_pattern]}${NC}"
            ((DEPRECATED_COUNT++))
            ((ACTIONS_NEEDED++))
        fi
    fi
done

if [ $DEPRECATED_COUNT -eq 0 ]; then
    echo -e "${GREEN}✓ No deprecated packages found${NC}"
fi
echo ""

# ============================================================================
# STEP 4: Check for Outdated Packages
# ============================================================================
echo -e "${BLUE}[4/8]${NC} ${MAGENTA}Checking for outdated packages (timeout: ${TIMEOUT_SECONDS}s)...${NC}"

# Create temp file for output
TEMP_FILE=$(mktemp)

# Run with timeout
if run_with_timeout $TIMEOUT_SECONDS "npm outdated 2>/dev/null > $TEMP_FILE"; then
    OUTDATED_OUTPUT=$(cat $TEMP_FILE)
    EXIT_CODE=$?
else
    EXIT_CODE=$?
    if [ $EXIT_CODE -eq 124 ]; then
        echo -e "${YELLOW}⚠ Command timed out after ${TIMEOUT_SECONDS}s${NC}"
        echo -e "${CYAN}  This may be due to network issues or proxy configuration${NC}"
        echo -e "${CYAN}  Skipping outdated check...${NC}"
        OUTDATED_OUTPUT=""
        ((TIMEOUT_COUNT++))
    fi
fi

rm -f $TEMP_FILE

if [ -n "$OUTDATED_OUTPUT" ]; then
    echo -e "${YELLOW}Outdated packages:${NC}"
    echo "$OUTDATED_OUTPUT"
    OUTDATED_COUNT=$(echo "$OUTDATED_OUTPUT" | tail -n +2 | wc -l | tr -d ' ')
    if [ "$OUTDATED_COUNT" -gt 0 ]; then
        ((ACTIONS_NEEDED++))
    fi
else
    if [ $TIMEOUT_COUNT -eq 0 ]; then
        echo -e "${GREEN}✓ All packages are up to date${NC}"
    fi
    OUTDATED_COUNT=0
fi
echo ""

# ============================================================================
# STEP 5: Security Audit
# ============================================================================
echo -e "${BLUE}[5/8]${NC} ${MAGENTA}Running security audit (timeout: ${TIMEOUT_SECONDS}s)...${NC}"

# Create temp file
TEMP_FILE=$(mktemp)

# Run with timeout
if run_with_timeout $TIMEOUT_SECONDS "npm audit --production 2>&1 > $TEMP_FILE"; then
    AUDIT_OUTPUT=$(cat $TEMP_FILE)
    EXIT_CODE=$?
else
    EXIT_CODE=$?
    if [ $EXIT_CODE -eq 124 ]; then
        echo -e "${YELLOW}⚠ Command timed out after ${TIMEOUT_SECONDS}s${NC}"
        echo -e "${CYAN}  This may be due to network issues or proxy configuration${NC}"
        echo -e "${CYAN}  Skipping security audit...${NC}"
        AUDIT_OUTPUT=""
        ((TIMEOUT_COUNT++))
    fi
fi

rm -f $TEMP_FILE

if [ -n "$AUDIT_OUTPUT" ]; then
    if echo "$AUDIT_OUTPUT" | grep -q "found 0 vulnerabilities"; then
        echo -e "${GREEN}✓ No security vulnerabilities found${NC}"
        SECURITY_COUNT=0
    else
        echo -e "${RED}✗ Security vulnerabilities detected${NC}"
        echo "$AUDIT_OUTPUT" | head -20
        SECURITY_COUNT=1
        ((ACTIONS_NEEDED++))
    fi
else
    if [ $TIMEOUT_COUNT -le 1 ]; then
        echo -e "${CYAN}  Security audit skipped${NC}"
    fi
    SECURITY_COUNT=0
fi
echo ""

# ============================================================================
# STEP 6: Check Package Sizes
# ============================================================================
echo -e "${BLUE}[6/8]${NC} ${MAGENTA}Analyzing package sizes...${NC}"

echo "Top 5 largest packages:"
npm list --all --long 2>/dev/null | grep -E "^├─|^└─" | head -5 || echo "  (size analysis not available)"
echo ""

# ============================================================================
# STEP 7: Check for Unused Dependencies
# ============================================================================
echo -e "${BLUE}[7/8]${NC} ${MAGENTA}Checking for potentially unused dependencies...${NC}"

echo -e "${CYAN}Scanning source files for imports...${NC}"

ALL_DEPS=$(node -p "Object.keys({...(require('./package.json').dependencies || {}), ...(require('./package.json').devDependencies || {})}).join(' ')" 2>/dev/null) || ""

POTENTIALLY_UNUSED=()

if [ -n "$ALL_DEPS" ] && [ -d "src" ]; then
    for dep in $ALL_DEPS; do
        USAGE_COUNT=$(grep -r "from ['\"]${dep}" src/ 2>/dev/null | wc -l | tr -d ' ')
        USAGE_COUNT2=$(grep -r "require(['\"]${dep}" src/ 2>/dev/null | wc -l | tr -d ' ')
        TOTAL_USAGE=$((USAGE_COUNT + USAGE_COUNT2))
        
        if [ "$TOTAL_USAGE" -eq 0 ]; then
            POTENTIALLY_UNUSED+=("$dep")
        fi
    done
fi

if [ ${#POTENTIALLY_UNUSED[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ All dependencies appear to be used${NC}"
else
    echo -e "${YELLOW}⚠ Potentially unused (verify manually):${NC}"
    for pkg in "${POTENTIALLY_UNUSED[@]}"; do
        echo -e "  - ${pkg}"
        ((UNUSED_COUNT++))
    done
    echo -e "${CYAN}Note: Some packages may be used in config files or indirectly${NC}"
fi
echo ""

# ============================================================================
# STEP 8: Recommendations & Action Plan
# ============================================================================
echo -e "${BLUE}[8/8]${NC} ${MAGENTA}Generating recommendations...${NC}"
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    📊 ANALYSIS SUMMARY                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "  ${RED}Deprecated packages:${NC}     $DEPRECATED_COUNT"
echo -e "  ${YELLOW}Outdated packages:${NC}       $OUTDATED_COUNT"
echo -e "  ${RED}Security vulnerabilities:${NC} $SECURITY_COUNT"
echo -e "  ${CYAN}Potentially unused:${NC}      $UNUSED_COUNT"
if [ $TIMEOUT_COUNT -gt 0 ]; then
    echo -e "  ${YELLOW}Timeouts:${NC}                $TIMEOUT_COUNT"
fi
echo ""

# Action Plan
if [ $ACTIONS_NEEDED -gt 0 ]; then
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                    🔧 ACTION PLAN                          ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    
    if [ $DEPRECATED_COUNT -gt 0 ]; then
        echo -e "${RED}[CRITICAL] Replace Deprecated Packages${NC}"
        echo ""
        # Show replacement commands
    fi
    
    if [ $OUTDATED_COUNT -gt 0 ]; then
        echo -e "${YELLOW}[UPDATE] Update Outdated Packages${NC}"
        echo ""
        echo "  # Safe updates (patches and minors):"
        echo "  npm update"
        echo ""
        echo "  # Update specific package:"
        echo "  npm install package-name@latest"
        echo ""
    fi
    
    if [ $SECURITY_COUNT -gt 0 ]; then
        echo -e "${RED}[SECURITY] Fix Vulnerabilities${NC}"
        echo ""
        echo "  npm audit fix"
        echo ""
    fi
    
    if [ $TIMEOUT_COUNT -gt 0 ]; then
        echo -e "${YELLOW}[NETWORK] Timeout Issues Detected${NC}"
        echo ""
        echo "  Some commands timed out. This may be due to:"
        echo "  • Corporate proxy/firewall"
        echo "  • Network connectivity issues"
        echo "  • npm registry being slow"
        echo ""
        echo "  Try configuring proxy:"
        echo "  npm config set proxy http://proxy.company.com:8080"
        echo "  npm config set https-proxy http://proxy.company.com:8080"
        echo ""
        echo "  Or increase timeout:"
        echo "  Edit TIMEOUT_SECONDS variable in this script"
        echo ""
    fi
    
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                  ⚠️  AFTER ANY CHANGES                     ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "  1. npm install"
    echo "  2. npm run build"
    echo "  3. ./pre-commit-check.sh"
    echo ""
    
    exit 1
else
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                   ✅ ALL CHECKS PASSED                     ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo -e "${GREEN}Your package configuration is optimal!${NC}"
    if [ $TIMEOUT_COUNT -gt 0 ]; then
        echo -e "${YELLOW}Note: Some checks were skipped due to timeouts${NC}"
    fi
    echo ""
    exit 0
fi
