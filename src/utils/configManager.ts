import * as vscode from 'vscode';
import { FlutterJsonConfig } from '../types';

export class ConfigManager {
    private static readonly CONFIG_SECTION = 'flutter-json-bean-factory';

    public static getConfig(): FlutterJsonConfig {
        const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
        
        return {
            generatedPath: config.get<string>('generatedPath') || 'generated/json',
            modelSuffix: config.get<string>('modelSuffix') || 'Entity',
            enableNullSafety: config.get<boolean>('enableNullSafety') ?? true,
            generateCopyWith: config.get<boolean>('generateCopyWith') ?? true
        };
    }

    public static async updateConfig(key: keyof FlutterJsonConfig, value: any): Promise<void> {
        const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
        await config.update(key, value, vscode.ConfigurationTarget.Workspace);
    }

    public static onConfigurationChanged(callback: () => void): vscode.Disposable {
        return vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration(this.CONFIG_SECTION)) {
                callback();
            }
        });
    }
}
