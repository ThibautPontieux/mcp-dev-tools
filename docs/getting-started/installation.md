# 📦 MCP Dev Tools - Complete Installation Guide

This guide walks you through step-by-step installation and configuration of the MCP Dev Tools package with Claude Desktop.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Package Installation](#package-installation)
3. [Claude Desktop Configuration](#claude-desktop-configuration)
4. [Installation Verification](#installation-verification)
5. [Advanced Configuration](#advanced-configuration)
6. [Troubleshooting](#troubleshooting)
7. [Getting Started](#getting-started)

---

## <a id="prerequisites"></a>✅ Prerequisites

Before starting, make sure you have:

### Required Software

| Software | Minimum Version | Check Command |
|----------|-----------------|---------------|
| **Node.js** | 18.0.0+ | `node --version` |
| **npm** | 9.0.0+ | `npm --version` |
| **Claude Desktop** | Latest version | - |
| **Git** | 2.0+ (optional) | `git --version` |

### Installing Node.js

If Node.js is not installed:

**macOS (with Homebrew)**:
```bash
brew install node@18
```

**Windows**:
Download from [nodejs.org](https://nodejs.org/) and install the LTS version.

**Linux (Ubuntu/Debian)**:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## <a id="package-installation"></a>📦 Package Installation

### Step 1: Navigate to Directory

```bash
cd /path/to/your/project
cd packages/dev-tools
```

### Step 2: Install Dependencies

```bash
npm install
```

**What gets installed**:
- `@modelcontextprotocol/sdk` - MCP SDK for Claude
- `fast-glob` - Fast file search
- `chokidar` - File watching
- Development dependencies (TypeScript, Jest, ESLint, etc.)

**Estimated duration**: 1-2 minutes

### Step 3: Build the Package

```bash
npm run build
```

**What happens**:
- TypeScript compiles `src/` → `dist/`
- Generation of `.js` and `.d.ts` files
- Type validation

**Estimated duration**: 30 seconds

**Expected result**:
```
✓ Compilation successful
✓ dist/ directory created
✓ Type definitions generated
```

### Step 4: Validate Installation

```bash
# Quick validation
node validate.js

# Complete tests
npm test
```

**Expected result**:
```
✅ VALIDATION PASSED - Package is ready!
```

---

## <a id="claude-desktop-configuration"></a>⚙️ Claude Desktop Configuration

### Step 1: Locate Configuration File

The configuration file is located here:

**macOS**:
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows**:
```
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux**:
```
~/.config/Claude/claude_desktop_config.json
```

### Step 2: Get Absolute Path

You need the **absolute** path to your `dist/index.js` file.

```bash
# In the packages/dev-tools/ directory
pwd
# Example output: /Users/john/projects/mcp/packages/dev-tools
```

The complete path will be:
```
/Users/john/projects/mcp/packages/dev-tools/dist/index.js
```

### Step 3: Edit Configuration File

Open `claude_desktop_config.json` and add:

```json
{
  "mcpServers": {
    "dev-tools": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/packages/dev-tools/dist/index.js"
      ],
      "env": {
        "WORKSPACE_DIR": "/path/to/your/workspace",
        "BACKUP_ENABLED": "true",
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
```

**⚠️ IMPORTANT**:
- Replace `/ABSOLUTE/PATH/TO/` with your actual path
- Replace `/path/to/your/workspace` with the folder where you work
- Use **absolute** paths, not relative ones

### Complete Configuration Example

**macOS/Linux**:
```json
{
  "mcpServers": {
    "dev-tools": {
      "command": "node",
      "args": [
        "/Users/john/projects/mcp/packages/dev-tools/dist/index.js"
      ],
      "env": {
        "WORKSPACE_DIR": "/Users/john/projects/my-project",
        "BACKUP_ENABLED": "true",
        "BACKUP_DIR": ".backups",
        "BACKUP_RETENTION": "7",
        "LOG_LEVEL": "INFO",
        "LOG_DIR": ".logs",
        "RATE_LIMIT_ENABLED": "true"
      }
    }
  }
}
```

**Windows**:
```json
{
  "mcpServers": {
    "dev-tools": {
      "command": "node",
      "args": [
        "C:\\Users\\John\\projects\\mcp\\packages\\dev-tools\\dist\\index.js"
      ],
      "env": {
        "WORKSPACE_DIR": "C:\\Users\\John\\projects\\my-project",
        "BACKUP_ENABLED": "true",
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
```

### Step 4: Restart Claude Desktop

1. **Completely quit** Claude Desktop (Cmd+Q on Mac, Alt+F4 on Windows)
2. **Relaunch** the application
3. Wait for Claude to reconnect

---

## <a id="installation-verification"></a>✅ Installation Verification

### Test 1: Verify MCP Server Starts

After restarting Claude, the MCP server logs should appear.

**Look for in logs** (if available):
```
MCP Dev Tools server started successfully
Workspace directory: /your/workspace/path
Available tools: rename_file, delete_file, copy_file, file_exists, get_file_info
```

### Test 2: Test with Claude

Open a conversation with Claude and ask:

```
Can you check if the file 'test.txt' exists in my workspace?
```

**Expected response**:
Claude should use the `file_exists` tool and give you a result.

### Test 3: Create and Modify a Test File

```
Create a test file called 'hello.txt' with the content "Hello World"
```

Then:

```
Now modify hello.txt to say "Hello MCP Dev Tools!"
```

**Expected behavior**:
- Claude should use `rename_file` to modify the file
- NOT create a new file
- Confirm the modification

### Test 4: Check Logs

Logs should be created in your workspace:

```bash
ls -la .logs/
# Should show: dev-tools-YYYY-MM-DD.log
```

Check contents:
```bash
tail .logs/dev-tools-*.log
```

You should see JSON entries with operations performed.

---

## <a id="advanced-configuration"></a>🔧 Advanced Configuration

### Complete Environment Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `WORKSPACE_DIR` | Working directory | `process.cwd()` | `/home/user/projects` |
| `ALLOW_OUTSIDE_ACCESS` | Allow access outside workspace | `false` | `true` |
| `BACKUP_ENABLED` | Enable backups | `true` | `false` |
| `BACKUP_DIR` | Backup folder | `.backups` | `/backups` |
| `BACKUP_RETENTION` | Retention in days | `7` | `30` |
| `RATE_LIMIT_ENABLED` | Enable rate limiting | `true` | `false` |
| `LOG_LEVEL` | Log level | `INFO` | `DEBUG` |
| `LOG_DIR` | Log folder | `.logs` | `/var/log` |
| `LOG_RETENTION` | Log retention in days | `30` | `90` |

### Custom Configuration File

Create `.dev-tools.config.json` in your workspace:

```json
{
  "workspace": {
    "dir": "/custom/workspace",
    "allowOutsideAccess": false,
    "protectedPaths": [
      "node_modules",
      ".git",
      "dist",
      ".env",
      "secrets"
    ]
  },
  "files": {
    "backupEnabled": true,
    "backupDir": ".backups",
    "backupRetention": 14,
    "maxFileSize": 10485760
  },
  "rateLimits": {
    "enabled": true,
    "limits": {
      "rename_file": { "max": 100, "per": 60000 },
      "delete_file": { "max": 50, "per": 60000 },
      "copy_file": { "max": 100, "per": 60000 }
    }
  },
  "logging": {
    "level": "DEBUG",
    "logDir": ".logs",
    "maxLogSize": 10485760,
    "retention": 60
  }
}
```

**Configuration Priority**:
1. Environment variables (highest)
2. `.dev-tools.config.json` file
3. Default values (lowest)

---

## <a id="troubleshooting"></a>🐛 Troubleshooting

### Issue 1: "Module not found"

**Symptom**:
```
Error: Cannot find module '@modelcontextprotocol/sdk'
```

**Solution**:
```bash
cd packages/dev-tools
npm install
npm run build
```

### Issue 2: "Permission denied"

**Symptom**:
```
Error: EACCES: permission denied
```

**Solution**:
```bash
# Check permissions
ls -la dist/index.js

# Give execution permissions
chmod +x dist/index.js
```

### Issue 3: Claude Doesn't See Tools

**Possible causes**:
1. Incorrect path in `claude_desktop_config.json`
2. Claude Desktop not restarted
3. Build errors

**Solutions**:
```bash
# 1. Check the path
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json

# 2. Rebuild
npm run build

# 3. Validate
node validate.js

# 4. Completely restart Claude Desktop
```

### Issue 4: "Invalid path" errors

**Symptom**:
```json
{
  "success": false,
  "error": "Invalid path: Path traversal detected"
}
```

**Cause**: Attempt to access outside workspace

**Solution**:
- Verify that `WORKSPACE_DIR` is correct
- Use paths relative to workspace
- Don't use `../` in paths

### Issue 5: Rate limit exceeded

**Symptom**:
```json
{
  "success": false,
  "error": "Rate limit exceeded"
}
```

**Solutions**:
```bash
# Option 1: Temporarily disable
# In claude_desktop_config.json:
"RATE_LIMIT_ENABLED": "false"

# Option 2: Increase limits
# Create .dev-tools.config.json with higher limits
```

### Debug Logs

To enable detailed logs:

```json
{
  "mcpServers": {
    "dev-tools": {
      "command": "node",
      "args": ["..."],
      "env": {
        "LOG_LEVEL": "DEBUG"
      }
    }
  }
}
```

Then check:
```bash
tail -f .logs/dev-tools-*.log
```

---

## <a id="getting-started"></a>🚀 Getting Started

### Example 1: Modify an Existing File

```
User: "I have a file called utils.ts. Can you add a new function called formatDate to it?"

Claude: I'll modify utils.ts for you using the rename_file tool...
[Claude modifies the file in place]
```

### Example 2: Rename Files

```
User: "Rename all .js files in the src/ directory to .ts"

Claude: I'll rename each .js file to .ts...
[Claude uses rename_file for each file]
```

### Example 3: Clean Up Files

```
User: "Delete all .log files older than 7 days"

Claude: I'll check for old log files and delete them with backups...
[Claude uses delete_file with createBackup: true]
```

### Example 4: Copy a Template

```
User: "Copy template.tsx to components/NewComponent.tsx"

Claude: I'll copy the template file for you...
[Claude uses copy_file]
```

---

## 📚 Additional Resources

- **README.md**: Complete package documentation
- **COMPLETION_REPORT.md**: Development report
- **changelog.md**: Version history
- **tests/**: Usage examples in tests

---

## 💡 Tips

### Performance
- Keep `BACKUP_ENABLED` at `true` for security
- Clean up `.backups/` and `.logs/` regularly
- Use `RATE_LIMIT_ENABLED` in production

### Security
- Never disable path validation
- Keep `protectedPaths` up to date
- Monitor logs for suspicious activity

### Development
- Use `LOG_LEVEL: DEBUG` during development
- Test with `validate.js` after each modification
- Rerun `npm run build` after changes

---

## ✅ Installation Checklist

- [ ] Node.js 18+ installed
- [ ] npm dependencies installed
- [ ] Package built (`npm run build`)
- [ ] Validation successful (`node validate.js`)
- [ ] `claude_desktop_config.json` configured with absolute path
- [ ] Claude Desktop restarted
- [ ] Test with `file_exists` successful
- [ ] File modification test successful
- [ ] Logs created in `.logs/`
- [ ] Backups working in `.backups/`

---

**🎉 Congratulations! MCP Dev Tools is now installed and ready to use!**

For any questions or issues, consult the [Troubleshooting](#troubleshooting) section or check logs in `.logs/`.
