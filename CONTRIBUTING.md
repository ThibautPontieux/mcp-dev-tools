# Contributing to MCP Dev Tools

Thank you for your interest in contributing! 🎉

## Quick Links

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Style Guide](#style-guide)

## Code of Conduct

Be respectful, collaborative, and constructive.

## Getting Started

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/mcp-dev-tools.git
cd mcp-dev-tools/packages/dev-tools

# 2. Install dependencies
npm install

# 3. Build
npm run build

# 4. Validate
./scripts/pre-commit-check.sh
```

## Development Workflow

### 1. Create Branch
```bash
git checkout -b feature/your-feature
# or
git checkout -b fix/your-bugfix
```

### 2. Make Changes
- Follow TypeScript best practices
- Add JSDoc comments
- Update documentation

### 3. Test
```bash
npm run build
npm test
npm run lint
```

### 4. Validate
```bash
./scripts/pre-commit-check.sh
```

### 5. Commit
```bash
git add .
git commit -m "feat: your feature description"
```

**Commit Message Format:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance

### 6. Push & PR
```bash
git push origin feature/your-feature
```

Then create a Pull Request on GitHub.

## Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Run validation** (`./scripts/pre-commit-check.sh`)
4. **Update CHANGELOG.md** with your changes
5. **Request review** from maintainers

### PR Checklist

- [ ] Code builds successfully
- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] No ESLint warnings
- [ ] Type-safe (no `any` unless necessary)

## Style Guide

### TypeScript

```typescript
// ✅ Good
export function processFile(path: string): Promise<FileResult> {
  // Implementation
}

// ❌ Bad
export function processFile(path: any): any {
  // Implementation
}
```

### Documentation

```typescript
/**
 * Process a file and return results
 * @param path - File path to process
 * @returns Promise with file processing results
 * @throws {Error} If file doesn't exist
 */
export async function processFile(path: string): Promise<FileResult> {
  // ...
}
```

### Error Handling

```typescript
// ✅ Good
try {
  await processFile(path);
} catch (error) {
  throw new Error(`Failed to process file: ${error.message}`);
}

// ❌ Bad
try {
  await processFile(path);
} catch (error) {
  console.log(error);
}
```

## Project Structure

```
packages/dev-tools/
├── src/              # Source code
├── dist/             # Build output (gitignored)
├── docs/             # Documentation
├── scripts/          # Automation scripts
└── tests/            # Test files
```

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## Documentation

- Update relevant files in `docs/`
- Keep README.md concise
- Add examples for new features

## Questions?

- Open an issue for discussion
- Check [existing issues](https://github.com/ThibautPontieux/mcp-dev-tools/issues)
- Read [full documentation](https://thibautpontieux.github.io/mcp-dev-tools/)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing! 🙏**
