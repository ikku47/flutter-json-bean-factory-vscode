import * as vscode from 'vscode';
import * as path from 'path';
import { FlutterProjectDetector } from '../utils/flutterProjectDetector';
import { JsonInputDialog } from '../utils/jsonInputDialog';
import { ConfigManager } from '../utils/configManager';
import { ModelGenerator } from '../generators/modelGenerator';
import { CollectInfo } from '../types';

export class GenerateFromJsonCommand {
    constructor(private projectDetector: FlutterProjectDetector) {}

    public async execute(uri?: vscode.Uri): Promise<void> {
        try {
            // Check if it's a Flutter project
            if (!this.projectDetector.isFlutterProject()) {
                vscode.window.showErrorMessage(
                    'This is not a Flutter project. Please open a Flutter project to use this extension.'
                );
                return;
            }

            // Get target directory
            const targetDir = this.getTargetDirectory(uri);
            if (!targetDir) {
                vscode.window.showErrorMessage(
                    'Please select a folder within the lib directory of your Flutter project.'
                );
                return;
            }

            // Show JSON input dialog
            const inputResult = await JsonInputDialog.showMultilineJsonInput();
            if (inputResult.cancelled) {
                return;
            }

            // Get configuration
            const config = ConfigManager.getConfig();
            
            // Create collect info
            const collectInfo: CollectInfo = {
                className: inputResult.className,
                jsonString: inputResult.jsonString,
                modelSuffix: config.modelSuffix,
                enableNullSafety: config.enableNullSafety,
                generateCopyWith: config.generateCopyWith
            };

            // Generate model
            const generator = new ModelGenerator(this.projectDetector);
            const generatedFiles = await generator.generateFromJson(collectInfo, targetDir);

            // Write files
            for (const file of generatedFiles) {
                await this.writeFile(file.path, file.content);
            }

            // Show success message
            const fileName = `${inputResult.className.toLowerCase()}_entity.dart`;
            vscode.window.showInformationMessage(
                `Dart data class '${fileName}' generated successfully!`,
                'Open File'
            ).then(selection => {
                if (selection === 'Open File') {
                    const filePath = path.join(targetDir, fileName);
                    vscode.workspace.openTextDocument(filePath).then(doc => {
                        vscode.window.showTextDocument(doc);
                    });
                }
            });

            // Generate helper files
            await this.generateHelperFiles();

        } catch (error) {
            console.error('Error generating from JSON:', error);
            vscode.window.showErrorMessage(
                `Error generating Dart class: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    private getTargetDirectory(uri?: vscode.Uri): string | null {
        const libPath = this.projectDetector.getLibPath();
        if (!libPath) {
            return null;
        }

        if (uri && uri.fsPath) {
            // Check if the selected path is within lib directory
            if (uri.fsPath.startsWith(libPath)) {
                return uri.fsPath;
            }
        }

        // Default to lib directory
        return libPath;
    }

    private async writeFile(filePath: string, content: string): Promise<void> {
        const uri = vscode.Uri.file(filePath);
        const encoder = new TextEncoder();
        await vscode.workspace.fs.writeFile(uri, encoder.encode(content));
    }

    private async generateHelperFiles(): Promise<void> {
        try {
            const { GenerateHelperFilesCommand } = await import('./generateHelperFiles');
            const helperCommand = new GenerateHelperFilesCommand(this.projectDetector);
            await helperCommand.execute();
        } catch (error) {
            console.error('Error generating helper files:', error);
            // Don't show error to user as this is a secondary operation
        }
    }
}
