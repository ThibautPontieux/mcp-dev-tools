# 🚀 Migration Guide - v1.0.0 → v1.2.0

## 📋 Overview

**Migrating from**: MCP Dev Tools 1.0.0 (5 tools)  
**To**: MCP Dev Tools 1.2.0 (14 tools)

**Migration type**: ✅ **Additive** (no breaking changes)

**Estimated time**: 5-10 minutes

---

## ✨ What's New in v1.2.0

### 9 New Tools

**File Operations** (2 new):
- `read_file` - Read file contents
- `write_file` - Create/write files

**Directory Operations** (4):
- `list_directory` - List directories with filters
- `create_directory` - Create directories
- `delete_directory` - Delete directories (secure)
- `move_directory` - Move/rename directories

**Search Operations** (3):
- `search_files` - Search by name/pattern
- `search_content` - Search in content (grep-like)
- `find_duplicates` - Duplicate detection

### New Utilities

- **SearchCache** - Search caching (5-15 min TTL)
- **FileHasher** - MD5/SHA256 hashing

---

## 🔄 Migration Steps

### Step 1: Backup (Optional but Recommended)

```bash
# Backup current version
cp -r packages/dev-tools packages/dev-tools-v1.0.0-backup
```

### Step 2: Pull/Update Code

If from Git:
```bash
git pull origin main
```

If local files:
- Replace files with v1.2.0

### Step 3: Rebuild

```bash
cd packages/dev-tools

# Clean
npm run clean

# Rebuild
npm install
npm run build
```

### Step 4: Verification

```bash
# Validate structure
node validate.js

# Check version in dist/server.js
grep "version:" dist/server.js
# Should display: version: '1.2.0'
```

### Step 5: Restart Claude Desktop

1. **Completely quit** Claude Desktop
2. **Relaunch** the application
3. MCP server reconnects automatically

### Step 6: Quick Test

In Claude, test:
```
List files in src/ directory
```

If Claude uses `list_directory`, ✅ **Migration successful!**

---

## ⚙️ Configuration (Optional)

### New Rate Limits

If you have a `.dev-tools.config.json` file, add:

```json
{
  "rateLimits": {
    "limits": {
      "read_file": { "max": 200, "per": 60000 },
      "write_file": { "max": 100, "per": 60000 },
      "list_directory": { "max": 100, "per": 60000 },
      "create_directory": { "max": 50, "per": 60000 },
      "delete_directory": { "max": 10, "per": 60000 },
      "move_directory": { "max": 20, "per": 60000 },
      "search_files": { "max": 100, "per": 60000 },
      "search_content": { "max": 50, "per": 60000 },
      "find_duplicates": { "max": 20, "per": 60000 }
    }
  }
}
```

**Note**: These limits are already in defaults, this config is optional.

---

## 🔍 Verify Migration

### In Claude Desktop

Ask Claude:
```
What tools do you have available?
```

Claude should list **14 tools** (instead of 5).

### Via Logs

```bash
tail -f packages/dev-tools/.logs/dev-tools-*.log
```

Perform an operation and verify the log appears.

---

## ⚠️ Breaking Changes

**None!** 

v1.2.0 is **100% backward compatible** with v1.0.0.

All existing tools work exactly the same:
- ✅ `rename_file` - No changes
- ✅ `delete_file` - No changes
- ✅ `copy_file` - No changes
- ✅ `file_exists` - No changes
- ✅ `get_file_info` - No changes

---

## 📊 Internal Changes

### Files Added

```
src/types/file.ts               # File operation types
src/types/directory.ts          # Directory operation types
src/types/search.ts             # Search operation types
src/tools/file-operations.ts    # File ops implementation
src/tools/directory-operations.ts  # Directory ops implementation
src/tools/search-operations.ts     # Search ops implementation
src/utils/search-cache.ts       # Caching
src/utils/file-hasher.ts        # Hashing
```

### Files Modified

```
src/server.ts                   # +9 tools
src/utils/config.ts             # +9 rate limits
src/types/index.ts              # Exports
src/tools/index.ts              # Exports
src/utils/index.ts              # Exports
CHANGELOG.md                    # v1.2.0
```

### No Files Deleted

All files from v1.0.0 are preserved.

---

## 🐛 Troubleshooting

### Issue: Build fails

**Solution**:
```bash
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### Issue: Claude doesn't see new tools

**Possible causes**:
1. Claude Desktop not restarted → Completely restart
2. Incomplete build → Check `dist/server.js` exists
3. Old cache → Delete `dist/` and rebuild

### Issue: TypeScript errors

**Solution**: See `build-fixes.md` for known fixes

---

## 📈 Migration Benefits

### Before (v1.0.0)
- 5 tools (files only)
- Basic management

### After (v1.2.0)
- 14 tools (files + directories + search)
- Complete workspace management
- Advanced search with caching
- Duplicate detection
- Optimized performance

### Unlocked Use Cases

**New**: Organize project structure
```
Create src/components/ui/buttons directory structure
```

**New**: Find files quickly
```
Find all test files
```

**New**: Content search
```
Search for TODO comments in TypeScript files
```

**New**: Clean up duplicates
```
Find duplicate images to save space
```

---

## ✅ Migration Checklist

- [ ] Backup done (optional)
- [ ] Code updated to v1.2.0
- [ ] `npm run clean` executed
- [ ] `npm install` executed
- [ ] `npm run build` successful
- [ ] `node validate.js` passes
- [ ] Claude Desktop restarted
- [ ] `list_directory` test successful
- [ ] 14 tools available confirmed
- [ ] Logs verified working

---

## 🎉 Migration Complete!

If all tests pass, migration is **complete and successful**!

**Enjoy the 9 new tools!** 🚀

---

## 📞 Support

**Issues?**
1. See `testing.md`
2. Check `build-fixes.md`
3. Consult `changelog.md` for details

---

**Version**: 1.0.0 → 1.2.0  
**Date**: October 19-21, 2025  
**Type**: Additive migration (no breaking changes)  
**Duration**: 5-10 minutes

*Migration guide created - October 19-21, 2025*
