# Contributing to Flutter JSON Bean Factory VSCode Extension

Thank you for your interest in contributing to the Flutter JSON Bean Factory VSCode extension! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- Bun package manager
- VSCode (for testing)
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/flutter-json-bean-factory-vscode.git
   cd flutter-json-bean-factory-vscode/vscode-extension
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Compile the extension**
   ```bash
   bun run compile
   ```

4. **Open in VSCode**
   ```bash
   code .
   ```

5. **Run the extension**
   - Press `F5` to open a new Extension Development Host window
   - Test your changes in the new window

## Project Structure

```
vscode-extension/
├── src/
│   ├── commands/           # Command implementations
│   ├── generators/         # Code generation logic
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── extension.ts       # Main extension entry point
├── package.json           # Extension manifest
├── tsconfig.json         # TypeScript configuration
└── README.md             # Extension documentation
```

## Development Guidelines

### Code Style

- Use TypeScript for all source code
- Follow the existing code style and formatting
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Use ESLint for code linting

### Testing

- Write unit tests for new functionality
- Test the extension manually in a Flutter project
- Ensure all existing tests pass before submitting

### Commit Messages

Use conventional commit format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `refactor:` for code refactoring
- `test:` for adding tests

Example: `feat: add support for nested array generation`

## Contributing Process

### Reporting Issues

1. Check existing issues to avoid duplicates
2. Use the issue template if available
3. Provide clear reproduction steps
4. Include relevant environment information

### Submitting Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the development guidelines
   - Add tests if applicable
   - Update documentation if needed

4. **Test your changes**
   ```bash
   bun run compile
   bun run lint
   bun run test
   ```

5. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Use a clear title and description
   - Reference any related issues
   - Include screenshots if applicable

### Pull Request Guidelines

- Keep PRs focused and atomic
- Include tests for new functionality
- Update documentation as needed
- Ensure CI checks pass
- Respond to review feedback promptly

## Development Commands

```bash
# Install dependencies
bun install

# Compile TypeScript
bun run compile

# Watch mode for development
bun run watch

# Run linting
bun run lint

# Run tests
bun run test

# Package extension
bun run package

# Publish extension
bun run publish
```

## Extension API

### Key Components

- **Commands**: Located in `src/commands/`
- **Generators**: Code generation logic in `src/generators/`
- **Utils**: Helper functions in `src/utils/`
- **Types**: TypeScript definitions in `src/types/`

### Adding New Commands

1. Create command class in `src/commands/`
2. Register command in `src/extension.ts`
3. Add command to `package.json` contributes section
4. Update documentation

### Adding New Generators

1. Create generator class in `src/generators/`
2. Implement required interfaces
3. Add tests for generation logic
4. Update existing commands to use new generator

## Testing

### Manual Testing

1. Open a Flutter project in VSCode
2. Test all extension commands
3. Verify generated code compiles
4. Test with various JSON structures

### Automated Testing

```bash
# Run all tests
bun run test

# Run specific test file
bun run test -- --grep "ModelGenerator"
```

## Documentation

- Update README.md for user-facing changes
- Update CHANGELOG.md for all changes
- Add JSDoc comments for new APIs
- Update configuration documentation

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create release commit
4. Tag the release
5. Publish to VSCode Marketplace

## Getting Help

- Check existing documentation
- Look at similar implementations
- Ask questions in issues or discussions
- Review the original IntelliJ plugin for reference

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow the project's coding standards

Thank you for contributing to Flutter JSON Bean Factory VSCode Extension!
