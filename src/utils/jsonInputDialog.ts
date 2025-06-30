import * as vscode from 'vscode';
import { JsonInputResult } from '../types';

export class JsonInputDialog {
    public static async show(): Promise<JsonInputResult> {
        // Get class name
        const className = await vscode.window.showInputBox({
            prompt: 'Enter the class name for the Dart bean',
            placeHolder: 'e.g., User, Product, ApiResponse',
            validateInput: (value: string) => {
                if (!value || value.trim().length === 0) {
                    return 'Class name cannot be empty';
                }
                if (!/^[A-Z][a-zA-Z0-9]*$/.test(value.trim())) {
                    return 'Class name must start with uppercase letter and contain only letters and numbers';
                }
                return null;
            }
        });

        if (!className) {
            return { className: '', jsonString: '', cancelled: true };
        }

        // Get JSON string
        const jsonString = await vscode.window.showInputBox({
            prompt: 'Paste your JSON string here',
            placeHolder: '{"name": "John", "age": 30, "email": "john@example.com"}',
            validateInput: (value: string) => {
                if (!value || value.trim().length === 0) {
                    return 'JSON string cannot be empty';
                }
                try {
                    JSON.parse(value.trim());
                    return null;
                } catch (error) {
                    return 'Invalid JSON format. Please check your JSON syntax.';
                }
            }
        });

        if (!jsonString) {
            return { className: '', jsonString: '', cancelled: true };
        }

        return {
            className: className.trim(),
            jsonString: jsonString.trim(),
            cancelled: false
        };
    }

    public static async showMultilineJsonInput(): Promise<JsonInputResult> {
        // First get the class name
        const className = await vscode.window.showInputBox({
            prompt: 'Enter the class name for the Dart bean',
            placeHolder: 'e.g., User, Product, ApiResponse',
            validateInput: (value: string) => {
                if (!value || value.trim().length === 0) {
                    return 'Class name cannot be empty';
                }
                if (!/^[A-Z][a-zA-Z0-9]*$/.test(value.trim())) {
                    return 'Class name must start with uppercase letter and contain only letters and numbers';
                }
                return null;
            }
        });

        if (!className) {
            return { className: '', jsonString: '', cancelled: true };
        }

        // Create a new untitled document for JSON input
        const document = await vscode.workspace.openTextDocument({
            content: '{\n  "": ""\n}',
            language: 'json'
        });

        const editor = await vscode.window.showTextDocument(document);

        // Show information message
        const result = await vscode.window.showInformationMessage(
            `Please paste your JSON in the editor and click "Generate" when ready.`,
            { modal: false },
            'Generate',
            'Cancel'
        );

        if (result !== 'Generate') {
            await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
            return { className: '', jsonString: '', cancelled: true };
        }

        const jsonString = editor.document.getText();
        
        // Validate JSON
        try {
            JSON.parse(jsonString);
        } catch (error) {
            vscode.window.showErrorMessage('Invalid JSON format. Please check your JSON syntax.');
            return { className: '', jsonString: '', cancelled: true };
        }

        // Close the temporary document
        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');

        return {
            className: className.trim(),
            jsonString: jsonString.trim(),
            cancelled: false
        };
    }
}
