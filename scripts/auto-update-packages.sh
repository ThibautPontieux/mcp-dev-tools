#!/bin/bash

# Auto Package Updater for MCP Dev Tools
# Automatically updates packages with safety checks

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     🤖 Automatic Package Updater - MCP Dev Tools         ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Configuration
DRY_RUN=false
AUTO_FIX_BREAKING=false
PACKAGES_TO_UPDATE=()

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --auto-fix)
            AUTO_FIX_BREAKING=true
            shift
            ;;
        --package)
            PACKAGES_TO_UPDATE+=("$2")
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}🧪 DRY RUN MODE - No changes will be applied${NC}"
    echo ""
fi

# Step 1: Analyze current state
echo -e "${BLUE}[Step 1/7]${NC} Analyzing packages..."

# Get outdated packages (text format is more reliable than JSON)
OUTDATED_TEXT=$(npm outdated 2>/dev/null) || true

if [ -z "$OUTDATED_TEXT" ]; then
    echo -e "${GREEN}✓ No outdated packages found${NC}"
    echo ""
    echo "Nothing to update!"
    exit 0
fi

echo -e "${YELLOW}Found outdated packages:${NC}"
echo "$OUTDATED_TEXT"
echo ""

# Parse the text output (more reliable than JSON)
# Format: Package  Current  Wanted  Latest  Location  Depended by
SAFE_UPDATES=()
MAJOR_UPDATES=()

# Skip header and parse each line
echo "$OUTDATED_TEXT" | tail -n +2 | while IFS= read -r line; do
    # Extract package name, current and latest versions
    PKG=$(echo "$line" | awk '{print $1}')
    CURRENT=$(echo "$line" | awk '{print $2}')
    LATEST=$(echo "$line" | awk '{print $4}')
    
    if [ -z "$PKG" ] || [ -z "$CURRENT" ] || [ -z "$LATEST" ]; then
        continue
    fi
    
    # Extract major versions
    CURRENT_MAJOR=$(echo "$CURRENT" | cut -d'.' -f1)
    LATEST_MAJOR=$(echo "$LATEST" | cut -d'.' -f1)
    
    # Categorize
    if [ "$CURRENT_MAJOR" != "$LATEST_MAJOR" ]; then
        echo "MAJOR:$PKG:$CURRENT:$LATEST"
    else
        echo "SAFE:$PKG:$CURRENT:$LATEST"
    fi
done > /tmp/categorized-packages.txt

# Read categorized packages
while IFS=: read -r type pkg current latest; do
    if [ "$type" = "SAFE" ]; then
        SAFE_UPDATES+=("$pkg:$current:$latest")
    elif [ "$type" = "MAJOR" ]; then
        MAJOR_UPDATES+=("$pkg:$current:$latest")
    fi
done < /tmp/categorized-packages.txt

# Step 2: Display categorization
echo -e "${BLUE}[Step 2/7]${NC} Categorizing updates..."

echo -e "${GREEN}Safe updates (minor/patch): ${#SAFE_UPDATES[@]}${NC}"
for item in "${SAFE_UPDATES[@]}"; do
    IFS=: read -r pkg current latest <<< "$item"
    echo "  • $pkg: $current → $latest"
done

echo ""
echo -e "${YELLOW}Major updates (breaking changes possible): ${#MAJOR_UPDATES[@]}${NC}"
for item in "${MAJOR_UPDATES[@]}"; do
    IFS=: read -r pkg current latest <<< "$item"
    echo "  • $pkg: $current → $latest"
done
echo ""

# Step 3: Create backup
echo -e "${BLUE}[Step 3/7]${NC} Creating backup..."

if [ "$DRY_RUN" = false ]; then
    BACKUP_DIR=".backups/auto-update-$(date +%s)"
    mkdir -p "$BACKUP_DIR"
    cp package.json "$BACKUP_DIR/"
    cp package-lock.json "$BACKUP_DIR/" 2>/dev/null || true
    echo -e "${GREEN}✓ Backup created: $BACKUP_DIR${NC}"
else
    echo -e "${CYAN}  Skipped (dry run)${NC}"
fi
echo ""

# Step 4: Apply safe updates
echo -e "${BLUE}[Step 4/7]${NC} Applying safe updates..."

