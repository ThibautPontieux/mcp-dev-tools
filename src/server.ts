import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { loadConfig } from './utils/config.js';
import { FileOperations } from './tools/file-operations.js';
import { DirectoryOperations } from './tools/directory-operations.js';
import { SearchOperations } from './tools/search-operations.js';

/**
 * Start the MCP server
 */
export async function startServer() {
  // Load configuration
  const config = await loadConfig();
  
  // Initialize operations
  const fileOperations = new FileOperations(config);
  const directoryOperations = new DirectoryOperations(config);
  const searchOperations = new SearchOperations(config);
  
  const server = new Server(
    {
      name: '@mcp-servers/dev-tools',
      version: '1.2.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        // FILE OPERATIONS
        {
          name: 'rename_file',
          description: 'Rename or move a file within the workspace. Creates parent directories automatically.',
          inputSchema: {
            type: 'object',
            properties: {
              agent: { type: 'string', description: 'Agent identifier' },
              oldPath: { type: 'string', description: 'Current file path (relative to workspace)' },
              newPath: { type: 'string', description: 'New file path (relative to workspace)' },
              overwrite: { type: 'boolean', description: 'Allow overwriting (default: false)', default: false },
              createBackup: { type: 'boolean', description: 'Create backup before overwriting (default: true)', default: true }
            },
            required: ['agent', 'oldPath', 'newPath']
          }
        },
        {
          name: 'delete_file',
          description: 'Delete a file with optional backup. Requires explicit confirmation.',
          inputSchema: {
            type: 'object',
            properties: {
              agent: { type: 'string' },
              path: { type: 'string' },
              confirm: { type: 'boolean', description: 'Must be true' },
              createBackup: { type: 'boolean', default: true }
            },
            required: ['agent', 'path', 'confirm']
          }
        },
        {
          name: 'copy_file',
          description: 'Copy a file to a new location. Preserves timestamps by default.',
          inputSchema: {
            type: 'object',
            properties: {
              agent: { type: 'string' },
              sourcePath: { type: 'string' },
              destPath: { type: 'string' },
              overwrite: { type: 'boolean', default: false },
              preserveTimestamps: { type: 'boolean', default: true }
            },
            required: ['agent', 'sourcePath', 'destPath']
          }
        },
        {
          name: 'file_exists',
          description: 'Check if a file or directory exists and get its type.',
          inputSchema: {
            type: 'object',
            properties: {
              path: { type: 'string' }
            },
            required: ['path']
          }
        },
        {
          name: 'get_file_info',
          description: 'Get detailed information about a file including size, timestamps, and permissions.',
          inputSchema: {
            type: 'object',
            properties: {
              path: { type: 'string' }
            },
            required: ['path']
          }
        },

        // DIRECTORY OPERATIONS
        {
          name: 'list_directory',
          description: 'List directory contents with advanced filtering and sorting',
          inputSchema: {
            type: 'object',
            properties: {
              agent: { type: 'string' },
              path: { type: 'string' },
              recursive: { type: 'boolean', default: false },
              includeHidden: { type: 'boolean', default: false },
              fileTypes: { type: 'array', items: { type: 'string' } },
              sortBy: { type: 'string', enum: ['name', 'size', 'modified'] },
              sortOrder: { type: 'string', enum: ['asc', 'desc'] },
              maxDepth: { type: 'number', default: 10 },
              pattern: { type: 'string' }
            },
            required: ['agent']
          }
        },
        {
          name: 'create_directory',
          description: 'Create a directory with optional parent creation',
          inputSchema: {
            type: 'object',
            properties: {
              agent: { type: 'string' },
              path: { type: 'string' },
              recursive: { type: 'boolean', default: true },
              mode: { type: 'string' }
            },
            required: ['agent', 'path']
          }
        },
        {
          name: 'delete_directory',
          description: 'Delete a directory with optional backup',
          inputSchema: {
            type: 'object',
            properties: {
              agent: { type: 'string' },
              path: { type: 'string' },
              confirm: { type: 'boolean' },
              recursive: { type: 'boolean', default: false },
              createBackup: { type: 'boolean', default: true },
              force: { type: 'boolean', default: false }
            },
            required: ['agent', 'path', 'confirm']
          }
        },
        {
          name: 'move_directory',
          description: 'Move or rename a directory',
          inputSchema: {
            type: 'object',
            properties: {
              agent: { type: 'string' },
              sourcePath: { type: 'string' },
              destPath: { type: 'string' },
              overwrite: { type: 'boolean', default: false },
              createBackup: { type: 'boolean', default: true },
              merge: { type: 'boolean', default: false }
            },
            required: ['agent', 'sourcePath', 'destPath']
          }
        },

        // SEARCH OPERATIONS
        {
          name: 'search_files',
          description: 'Search for files by name or pattern',
          inputSchema: {
            type: 'object',
            properties: {
              agent: { type: 'string' },
              pattern: { type: 'string' },
              path: { type: 'string' },
              recursive: { type: 'boolean', default: true },
              caseSensitive: { type: 'boolean', default: false },
              includeHidden: { type: 'boolean', default: false },
              fileTypes: { type: 'array', items: { type: 'string' } },
              maxResults: { type: 'number', default: 100 },
              excludePatterns: { type: 'array', items: { type: 'string' } },
              useRegex: { type: 'boolean', default: false }
            },
            required: ['agent', 'pattern']
          }
        },
        {
          name: 'search_content',
          description: 'Search for text within file contents',
          inputSchema: {
            type: 'object',
            properties: {
              agent: { type: 'string' },
              query: { type: 'string' },
              path: { type: 'string' },
              recursive: { type: 'boolean', default: true },
              caseSensitive: { type: 'boolean', default: false },
              useRegex: { type: 'boolean', default: false },
              fileTypes: { type: 'array', items: { type: 'string' } },
              maxResults: { type: 'number', default: 50 },
              maxFileSize: { type: 'number', default: 1048576 },
              context: { type: 'number', default: 2 },
              excludePatterns: { type: 'array', items: { type: 'string' } },
              wholeWord: { type: 'boolean', default: false }
            },
            required: ['agent', 'query']
          }
        },
        {
          name: 'find_duplicates',
          description: 'Find duplicate files in the workspace',
          inputSchema: {
            type: 'object',
            properties: {
              agent: { type: 'string' },
              path: { type: 'string' },
              recursive: { type: 'boolean', default: true },
              compareBy: { type: 'string', enum: ['hash', 'name', 'size-name'], default: 'hash' },
              minSize: { type: 'number', default: 1024 },
              maxSize: { type: 'number' },
              fileTypes: { type: 'array', items: { type: 'string' } },
              excludePatterns: { type: 'array', items: { type: 'string' } }
            },
            required: ['agent']
          }
        },
        {
          name: 'read_file',
          description: 'Read the content of a file',
          inputSchema: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'File path (relative to workspace)' },
              encoding: { type: 'string', enum: ['utf8', 'base64'], default: 'utf8' }
            },
            required: ['path']
          }
        },
        {
          name: 'write_file',
          description: 'Create or write content to a file',
          inputSchema: {
            type: 'object',
            properties: {
              agent: { type: 'string' },
              path: { type: 'string' },
              content: { type: 'string' },
              encoding: { type: 'string', enum: ['utf8', 'base64'], default: 'utf8' },
              overwrite: { type: 'boolean', default: false },
              createBackup: { type: 'boolean', default: true }
            },
            required: ['agent', 'path', 'content']
          }
        }
      ]
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        // FILE OPERATIONS
        case 'rename_file': {
          const result = await fileOperations.renameFile(args as any);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
        case 'delete_file': {
          const result = await fileOperations.deleteFile(args as any);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
        case 'copy_file': {
          const result = await fileOperations.copyFile(args as any);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
        case 'file_exists': {
          const result = await fileOperations.fileExists(args as any);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
        case 'get_file_info': {
          const result = await fileOperations.getFileInfo(args as any);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
        case 'read_file': {
          const result = await fileOperations.readFile(args as any);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
        case 'write_file': {
          const result = await fileOperations.writeFile(args as any);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }

        // DIRECTORY OPERATIONS
        case 'list_directory': {
          const result = await directoryOperations.listDirectory(args as any);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
        case 'create_directory': {
          const result = await directoryOperations.createDirectory(args as any);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
        case 'delete_directory': {
          const result = await directoryOperations.deleteDirectory(args as any);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
        case 'move_directory': {
          const result = await directoryOperations.moveDirectory(args as any);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }

        // SEARCH OPERATIONS
        case 'search_files': {
          const result = await searchOperations.searchFiles(args as any);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
        case 'search_content': {
          const result = await searchOperations.searchContent(args as any);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
        case 'find_duplicates': {
          const result = await searchOperations.findDuplicates(args as any);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }

        default:
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({ success: false, error: `Unknown tool: ${name}` })
            }],
            isError: true
          };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ success: false, error: errorMessage })
        }],
        isError: true
      };
    }
  });

  // Start server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('MCP Dev Tools server started successfully');
  console.error(`Version: 1.1.0`);
  console.error(`Workspace directory: ${config.workspace.dir}`);
  console.error(`Backup enabled: ${config.files.backupEnabled}`);
  console.error(`Rate limiting: ${config.rateLimits.enabled ? 'enabled' : 'disabled'}`);
  console.error('');
  console.error('Available tools (14):');
  console.error('  File Operations: rename_file, delete_file, copy_file, file_exists, get_file_info, read_file, write_file');
  console.error('  Directory Operations: list_directory, create_directory, delete_directory, move_directory');
  console.error('  Search Operations: search_files, search_content, find_duplicates');
}
