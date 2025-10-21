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

# 5. ONLY after successful build → Declare complete
```

### 🚫 **Never Do This**

❌ "The code is complete!" → without testing the build  
❌ "Ready for testing" → without compiling  
❌ Create 20 files → without verifying they compile together  

### ✅ **Always Do This**

✅ Modify code → `npm run build` → Fix errors → Re-build → Complete  
✅ Verify files exist: `file_exists`  
✅ Read compiled output: `read_file dist/server.js`  

---

## 📋 Systematic Checklist

Before saying "complete", verify:

- [ ] `npm run build` → success (0 errors)
- [ ] `node validate.js` → passed
- [ ] Created files actually exist
- [ ] No duplicate types/exports
- [ ] package.json version correct

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
7. **Confirm**: Read dist/server.js to verify result
8. **Declare complete**: ONLY now

### For Modifying Existing Code

1. **Read**: `read_file` to see current code
2. **Modify**: Make changes
3. **Compile**: `npm run build`
4. **Verify**: Read result in dist/
5. **Test**: If possible, quick test
6. **Declare complete**: If everything OK

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
6. [Verifies result in dist/]
7. "✅ Feature X is now complete and tested"
```

---

## 🚨 IF YOU'RE READING THIS FILE

**You are Claude in a NEW conversation.**

Previous development sessions had issues because:
- Code wasn't tested before being declared complete
- Files weren't saved correctly
- Type duplicates caused compilation errors

**LEARN from these errors**: ALWAYS test the build!

---

## 📞 When in Doubt

**Ask the user**:
- "May I test the compilation now?"
- "Would you like me to verify everything compiles before continuing?"

But **IDEALLY**: Test automatically without asking.

---

## ✅ Final Checklist Before "Complete"

Before saying "The work is complete":

- [ ] I tested `npm run build`
- [ ] No compilation errors
- [ ] I verified files exist
- [ ] I read compiled output to confirm
- [ ] Version is correct if needed
- [ ] No duplicate types/exports

**If ALL are checked → Then and only then say "complete"**

---

## 🌟 Applying This to Your Own Projects

You can create similar context files for your projects:

### Template Structure

```markdown
# Working with Claude on [Project Name]

## Project-Specific Rules
- [Your critical rules]

## Common Mistakes to Avoid
- [Past errors and their solutions]

## Mandatory Workflow
- [Your team's development process]

## Available Tools
- [Tools Claude has access to]

## Quality Checklist
- [What to verify before declaring complete]
```

### Tips for Effective Context Files

1. **Be specific**: Don't say "test the code", say "run `npm test` and verify 0 failures"
2. **Document past errors**: Include actual mistakes that happened
3. **Provide examples**: Show good and bad patterns
4. **Keep it updated**: Add new lessons learned
5. **Make it actionable**: Use checklists and clear steps

---

## 📚 Additional Resources

- **Project Structure**: See main README.md
- **Testing Guide**: See guides/testing.md
- **Troubleshooting**: See maintenance/troubleshooting.md
- **Lessons Learned**: See development/lessons-learned.md

---

**This documentation exists to help you avoid repeating past mistakes.**

*Created from lessons learned - October 19-21, 2025*
