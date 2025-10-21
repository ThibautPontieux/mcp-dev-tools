# 🔧 Post-Build Troubleshooting

## 📋 Detected Issues

### ✅ Build Works
Build executed successfully!

### ❌ Issue 1: Deprecated Packages
Some packages are marked as "deprecated"

### ❌ Issue 2: Claude Doesn't See New Tools
Only the 5 original tools are visible (screenshot)

---

## 🔧 FIXES APPLIED

### Issue 1: Security ✅

**Changes in package.json**:

```diff
"dependencies": {
  "@modelcontextprotocol/sdk": "^1.20.1",
  "fast-glob": "^3.3.2",
- "chokidar": "^3.5.3"  ← REMOVED (unused)
}

"devDependencies": {
- "eslint": "^8.56.0",           ← Deprecated
+ "eslint": "^9.38.0",            ← Latest version
- "@typescript-eslint/...": "^6.19.0",  ← Old
+ "@typescript-eslint/...": "^8.46.0",   ← Recent
}
```

**New script added**:
```json
"audit": "npm audit --production"
```

**Security files created**:
- ✅ `security-audit.sh` - Automatic audit script
- ✅ `SECURITY.md` - Complete security guide

---

### Issue 2: Incorrect Version ✅

**Root Cause**: Version `1.0.0` in package.json

**Fix**:
```diff
{
  "name": "@mcp-servers/dev-tools",
- "version": "1.0.0",
+ "version": "1.2.0",
  ...
}
```

**Impact**: 
- MCP server identifies with version 1.0.0
- Claude Desktop doesn't reload new tools

---

## 🚀 ACTIONS TO PERFORM NOW

### Step 1: Reinstall Dependencies

```bash
cd packages/dev-tools

# Remove old dependencies
rm -rf node_modules package-lock.json

# Reinstall with updated versions
npm install
```

**Expected result**: New versions installed without warnings

---

### Step 2: Security Audit

```bash
# Check vulnerabilities
npm audit --production

# Run complete audit
chmod +x security-audit.sh
./security-audit.sh
```

**Expected result**: ✅ No vulnerabilities

---

### Step 3: Complete Rebuild

```bash
# Clean
npm run clean

# Rebuild with version 1.2.0
npm run build

# Check version in build
grep "version:" dist/server.js | head -1
```

**Expected result**: `version: '1.2.0'`

---

### Step 4: Restart Claude Desktop

**IMPORTANT**: COMPLETE restart required

**macOS**:
1. Cmd+Q (quit completely)
2. Relaunch Claude Desktop
3. Wait for reconnection

**Windows**:
1. Alt+F4 or close via task manager
2. Relaunch Claude Desktop
3. Wait for reconnection

---

### Step 5: Verification

In Claude, type:
```
What tools do you have available for dev-tools?
```

**Expected result**: 
```
14 tools available:
- File Operations: read_file, write_file, rename_file, delete_file, copy_file, file_exists, get_file_info
- Directory Operations: list_directory, create_directory, delete_directory, move_directory
- Search Operations: search_files, search_content, find_duplicates
```

**OR** quick test:
```
List files in the src directory
```

If Claude uses `list_directory` → ✅ **SUCCESS!**

---

## 📊 Complete Checklist

### Build & Security
- [ ] `rm -rf node_modules package-lock.json`
- [ ] `npm install` (new versions)
- [ ] `npm audit --production` (0 vulnerabilities)
- [ ] `./security-audit.sh` (passed)

### Rebuild
- [ ] `npm run clean`
- [ ] `npm run build` (success)
- [ ] `grep "1.2.0" dist/server.js` (found)

### Claude Desktop
- [ ] Quit completely
- [ ] Relaunch
- [ ] Wait for reconnection (30 seconds)

### Tests
- [ ] Ask "List files in src/"
- [ ] Claude uses `list_directory`
- [ ] 14 tools visible

---

## 🐛 If Still Only 5 Tools

### Diagnosis

1. **Check server version**:
```bash
node dist/index.js 2>&1 | grep version
```
Should display: `Version: 1.2.0`

2. **Check Claude logs**:
```bash
# macOS
tail -f ~/Library/Logs/Claude/mcp*.log

# Windows
# Check in Event Viewer
```

3. **Check config**:
```bash
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

Verify path points to `dist/index.js` (NOT `dist/server.js`)

---

## 🔍 Advanced Debug

### Test MCP Server

```bash
# Run server directly
cd packages/dev-tools
node dist/index.js
```

**Should display**:
```
MCP Dev Tools server started successfully
Version: 1.2.0
...
Available tools (14):
  File Operations: ...
  Directory Operations: ...
  Search Operations: ...
```

If version = 1.0.0 or tools = 5 → Rebuild required

---

## 📝 Summary of Changes

### Modified Files
1. `package.json` - Version + dependencies
2. New: `security-audit.sh`, `SECURITY.md`

### Commands to Execute
```bash
# In packages/dev-tools/
rm -rf node_modules package-lock.json
npm install
npm audit --production
npm run clean
npm run build
grep "1.2.0" dist/server.js
```

Then completely restart Claude Desktop.

---

## ✅ Final Validation

**Everything is OK if**:
- ✅ `npm audit --production` → 0 vulnerabilities
- ✅ `grep "1.2.0" dist/server.js` → found
- ✅ Claude displays 14 tools
- ✅ `list_directory` test works

---

## 🎯 Expected Status After Fixes

**Security**: ✅ No vulnerabilities  
**Version**: ✅ 1.2.0  
**Tools**: ✅ 14 tools available  
**Tests**: ✅ All functional

---

**Next step**: Execute commands above and let me know the result! 🚀

*Fixes documented - October 19-21, 2025*
