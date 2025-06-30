# Change Log

All notable changes to the "Flutter JSON Bean Factory" extension will be documented in this file.

## [1.0.0] - 2024-12-30

### Added
- Initial release of Flutter JSON Bean Factory VSCode extension
- Generate Dart data classes from JSON with complete serialization support
- Support for nested objects and arrays
- Automatic generation of `toJson()` and `fromJson()` methods
- Generate `copyWith()` methods for immutable data classes
- Support for null safety
- Custom JSON field mapping with `@JSONField` annotations
- Helper file generation for all entity classes
- Keyboard shortcut support (Alt+J for helper files)
- Right-click context menu integration
- Command palette support
- Configurable settings for generated paths and model suffixes
- Support for generic types and collections
- Two-dimensional array support
- Custom generated file paths via pubspec.yaml configuration

### Features
- **JSON to Dart Class Generation**: Convert JSON strings into fully-featured Dart data classes
- **Smart Type Inference**: Automatic detection of types with null safety support
- **Nested Object Support**: Handle complex JSON structures with nested objects and arrays
- **Helper File Generation**: Automatically generate all necessary helper files and factory classes
- **Customizable Configuration**: Configure generated paths, model suffixes, and other options
- **Flutter Project Detection**: Automatic detection of Flutter projects
- **Code Generation**: Generate toJson/fromJson methods for existing classes

### Commands
- `flutter-json-bean-factory.generateFromJson`: Generate Dart Bean Class from JSON
- `flutter-json-bean-factory.generateHelperFiles`: Generate Helper Files (Alt+J)
- `flutter-json-bean-factory.generateToFromJson`: Generate toJson/fromJson Methods

### Configuration Options
- `flutter-json-bean-factory.generatedPath`: Path where generated files will be placed
- `flutter-json-bean-factory.modelSuffix`: Suffix to add to generated model class names
- `flutter-json-bean-factory.enableNullSafety`: Generate null-safe Dart code
- `flutter-json-bean-factory.generateCopyWith`: Generate copyWith methods for data classes

### Known Issues
- None at this time

### Requirements
- VSCode 1.74.0 or higher
- Flutter project with pubspec.yaml
- Dart language support

### Acknowledgments
Based on the original IntelliJ/Android Studio plugin [FlutterJsonBeanFactory](https://github.com/zhangruiyu/FlutterJsonBeanFactory) by zhangruiyu.
