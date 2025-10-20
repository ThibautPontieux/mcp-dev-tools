# Changelog

All notable changes to the MCP Dev Tools project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2025-10-19

### 🎉 Major Feature Release - Directory Operations + Search Operations

Second major release adding comprehensive directory management and advanced search capabilities.

### ✨ Added - Directory Operations (Phase 4)

#### New Tools
- **`list_directory`** - List directory contents with advanced filtering
  - Recursive traversal with max depth control
  - File type filtering
  - Multiple sort options (name, size, modified)
  - Glob pattern support
  - Hidden file inclusion option
  - Statistics (total files, directories, size)

- **`create_directory`** - Create directories with parent support
  - Recursive parent creation
  - Unix permissions support
  - Automatic path validation
  - Duplicate detection

- **`delete_directory`** - Safe directory deletion
  - Confirmation requirement
  - Recursive deletion support
  - Automatic backup creation
  - Content counting before deletion
  - Force flag for non-empty directories

- **`move_directory`** - Move or rename directories
  - Directory merging support
  - Automatic backup on overwrite
  - Content preservation
  - Cross-directory moves

### ✨ Added - Search Operations (Phase 5)

#### New Tools
- **`search_files`** - Advanced file search
  - Name/pattern matching (glob and regex)
  - Case-sensitive/insensitive search
  - File type filtering
  - Relevance scoring
  - Result caching (5 min TTL)
  - Exclusion patterns
  - Max results limit

- **`search_content`** - Content search (grep-like)
  - Text search within files
  - Regex support
  - Whole word matching
  - Context lines (before/after)
  - File type filtering
  - Binary file detection and skip
  - Line number and column tracking

- **`find_duplicates`** - Duplicate file detection
  - Hash-based comparison (MD5)
  - Name-based comparison
  - Size+name comparison
  - Wasted space calculation
  - Original file marking
  - Size filtering (min/max)
  - Result caching (15 min TTL)

#### New Utilities
- **`SearchCache`** - Result caching system
  - Configurable TTL
  - Automatic cleanup
  - Key generation from params

- **`FileHasher`** - File hashing utility
  - MD5 and SHA256 support
  - Batch processing
  - Stream-based for large files

### 📊 Performance

- **Caching**: Search results cached to reduce redundant operations
- **Streaming**: Large file operations use streams
- **Parallel Processing**: Batch operations where applicable
- **Optimized Glob**: Using fast-glob for performance

### 🔒 Security

#### Rate Limiting (Updated)
- `list_directory`: 100 ops/min
- `create_directory`: 50 ops/min
- `delete_directory`: 10 ops/min (sensitive operation)
- `move_directory`: 20 ops/min
- `search_files`: 100 ops/min
- `search_content`: 50 ops/min (heavy operation)
- `find_duplicates`: 20 ops/min (very heavy)

#### Auto-Exclusions
All search/directory operations automatically exclude:
- `node_modules/**`
- `.git/**`
- `dist/**`
- `build/**`
- `.next/**`
- `coverage/**`
- `.cache/**`

### 🧪 Testing

- Added 30+ tests for Directory Operations
- Added 30+ tests for Search Operations
- Total test count: 180+ tests
- Coverage maintained >90%

### 📚 Documentation

- Updated README.md with 7 new tools
- Added SPECS_PHASE_4_5.md with complete specifications
- Updated examples for all new operations
- Added use case documentation

### 🔧 Technical Changes

#### New Files
- `src/types/directory.ts` - Directory operation types
- `src/types/search.ts` - Search operation types
- `src/tools/directory-operations.ts` - Directory tools implementation
- `src/tools/search-operations.ts` - Search tools implementation
- `src/utils/search-cache.ts` - Caching utility
- `src/utils/file-hasher.ts` - Hashing utility

#### Updated Files
- `src/server.ts` - Added 7 new tool definitions
- `src/utils/config.ts` - Added rate limits for new tools
- `src/types/index.ts` - Export new types
- `src/tools/index.ts` - Export new operations
- `src/utils/index.ts` - Export new utilities

### 📈 Statistics

| Metric | Value |
|--------|-------|
| **New Tools** | 7 |
| **Total Tools** | 12 |
| **New Tests** | 60+ |
| **Total Tests** | 180+ |
| **New Files** | 8 |
| **Lines Added** | ~2000+ |

### 🎯 Use Cases

#### Directory Management
```typescript
// List all TypeScript files sorted by size
list_directory({ agent: "dev", path: "src", recursive: true, fileTypes: [".ts"], sortBy: "size" })

// Create nested directory structure
create_directory({ agent: "dev", path: "src/components/ui/buttons", recursive: true })

// Clean up build directory
delete_directory({ agent: "dev", path: "build", confirm: true, recursive: true })
```

#### File Search
```typescript
// Find all test files
search_files({ agent: "dev", pattern: "**/*.test.*" })

// Search for TODO comments
search_content({ agent: "dev", query: "TODO", fileTypes: [".ts", ".tsx"], context: 2 })

// Find duplicate images
find_duplicates({ agent: "dev", compareBy: "hash", fileTypes: [".jpg", ".png"] })
```

### ⚠️ Breaking Changes

None - All changes are additive and backward compatible.

### 🐛 Bug Fixes

- Improved path validation error messages
- Fixed edge cases in recursive directory operations
- Enhanced binary file detection

### 📝 Notes

- Search operations are cached for better performance
- Large directory operations may take time - use with appropriate limits
- Hash-based duplicate detection is most accurate but slower than name-based

---

## [1.0.0] - 2025-10-19

### 🎉 Initial Release - Production Ready

First stable release of MCP Dev Tools providing secure file operations for autonomous AI development with Claude Desktop.

### ✨ Added

#### Core Features
- **File Operations Tools**
  - `rename_file` - Rename or move files with automatic directory creation
  - `delete_file` - Safe file deletion with mandatory confirmation and automatic backups
  - `copy_file` - Copy files with timestamp preservation
  - `file_exists` - Check file/directory existence and type
  - `get_file_info` - Get detailed file metadata (size, timestamps, permissions)

#### Security & Validation
- **PathValidator** - Comprehensive path validation and security
- **RateLimiter** - Abuse prevention system
- **BackupManager** - Automatic backup system
- **Logger** - Comprehensive logging system

#### Configuration
- **Config Loader** - Flexible configuration system
- Environment variable support
- Configuration file support
- Priority-based merging

### 📊 Statistics

- **Total Files**: 25+
- **Lines of Code**: ~3,000+
- **Unit Tests**: 120+
- **Test Coverage**: >90%
- **Documentation**: Complete

---

## Version History Summary

| Version | Date | Status | Key Features |
|---------|------|--------|--------------|
| 1.1.0 | 2025-10-19 | ✅ Released | Directory ops, Search ops, Caching |
| 1.0.0 | 2025-10-19 | ✅ Released | File operations, Security, Backups |

---

**🎉 Thank you for using MCP Dev Tools!**
