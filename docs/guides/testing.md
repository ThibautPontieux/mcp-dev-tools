# 🧪 Testing Guide - MCP Dev Tools v1.2.0

## ✅ Complete Validation Checklist

---

## 🔨 1. Build & Compilation

### Step 1: Clean Build
```bash
cd packages/dev-tools
npm run clean
npm install
npm run build
```

**Expected result**:
```
✓ Compilation successful
✓ dist/ directory created
✓ No TypeScript errors
```

**If errors**: See `build-fixes.md`

---

### Step 2: Structure Validation
```bash
node validate.js
```

**Expected result**:
```
✓ All structure checks passed
✓ All files present
✓ Package is ready
```

---

### Step 3: Type Checking
```bash
npm run type-check
```

**Expected result**: No TypeScript errors

---

## 🧪 2. Functional Tests (Optional)

### Unit Tests (if created)
```bash
npm test
```

### Quick Manual Test

Create a test file: `test-tools.js`

```javascript
// Quick test of 14 MCP tools
const tools = [
  // File Operations
  'read_file',
  'write_file',
  'rename_file',
  'delete_file', 
  'copy_file',
  'file_exists',
  'get_file_info',
  
  // Directory Operations
  'list_directory',
  'create_directory',
  'delete_directory',
  'move_directory',
  
  // Search Operations
  'search_files',
  'search_content',
  'find_duplicates'
];

console.log(`✓ ${tools.length} MCP tools defined`);
console.log('Tools:', tools.join(', '));
```

Execute: `node test-tools.js`

---

## 🔧 3. Claude Desktop Configuration

### Verify path
```bash
pwd
# Note the absolute path
```

### JSON Configuration
Edit `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "dev-tools": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/to/packages/dev-tools/dist/index.js"
      ],
      "env": {
        "WORKSPACE_DIR": "/your/workspace",
        "BACKUP_ENABLED": "true",
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
```

**⚠️ Replace** `/ABSOLUTE/PATH/to/` with your actual path!

---

## 🎯 4. Tests With Claude

### Test 1: File Operations

```
Can you check if package.json exists?
```
✅ **Expected**: Claude uses `file_exists`

---

### Test 2: Directory Operations

#### Test 2.1: list_directory
```
List all files in the src/ directory
```
✅ **Expected**: List of files in src/

#### Test 2.2: create_directory  
```
Create a directory called test-dir
```
✅ **Expected**: Directory created

#### Test 2.3: Verification
```
Check if test-dir exists
```
✅ **Expected**: Existence confirmation

#### Test 2.4: delete_directory
```
Delete the test-dir directory
```
✅ **Expected**: Claude asks for confirmation, then deletes

---

### Test 3: Search Operations

#### Test 3.1: search_files
```
Find all TypeScript files in the project
```
✅ **Expected**: List of .ts files

#### Test 3.2: search_content
```
Search for the word "export" in all TypeScript files
```
✅ **Expected**: Files containing "export" with context

#### Test 3.3: find_duplicates (if applicable)
```
Find any duplicate files in the project
```
✅ **Expected**: List of duplicates (or none if no duplicates)

---

## 📊 5. Log Verification

### Logs created
```bash
ls -la .logs/
```
✅ **Expected**: Log files created

### Log contents
```bash
tail -f .logs/dev-tools-*.log
```
✅ **Expected**: JSON entries for each operation

---

## 🔒 6. Security Tests

### Test Path Traversal
```
Try to access ../../../etc/passwd
```
✅ **Expected**: Error "Invalid path: Path traversal detected"

### Test Protected Paths
```
Try to delete node_modules directory
```
✅ **Expected**: Error "Path is protected"

### Test Rate Limiting (if enabled)
Make 100 `list_directory` requests quickly
✅ **Expected**: After limit, error "Rate limit exceeded"

---

## 📈 7. Performance

### Test 1: List large structure
```
List all files recursively in a large directory
```
✅ **Expected**: Completes in < 5 seconds for ~1000 files

### Test 2: Content search
```
Search for "function" in all TypeScript files
```
✅ **Expected**: Completes in < 10 seconds

### Test 3: Duplicate detection
```
Find duplicates by hash in the entire project
```
✅ **Expected**: Completes in < 30 seconds

---

## 🐛 8. Error Tests

### Nonexistent file
```
Get info about nonexistent-file.txt
```
✅ **Expected**: `{ success: true, exists: false }`

### Nonexistent directory
```
List contents of nonexistent-directory
```
✅ **Expected**: Error "Directory not found"

### Missing confirmation
```
Delete a directory without confirming
```
✅ **Expected**: Error "confirm parameter must be true"

---

## ✅ Complete Checklist

### Build & Installation
- [ ] `npm run build` succeeds
- [ ] `node validate.js` passes
- [ ] `npm run type-check` no errors
- [ ] `dist/` contains all files

### Configuration
- [ ] `claude_desktop_config.json` configured
- [ ] Correct absolute path
- [ ] Environment variables defined
- [ ] Claude Desktop restarted

### Tests File Operations
- [ ] `read_file` works
- [ ] `write_file` works
- [ ] `rename_file` works
- [ ] `delete_file` works
- [ ] `copy_file` works
- [ ] `file_exists` works
- [ ] `get_file_info` works

### Tests Directory Operations
- [ ] `list_directory` works
- [ ] `create_directory` works
- [ ] `delete_directory` works (with confirm)
- [ ] `move_directory` works

### Tests Search Operations
- [ ] `search_files` works
- [ ] `search_content` works
- [ ] `find_duplicates` works

### Security
- [ ] Path traversal blocked
- [ ] Protected paths respected
- [ ] Rate limiting works (if enabled)
- [ ] Logs created correctly

### Performance
- [ ] Fast operations (< 5s)
- [ ] Cache works (instant results)
- [ ] No memory leaks

---

## 🚨 Troubleshooting

### Error: "Module not found"
```bash
cd packages/dev-tools
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Error: "Invalid path"
Verify that `WORKSPACE_DIR` is correct in config

### Error: "Rate limit exceeded"
Either:
- Wait 1 minute
- Or disable: `"RATE_LIMIT_ENABLED": "false"`

### Claude doesn't see new tools
1. Verify displayed version is 1.2.0
2. Completely restart Claude Desktop
3. Check MCP server logs

---

## 📝 Test Report

After testing, fill out:

**Test date**: _______________

**Version**: 1.2.0

**Results**:
- Build: ☐ OK ☐ ERROR
- File ops: ☐ OK ☐ ERROR  
- Directory ops: ☐ OK ☐ ERROR
- Search ops: ☐ OK ☐ ERROR
- Security: ☐ OK ☐ ERROR
- Performance: ☐ OK ☐ ERROR

**Issues encountered**:
_________________________________
_________________________________

**Notes**:
_________________________________
_________________________________

---

## 🎉 If All Tests Pass

**Congratulations!** The MCP Dev Tools v1.2.0 package is fully functional with:
- ✅ 14 MCP tools
- ✅ Complete file + directory management
- ✅ Advanced search
- ✅ Enterprise security
- ✅ Optimized performance

---

**Next step**: Production use! 🚀

*Testing guide created - October 19-21, 2025*
