# 🤖 Working with Claude on This Project

## Overview

This document serves two purposes:
1. **For humans**: Understand how to collaborate effectively with Claude on this project
2. **For Claude**: Critical guidelines for maintaining code quality and consistency

This is an example of **context files** - documentation that can be provided to Claude at the start of a conversation to improve consistency and adherence to project-specific workflows.

---

## 💡 Context Files for Claude

### What are Context Files?

Context files are documents that you can provide to Claude at the beginning of a conversation to:
- Set project-specific rules and workflows
- Prevent common mistakes
- Ensure consistency across sessions
- Document lessons learned from past work

### How to Use Them

When starting a new conversation with Claude about this project, you can:
1. Reference this document in your initial message
2. Share it as an attachment if your Claude interface supports file uploads
3. Copy relevant sections into your conversation

### Benefits

- ✅ **Consistency**: Claude follows the same patterns across all sessions
- ✅ **Quality**: Avoid repeating past mistakes
- ✅ **Efficiency**: Less back-and-forth, faster development
- ✅ **Best practices**: Encode your team's standards

---

## ⚠️ CRITICAL RULES TO FOLLOW

### 🔴 **RULE #1: ALWAYS TEST BEFORE DECLARING COMPLETE**

**NEVER declare work "complete" without verifying compilation.**

### 🔴 **RULE #2: ALWAYS UPDATE CHANGELOG**

**NEVER bump version or add features without updating the changelog.**

### ✅ Mandatory Workflow

For **ANY** code modification:

```bash
# 1. Make modifications
# ... edit files ...

# 2. TEST COMPILATION (MANDATORY)
cd packages/dev-tools
npm run build

# 3. IF errors → FIX immediately
# 4. RE-TEST after fixing
npm run build

# 5. UPDATE CHANGELOG if needed (see below)

# 6. ONLY after successful build + changelog → Declare complete
```

### 🚫 **Never Do This**

❌ "The code is complete!" → without testing the build  
❌ "Ready for testing" → without compiling  
❌ Create 20 files → without verifying they compile together  
❌ Bump version → without updating changelog  
❌ Add new feature → without documenting in changelog  

### ✅ **Always Do This**

✅ Modify code → `npm run build` → Fix errors → Re-build → Complete  
✅ Verify files exist: `file_exists`  
✅ Read compiled output: `read_file dist/server.js`  
✅ Update changelog: See "Changelog Maintenance" section  

---

## 📋 Systematic Checklist

Before saying "complete", verify:

- [ ] `npm run build` → success (0 errors)
- [ ] `node validate.js` → passed
- [ ] Created files actually exist
- [ ] No duplicate types/exports
- [ ] package.json version correct
- [ ] **Changelog updated** if version changed or features added

---

## 📝 Changelog Maintenance

### When to Update Changelog

**ALWAYS update `docs/maintenance/changelog.md` when:**

1. **Version changes** in package.json
2. **New features** added (tools, utilities, etc.)
3. **Breaking changes** introduced
4. **Bug fixes** implemented
5. **Dependencies updated** (especially major versions)
6. **Documentation changes** that impact users

### Changelog Format

