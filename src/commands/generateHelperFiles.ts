import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { FlutterProjectDetector } from '../utils/flutterProjectDetector';
import { HelperFileGenerator } from '../generators/helperFileGenerator';

export class GenerateHelperFilesCommand {
    constructor(private projectDetector: FlutterProjectDetector) {}

    public async execute(): Promise<void> {
        try {
            // Check if it's a Flutter project
            if (!this.projectDetector.isFlutterProject()) {
                vscode.window.showErrorMessage(
                    'This is not a Flutter project. Please open a Flutter project to use this extension.'
                );
                return;
            }

            const libPath = this.projectDetector.getLibPath();
            if (!libPath) {
                vscode.window.showErrorMessage(
                    'Could not find lib directory in your Flutter project.'
                );
                return;
            }

            // Find all entity files
            const entityFiles = await this.findEntityFiles(libPath);
            
            if (entityFiles.length === 0) {
                vscode.window.showWarningMessage(
                    'No entity classes found. Create some entity classes first using "Generate Dart Bean Class from JSON".'
                );
                return;
            }

            // Generate helper files
            const generator = new HelperFileGenerator(this.projectDetector);
            const generatedFiles = await generator.generateHelperFiles(entityFiles);

            // Write files
            for (const file of generatedFiles) {
                await this.ensureDirectoryExists(path.dirname(file.path));
                await this.writeFile(file.path, file.content);
            }

            // Show success message
            vscode.window.showInformationMessage(
                `Generated ${generatedFiles.length} helper files successfully!`,
                'Show Files'
            ).then(selection => {
                if (selection === 'Show Files') {
                    const generatedPath = this.projectDetector.getGeneratedPath();
                    const fullPath = path.join(libPath, generatedPath);
                    vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(fullPath));
                }
            });

        } catch (error) {
            console.error('Error generating helper files:', error);
            vscode.window.showErrorMessage(
                `Error generating helper files: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    private async findEntityFiles(libPath: string): Promise<string[]> {
        const entityFiles: string[] = [];
        
        const findFiles = async (dir: string): Promise<void> => {
            const entries = await fs.promises.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory()) {
                    // Skip generated directories and common non-source directories
                    if (!entry.name.startsWith('.') && 
                        entry.name !== 'generated' && 
                        entry.name !== 'build') {
                        await findFiles(fullPath);
                    }
                } else if (entry.isFile() && entry.name.endsWith('.dart')) {
                    // Check if file contains entity classes
                    if (await this.isEntityFile(fullPath)) {
                        entityFiles.push(fullPath);
                    }
                }
            }
        };

        await findFiles(libPath);
        return entityFiles;
    }

    private async isEntityFile(filePath: string): Promise<boolean> {
        try {
            const content = await fs.promises.readFile(filePath, 'utf8');
            
            // Check for common patterns that indicate an entity file
            const patterns = [
                /class\s+\w+Entity\s*{/,
                /@JsonSerializable\(\)/,
                /\.fromJson\(/,
                /\.toJson\(/,
                /factory\s+\w+\.fromJson/
            ];

            return patterns.some(pattern => pattern.test(content));
        } catch (error) {
            console.error(`Error reading file ${filePath}:`, error);
            return false;
        }
    }

    private async ensureDirectoryExists(dirPath: string): Promise<void> {
        try {
            await fs.promises.access(dirPath);
        } catch {
            await fs.promises.mkdir(dirPath, { recursive: true });
        }
    }

    private async writeFile(filePath: string, content: string): Promise<void> {
        const uri = vscode.Uri.file(filePath);
        const encoder = new TextEncoder();
        await vscode.workspace.fs.writeFile(uri, encoder.encode(content));
    }
}
