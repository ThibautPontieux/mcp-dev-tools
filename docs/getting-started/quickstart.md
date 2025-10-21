# ⚡ Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Build (30 seconds)
```bash
cd packages/dev-tools
npm install
npm run build
```

✅ **Expected result**: `dist/` created with compiled files

---

### Step 2: Claude Desktop Configuration (2 minutes)

**Find your config file:**

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**Edit it and add:**

```json
{
  "mcpServers": {
    "dev-tools": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/to/packages/dev-tools/dist/index.js"],
      "env": {
        "WORKSPACE_DIR": "/path/to/your/workspace"
      }
    }
  }
}
```

⚠️ **Replace the paths** with your actual paths (absolute, not relative!)

**To get the absolute path:**
```bash
cd packages/dev-tools
pwd
# Copy the result + /dist/index.js
```

---

### Step 3: Restart Claude Desktop (1 minute)

1. **Completely quit** Claude Desktop (Cmd+Q or Alt+F4)
2. Relaunch the application
3. Wait for reconnection

---

### Step 4: Quick Test (1 minute)

In Claude, test:

```
Can you check if package.json exists in my workspace?
```

**✅ If it works**: Claude will use `file_exists` and respond

**❌ If error**: See Troubleshooting section below

---

## 🧪 Complete Test

### Test 1: Check Existence
```
Check if README.md exists
```

### Test 2: File Info
```
Get information about package.json
```

### Test 3: Create and Modify (THE IMPORTANT TEST!)
```
Create a test file called hello.txt with "Hello World"
```

Then:
```
Now modify hello.txt to say "Hello MCP!"
```

**✅ Success**: Claude uses `rename_file` to modify in place (no new file created!)

---

## 🔧 Express Troubleshooting

### Issue: "Module not found"
```bash
cd packages/dev-tools
npm install
npm run build
```

### Issue: Claude doesn't see tools
1. Verify absolute paths in config
2. Restart Claude Desktop **completely**
3. Check logs: `ls .logs/`

### Issue: "Invalid path"
- Verify that `WORKSPACE_DIR` is correct
- Use paths relative to workspace in Claude

### Issue: Build fails
See `troubleshooting.md` - fixes already applied, should build now

---

## 📁 Quick Verification

After build, you should have:

```
packages/dev-tools/
├── dist/
│   ├── index.js          ← Entry point
│   ├── server.js
│   ├── index.d.ts
│   └── ... (other compiled files)
├── node_modules/         ← Dependencies
├── src/                  ← TypeScript sources
└── tests/                ← Tests
```

---

## 📊 Useful Commands

```bash
# Quick validation
node validate.js

# View logs
tail -f .logs/dev-tools-*.log

# Clean and rebuild
npm run clean && npm run build

# Run tests
npm test

# Type checking
npm run type-check
```

---

## ✅ Quick Checklist

- [ ] `npm run build` successful
- [ ] `dist/index.js` exists
- [ ] Claude config with absolute path
- [ ] Claude Desktop restarted
- [ ] `file_exists` test OK
- [ ] File modification test OK

---

## 🎯 Daily Usage

Once configured, use Claude normally:

```
"Modify src/utils.ts to add error handling"
"Copy template.tsx to NewComponent.tsx"
"Delete all .log files"
"Check if config.json exists"
```

Claude will automatically use MCP Dev Tools!

---

## 📚 More Info

- **Detailed installation**: `installation.md`
- **Complete documentation**: Main documentation index
- **Bug fixes**: `lessons-learned.md`
- **Troubleshooting**: `troubleshooting.md`

---

## 💡 Pro Tips

1. **Enable backups** (already enabled by default)
2. **Check logs** regularly: `.logs/`
3. **Clean up backups** periodically: `.backups/`
4. **Use LOG_LEVEL=DEBUG** for debugging

---

**🎉 That's it! You're ready to use MCP Dev Tools!**

**In case of issues**: Consult `installation.md` for the complete guide
