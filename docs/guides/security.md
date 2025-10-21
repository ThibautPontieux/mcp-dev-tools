# 🔒 Security Guide - MCP Dev Tools

## 🎯 Automatic Verification

### Security Audit Script

```bash
chmod +x security-audit.sh
./security-audit.sh
```

This script checks:
- ✅ Deprecated packages
- ✅ npm audit vulnerabilities
- ✅ Node.js version
- ✅ Known vulnerable packages

---

## 📋 Manual Security Checklist

### Before Each Build

```bash
# 1. Check outdated packages
npm outdated

# 2. Security audit (production only)
npm audit --production

# 3. Check critical vulnerabilities
npm audit --audit-level=high
```

### Automatic Fix

```bash
# Attempt auto fix (no breaking changes)
npm audit fix

# Aggressive fix (with breaking changes)
npm audit fix --force
```

---

## 🚨 Packages to Avoid

### Blacklist (Deprecated/Vulnerable)

❌ **AVOID**:
- `request` - Deprecated, use `node-fetch` or `axios`
- `chokidar@<3.5` - Old versions vulnerable
- `eslint@<9` - Old versions deprecated
- `glob@<8` - Use `fast-glob` instead
- `colors` - Package compromised in 2022

✅ **Safe Alternatives**:
- For HTTP: `node-fetch@3+`, `axios@1+`
- For file watching: `chokidar@3.5+`
- For globbing: `fast-glob@3.3+`
- For linting: `eslint@9+`

---

## 📊 Current Dependencies (v1.2.0)

### Production Dependencies

| Package | Version | Security | Notes |
|---------|---------|----------|-------|
| @modelcontextprotocol/sdk | ^1.20.1 | ✅ Safe | Official Anthropic |
| fast-glob | ^3.3.2 | ✅ Safe | Active, maintained |

### Dev Dependencies

| Package | Version | Security | Notes |
|---------|---------|----------|-------|
| typescript | ^5.3.3 | ✅ Safe | Latest stable |
| jest | ^30.2.0 | ✅ Safe | Active, maintained |
| eslint | ^9.38.0 | ✅ Safe | Latest version |
| @typescript-eslint | ^8.46.0 | ✅ Safe | ESLint 9 compatible |

---

## 🔄 Update Process

### Security Update (Recommended: Monthly)

```bash
# 1. Backup
git commit -am "Backup before security update"

# 2. Check what's outdated
npm outdated

# 3. Update patches/minor (safe)
npm update

# 4. Audit
npm audit

# 5. Auto fix
npm audit fix

# 6. Rebuild and test
npm run build
npm test

# 7. If OK, commit
git add package*.json
git commit -m "Security: Update dependencies"
```

### Major Update (With Caution)

```bash
# For each outdated major package:
npm install package@latest

# Then complete test
npm run build
npm test
```

---

## 🛡️ Best Practices

### 1. Lock File
✅ **Always commit** `package-lock.json`  
Guarantees reproducibility and security

### 2. Regular Audit
```bash
# Add to CI/CD or cron
npm audit --production --audit-level=moderate
```

### 3. Minimum Dependencies
- Avoid unnecessary dependencies
- Prefer packages with few sub-dependencies
- Check maintenance (last release, issues, stars)

### 4. Precise Versions in Production
For critical production, use exact versions:
```json
{
  "dependencies": {
    "fast-glob": "3.3.2"  // Without ^ for exact version
  }
}
```

---

## 🔍 Pre-Installation Verification

Before adding a new dependency:

```bash
# 1. Check on npm
npm view package-name

# 2. Check known vulnerabilities
npm audit --package-lock-only

# 3. Check GitHub repo
# - Recent release?
# - Critical open issues?
# - Active maintenance?
```

### Evaluation Criteria

✅ **Safe Package**:
- Recent release (< 6 months)
- Critical issues addressed
- Tests + CI/CD
- >1000 stars (for popular packages)
- Active maintainer

❌ **Suspicious Package**:
- Last release > 2 years
- Unaddressed critical issues
- No tests
- Inactive maintainer
- Security warnings

---

## 📈 Continuous Monitoring

### Recommended Tools

1. **Snyk** (https://snyk.io)
   - Automatic vulnerability scan
   - GitHub integration

2. **Dependabot** (GitHub)
   - Auto PRs for security updates
   - Free for public repos

3. **npm audit**
   - Built-in, always available
   - Use regularly

---

## 🚨 In Case of Critical Vulnerability

### Emergency Process

1. **Identify**
```bash
npm audit --audit-level=critical
```

2. **Assess Impact**
- Package in production?
- Exploitable in our context?
- Patch available?

3. **Fix QUICKLY**
```bash
# Option 1: Auto fix
npm audit fix

# Option 2: Manual update
npm install vulnerable-package@safe-version

# Option 3: Replace
npm uninstall vulnerable-package
npm install safe-alternative
```

4. **Test & Deploy**
```bash
npm run build
npm test
# If OK → deploy immediately
```

---

## 📝 Security Changelog

Keep track of security updates in SECURITY.md:

```markdown
## [Date] - Security Update
- Updated `package` from vX to vY
- Fixes CVE-XXXX-XXXXX
- Impact: [Low/Medium/High]
- Breaking changes: [Yes/No]
```

---

## ✅ Production Build Checklist

Before each release:

- [ ] `npm audit --production` → 0 vulnerabilities
- [ ] `npm outdated` → No critical outdated packages
- [ ] `./security-audit.sh` → Passed
- [ ] `npm test` → All tests pass
- [ ] `npm run build` → Successful
- [ ] Version bumped in package.json
- [ ] CHANGELOG.md updated

---

## 🎯 For This Project (v1.2.0)

### Current Status

✅ **Safe Dependencies**:
- Only 2 production deps (minimal)
- Recent and maintained versions
- No known critical vulnerabilities

⚠️ **To Monitor**:
- ESLint 9 (new, possible bugs)
- MCP SDK (check Anthropic updates)

### Next Check

📅 **Recommended**: Monthly audit
```bash
# First day of month
./security-audit.sh
npm audit
npm outdated
```

---

**🔒 Security is continuous, not one-time!**

*Guide created - October 19-21, 2025*
