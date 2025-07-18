import * as path from 'path';
import * as fs from 'fs';
import { FlutterProjectDetector } from '../utils/flutterProjectDetector';
import { GeneratedFile } from '../types';

export class HelperFileGenerator {
    constructor(private projectDetector: FlutterProjectDetector) {}

    public async generateHelperFiles(entityFiles: string[]): Promise<GeneratedFile[]> {
        const generatedFiles: GeneratedFile[] = [];
        const libPath = this.projectDetector.getLibPath();
        const generatedPath = this.projectDetector.getGeneratedPath();
        
        if (!libPath) {
            throw new Error('Could not find lib directory');
        }

        const baseDir = path.join(libPath, generatedPath, 'base');
        
        // Generate base files
        generatedFiles.push({
            path: path.join(baseDir, 'json_field.dart'),
            content: this.generateJsonFieldContent(),
            type: 'base'
        });

        generatedFiles.push({
            path: path.join(baseDir, 'json_convert_content.dart'),
            content: await this.generateJsonConvertContent(entityFiles),
            type: 'base'
        });

        // Generate .g.dart files for each entity
        for (const entityFile of entityFiles) {
            const helperFile = await this.generateEntityHelperFile(entityFile);
            if (helperFile) {
                generatedFiles.push(helperFile);
            }
        }

        return generatedFiles;
    }

    private generateJsonFieldContent(): string {
        return `import 'package:meta/meta_meta.dart';

@Target({TargetKind.classType})
class JsonSerializable {
  const JsonSerializable();
}

@Target({TargetKind.field})
class JSONField {
  //Specify the parse field name
  final String? name;

  //Whether to participate in toJson
  final bool? serialize;
  
  //Whether to participate in fromMap
  final bool? deserialize;
  
  //Whether to participate in copyWith
  final bool? copyWith;
  
  //Enumeration or not
  final bool? isEnum;
  
  const JSONField({this.name, this.serialize, this.deserialize, this.isEnum, this.copyWith});
}
`;
    }

    private async generateJsonConvertContent(entityFiles: string[]): Promise<string> {
        const pubspecConfig = this.projectDetector.getPubspecConfig();
        const generatedPath = this.projectDetector.getGeneratedPath();
        
        let content = `// ignore_for_file: non_constant_identifier_names
// ignore_for_file: camel_case_types
// ignore_for_file: prefer_single_quotes

// This file is automatically generated. DO NOT EDIT, all your changes would be lost.

import 'dart:convert';
import 'dart:core';

`;

        // Add imports for all entity files
        for (const entityFile of entityFiles) {
            const relativePath = this.getRelativeImportPath(entityFile);
            if (relativePath) {
                content += `import 'package:${pubspecConfig?.name}/${relativePath}';\n`;
            }
        }

        content += `
JsonConvert jsonConvert = JsonConvert();
typedef JsonConvertFunction<T> = T Function(Map<String, dynamic> json);

class JsonConvert {
  static const _convertFuncMap = {
`;

        // Add convert functions for each entity
        for (const entityFile of entityFiles) {
            const classes = await this.extractClassNames(entityFile);
            for (const className of classes) {
                content += `    '${className}': ${className}.fromJson,\n`;
            }
        }

        content += `  };

  T? fromJsonAsT<T>(dynamic json) {
    if (json == null) {
      return null;
    }
    
    if (json is T) {
      return json;
    }
    
    try {
      return asT<T>(json);
    } catch (e, stackTrace) {
      print('fromJsonAsT<$T> $e $stackTrace');
      return null;
    }
  }

  T? asT<T extends Object?>(dynamic value) {
    if (value is T) {
      return value;
    }
    
    final String type = T.toString();
    final String valueS = value.toString();
    
    if (type == "String") {
      return valueS as T;
    } else if (type == "int") {
      final int? intValue = int.tryParse(valueS);
      if (intValue != null) {
        return intValue as T;
      }
      return double.tryParse(valueS)?.toInt() as T?;
    } else if (type == "double") {
      return double.tryParse(valueS) as T?;
    } else if (type == "DateTime") {
      return DateTime.tryParse(value) as T?;
    } else if (type == "bool") {
      if (value == "true" || value == "1") {
        return true as T;
      }
      if (value == "false" || value == "0") {
        return false as T;
      }
      return bool.tryParse(valueS) as T?;
    } else if (type.startsWith("List<")) {
      if (value is List) {
        final String itemType = type.substring(5, type.length - 1);
        final List<dynamic> result = [];
        for (final dynamic item in value) {
          result.add(asT<dynamic>(item));
        }
        return result as T;
      }
    } else if (_convertFuncMap.containsKey(type)) {
      if (value is Map<String, dynamic>) {
        return _convertFuncMap[type]!(value) as T;
      }
    }
    
    return value as T?;
  }
}
`;

        return content;
    }