if [ ${#SAFE_UPDATES[@]} -gt 0 ]; then
    for item in "${SAFE_UPDATES[@]}"; do
        IFS=: read -r pkg current latest <<< "$item"
        echo -e "${CYAN}Updating $pkg: $current → $latest${NC}"
        if [ "$DRY_RUN" = false ]; then
            npm install "$pkg@$latest" --save 2>&1 | tail -3
        else
            echo -e "${YELLOW}  [DRY RUN] Would run: npm install $pkg@$latest${NC}"
        fi
    done
    echo -e "${GREEN}✓ Safe updates applied${NC}"
else
    echo -e "${CYAN}  No safe updates to apply${NC}"
fi
echo ""

# Step 5: Handle major updates
echo -e "${BLUE}[Step 5/7]${NC} Handling major updates..."

if [ ${#MAJOR_UPDATES[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠ Major updates require caution${NC}"
    
    for item in "${MAJOR_UPDATES[@]}"; do
        IFS=: read -r pkg current latest <<< "$item"
        echo ""
        echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${MAGENTA}Package: $pkg${NC}"
        echo -e "${MAGENTA}Version: $current → $latest (MAJOR)${NC}"
        echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        
        # Fetch changelog/readme
        echo "  📄 Fetching changelog..."
        CHANGELOG=$(npm view "$pkg@$latest" readme 2>/dev/null | head -100)
        
        # Check for breaking changes
        BREAKING_FOUND=false
        if echo "$CHANGELOG" | grep -qi "breaking"; then
            echo -e "  ${RED}⚠ BREAKING CHANGES detected in changelog${NC}"
            BREAKING_FOUND=true
            
            # Show relevant lines
            echo ""
            echo "  Relevant excerpt:"
            echo "$CHANGELOG" | grep -i "breaking" -A 2 -B 2 | head -10 | sed 's/^/    /'
            echo ""
        else
            echo -e "  ${GREEN}✓ No obvious breaking changes mentioned${NC}"
        fi
        
        # Decision
        if [ "$BREAKING_FOUND" = true ]; then
            if [ "$AUTO_FIX_BREAKING" = true ]; then
                echo -e "  ${YELLOW}Auto-fix enabled, will attempt update...${NC}"
                if [ "$DRY_RUN" = false ]; then
                    npm install "$pkg@$latest" --save 2>&1 | tail -5
                else
                    echo -e "  ${YELLOW}[DRY RUN] Would run: npm install $pkg@$latest${NC}"
                fi
            else
                echo -e "  ${CYAN}⏭  Skipping (use --auto-fix to force update)${NC}"
            fi
        else
            echo -e "  ${GREEN}✓ Applying update${NC}"
            if [ "$DRY_RUN" = false ]; then
                npm install "$pkg@$latest" --save 2>&1 | tail -5
            else
                echo -e "  ${YELLOW}[DRY RUN] Would run: npm install $pkg@$latest${NC}"
            fi
        fi
    done
else
    echo -e "${CYAN}  No major updates to handle${NC}"
fi
echo ""

# Step 6: Test build
echo -e "${BLUE}[Step 6/7]${NC} Testing build..."

BUILD_SUCCESS=false

if [ "$DRY_RUN" = false ]; then
    echo "Running npm run build..."
    if npm run build > /tmp/build-output.txt 2>&1; then
        echo -e "${GREEN}✓ Build successful${NC}"
        BUILD_SUCCESS=true
    else
        echo -e "${RED}✗ Build failed${NC}"
        echo ""
        echo "Build errors:"
        tail -20 /tmp/build-output.txt
        
        echo ""
        echo -e "${YELLOW}Rolling back changes...${NC}"
        
        if [ -n "$BACKUP_DIR" ] && [ -d "$BACKUP_DIR" ]; then
            cp "$BACKUP_DIR/package.json" ./
            cp "$BACKUP_DIR/package-lock.json" ./ 2>/dev/null || true
            echo "Reinstalling dependencies..."
            npm install > /dev/null 2>&1
            echo -e "${GREEN}✓ Rollback complete${NC}"
        fi
        
        exit 1
    fi
else
    echo -e "${CYAN}  Skipped (dry run)${NC}"
    BUILD_SUCCESS=true
fi
echo ""

# Step 7: Final validation
echo -e "${BLUE}[Step 7/7]${NC} Final validation..."

if [ "$DRY_RUN" = false ] && [ "$BUILD_SUCCESS" = true ]; then
    if [ -f "./pre-commit-check.sh" ]; then
        echo "Running pre-commit checks..."
        if ./pre-commit-check.sh > /tmp/precommit-output.txt 2>&1; then
            echo -e "${GREEN}✓ All checks passed${NC}"
        else
            echo -e "${YELLOW}⚠ Some checks failed${NC}"
            tail -15 /tmp/precommit-output.txt
        fi
    else
        echo -e "${CYAN}  pre-commit-check.sh not found, skipping${NC}"
    fi
else
    echo -e "${CYAN}  Skipped (dry run)${NC}"
fi
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    📊 UPDATE SUMMARY                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}DRY RUN completed${NC}"
    echo "  • Safe updates: ${#SAFE_UPDATES[@]}"
    for item in "${SAFE_UPDATES[@]}"; do
        IFS=: read -r pkg current latest <<< "$item"
        echo "    - $pkg: $current → $latest"
    done
    echo "  • Major updates: ${#MAJOR_UPDATES[@]}"
    for item in "${MAJOR_UPDATES[@]}"; do
        IFS=: read -r pkg current latest <<< "$item"
        echo "    - $pkg: $current → $latest"
    done
    echo ""
    echo "Run without --dry-run to apply changes"
    echo "Add --auto-fix to update packages with breaking changes"
else
    echo -e "${GREEN}Updates applied${NC}"
    echo "  • Safe updates: ${#SAFE_UPDATES[@]}"
    echo "  • Major updates: ${#MAJOR_UPDATES[@]}"
    echo "  • Build status: $([ "$BUILD_SUCCESS" = true ] && echo '✓ Success' || echo '✗ Failed')"
    
    if [ -n "$BACKUP_DIR" ]; then
        echo ""
        echo "Backup location: $BACKUP_DIR"
        echo "To rollback: cp $BACKUP_DIR/* ./"
    fi
fi

echo ""

if [ "$DRY_RUN" = true ] || [ "$BUILD_SUCCESS" = true ]; then
    echo -e "${GREEN}✅ Package update process completed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Updates failed - changes rolled back${NC}"
    exit 1
fi
