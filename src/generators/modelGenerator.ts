import * as path from 'path';
import { FlutterProjectDetector } from '../utils/flutterProjectDetector';
import { CollectInfo, ClassDefinition, TypeDefinition, GeneratedFile } from '../types';

export class ModelGenerator {
    constructor(private projectDetector: FlutterProjectDetector) {}

    public async generateFromJson(collectInfo: CollectInfo, targetDir: string): Promise<GeneratedFile[]> {
        try {
            // Parse JSON
            const jsonData = JSON.parse(collectInfo.jsonString);
            
            // Generate class definitions
            const classDefinitions = this.generateClassDefinitions(
                collectInfo.className,
                jsonData,
                collectInfo
            );

            // Generate Dart code
            const dartContent = this.generateDartCode(classDefinitions, collectInfo);
            
            // Create file path
            const fileName = `${collectInfo.className.toLowerCase()}_entity.dart`;
            const filePath = path.join(targetDir, fileName);

            return [{
                path: filePath,
                content: dartContent,
                type: 'entity'
            }];

        } catch (error) {
            throw new Error(`Failed to generate model: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private generateClassDefinitions(
        className: string,
        jsonData: any,
        collectInfo: CollectInfo,
        parentName: string = ''
    ): ClassDefinition[] {
        const definitions: ClassDefinition[] = [];
        
        if (Array.isArray(jsonData)) {
            // Handle array at root level
            if (jsonData.length > 0) {
                return this.generateClassDefinitions(
                    className,
                    jsonData[0],
                    collectInfo,
                    parentName
                );
            }
            return definitions;
        }

        if (typeof jsonData !== 'object' || jsonData === null) {
            return definitions;
        }

        const fullClassName = parentName ? `${parentName}${className}` : `${className}${collectInfo.modelSuffix}`;
        const classDefinition: ClassDefinition = {
            name: fullClassName,
            fields: {},
            imports: []
        };

        // Process each field
        for (const [key, value] of Object.entries(jsonData)) {
            const fieldName = this.toCamelCase(key);
            const typeDefinition = this.analyzeType(value, key, collectInfo, fullClassName);
            
            classDefinition.fields[fieldName] = typeDefinition;

            // Generate nested classes
            if (typeDefinition.isCustomClass) {
                const nestedDefinitions = this.generateClassDefinitions(
                    this.toPascalCase(key),
                    value,
                    collectInfo,
                    fullClassName
                );
                definitions.push(...nestedDefinitions);
            }
        }

        definitions.unshift(classDefinition);
        return definitions;
    }

    private analyzeType(value: any, originalKey: string, collectInfo: CollectInfo, parentClassName: string): TypeDefinition {
        if (value === null) {
            return {
                type: 'dynamic',
                isNullable: true,
                isArray: false,
                arrayDepth: 0,
                isCustomClass: false,
                originalJsonKey: originalKey
            };
        }

        if (Array.isArray(value)) {
            if (value.length === 0) {
                return {
                    type: 'List<dynamic>',
                    isNullable: collectInfo.enableNullSafety,
                    isArray: true,
                    arrayDepth: 1,
                    isCustomClass: false,
                    originalJsonKey: originalKey
                };
            }

            const firstElement = value[0];
            const elementType = this.analyzeType(firstElement, originalKey, collectInfo, parentClassName);
            
            return {
                type: `List<${elementType.type}>`,
                isNullable: collectInfo.enableNullSafety,
                isArray: true,
                arrayDepth: 1,
                genericType: elementType.type,
                isCustomClass: elementType.isCustomClass,
                originalJsonKey: originalKey
            };
        }

        switch (typeof value) {
            case 'string':
                return {
                    type: 'String',
                    isNullable: collectInfo.enableNullSafety,
                    isArray: false,
                    arrayDepth: 0,
                    isCustomClass: false,
                    originalJsonKey: originalKey
                };
            case 'number':
                const type = Number.isInteger(value) ? 'int' : 'double';
                return {
                    type,
                    isNullable: collectInfo.enableNullSafety,
                    isArray: false,
                    arrayDepth: 0,
                    isCustomClass: false,
                    originalJsonKey: originalKey
                };
            case 'boolean':
                return {
                    type: 'bool',
                    isNullable: collectInfo.enableNullSafety,
                    isArray: false,
                    arrayDepth: 0,
                    isCustomClass: false,
                    originalJsonKey: originalKey
                };
            case 'object':
                const customClassName = `${parentClassName}${this.toPascalCase(originalKey)}`;
                return {
                    type: customClassName,
                    isNullable: collectInfo.enableNullSafety,
                    isArray: false,
                    arrayDepth: 0,
                    isCustomClass: true,
                    originalJsonKey: originalKey
                };
            default:
                return {
                    type: 'dynamic',
                    isNullable: true,
                    isArray: false,
                    arrayDepth: 0,
                    isCustomClass: false,
                    originalJsonKey: originalKey
                };
        }
    }

    private generateDartCode(classDefinitions: ClassDefinition[], collectInfo: CollectInfo): string {
        const pubspecConfig = this.projectDetector.getPubspecConfig();
        const generatedPath = this.projectDetector.getGeneratedPath();
        const fileName = `${collectInfo.className.toLowerCase()}_entity`;
        
        let code = '';
        
        // Add imports
        code += `import 'package:${pubspecConfig?.name}/${generatedPath}/base/json_field.dart';\n`;
        code += `import 'package:${pubspecConfig?.name}/${generatedPath}/${fileName}.g.dart';\n`;
        code += `import 'dart:convert';\n\n`;
        
        // Add export for helper file
        code += `export 'package:${pubspecConfig?.name}/${generatedPath}/${fileName}.g.dart';\n\n`;

        // Generate each class
        for (const classDef of classDefinitions) {
            code += this.generateClassCode(classDef, collectInfo);
            code += '\n\n';
        }

        return code.trim();
    }

    private generateClassCode(classDef: ClassDefinition, collectInfo: CollectInfo): string {
        let code = '@JsonSerializable()\n';
        code += `class ${classDef.name} {\n`;

        // Generate fields
        for (const [fieldName, typeDef] of Object.entries(classDef.fields)) {
            const nullableSuffix = typeDef.isNullable ? '?' : '';
            code += `  late ${typeDef.type}${nullableSuffix} ${fieldName};\n`;
        }

        code += '\n';

        // Generate constructor
        code += `  ${classDef.name}();\n\n`;

        // Generate fromJson factory
        code += `  factory ${classDef.name}.fromJson(Map<String, dynamic> json) => $${classDef.name}FromJson(json);\n\n`;

        // Generate toJson method
        code += `  Map<String, dynamic> toJson() => $${classDef.name}ToJson(this);\n`;

        // Generate copyWith method if enabled
        if (collectInfo.generateCopyWith) {
            code += '\n';
            code += this.generateCopyWithMethod(classDef, collectInfo);
        }

        code += '}';
        return code;
    }

    private generateCopyWithMethod(classDef: ClassDefinition, collectInfo: CollectInfo): string {
        const fields = Object.entries(classDef.fields);
        
        let code = `  ${classDef.name} copyWith({\n`;
        
        // Parameters
        for (const [fieldName, typeDef] of fields) {
            const nullableSuffix = '?';
            code += `    ${typeDef.type}${nullableSuffix} ${fieldName},\n`;
        }
        
        code += '  }) {\n';
        code += `    return ${classDef.name}()\n`;
        
        // Assignments
        for (const [fieldName] of fields) {
            code += `      ..${fieldName} = ${fieldName} ?? this.${fieldName}\n`;
        }
        
        code += '    ;\n';
        code += '  }';
        
        return code;
    }

    private toCamelCase(str: string): string {
        return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    }

    private toPascalCase(str: string): string {
        const camelCase = this.toCamelCase(str);
        return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
    }
}
