/**
 * Basic configuration tests
 */

describe('Package Structure', () => {
  it('should have valid package.json', () => {
    const pkg = require('../package.json');
    expect(pkg.name).toBe('@mcp-servers/dev-tools');
    expect(pkg.version).toBeDefined();
    expect(pkg.main).toBe('dist/index.js');
  });

  it('should export config types', () => {
    // This will fail to compile if types are not properly defined
    const configModule = require('../src/types/config');
    expect(configModule).toBeDefined();
  });

  it('should export tool types', () => {
    const toolsModule = require('../src/types/tools');
    expect(toolsModule).toBeDefined();
  });
});

describe('TypeScript Configuration', () => {
  it('should have valid tsconfig.json', () => {
    const tsconfig = require('../tsconfig.json');
    expect(tsconfig.compilerOptions).toBeDefined();
    expect(tsconfig.compilerOptions.target).toBe('ES2020');
    expect(tsconfig.compilerOptions.strict).toBe(true);
  });
});
