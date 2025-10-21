# 📦 Package Management Guide

## 🎯 Objective

This guide defines processes for managing, analyzing, and maintaining MCP Dev Tools project dependencies in a secure and optimal manner.

---

## 🔍 Package Analysis Checklist

### ✅ **Security** (CRITICAL)

- [ ] **Vulnerabilities**: `npm audit --production`
- [ ] **Compromised packages**: Check blacklist (colors, node-ipc)
- [ ] **Licenses**: Verify compatibility (MIT, Apache-2.0, ISC OK)
- [ ] **Typosquatting**: Check suspicious package names

### ✅ **Obsolescence**

- [ ] **Deprecated packages**: Check npm warnings
- [ ] **Last update**: Unmaintained packages > 2 years
- [ ] **Modern alternatives**: Search for replacements

### ✅ **Updates**

- [ ] **Outdated**: `npm outdated`
- [ ] **Breaking changes**: Check changelog for major updates
- [ ] **Peer dependencies**: Verify compatibility

### ✅ **Quality**

- [ ] **Unused packages**: Check imports in code
- [ ] **Size**: Analyze bundle size
- [ ] **Popularity**: Check downloads/week on npmjs.com
- [ ] **Active maintenance**: Last release < 6 months

### ✅ **Compatibility**

- [ ] **Node.js version**: Check engines in package.json
- [ ] **TypeScript**: Verify types available
- [ ] **Conflicts**: Test clean installation

---

## 🚀 Management Workflow

### **1. Regular Analysis** (Monthly)

```bash
# Run complete analyzer
chmod +x package-analyzer.sh
./package-analyzer.sh
```

**Result**: Detailed report with recommended actions

---

### **2. Before Adding a Package**

```bash
# Check popularity and maintenance
npm view <package-name>

# Check known vulnerabilities
npm audit --package-lock-only

# Check size
npm view <package-name> dist.tarball

# Install in dev first
npm install --save-dev <package-name>

# Test
npm run build
npm test

# If OK, commit
git add package.json package-lock.json
```

**Decision criteria**:
- ✅ Downloads > 10k/week (for popular packages)
- ✅ Last release < 6 months
- ✅ Critical issues < 5 open
- ✅ Tests + CI/CD present
- ✅ Complete documentation

---

### **3. Package Updates**

#### **A. Minor/patch updates (Safe)**

```bash
# See what will be updated
npm outdated

# Update (respects semver)
npm update

# Verify
npm run build
npm test
./pre-commit-check.sh
```

#### **B. Major updates (Breaking)**

```bash
# Backup
git commit -am "Backup before major update"

# Read changelog
npm view <package-name> versions
npm view <package-name>@latest

# Update
npm install <package-name>@latest

# Test extensively
npm run build
npm test

# If errors, fix or rollback
# If OK, commit
git add package*.json
git commit -m "Update <package-name> to vX.Y.Z"
```

---

### **4. Deprecated Package Replacement**

**Example: eslint@8 → eslint@9**

```bash
# 1. Read migration guide
# eslint.org/docs/latest/use/migrate-to-9.0.0

# 2. Uninstall old
npm uninstall eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser

# 3. Install new
npm install --save-dev eslint@9 \
  @typescript-eslint/eslint-plugin@latest \
  @typescript-eslint/parser@latest

# 4. Update config
# .eslintrc.json → eslint.config.js (flat config)

# 5. Test
npm run lint

# 6. Auto fix if possible
npm run lint:fix

# 7. Validate
npm run build
./pre-commit-check.sh
```

---

### **5. Unused Package Cleanup**

```bash
# Detect via analyzer
./package-analyzer.sh

# Manually verify
grep -r "from '<package-name>'" src/

# If truly unused
npm uninstall <package-name>

# Verify everything works
npm run build
npm test
```

---

## 🗂️ Package Database

### **Deprecated Packages to Replace**

| Deprecated | Replacement | Reason |
|------------|-------------|--------|
| `request` | `axios` or `node-fetch` | Unmaintained since 2020 |
| `node-sass` | `sass` (Dart Sass) | Deprecated by Sass team |
| `colors@1.4.x` | `chalk` or `picocolors` | Package compromised in 2022 |
| `babel-eslint` | `@babel/eslint-parser` | Renamed |
| `tslint` | `eslint` + `@typescript-eslint` | TSLint deprecated |
| `eslint@7/8` | `eslint@9` | New versions available |

