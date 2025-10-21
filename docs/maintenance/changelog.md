# Changelog

All notable changes to the MCP Dev Tools project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2025-10-20 to 2025-10-21

### 🎉 Major Release - File I/O Operations + Dependencies Update + Documentation Overhaul

Third major release completing the file operations suite, updating all dependencies, and internationalizing documentation.

### ✨ Added - File I/O Operations

#### New Tools (2)
- **`read_file`** - Read file contents
  - Text and binary file support
  - UTF-8 and Base64 encoding options
  - Configurable size limits for safety
  - Efficient streaming for large files
  - MIME type detection

- **`write_file`** - Create or write files
  - Automatic parent directory creation
  - Overwrite protection with confirmation
  - Automatic backup on overwrite
  - Content encoding support (UTF-8, Base64)
  - Atomic write operations

### 📦 Dependencies - Major Updates

#### Production Dependencies
- **`@modelcontextprotocol/sdk`**: `^0.6.0` → `^1.20.1` (major update)
  - Updated to latest MCP SDK version
  - Improved stability and performance
  - Better TypeScript types

#### Development Dependencies
- **`eslint`**: `^8.56.0` → `^9.38.0` (major update)
  - Migrated to ESLint 9 flat config
  - Improved performance and rules
  
- **`@typescript-eslint/*`**: `^6.19.0` → `^8.46.0` (major update)
  - ESLint 9 compatibility
  - Better TypeScript analysis

- **`jest`**: `^29.7.0` → `^30.2.0` (major update)
  - Latest testing framework
  - Improved performance

- **`rimraf`**: `^5.0.10` → `^6.0.1` (major update)
  - Better cross-platform support

- **`@types/jest`**: Updated to `^30.0.0`
- **`@types/node`**: Updated to `^24.8.1`

### 📚 Documentation - Complete Internationalization

#### Language Translation
- **Translated to English**: 12+ documentation files
  - `getting-started/` - Complete translation
  - `guides/` - Security, testing, migration guides
  - `development/` - Package management, lessons learned
  - `maintenance/` - Build fixes, troubleshooting
  - Main `index.md` - Complete rewrite

#### Documentation Improvements
- **`working-with-claude.md`** - Renamed from `claude-instructions.md`
  - Added context files explanation
  - Enhanced with pedagogical content
  - Template for other projects

- **Cleaned up navigation**
  - Removed 10 broken links to non-existent files
  - Added complete tool descriptions (14 tools)
  - Simplified structure

- **Archived historical documents**
  - Moved to `_archived_docs/` with explanatory README
  - `autonomous-workflow.md` - Vision document
  - `package-updates.md` - Status snapshot
  - `phases-4-5.md` - Historical specs
  - `roadmap.md` - Historical planning

#### Documentation Fixes
- **Fixed Markdown tables** - Corrected rendering issues in `getting-started/index.md`
- **Added navigation anchors** - Fixed table of contents in `installation.md`
- **Updated tool counts** - Corrected from 12 to 14 tools throughout

### 🔧 Development Improvements

#### Automation Scripts (Enhanced)
- **Added timeout support** (30s) for network operations
  - Fixes proxy environment issues
  - Better error handling
  - Automatic fallback

- **`auto-update-packages.sh`** - Enhanced package management
  - Automatic CHANGELOG reading
  - Breaking change detection
  - Automatic rollback on build failure
  - Backup before updates

- **`package-analyzer.sh`** - Improved analysis
  - Timeout handling for slow networks
  - Better reporting format
  - Deprecated package detection

### 📈 Statistics

| Metric | v1.1.0 | v1.2.0 | Change |
|--------|--------|--------|--------|
| **Total Tools** | 12 | 14 | +2 |
| **File Operations** | 5 | 7 | +2 |
| **MCP SDK Version** | 0.6.0 | 1.20.1 | +1.14.1 |
| **Documentation Files** | 18 (mixed) | 13 (EN) | Cleaned |
| **Security Vulnerabilities** | 0 | 0 | ✅ |
| **Outdated Packages** | 3 | 0 | Fixed |

### 🔒 Security