Follow [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### 🎉 Release Description

Brief description of this release.

### ✨ Added
- **New feature name** - Description
  - Detail 1
  - Detail 2

### 📦 Changed
- **Component name** - What changed
  - Before → After

### 🐛 Fixed
- **Issue** - How it was fixed

### ⚠️ Breaking Changes
- **Change description** - Migration notes

### 📈 Statistics
| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Tools  | 12     | 14    | +2     |
```

### Changelog Workflow

```bash
# 1. Before making changes, note current version
grep "version" package.json

# 2. Make your changes

# 3. If version changed, update changelog
read_file docs/maintenance/changelog.md
# Add new version section at the top

# 4. Document all changes made
# - Added features
# - Updated dependencies
# - Fixed bugs
# - Breaking changes (if any)

# 5. Include statistics if relevant
# - Tool count changes
# - Dependency version changes
# - File count changes

# 6. Save and verify
write_file docs/maintenance/changelog.md [content]
read_file docs/maintenance/changelog.md
```

### Example Changelog Entry

```markdown
## [1.3.0] - 2025-10-22

### 🎉 Feature Release - Advanced Caching

Added intelligent caching system for improved performance.

### ✨ Added
- **`cache_manager`** - New caching tool
  - Configurable TTL
  - LRU eviction
  - Size limits

### 📦 Changed
- **Search operations** - Now use cache_manager
  - 50% performance improvement
  - Reduced API calls

### 📈 Statistics
| Metric | v1.2.0 | v1.3.0 | Change |
|--------|--------|--------|--------|
| Tools  | 14     | 15     | +1     |
```

---

## 🐛 Known Errors to Avoid

### 1. Duplicate Types
**Problem**: Types defined in 2 different files  
**Solution**: Check exports before creating new types

### 2. Unsaved Files
**Problem**: Very long file truncated during write_file  
**Solution**: Use `file_exists` to verify after writing

### 3. Incorrect Version
**Problem**: package.json not updated  
**Solution**: Always update version with new features

### 4. Missing Imports
**Problem**: New class created but not imported  
**Solution**: Verify all imports after creation

### 5. Outdated Changelog
**Problem**: Changelog not updated with version  
**Solution**: ALWAYS update changelog when version changes

---

## 🔧 Available MCP Tools

You have access to `dev-tools` with **14 tools**:

### File Operations (7)
- `read_file` - Read file contents
- `write_file` - Create/write files
- `rename_file` - Rename/move file
- `delete_file` - Delete file
- `copy_file` - Copy file
- `file_exists` - Check existence
- `get_file_info` - Detailed info

### Directory Operations (4)
- `list_directory` - List contents
- `create_directory` - Create folder
- `delete_directory` - Delete folder
- `move_directory` - Move folder

### Search Operations (3)
- `search_files` - Search files by name
- `search_content` - Search in content
- `find_duplicates` - Find duplicates

**⚠️ USE THESE TOOLS to verify your work!**

---

## 💡 Recommended Workflow

### For Creating New Features

1. **Plan**: Define what needs to be created
2. **Create**: Write necessary files
3. **Verify**: `file_exists` on each created file
4. **Compile**: `npm run build`
5. **Fix**: If errors, fix and re-build
6. **Validate**: `node validate.js`
7. **Update changelog**: Document the new feature
8. **Confirm**: Read dist/server.js to verify result
9. **Declare complete**: ONLY now

### For Modifying Existing Code

1. **Read**: `read_file` to see current code
2. **Modify**: Make changes
3. **Compile**: `npm run build`
4. **Verify**: Read result in dist/
5. **Update changelog**: If version changed or bug fixed
6. **Test**: If possible, quick test
7. **Declare complete**: If everything OK

---

## 🎯 Example of Good Practice

```
User: "Add a new feature X"

Claude:
1. [Creates necessary files]
2. [Uses file_exists to confirm]
3. "I'll now test the compilation"
4. [Runs npm run build via execution or asks user]
5a. If errors → [Fixes] → [Re-tests] → Repeats until success
5b. If success → "✅ Build successful, 0 errors"
6. [Updates changelog with new feature X]
7. [Verifies result in dist/]
8. "✅ Feature X is now complete, tested, and documented in changelog"
```

---

## 🚨 IF YOU'RE READING THIS FILE

**You are Claude in a NEW conversation.**

Previous development sessions had issues because:
- Code wasn't tested before being declared complete
- Files weren't saved correctly
- Type duplicates caused compilation errors
- **Changelog wasn't updated** with version changes

**LEARN from these errors**: ALWAYS test the build AND update the changelog!

---

## 📞 When in Doubt

**Ask the user**:
- "May I test the compilation now?"
- "Would you like me to verify everything compiles before continuing?"
- "Should I update the changelog with these changes?"

But **IDEALLY**: Test and update automatically without asking.

---

## ✅ Final Checklist Before "Complete"

Before saying "The work is complete":

- [ ] I tested `npm run build`
- [ ] No compilation errors
- [ ] I verified files exist
- [ ] I read compiled output to confirm
- [ ] Version is correct if needed
- [ ] No duplicate types/exports
- [ ] **Changelog is updated** if version changed or features added

**If ALL are checked → Then and only then say "complete"**

---

## 🌟 Applying This to Your Own Projects

You can create similar context files for your projects:

### Template Structure

```markdown
# Working with Claude on [Project Name]

## Project-Specific Rules
- [Your critical rules]
- Always update changelog

## Common Mistakes to Avoid
- [Past errors and their solutions]
- Forgotten changelog updates

## Mandatory Workflow
- [Your team's development process]
- Changelog maintenance

## Available Tools
- [Tools Claude has access to]

## Quality Checklist
- [What to verify before declaring complete]
- Changelog updated
```

### Tips for Effective Context Files

1. **Be specific**: Don't say "test the code", say "run `npm test` and verify 0 failures"
2. **Document past errors**: Include actual mistakes that happened
3. **Provide examples**: Show good and bad patterns
4. **Keep it updated**: Add new lessons learned
5. **Make it actionable**: Use checklists and clear steps
6. **Include changelog rules**: Specify when and how to update

---

## 📚 Additional Resources

- **Project Structure**: See main README.md
- **Testing Guide**: See guides/testing.md
- **Troubleshooting**: See maintenance/troubleshooting.md
- **Lessons Learned**: See development/lessons-learned.md
- **Changelog**: See maintenance/changelog.md (KEEP IT UPDATED!)

---

**This documentation exists to help you avoid repeating past mistakes.**

*Created from lessons learned - October 19-21, 2025*
