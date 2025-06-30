# Flutter JSON Bean Factory - VSCode Extension

A powerful VSCode extension that generates Dart data classes from JSON for Flutter projects, complete with `toJson()`, `fromJson()`, and `copyWith()` methods.

## Features

🚀 **Generate Dart Bean Classes from JSON**
- Convert JSON strings into fully-featured Dart data classes
- Support for nested objects and arrays
- Automatic type inference with null safety support
- Customizable class naming and structure

🔧 **Smart Code Generation**
- Generate `toJson()` and `fromJson()` methods
- Create `copyWith()` methods for immutable data classes
- Support for custom JSON field mapping with `@JSONField` annotations
- Generate helper files and factory classes

⚡ **Seamless Integration**
- Right-click context menu integration
- Command palette support
- Keyboard shortcuts (Alt+J for helper file generation)
- Automatic Flutter project detection

🎯 **Advanced Features**
- Support for generic types and collections
- Two-dimensional array support
- Custom generated file paths
- Configurable model suffixes
- Null safety compliance

## Installation

1. Open VSCode
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Flutter JSON Bean Factory"
4. Click Install

## Usage

### Generate Dart Bean Class from JSON

1. **Right-click method**: Right-click on any folder in your Flutter project's `lib` directory → "Generate Dart Bean Class from JSON"
2. **Command Palette**: Press `Ctrl+Shift+P` → Type "Generate Dart Bean Class from JSON"
3. Enter your class name and JSON string
4. The extension will generate a complete Dart data class with all necessary methods

### Generate Helper Files

- Press `Alt+J` or use Command Palette → "Generate Helper Files"
- This generates all necessary helper files and factory classes for your existing entity classes

### Generate toJson/fromJson for Existing Classes

- Open a Dart file with your data class
- Right-click in the editor → "Generate toJson/fromJson Methods"
- Or use Command Palette → "Generate toJson/fromJson Methods"

## Configuration

Configure the extension through VSCode settings:

```json
{
  "flutter-json-bean-factory.generatedPath": "generated/json",
  "flutter-json-bean-factory.modelSuffix": "Entity",
  "flutter-json-bean-factory.enableNullSafety": true,
  "flutter-json-bean-factory.generateCopyWith": true
}
```

### Settings

- **generatedPath**: Path where generated files will be placed (relative to lib folder)
- **modelSuffix**: Suffix to add to generated model class names
- **enableNullSafety**: Generate null-safe Dart code
- **generateCopyWith**: Generate copyWith methods for data classes

## Custom JSON Parsing

You can customize JSON parsing by extending the JsonConvert class:

```dart
import 'generated/json/base/json_convert_content.dart';

class MyJsonConvert extends JsonConvert {
  T? asT<T extends Object?>(dynamic value) {
    try {
      String type = T.toString();
      if (type == "DateTime") {
        return DateFormat("dd.MM.yyyy").parse(value) as T;
      } else {
        return super.asT<T>(value);
      }
    } catch (e, stackTrace) {
      print('asT<$T> $e $stackTrace');
      return null;
    }
  }
}

Future<void> main() async {
  jsonConvert = MyJsonConvert();
  runApp(MyApp());
}
```

## Custom Generated Path

Configure custom path in your `pubspec.yaml`:

```yaml
flutter_json:
  generated_path: src/json/**
```

## Example

### Input JSON:
```json
{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "addresses": [
    {
      "street": "123 Main St",
      "city": "New York",
      "zipCode": "10001"
    }
  ]
}
```

### Generated Dart Class:
```dart
import 'package:my_app/generated/json/base/json_field.dart';
import 'package:my_app/generated/json/user_entity.g.dart';
import 'dart:convert';

@JsonSerializable()
class UserEntity {
  late String name;
  late int age;
  late String email;
  late List<AddressEntity> addresses;

  UserEntity();

  factory UserEntity.fromJson(Map<String, dynamic> json) => $UserEntityFromJson(json);

  Map<String, dynamic> toJson() => $UserEntityToJson(this);

  UserEntity copyWith({
    String? name,
    int? age,
    String? email,
    List<AddressEntity>? addresses,
  }) {
    return UserEntity()
      ..name = name ?? this.name
      ..age = age ?? this.age
      ..email = email ?? this.email
      ..addresses = addresses ?? this.addresses;
  }
}

@JsonSerializable()
class AddressEntity {
  late String street;
  late String city;
  late String zipCode;

  AddressEntity();

  factory AddressEntity.fromJson(Map<String, dynamic> json) => $AddressEntityFromJson(json);

  Map<String, dynamic> toJson() => $AddressEntityToJson(this);
}
```

## Supported Types

- `int`, `double`, `String`, `bool`
- `DateTime` (with custom parsing support)
- `dynamic`, `var`
- `List<T>` of any supported type
- Nested objects and classes
- Two-dimensional arrays
- Generic types

## Keyboard Shortcuts

- `Alt+J`: Generate helper files for all entity classes

## Requirements

- VSCode 1.74.0 or higher
- Flutter project with `pubspec.yaml`
- Dart language support

## Known Issues

- If "No classes that inherit JsonConvert were found" appears, try reloading the VSCode window
- Make sure your project has a proper Flutter structure with `lib` directory

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Quick Start

1. **Install the extension** (when published to marketplace)
2. **Open a Flutter project** in VSCode
3. **Right-click** in your `lib` folder → "Generate Dart Bean Class from JSON"
4. **Enter class name** and **paste your JSON**
5. **Press Alt+J** to generate helper files
6. **Start using** your generated data classes!

## Development

### Setup
```bash
cd vscode-extension
bun install
bun run compile
```

### Testing
Press `F5` in VSCode to launch Extension Development Host and test your changes.

### Building
```bash
bun run package  # Creates .vsix file
```

## Documentation

- [Usage Guide](docs/USAGE.md) - Complete user guide
- [Development Guide](docs/DEVELOPMENT.md) - Developer documentation
- [Contributing](CONTRIBUTING.md) - How to contribute
- [Changelog](CHANGELOG.md) - Version history

## Project Structure

```
vscode-extension/
├── src/                    # TypeScript source code
│   ├── commands/          # Command implementations
│   ├── generators/        # Code generation logic
│   ├── utils/            # Utility functions
│   ├── types/            # Type definitions
│   └── extension.ts      # Main entry point
├── docs/                 # Documentation
├── examples/             # Sample JSON files
├── package.json          # Extension manifest
└── README.md            # This file
```

## Acknowledgments

Based on the original IntelliJ/Android Studio plugin [FlutterJsonBeanFactory](https://github.com/zhangruiyu/FlutterJsonBeanFactory) by zhangruiyu.