### **Packages to Monitor**

| Package | Note | Action |
|---------|------|--------|
| `node-ipc` | Malicious code in 2022 | Verify version > 10.1.1 |
| `event-stream` | Compromised in 2018 | Avoid if possible |
| `flatmap-stream` | Compromised in 2018 | Avoid |

### **Recommended Packages**

| Need | Package | Reason |
|------|---------|--------|
| HTTP Client | `axios@1.x` | Popular, well maintained |
| File Watching | `chokidar@3.5+` | Performant, cross-platform |
| Glob Patterns | `fast-glob@3.3+` | Faster than glob |
| CLI Colors | `chalk@5.x` | De facto standard |
| Date/Time | `date-fns` | Modular, tree-shakeable |

---

## 🔒 Security

### **Automatic Audit**

```bash
# Audit production only
npm audit --production

# Complete audit
npm audit

# Auto fix
npm audit fix

# Fix with breaking changes
npm audit fix --force
```

### **Manual Verification**

```bash
# Check specific package
npm view <package-name> versions
npm view <package-name> repository
npm view <package-name> maintainers

# Check on npmjs.com
# - Last release date
# - Download count
# - Dependencies
# - GitHub issues
```

### **Blacklist**

**NEVER use**:
- `colors@1.4.1` or `1.4.2` (compromised)
- `node-ipc@<10.1.1` (malicious)
- Packages with known typosquatting

---

## 📊 Continuous Monitoring

### **Recommended Tools**

1. **Snyk** (https://snyk.io)
   - Automatic vulnerability scan
   - GitHub integration
   - Free for open source

2. **Dependabot** (GitHub)
   - Automatic PRs for security updates
   - Integrated GitHub
   - Free

3. **npm-check-updates**
   ```bash
   npx npm-check-updates
   ```

4. **depcheck** (unused dependencies)
   ```bash
   npx depcheck
   ```

### **Recommended Frequency**

| Action | Frequency |
|--------|-----------|
| `npm audit` | Weekly |
| `./package-analyzer.sh` | Monthly |
| Patch updates | Monthly |
| Minor updates | Quarterly |
| Major updates | As needed + tests |
| Complete review | Annual |

---

## 🎯 Decision Process

### **Should we update?**

```
┌─ Critical vulnerability?
│  └─ YES → Update IMMEDIATELY
│  └─ NO ↓
│
├─ Deprecated package?
│  └─ YES → Plan replacement
│  └─ NO ↓
│
├─ Breaking changes?
│  └─ YES → Analyze impact + Tests
│  └─ NO ↓
│
└─ Useful features?
   └─ YES → Update
   └─ NO → Keep current version
```

---

## 📝 Change Documentation

### **Commit Message Template**

```
deps: update <package> from vX to vY

- Breaking changes: [list]
- New features: [list]
- Fixes: [list]
- Migration steps: [if any]

Refs: #issue-number
```

### **Changelog Entry**

```markdown
## [Version] - Date

### Dependencies
- Updated `<package>` from vX.Y.Z to vA.B.C
  - Reason: [security/feature/deprecation]
  - Breaking changes: [Y/N]
  - Migration required: [Y/N]
```

---

## 🚨 Troubleshooting

### **Quick Rollback**

```bash
# Restore package.json and package-lock.json
git checkout package*.json

# Reinstall
rm -rf node_modules
npm install

# Verify
npm run build
```

### **Debug Installation**

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Verbose mode
npm install --verbose

# Check conflicts
npm ls
```

---

## ✅ Pre-Production Checklist

Before merging dependency changes:

- [ ] `./package-analyzer.sh` → Passed
- [ ] `npm audit --production` → 0 vulnerabilities
- [ ] `npm run build` → Success
- [ ] `npm test` → All pass (if tests available)
- [ ] `./pre-commit-check.sh` → Passed
- [ ] Changelog updated
- [ ] Breaking changes documented
- [ ] Migration guide (if necessary)

---

## 📞 Resources

- **npm documentation**: https://docs.npmjs.com/
- **Semver**: https://semver.org/
- **Node.js LTS**: https://nodejs.org/en/about/releases/
- **Security Best Practices**: https://snyk.io/learn/

---

**Version**: 1.2.0  
**Last updated**: October 20, 2025  
**Maintainer**: Dev Team

*This guide evolves with industry best practices.*
