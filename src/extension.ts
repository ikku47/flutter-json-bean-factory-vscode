import * as vscode from 'vscode';
import { GenerateFromJsonCommand } from './commands/generateFromJson';
import { GenerateHelperFilesCommand } from './commands/generateHelperFiles';
import { GenerateToFromJsonCommand } from './commands/generateToFromJson';
import { FlutterProjectDetector } from './utils/flutterProjectDetector';

export function activate(context: vscode.ExtensionContext) {
    console.log('Flutter JSON Bean Factory extension is now active!');

    // Initialize project detector
    const projectDetector = new FlutterProjectDetector();

    // Register commands
    const generateFromJsonCommand = new GenerateFromJsonCommand(projectDetector);
    const generateHelperFilesCommand = new GenerateHelperFilesCommand(projectDetector);
    const generateToFromJsonCommand = new GenerateToFromJsonCommand(projectDetector);

    // Register command handlers
    const disposables = [
        vscode.commands.registerCommand(
            'flutter-json-bean-factory.generateFromJson',
            (uri?: vscode.Uri) => generateFromJsonCommand.execute(uri)
        ),
        vscode.commands.registerCommand(
            'flutter-json-bean-factory.generateHelperFiles',
            () => generateHelperFilesCommand.execute()
        ),
        vscode.commands.registerCommand(
            'flutter-json-bean-factory.generateToFromJson',
            () => generateToFromJsonCommand.execute()
        )
    ];

    // Add all disposables to context
    disposables.forEach(disposable => context.subscriptions.push(disposable));

    // Show welcome message for Flutter projects
    if (projectDetector.isFlutterProject()) {
        vscode.window.showInformationMessage(
            'Flutter JSON Bean Factory is ready! Use Alt+J to generate helper files or right-click to generate from JSON.',
            'Learn More'
        ).then(selection => {
            if (selection === 'Learn More') {
                vscode.env.openExternal(vscode.Uri.parse('https://github.com/your-username/flutter-json-bean-factory-vscode'));
            }
        });
    }
}

export function deactivate() {
    console.log('Flutter JSON Bean Factory extension is now deactivated.');
}
