# MCP Dev Tools - Scripts

This directory contains automation scripts for package management and validation.

## Available Scripts

### 📦 Package Management

#### `package-analyzer.sh`
Analyzes npm packages for outdated dependencies, security vulnerabilities, and deprecated packages.

```bash
./package-analyzer.sh
```

**Features:**
- Detects outdated packages
- Checks for deprecated packages
- Security vulnerability scan
- Unused dependency detection
- 30s timeout for network operations (proxy-friendly)

---

#### `auto-update-packages.sh`
Automatically updates npm packages with safety checks.

```bash
# Dry run (no changes)
./auto-update-packages.sh --dry-run

# Apply updates
./auto-update-packages.sh

# Force major updates
./auto-update-packages.sh --auto-fix
```

**Features:**
- Categorizes safe vs major updates
- Reads CHANGELOGs automatically
- Tests build after updates
- Automatic rollback on failure
- Creates backup before changes

---

### ✅ Validation

#### `pre-commit-check.sh`
Comprehensive validation before commits.

```bash
./pre-commit-check.sh
```

**Checks:**
- TypeScript compilation
- ESLint validation
- Package analysis
- Build success
- File structure

---

#### `security-audit.sh`
Security vulnerability audit.

```bash
./security-audit.sh
```

**Features:**
- npm audit
- Dependency analysis
- Security recommendations

---

### 🧪 Testing

#### `test-package.sh`
Package testing script.

```bash
./test-package.sh
```

---

## Workflow

### During Development
```bash
# 1. Make changes
# ... edit files ...

# 2. Validate
./scripts/pre-commit-check.sh

# 3. If OK → commit
git commit -m "Your message"
```

### Monthly Maintenance
```bash
# 1. Analyze packages
./scripts/package-analyzer.sh

# 2. Update if needed
./scripts/auto-update-packages.sh --dry-run
./scripts/auto-update-packages.sh --auto-fix

# 3. Validate
./scripts/pre-commit-check.sh
```

---

## Configuration

### Timeout
Edit `TIMEOUT_SECONDS` in `package-analyzer.sh` if you have slow network:

```bash
# Default: 30s
TIMEOUT_SECONDS=60  # Increase to 60s
```

### Proxy
If behind corporate proxy, configure npm:

```bash
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

---

## Troubleshooting

### "Command timed out"
- Increase `TIMEOUT_SECONDS`
- Configure proxy settings
- Check network connectivity

### "Build failed after update"
- Scripts automatically rollback
- Check backup in `.backups/auto-update-*`
- Review breaking changes in changelogs

### "Permission denied"
```bash
chmod +x scripts/*.sh
```

---

## For Claude/AI Assistants

These scripts are designed for autonomous AI development:

1. **Always run `package-analyzer.sh` before declaring work complete**
2. **Use `auto-update-packages.sh` to keep dependencies updated**
3. **Run `pre-commit-check.sh` before finalizing changes**
4. **Scripts handle errors gracefully with automatic rollback**

See [claude-instructions.md](../docs/development/claude-instructions.md) for details.

---

**Last updated:** October 20, 2025
