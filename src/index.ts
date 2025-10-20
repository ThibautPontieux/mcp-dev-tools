#!/usr/bin/env node

/**
 * MCP Dev Tools Server
 * Entry point for the Model Context Protocol server
 * Provides file operations and development tools for autonomous AI development
 */

import { startServer } from './server.js';

// Start the MCP server
startServer().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
