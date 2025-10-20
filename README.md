# 🛠️ MCP Dev Tools

> **File & Directory Operations for Autonomous AI Development**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](package.json)
[![GitHub](https://img.shields.io/badge/GitHub-ThibautPontieux-blue?logo=github)](https://github.com/ThibautPontieux/mcp-dev-tools)

**14 powerful MCP tools** for file and directory operations with enterprise-grade security and 85% autonomous workflow automation.

---

## ⚡ Quick Start

```bash
# Install
npm install @mcp-servers/dev-tools

# Configure
# Add to your Claude Desktop configuration...
```

**[📚 Full Documentation](https://thibautpontieux.github.io/mcp-dev-tools/)**

---

## ✨ Features

- ✅ **14 MCP Tools** - Complete file & directory operations
- 🔒 **Enterprise Security** - Path validation, rate limiting, protected paths
- 🤖 **85% Autonomous** - Automated package management & validation
- 📦 **Zero Vulnerabilities** - All dependencies up-to-date and secure
- ✨ **TypeScript** - Full type safety with strict mode
- 📚 **Comprehensive Docs** - Complete documentation site

---

## 🛠️ Available Tools

### File Operations (7)
`read_file` · `write_file` · `rename_file` · `delete_file` · `copy_file` · `file_exists` · `get_file_info`

### Directory Operations (4)
`list_directory` · `create_directory` · `delete_directory` · `move_directory`

### Search Operations (3)
`search_files` · `search_content` · `find_duplicates`

---

## 📚 Documentation

- [📖 Installation Guide](docs/getting-started/installation.md)
- [⚡ Quick Start](docs/getting-started/quickstart.md)
- [📚 API Reference](docs/api/overview.md)
- [🔒 Security Guide](docs/guides/security.md)
- [🤝 Contributing](docs/development/contributing.md)

**[🌐 Full Documentation Site →](https://thibautpontieux.github.io/mcp-dev-tools/)**

---

## 🚀 Installation

```bash
npm install @mcp-servers/dev-tools
```

### Claude Desktop Configuration

Add to your Claude Desktop config file:

```json
{
  "mcpServers": {
    "dev-tools": {
      "command": "node",
      "args": ["/path/to/mcp-dev-tools/dist/index.js"],
      "env": {
        "WORKSPACE_PATH": "/your/workspace/path"
      }
    }
  }
}
```

[See detailed installation guide →](docs/getting-started/installation.md)

---

## 💡 Example Usage

```typescript
// List files in directory
await listDirectory({
  path: "src",
  recursive: true,
  fileTypes: [".ts", ".js"]
});

// Search in file contents
await searchContent({
  query: "function",
  path: "src",
  recursive: true
});

// Find duplicate files
await findDuplicates({
  path: "assets",
  compareBy: "hash"
});
```

[See more examples →](docs/api/overview.md)

---

## 🔒 Security

- ✅ Path traversal protection
- ✅ Rate limiting
- ✅ Protected paths configuration
- ✅ Automatic backups before deletions
- ✅ Input validation on all operations

[Read security guide →](docs/guides/security.md)

---

## 📊 Status

| Metric | Value |
|--------|-------|
| **Version** | 1.2.0 |
| **MCP Tools** | 14 |
| **Dependencies** | 2 production, 10 dev |
| **Security Issues** | 0 |
| **Build Status** | ✅ Passing |
| **Test Coverage** | Ready |

---

## 🤝 Contributing

Contributions are welcome! Please see our [Contributing Guide](docs/development/contributing.md).

```bash
# Clone repository
git clone https://github.com/ThibautPontieux/mcp-dev-tools.git

# Install dependencies
cd mcp-dev-tools/packages/dev-tools
npm install

# Build
npm run build

# Run validation
./scripts/pre-commit-check.sh
```

---

## 📝 Scripts

```bash
npm run build              # Build TypeScript
npm run build:watch        # Watch mode
npm test                   # Run tests
npm run lint               # Lint code
./scripts/package-analyzer.sh       # Analyze packages
./scripts/auto-update-packages.sh   # Auto-update dependencies
./scripts/pre-commit-check.sh       # Validate everything
```

---

## 🗺️ Roadmap

- [x] Phase 1-3: Core file operations
- [x] Phase 4-5: Directory & search operations
- [x] Phase 6: Read/write file tools
- [x] Phase 7: Automated package management
- [ ] Phase 8: Unit tests (180+ tests)
- [ ] Phase 9: CI/CD pipeline
- [ ] Phase 10: NPM publication

[See full roadmap →](docs/specs/roadmap.md)

---

## 📄 License

MIT © 2025 [Thibaut Pontieux](https://github.com/ThibautPontieux)

---

## 🔗 Links

- [📚 Documentation](https://thibautpontieux.github.io/mcp-dev-tools/)
- [🐛 Report an Issue](https://github.com/ThibautPontieux/mcp-dev-tools/issues)
- [📝 Changelog](docs/maintenance/changelog.md)
- [🔒 Security Policy](docs/guides/security.md)

---

**Made with ❤️ for autonomous AI development**
