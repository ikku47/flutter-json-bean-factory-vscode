# Development Guide

This guide provides detailed information for developers working on the Flutter JSON Bean Factory VSCode extension.

## Architecture Overview

The extension follows a modular architecture with clear separation of concerns:

```
src/
├── extension.ts          # Main entry point
├── commands/            # Command implementations
│   ├── generateFromJson.ts
│   ├── generateHelperFiles.ts
│   └── generateToFromJson.ts
├── generators/          # Code generation logic
│   ├── modelGenerator.ts
│   ├── helperFileGenerator.ts
│   └── toFromJsonGenerator.ts
├── utils/              # Utility functions
│   ├── flutterProjectDetector.ts
│   ├── jsonInputDialog.ts
│   └── configManager.ts
└── types/              # TypeScript definitions
    └── index.ts
```

## Key Components

### Extension Entry Point (`extension.ts`)

The main extension file that:
- Activates the extension
- Registers commands
- Initializes project detection
- Shows welcome messages

### Commands

Each command is implemented as a separate class:

- **GenerateFromJsonCommand**: Handles JSON to Dart class generation
- **GenerateHelperFilesCommand**: Generates helper files for all entities
- **GenerateToFromJsonCommand**: Adds toJson/fromJson methods to existing classes

### Generators

Code generation logic is separated into specialized generators:

- **ModelGenerator**: Creates Dart data classes from JSON
- **HelperFileGenerator**: Creates .g.dart helper files and base files
- **ToFromJsonGenerator**: Adds serialization methods to existing classes

### Utilities

- **FlutterProjectDetector**: Detects Flutter projects and reads configuration
- **JsonInputDialog**: Handles user input for JSON and class names
- **ConfigManager**: Manages extension configuration

## Development Workflow

### 1. Setting Up Development Environment

```bash
# Clone and setup
git clone <repository-url>
cd vscode-extension
bun install

# Start development
bun run watch
```

### 2. Testing Changes

1. Press `F5` in VSCode to launch Extension Development Host
2. Open a Flutter project in the new window
3. Test your changes using the extension commands

### 3. Debugging

- Use VSCode debugger with the provided launch configuration
- Add breakpoints in TypeScript files
- Use console.log for additional debugging

## Code Generation Flow

### JSON to Dart Class Generation

1. User provides JSON string and class name
2. `ModelGenerator.generateFromJson()` parses JSON
3. Type analysis creates `ClassDefinition` objects
4. Dart code is generated with proper imports and methods
5. Files are written to the target directory
6. Helper files are automatically generated

### Helper File Generation

1. Scan lib directory for entity files
2. Extract class information from each file
3. Generate `.g.dart` files with serialization logic
4. Create base files (`json_field.dart`, `json_convert_content.dart`)
5. Update import statements and factory methods

## Type System

The extension uses a comprehensive type system:

```typescript
interface ClassDefinition {
  name: string;
  fields: { [key: string]: TypeDefinition };
  imports: string[];
}

interface TypeDefinition {
  type: string;
  isNullable: boolean;
  isArray: boolean;
  arrayDepth: number;
  genericType?: string;
  isCustomClass: boolean;
  originalJsonKey?: string;
}
```

## Configuration Management

The extension supports multiple configuration sources:

1. VSCode settings (`flutter-json-bean-factory.*`)
2. pubspec.yaml (`flutter_json.generated_path`)
3. Default values

Priority: pubspec.yaml > VSCode settings > defaults

## File Generation Patterns

### Entity Files

```dart
@JsonSerializable()
class UserEntity {
  late String name;
  late int age;
  
  UserEntity();
  
  factory UserEntity.fromJson(Map<String, dynamic> json) => $UserEntityFromJson(json);
  Map<String, dynamic> toJson() => $UserEntityToJson(this);
  
  UserEntity copyWith({String? name, int? age}) {
    return UserEntity()
      ..name = name ?? this.name
      ..age = age ?? this.age;
  }
}
```

### Helper Files (.g.dart)

```dart
UserEntity $UserEntityFromJson(Map<String, dynamic> json) {
  final UserEntity entity = UserEntity();
  entity.name = json['name'] as String;
  entity.age = json['age'] as int;
  return entity;
}

Map<String, dynamic> $UserEntityToJson(UserEntity entity) {
  final Map<String, dynamic> data = <String, dynamic>{};
  data['name'] = entity.name;
  data['age'] = entity.age;
  return data;
}
```

## Testing Strategy

### Manual Testing

1. **Basic JSON Generation**
   - Simple objects with primitive types
   - Nested objects
   - Arrays of primitives and objects
   - Complex nested structures

2. **Helper File Generation**
   - Multiple entity files
   - Different class structures
   - Import resolution

3. **Configuration Testing**
   - Different generated paths
   - Custom model suffixes
   - Null safety options

### Automated Testing

```bash
# Run all tests
bun run test

# Run with coverage
bun run test -- --coverage
```

## Common Development Tasks

### Adding a New Command

1. Create command class in `src/commands/`
2. Implement the command logic
3. Register in `src/extension.ts`
4. Add to `package.json` contributes section
5. Update documentation

### Modifying Code Generation

1. Update the appropriate generator class
2. Modify type definitions if needed
3. Test with various JSON structures
4. Update tests

### Adding Configuration Options

1. Add to `package.json` configuration section
2. Update `ConfigManager` to handle new option
3. Use in relevant generator/command
4. Document the new option

## Performance Considerations

- File I/O operations are async
- Large JSON structures are handled efficiently
- Batch file operations when possible
- Cache project configuration

## Error Handling

- Validate JSON input before processing
- Provide meaningful error messages
- Handle file system errors gracefully
- Log errors for debugging

## Best Practices

1. **Code Organization**
   - Keep classes focused and single-purpose
   - Use dependency injection for testability
   - Separate concerns clearly

2. **Error Handling**
   - Always validate user input
   - Provide helpful error messages
   - Handle edge cases gracefully

3. **Performance**
   - Use async/await for I/O operations
   - Cache expensive computations
   - Minimize file system operations

4. **Testing**
   - Test with real Flutter projects
   - Cover edge cases and error conditions
   - Validate generated code compiles

## Troubleshooting

### Common Issues

1. **Extension not activating**
   - Check activation events in package.json
   - Verify Flutter project detection

2. **Generated code not compiling**
   - Check import paths
   - Verify class names and types
   - Test with simple JSON first

3. **Helper files not generating**
   - Check file permissions
   - Verify entity file detection
   - Check generated path configuration

### Debug Tips

- Use VSCode debugger for step-through debugging
- Check VSCode Developer Console for errors
- Test with minimal JSON examples first
- Verify file paths and permissions

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed contribution guidelines.
