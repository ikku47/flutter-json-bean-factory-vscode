import { FlutterProjectDetector } from '../utils/flutterProjectDetector';

export class ToFromJsonGenerator {
    constructor(private projectDetector: FlutterProjectDetector) {}

    public async generateToFromJsonMethods(content: string, className: string): Promise<string> {
        try {
            // Check if methods already exist
            const hasFromJson = content.includes(`${className}.fromJson`);
            const hasToJson = content.includes('toJson()');
            
            if (hasFromJson && hasToJson) {
                return content;
            }

            // Extract class body
            const classRegex = new RegExp(`(class\\s+${className}\\s*{)([^}]+)(})`, 's');
            const classMatch = content.match(classRegex);
            
            if (!classMatch) {
                throw new Error(`Could not find class ${className}`);
            }

            const classStart = classMatch[1];
            const classBody = classMatch[2];
            const classEnd = classMatch[3];

            // Extract fields
            const fields = this.extractFields(classBody);
            
            if (fields.length === 0) {
                throw new Error('No fields found in the class');
            }

            // Generate new class body
            let newClassBody = classBody;

            // Add @JsonSerializable annotation if not present
            let newContent = content;
            if (!content.includes('@JsonSerializable')) {
                newContent = content.replace(
                    `class ${className}`,
                    `@JsonSerializable()\nclass ${className}`
                );
            }

            // Add imports if not present
            newContent = this.addImports(newContent, className);

            // Add fromJson factory if not present
            if (!hasFromJson) {
                const fromJsonMethod = `\n  factory ${className}.fromJson(Map<String, dynamic> json) => $${className}FromJson(json);\n`;
                newClassBody += fromJsonMethod;
            }

            // Add toJson method if not present
            if (!hasToJson) {
                const toJsonMethod = `\n  Map<String, dynamic> toJson() => $${className}ToJson(this);\n`;
                newClassBody += toJsonMethod;
            }

            // Replace class body in content
            const updatedClassRegex = new RegExp(`(class\\s+${className}\\s*{)([^}]+)(})`, 's');
            newContent = newContent.replace(updatedClassRegex, `${classStart}${newClassBody}${classEnd}`);

            return newContent;

        } catch (error) {
            throw new Error(`Failed to generate toJson/fromJson methods: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private extractFields(classBody: string): Array<{name: string, type: string}> {
        const fields: Array<{name: string, type: string}> = [];
        
        // Match field declarations (late Type fieldName;)
        const fieldRegex = /late\s+([^;]+?)\s+(\w+);/g;
        let match;
        
        while ((match = fieldRegex.exec(classBody)) !== null) {
            const type = match[1].trim();
            const name = match[2];
            fields.push({ name, type });
        }

        // Also match regular field declarations (Type fieldName;)
        const regularFieldRegex = /^\s*([A-Z]\w*(?:<[^>]+>)?[?]?)\s+(\w+);/gm;
        
        while ((match = regularFieldRegex.exec(classBody)) !== null) {
            const type = match[1].trim();
            const name = match[2];
            
            // Skip if already found as late field
            if (!fields.some(f => f.name === name)) {
                fields.push({ name, type });
            }
        }
        
        return fields;
    }

    private addImports(content: string, className: string): string {
        const pubspecConfig = this.projectDetector.getPubspecConfig();
        const generatedPath = this.projectDetector.getGeneratedPath();
        const fileName = this.getFileNameFromClassName(className);
        
        const requiredImports = [
            `import 'package:${pubspecConfig?.name}/${generatedPath}/base/json_field.dart';`,
            `import 'package:${pubspecConfig?.name}/${generatedPath}/${fileName}.g.dart';`,
            `import 'dart:convert';`
        ];

        let newContent = content;
        
        // Find existing imports
        const importRegex = /^import\s+[^;]+;$/gm;
        const existingImports = content.match(importRegex) || [];
        
        // Add missing imports
        for (const requiredImport of requiredImports) {
            if (!existingImports.some(existing => existing.includes(requiredImport.split("'")[1]))) {
                // Find the position to insert import
                const lastImportMatch = [...content.matchAll(importRegex)];
                if (lastImportMatch.length > 0) {
                    const lastImport = lastImportMatch[lastImportMatch.length - 1];
                    const insertPosition = lastImport.index! + lastImport[0].length;
                    newContent = newContent.slice(0, insertPosition) + '\n' + requiredImport + newContent.slice(insertPosition);
                } else {
                    // No existing imports, add at the beginning
                    newContent = requiredImport + '\n\n' + newContent;
                }
            }
        }

        // Add export if not present
        const exportStatement = `export 'package:${pubspecConfig?.name}/${generatedPath}/${fileName}.g.dart';`;
        if (!newContent.includes(exportStatement)) {
            // Add export after imports
            const lastImportMatch = [...newContent.matchAll(importRegex)];
            if (lastImportMatch.length > 0) {
                const lastImport = lastImportMatch[lastImportMatch.length - 1];
                const insertPosition = lastImport.index! + lastImport[0].length;
                newContent = newContent.slice(0, insertPosition) + '\n' + exportStatement + newContent.slice(insertPosition);
            }
        }

        return newContent;
    }

    private getFileNameFromClassName(className: string): string {
        // Convert PascalCase to snake_case
        return className
            .replace(/([A-Z])/g, '_$1')
            .toLowerCase()
            .replace(/^_/, '')
            .replace(/_entity$/, '_entity');
    }
}
