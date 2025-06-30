# Usage Guide

This guide explains how to use the Flutter JSON Bean Factory VSCode extension effectively.

## Installation

### From VSCode Marketplace (Coming Soon)

1. Open VSCode
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Flutter JSON Bean Factory"
4. Click Install

### Manual Installation (Development)

1. Clone the repository
2. Navigate to the vscode-extension folder
3. Run `bun install && bun run compile`
4. Press F5 to launch Extension Development Host
5. Test in a Flutter project

## Getting Started

### Prerequisites

- VSCode 1.74.0 or higher
- A Flutter project with `pubspec.yaml`
- Dart language support enabled

### Basic Workflow

1. **Open a Flutter Project**: The extension automatically detects Flutter projects
2. **Generate from JSON**: Right-click in lib folder → "Generate Dart Bean Class from JSON"
3. **Generate Helper Files**: Press Alt+J to generate all helper files
4. **Use Generated Classes**: Import and use your generated data classes

## Features

### 1. Generate Dart Bean Class from JSON

**How to use:**
- Right-click on any folder in your Flutter project's `lib` directory
- Select "Generate Dart Bean Class from JSON"
- Enter your class name (e.g., "User", "Product")
- Paste your JSON string
- Click Generate

**Example:**

Input JSON:
```json
{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "addresses": [
    {
      "street": "123 Main St",
      "city": "New York"
    }
  ]
}
```

Generated Dart class:
```dart
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
```

### 2. Generate Helper Files

**How to use:**
- Press `Alt+J` anywhere in your Flutter project
- Or use Command Palette → "Generate Helper Files"

**What it generates:**
- `.g.dart` files for each entity class
- `json_field.dart` with annotations
- `json_convert_content.dart` with conversion logic

### 3. Generate toJson/fromJson for Existing Classes

**How to use:**
- Open a Dart file with your data class
- Right-click in the editor → "Generate toJson/fromJson Methods"
- The extension will add the necessary methods and imports

## Configuration

### Extension Settings

Access via File → Preferences → Settings → Extensions → Flutter JSON Bean Factory

- **Generated Path**: Where to place generated files (default: `generated/json`)
- **Model Suffix**: Suffix for generated classes (default: `Entity`)
- **Enable Null Safety**: Generate null-safe code (default: `true`)
- **Generate CopyWith**: Include copyWith methods (default: `true`)

### Project Configuration

Add to your `pubspec.yaml`:

```yaml
flutter_json:
  generated_path: custom/path/**
```

## Advanced Usage

### Custom JSON Field Mapping

Use `@JSONField` annotation for custom mapping:

```dart
@JsonSerializable()
class UserEntity {
  @JSONField(name: 'user_name')
  late String userName;
  
  @JSONField(serialize: false)
  late String password;
}
```

### Custom JSON Conversion

Create custom converter:

```dart
import 'generated/json/base/json_convert_content.dart';

class MyJsonConvert extends JsonConvert {
  T? asT<T extends Object?>(dynamic value) {
    try {
      String type = T.toString();
      if (type == "DateTime") {
        return DateFormat("yyyy-MM-dd").parse(value) as T;
      } else {
        return super.asT<T>(value);
      }
    } catch (e, stackTrace) {
      print('asT<$T> $e $stackTrace');
      return null;
    }
  }
}

void main() {
  jsonConvert = MyJsonConvert();
  runApp(MyApp());
}
```

### Using Generated Classes

```dart
// Parse JSON
final user = UserEntity.fromJson(jsonData);

// Convert to JSON
final jsonMap = user.toJson();

// Create copies with modifications
final updatedUser = user.copyWith(age: 31);

// Generic conversion
final users = jsonConvert.fromJsonAsT<List<UserEntity>>(jsonArray);
```

## Supported Types

### Primitive Types
- `String`
- `int`
- `double`
- `bool`
- `DateTime`
- `dynamic`

### Collection Types
- `List<T>` of any supported type
- Multi-dimensional arrays
- Nested objects

### Custom Types
- Nested classes
- Generic types
- Nullable types (with null safety)

## Best Practices

### 1. Naming Conventions
- Use PascalCase for class names
- Use camelCase for field names
- Add meaningful suffixes (Entity, Model, Data)

### 2. Project Structure
```
lib/
├── models/
│   ├── user_entity.dart
│   └── product_entity.dart
├── generated/
│   └── json/
│       ├── base/
│       ├── user_entity.g.dart
│       └── product_entity.g.dart
└── main.dart
```

### 3. JSON Structure
- Use consistent naming conventions
- Avoid deeply nested structures when possible
- Include sample data for all fields

### 4. Version Control
- Commit generated files to version control
- Regenerate after JSON structure changes
- Use consistent configuration across team

## Troubleshooting

### Common Issues

**Extension not working:**
- Ensure you're in a Flutter project
- Check that `pubspec.yaml` exists
- Reload VSCode window

**Generated code not compiling:**
- Run `flutter pub get`
- Check import paths
- Verify Dart SDK version

**Helper files not generating:**
- Check file permissions
- Verify generated path exists
- Ensure entity files are properly formatted

**JSON parsing errors:**
- Validate JSON syntax
- Check for special characters
- Use online JSON validators

### Getting Help

1. Check the [GitHub Issues](https://github.com/your-username/flutter-json-bean-factory-vscode/issues)
2. Review the [Development Guide](DEVELOPMENT.md)
3. Look at the [Contributing Guidelines](../CONTRIBUTING.md)
4. Check the original [IntelliJ plugin documentation](https://github.com/zhangruiyu/FlutterJsonBeanFactory)

## Tips and Tricks

### 1. Keyboard Shortcuts
- `Alt+J`: Quick helper file generation
- `Ctrl+Shift+P`: Open command palette for all commands

### 2. Workflow Optimization
- Keep JSON samples in a separate file for reference
- Use consistent class naming across your project
- Generate helper files after adding new entities

### 3. Team Collaboration
- Share extension settings via workspace configuration
- Document custom JSON conversion logic
- Use consistent generated paths across team

## Examples

See the `examples/` folder for sample JSON files and generated output.

## Next Steps

After generating your classes:

1. Add them to your data layer
2. Integrate with your API calls
3. Use in your UI components
4. Add unit tests for serialization
5. Consider adding validation logic

For more advanced usage and development information, see the [Development Guide](DEVELOPMENT.md).
