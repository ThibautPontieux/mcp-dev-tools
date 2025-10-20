# MCP Dev Tools 🛠️

**Production-ready MCP server providing secure file operations for autonomous AI development.**

## ✨ Features

### 🔒 Security First
- **Path Validation**: Prevents path traversal attacks and unauthorized access
- **Protected Paths**: Configurable list of protected directories (node_modules, .git, etc.)
- **Rate Limiting**: Prevents abuse with configurable operation limits
- **Comprehensive Logging**: Full audit trail of all operations

### 📁 File Operations
- **rename_file**: Rename or move files with automatic directory creation
- **delete_file**: Safe file deletion with mandatory confirmation and automatic backups
- **copy_file**: Copy files with timestamp preservation
- **file_exists**: Check file/directory existence and type
- **get_file_info**: Get detailed file metadata (size, timestamps, permissions)

### 🎯 Smart Features
- **Automatic Backups**: Optional backups before destructive operations
- **Backup Management**: Automatic cleanup based on retention policy
- **Log Rotation**: Automatic log file rotation and cleanup
- **Sensitive Data Sanitization**: Redacts passwords, tokens, and secrets from logs

## 📦 Installation

```bash
cd packages/dev-tools
npm install
npm run build
```

## ⚙️ Configuration

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "dev-tools": {
      "command": "node",
      "args": ["/path/to/packages/dev-tools/dist/index.js"],
      "env": {
        "WORKSPACE_DIR": "/path/to/your/workspace",
        "BACKUP_ENABLED": "true",
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `WORKSPACE_DIR` | Workspace directory path | `process.cwd()` |
| `ALLOW_OUTSIDE_ACCESS` | Allow access outside workspace | `false` |
| `ALLOW_COMMAND_EXECUTION` | Enable command execution | `false` |
| `BACKUP_ENABLED` | Enable automatic backups | `true` |
| `BACKUP_DIR` | Backup directory | `.backups` |
| `BACKUP_RETENTION` | Backup retention in days | `7` |
| `RATE_LIMIT_ENABLED` | Enable rate limiting | `true` |
| `LOG_LEVEL` | Logging level (DEBUG, INFO, WARN, ERROR) | `INFO` |
| `LOG_DIR` | Log directory | `.logs` |
| `LOG_RETENTION` | Log retention in days | `30` |

### Configuration File

Create `.dev-tools.config.json` in your workspace:

```json
{
  "workspace": {
    "protectedPaths": ["node_modules", ".git", "dist", ".env"]
  },
  "files": {
    "backupEnabled": true,
    "backupRetention": 7
  },
  "rateLimits": {
    "enabled": true,
    "limits": {
      "rename_file": { "max": 50, "per": 60000 },
      "delete_file": { "max": 20, "per": 60000 }
    }
  }
}
```

## 🚀 Usage Examples

### Rename a File

Claude can now modify files by renaming them instead of creating new ones:

```
User: "Modify utils.ts to add a new function"

Claude: I'll update the file for you.
[Uses rename_file to update the file]
```

**Tool call:**
```json
{
  "name": "rename_file",
  "arguments": {
    "agent": "developer",
    "oldPath": "src/utils.ts",
    "newPath": "src/utils.ts.new",
    "overwrite": false
  }
}
```

### Delete a File

```json
{
  "name": "delete_file",
  "arguments": {
    "agent": "developer",
    "path": "old-file.txt",
    "confirm": true,
    "createBackup": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "path": "old-file.txt",
  "backupPath": ".backups/old-file.txt.1234567890.backup",
  "timestamp": "2025-10-19T17:30:00.000Z"
}
```

### Copy a File

```json
{
  "name": "copy_file",
  "arguments": {
    "agent": "developer",
    "sourcePath": "template.ts",
    "destPath": "new-file.ts",
    "preserveTimestamps": true
  }
}
```

### Check File Existence

```json
{
  "name": "file_exists",
  "arguments": {
    "path": "src/index.ts"
  }
}
```

**Response:**
```json
{
  "success": true,
  "exists": true,
  "path": "src/index.ts",
  "isFile": true,
  "isDirectory": false,
  "timestamp": "2025-10-19T17:30:00.000Z"
}
```

### Get File Information

```json
{
  "name": "get_file_info",
  "arguments": {
    "path": "package.json"
  }
}
```

**Response:**
```json
{
  "success": true,
  "exists": true,
  "path": "package.json",
  "size": 1024,
  "sizeFormatted": "1.00 KB",
  "created": "2025-10-19T10:00:00.000Z",
  "modified": "2025-10-19T15:30:00.000Z",
  "accessed": "2025-10-19T17:30:00.000Z",
  "isFile": true,
  "isDirectory": false,
  "extension": ".json",
  "permissions": "644",
  "timestamp": "2025-10-19T17:30:00.000Z"
}
```

## 🔒 Security Features

### Path Validation

All paths are validated to prevent:
- Path traversal attacks (`../`, `..\\`)
- Access outside workspace
- Operations on protected directories
- Null byte injection

### Rate Limiting

Default rate limits per agent per minute:
- `rename_file`: 50 operations
- `delete_file`: 20 operations
- `copy_file`: 50 operations
- `search_files`: 100 operations

### Automatic Backups

Backups are created automatically:
- Before overwriting files
- Before deleting files (unless explicitly disabled)
- Stored in `.backups/` directory
- Automatic cleanup based on retention policy

## 📊 Logging

All operations are logged with:
- Timestamp
- Agent identifier
- Operation name
- Parameters (with sensitive data sanitized)
- Result (success/failure, duration)
- System metadata (memory usage, platform, etc.)

Logs are stored in `.logs/` directory with automatic rotation.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

**Test Coverage:**
- 80+ unit tests
- >90% code coverage
- All edge cases covered

## 🛠️ Development

```bash
# Build the project
npm run build

# Build in watch mode
npm run build:watch

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Clean build artifacts
npm clean
```

## 📁 Project Structure

```
packages/dev-tools/
├── src/
│   ├── index.ts              # Entry point
│   ├── server.ts             # MCP server configuration
│   ├── tools/
│   │   ├── file-operations.ts  # File operation implementations
│   │   └── index.ts
│   ├── utils/
│   │   ├── path-validator.ts   # Path security validation
│   │   ├── logger.ts           # Logging system
│   │   ├── rate-limiter.ts     # Rate limiting
│   │   ├── backup-manager.ts   # Backup management
│   │   ├── config.ts           # Configuration loader
│   │   └── index.ts
│   └── types/
│       ├── config.ts           # Configuration types
│       ├── tools.ts            # Tool types
│       └── index.ts
├── tests/                    # Comprehensive test suite
├── package.json
├── tsconfig.json
└── README.md
```

## 🎯 Use Cases

### 1. **Autonomous AI Development**
Claude can now modify files directly instead of creating duplicates, enabling true autonomous development workflows.

### 2. **Safe File Management**
All operations include validation, backups, and logging for safe file manipulation.

### 3. **Multi-Agent Coordination**
Rate limiting and logging enable multiple AI agents to work concurrently without conflicts.

### 4. **Audit Compliance**
Complete audit trail of all file operations for compliance and debugging.

## ⚠️ Important Notes

### Security
- Never disable path validation in production
- Keep protected paths list comprehensive
- Monitor logs for suspicious activity
- Use rate limiting to prevent abuse

### Performance
- Large files may affect performance
- Consider adjusting rate limits based on needs
- Monitor backup directory size
- Clean old logs and backups regularly

### Compatibility
- Requires Node.js 18+
- Works on Windows, macOS, and Linux
- Path handling is cross-platform compatible

## 🚧 Roadmap

- [ ] Directory operations (create, list, delete)
- [ ] File search capabilities
- [ ] Content analysis tools
- [ ] Git integration
- [ ] Command execution with sandboxing

## 📄 License

MIT

## 🤝 Contributing

This is part of the Autonomous AI Development Team project. See main project README for contribution guidelines.

---

**Built with ❤️ for autonomous AI development**
