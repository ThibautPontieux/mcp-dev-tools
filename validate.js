/**
 * Quick Package Validation Script
 * Runs pre-deployment checks
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 MCP Dev Tools - Quick Validation\n');

let errors = 0;
let warnings = 0;

function check(name, condition, severity = 'error') {
  process.stdout.write(`Checking ${name}... `);
  if (condition) {
    console.log('✓ OK');
    return true;
  } else {
    if (severity === 'error') {
      console.log('✗ FAILED');
      errors++;
    } else {
      console.log('⚠ WARNING');
      warnings++;
    }
    return false;
  }
}

// Check directory structure
check('src/ exists', fs.existsSync('src'));
check('tests/ exists', fs.existsSync('tests'));
check('dist/ exists', fs.existsSync('dist'));

// Check critical files
const criticalFiles = [
  'src/index.ts',
  'src/server.ts',
  'src/tools/file-operations.ts',
  'src/utils/path-validator.ts',
  'src/utils/logger.ts',
  'src/utils/rate-limiter.ts',
  'src/utils/backup-manager.ts',
  'src/utils/config.ts',
  'package.json',
  'tsconfig.json',
  'README.md'
];

criticalFiles.forEach(file => {
  check(`${file} exists`, fs.existsSync(file));
});

// Check compiled files
const compiledFiles = [
  'dist/index.js',
  'dist/server.js',
  'dist/index.d.ts'
];

compiledFiles.forEach(file => {
  check(`${file} exists`, fs.existsSync(file));
});

// Check package.json validity
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  check('package.json is valid JSON', true);
  check('package name is correct', pkg.name === '@mcp-servers/dev-tools');
  check('version is defined', !!pkg.version);
  check('main entry point is correct', pkg.main === 'dist/index.js');
  check('MCP SDK dependency exists', !!pkg.dependencies['@modelcontextprotocol/sdk']);
} catch (e) {
  check('package.json is valid JSON', false);
}

// Check tsconfig.json validity
try {
  const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  check('tsconfig.json is valid JSON', true);
  check('strict mode is enabled', tsconfig.compilerOptions.strict === true);
  check('outDir is configured', tsconfig.compilerOptions.outDir === './dist');
} catch (e) {
  check('tsconfig.json is valid JSON', false);
}

// Count test files
const testFiles = fs.readdirSync('tests').filter(f => f.endsWith('.test.ts'));
check('test files exist', testFiles.length > 0);
console.log(`  → Found ${testFiles.length} test files`);

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 VALIDATION SUMMARY');
console.log('='.repeat(50));
console.log(`Errors: ${errors}`);
console.log(`Warnings: ${warnings}`);

if (errors === 0) {
  console.log('\n✅ VALIDATION PASSED - Package is ready!');
  process.exit(0);
} else {
  console.log('\n❌ VALIDATION FAILED - Please fix errors above');
  process.exit(1);
}