- **Zero vulnerabilities** maintained across all updates
- **No deprecated packages** - All dependencies current
- **Automated security auditing** - Enhanced scripts
- **Rate limiting** - Extended to new file operations
  - `read_file`: 200 ops/min
  - `write_file`: 100 ops/min

### 🎯 Use Cases - New File I/O Examples

```typescript
// Read configuration file
read_file({ agent: "dev", path: "config.json", encoding: "utf8" })

// Write generated code
write_file({ 
  agent: "dev", 
  path: "src/generated/types.ts", 
  content: generatedCode,
  overwrite: false 
})

// Read binary file (image)
read_file({ agent: "dev", path: "logo.png", encoding: "base64" })

// Create file with backup
write_file({ 
  agent: "dev", 
  path: "important.json", 
  content: data,
  createBackup: true 
})
```

### ⚠️ Breaking Changes

**None** - All changes are additive and backward compatible.

### 🐛 Bug Fixes

- Fixed TypeScript compilation errors from dependency updates
- Corrected tool count displays (12 → 14)
- Fixed broken documentation links
- Resolved Markdown table rendering issues

### 📝 Migration Notes

#### From v1.1.0 to v1.2.0
- **No code changes required** - Fully backward compatible
- **Rebuild required** after `npm install` due to dependency updates
- **Claude Desktop restart required** to recognize new tools
- **Configuration unchanged** - Existing configs work as-is

#### Documentation Changes
- English documentation now in `docs/`
- Historical French documents in `_archived_docs/`
- All internal links updated and verified

### 🎓 Lessons Learned

- **Always update changelog** with each version
- **Test build after every change** before declaring complete
- **Maintain consistent tool counts** across documentation
- **Verify all links** after documentation restructuring
- **Document breaking changes** even if none exist

---

## [1.1.0] - 2025-10-19

### 🎉 Major Feature Release - Directory Operations + Search Operations

Second major release adding comprehensive directory management and advanced search capabilities.

### ✨ Added - Directory Operations (Phase 4)

#### New Tools
- **`list_directory`** - List directory contents with advanced filtering
- **`create_directory`** - Create directories with parent support
- **`delete_directory`** - Safe directory deletion
- **`move_directory`** - Move or rename directories

### ✨ Added - Search Operations (Phase 5)

#### New Tools
- **`search_files`** - Advanced file search
- **`search_content`** - Content search (grep-like)
- **`find_duplicates`** - Duplicate file detection

#### New Utilities
- **`SearchCache`** - Result caching system
- **`FileHasher`** - File hashing utility

### 📈 Statistics

| Metric | Value |
|--------|-------|
| **New Tools** | 7 |
| **Total Tools** | 12 |
| **New Tests** | 60+ |
| **Total Tests** | 180+ |

### ⚠️ Breaking Changes

None - All changes are additive and backward compatible.

---

## [1.0.0] - 2025-10-19

### 🎉 Initial Release - Production Ready

First stable release of MCP Dev Tools providing secure file operations for autonomous AI development with Claude Desktop.

### ✨ Added

#### Core Features
- **File Operations Tools** (5)
  - `rename_file` - Rename or move files
  - `delete_file` - Safe file deletion
  - `copy_file` - Copy files
  - `file_exists` - Check existence
  - `get_file_info` - Get metadata

#### Security & Validation
- **PathValidator** - Path validation and security
- **RateLimiter** - Abuse prevention
- **BackupManager** - Automatic backups
- **Logger** - Comprehensive logging

### 📊 Statistics

- **Total Files**: 25+
- **Lines of Code**: ~3,000+
- **Unit Tests**: 120+
- **Test Coverage**: >90%

---

## Version History Summary

| Version | Date | Status | Key Features |
|---------|------|--------|--------------|
| 1.2.0 | 2025-10-20/21 | ✅ Released | File I/O, Dependencies update, Docs overhaul |
| 1.1.0 | 2025-10-19 | ✅ Released | Directory ops, Search ops, Caching |
| 1.0.0 | 2025-10-19 | ✅ Released | File operations, Security, Backups |

---

**🎉 Thank you for using MCP Dev Tools!**

*Keep this changelog updated with every version change.*
