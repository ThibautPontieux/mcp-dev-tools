# 🛠️ MCP Dev Tools Documentation

> **Complete documentation for MCP Dev Tools - File & Directory Operations for Autonomous AI Development**

[![GitHub](https://img.shields.io/badge/GitHub-ThibautPontieux%2Fmcp--dev--tools-blue?logo=github)](https://github.com/ThibautPontieux/mcp-dev-tools)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/ThibautPontieux/mcp-dev-tools/blob/main/LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://github.com/ThibautPontieux/mcp-dev-tools)

---

## 🚀 Quick Navigation

### Getting Started
- [🎯 Start Here](getting-started/index.md) - Your first MCP dev tools experience
- [📖 Installation Guide](getting-started/installation.md) - Complete installation instructions
- [⚡ Quick Start](getting-started/quickstart.md) - Get up and running in 5 minutes

### User Guides
- [🔒 Security Guide](guides/security.md) - Security best practices
- [✅ Testing Guide](guides/testing.md) - Testing your implementation
- [🔄 Migration Guide](guides/migration.md) - Upgrading between versions

### Development
- [🤖 Working with Claude](development/working-with-claude.md) - AI collaboration guide
- [📦 Package Management](development/package-management.md) - Dependency management
- [💡 Lessons Learned](development/lessons-learned.md) - Project insights

### Maintenance
- [🔧 Build Fixes](maintenance/build-fixes.md) - Common build issues
- [🆘 Troubleshooting](maintenance/troubleshooting.md) - Problem solving
- [📝 Changelog](maintenance/changelog.md) - Version history

---

## 📊 Project Overview

**MCP Dev Tools** provides 14 powerful tools for file and directory operations, designed for autonomous AI development with enterprise-grade security.

### Key Features

✅ **14 MCP Tools** - Complete file & directory operations  
🔒 **Enterprise Security** - Path validation, rate limiting, protected paths  
🤖 **85% Autonomous** - Automated package management & validation  
📦 **Zero Vulnerabilities** - All dependencies up-to-date and secure  
✨ **TypeScript** - Full type safety with strict mode  
📚 **Comprehensive Docs** - Complete documentation in English  

### Statistics

| Metric | Value |
|--------|-------|
| **MCP Tools** | 14 (7 file + 4 dir + 3 search) |
| **Dependencies** | 2 production, 10 dev |
| **Security Issues** | 0 |
| **Build Status** | ✅ Passing |
| **Test Coverage** | Ready for tests |
| **Documentation** | Complete |

---

## 🎯 Quick Start

```bash
# Install
npm install @mcp-servers/dev-tools

# Configure in Claude Desktop
# Add to config file...
```

[See full installation guide →](getting-started/installation.md)

---

## 🛠️ Available Tools

### File Operations (7)

1. **`read_file`** - Read file contents
   - Supports text and binary files
   - UTF-8 and Base64 encoding
   - Size limits for safety

2. **`write_file`** - Create/write files
   - Automatic parent directory creation
   - Overwrite protection
   - Backup on overwrite

3. **`rename_file`** - Rename or move files
   - Atomic operations
   - Automatic directory creation
   - Backup support

4. **`delete_file`** - Delete files (with backup)
   - Mandatory confirmation
   - Automatic backup creation
   - Safe deletion with validation

5. **`copy_file`** - Copy files
   - Timestamp preservation
   - Overwrite protection
   - Progress for large files

6. **`file_exists`** - Check file existence
   - Returns existence status
   - File type detection
   - Fast validation

7. **`get_file_info`** - Get file metadata
   - Size, timestamps, permissions
   - MIME type detection
   - Complete file information

### Directory Operations (4)

8. **`list_directory`** - List directory contents with filters
   - Recursive traversal with depth control
   - File type filtering (by extension)
   - Multiple sort options (name, size, modified)
   - Hidden file inclusion
   - Pattern matching (glob support)
   - Statistics (total files, directories, size)

9. **`create_directory`** - Create directories
   - Recursive parent creation
   - Unix permissions support
   - Duplicate detection
   - Safe path validation

10. **`delete_directory`** - Delete directories (secure)
    - Mandatory confirmation requirement
    - Recursive deletion support
    - Automatic backup creation
    - Content counting before deletion
    - Force flag for non-empty directories

11. **`move_directory`** - Move/rename directories
    - Directory merging support
    - Automatic backup on overwrite
    - Content preservation
    - Cross-directory moves

### Search Operations (3)

12. **`search_files`** - Search files by name/pattern
    - Name/pattern matching (glob and regex)
    - Case-sensitive/insensitive options
    - File type filtering
    - Relevance scoring
    - Result caching (5 min TTL)
    - Exclusion patterns
    - Max results limit

13. **`search_content`** - Search within file contents
    - Full-text search (grep-like)
    - Regex support
    - Whole word matching
    - Context lines (before/after)
    - File type filtering
    - Binary file detection and skip
    - Line number and column tracking

14. **`find_duplicates`** - Find duplicate files
    - Hash-based comparison (MD5)
    - Name-based comparison
    - Size+name comparison options
    - Wasted space calculation
    - Original file marking
    - Size filtering (min/max)
    - Result caching (15 min TTL)

---

## 🔒 Security Features

- **Path Validation** - Prevents path traversal attacks
- **Rate Limiting** - Configurable limits per operation
- **Protected Paths** - Automatically excludes sensitive directories
- **Backup System** - Automatic backups before destructive operations
- **Logging** - Complete operation logging for audit
- **Workspace Isolation** - Operations limited to workspace directory

---

## 📚 Documentation Structure

```
docs/
├── getting-started/    # Installation & quick start
├── guides/            # User guides (security, testing, migration)
├── development/       # For contributors
└── maintenance/       # Keeping up-to-date
```

---

## 🤝 Contributing

We welcome contributions! See our [Working with Claude](development/working-with-claude.md) guide for development guidelines.

---

## 📝 License

MIT © 2025 Thibaut Pontieux

---

## 🔗 Links

- [GitHub Repository](https://github.com/ThibautPontieux/mcp-dev-tools)
- [Report an Issue](https://github.com/ThibautPontieux/mcp-dev-tools/issues)
- [Changelog](maintenance/changelog.md)

---

**Last updated:** October 21, 2025  
**Version:** 1.2.0  
**Status:** ✅ Production Ready
