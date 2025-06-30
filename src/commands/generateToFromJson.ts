import * as vscode from 'vscode';
import { FlutterProjectDetector } from '../utils/flutterProjectDetector';
import { ToFromJsonGenerator } from '../generators/toFromJsonGenerator';

export class GenerateToFromJsonCommand {
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

            // Get active editor
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage(
                    'Please open a Dart file to generate toJson/fromJson methods.'
                );
                return;
            }

            // Check if it's a Dart file
            if (editor.document.languageId !== 'dart') {
                vscode.window.showErrorMessage(
                    'This command only works with Dart files.'
                );
                return;
            }

            const document = editor.document;
            const content = document.getText();

            // Check if file contains a class
            const classMatch = content.match(/class\s+(\w+)\s*{/);
            if (!classMatch) {
                vscode.window.showErrorMessage(
                    'No class found in the current file.'
                );
                return;
            }

            const className = classMatch[1];

            // Generate toJson/fromJson methods
            const generator = new ToFromJsonGenerator(this.projectDetector);
            const updatedContent = await generator.generateToFromJsonMethods(content, className);

            if (updatedContent === content) {
                vscode.window.showInformationMessage(
                    'toJson/fromJson methods are already up to date.'
                );
                return;
            }

            // Apply changes to the document
            const edit = new vscode.WorkspaceEdit();
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(content.length)
            );
            edit.replace(document.uri, fullRange, updatedContent);

            const success = await vscode.workspace.applyEdit(edit);
            if (success) {
                await document.save();
                vscode.window.showInformationMessage(
                    `toJson/fromJson methods generated for class '${className}'!`
                );

                // Generate helper files
                await this.generateHelperFiles();
            } else {
                vscode.window.showErrorMessage(
                    'Failed to apply changes to the document.'
                );
            }

        } catch (error) {
            console.error('Error generating toJson/fromJson methods:', error);
            vscode.window.showErrorMessage(
                `Error generating methods: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
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