    private async generateEntityHelperFile(entityFile: string): Promise<GeneratedFile | null> {
        try {
            const content = await fs.promises.readFile(entityFile, 'utf8');
            const classes = await this.extractClassNames(entityFile);
            
            if (classes.length === 0) {
                return null;
            }

            const fileName = path.basename(entityFile, '.dart');
            const libPath = this.projectDetector.getLibPath()!;
            const generatedPath = this.projectDetector.getGeneratedPath();
            const helperPath = path.join(libPath, generatedPath, `${fileName}.g.dart`);

            let helperContent = `// GENERATED CODE - DO NOT MODIFY BY HAND

// ignore_for_file: non_constant_identifier_names
// ignore_for_file: camel_case_types
// ignore_for_file: prefer_single_quotes

`;

            // Generate helper functions for each class
            for (const className of classes) {
                helperContent += this.generateClassHelperFunctions(className, content);
                helperContent += '\n\n';
            }

            return {
                path: helperPath,
                content: helperContent.trim(),
                type: 'helper'
            };

        } catch (error) {
            console.error(`Error generating helper file for ${entityFile}:`, error);
            return null;
        }
    }

    private generateClassHelperFunctions(className: string, classContent: string): string {
        // Extract fields from class
        const fields = this.extractClassFields(className, classContent);
        
        let content = `${className} $${className}FromJson(Map<String, dynamic> json) {
  final ${className} entity = ${className}();
`;

        // Generate field assignments
        for (const field of fields) {
            content += `  entity.${field.name} = `;
            
            if (field.type.startsWith('List<')) {
                const genericType = field.type.substring(5, field.type.length - 1);
                content += `(json['${field.jsonKey}'] as List<dynamic>?)?.map((e) => `;
                
                if (this.isPrimitiveType(genericType)) {
                    content += `e as ${genericType}`;
                } else {
                    content += `${genericType}.fromJson(e as Map<String, dynamic>)`;
                }
                
                content += `).toList()`;
            } else if (this.isPrimitiveType(field.type)) {
                content += `json['${field.jsonKey}'] as ${field.type}${field.isNullable ? '?' : ''}`;
            } else {
                content += `json['${field.jsonKey}'] != null ? ${field.type}.fromJson(json['${field.jsonKey}'] as Map<String, dynamic>) : null`;
            }
            
            content += ';\n';
        }

        content += `  return entity;
}

Map<String, dynamic> $${className}ToJson(${className} entity) {
  final Map<String, dynamic> data = <String, dynamic>{};
`;

        // Generate field serialization
        for (const field of fields) {
            content += `  data['${field.jsonKey}'] = `;
            
            if (field.type.startsWith('List<')) {
                const genericType = field.type.substring(5, field.type.length - 1);
                content += `entity.${field.name}`;
                
                if (!this.isPrimitiveType(genericType)) {
                    content += `?.map((e) => e.toJson()).toList()`;
                }
            } else if (this.isPrimitiveType(field.type)) {
                content += `entity.${field.name}`;
            } else {
                content += `entity.${field.name}?.toJson()`;
            }
            
            content += ';\n';
        }

        content += `  return data;
}`;

        return content;
    }

    private extractClassFields(className: string, content: string): Array<{name: string, type: string, jsonKey: string, isNullable: boolean}> {
        const fields: Array<{name: string, type: string, jsonKey: string, isNullable: boolean}> = [];
        
        // Find class definition
        const classRegex = new RegExp(`class\\s+${className}\\s*{([^}]+)}`, 's');
        const classMatch = content.match(classRegex);
        
        if (!classMatch) {
            return fields;
        }

        const classBody = classMatch[1];
        
        // Extract field declarations
        const fieldRegex = /late\s+([^;]+?)\s+(\w+);/g;
        let match;
        
        while ((match = fieldRegex.exec(classBody)) !== null) {
            const typeDeclaration = match[1].trim();
            const fieldName = match[2];
            
            const isNullable = typeDeclaration.endsWith('?');
            const type = isNullable ? typeDeclaration.slice(0, -1) : typeDeclaration;
            
            fields.push({
                name: fieldName,
                type: type,
                jsonKey: this.toSnakeCase(fieldName),
                isNullable: isNullable
            });
        }
        
        return fields;
    }

    private async extractClassNames(filePath: string): Promise<string[]> {
        try {
            const content = await fs.promises.readFile(filePath, 'utf8');
            const classRegex = /class\s+(\w+)\s*{/g;
            const classes: string[] = [];
            let match;
            
            while ((match = classRegex.exec(content)) !== null) {
                classes.push(match[1]);
            }
            
            return classes;
        } catch (error) {
            console.error(`Error extracting class names from ${filePath}:`, error);
            return [];
        }
    }

    private getRelativeImportPath(entityFile: string): string | null {
        const libPath = this.projectDetector.getLibPath();
        if (!libPath) {
            return null;
        }

        const relativePath = path.relative(libPath, entityFile);
        return relativePath.replace(/\\/g, '/');
    }

    private isPrimitiveType(type: string): boolean {
        const primitiveTypes = ['String', 'int', 'double', 'bool', 'DateTime', 'dynamic'];
        return primitiveTypes.includes(type);
    }

    private toSnakeCase(str: string): string {
        return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '');
    }
}
