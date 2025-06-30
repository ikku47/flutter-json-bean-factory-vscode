import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { PubspecConfig } from '../types';

export class FlutterProjectDetector {
    private _isFlutterProject: boolean | null = null;
    private _pubspecConfig: PubspecConfig | null = null;

    public isFlutterProject(): boolean {
        if (this._isFlutterProject === null) {
            this._isFlutterProject = this.detectFlutterProject();
        }
        return this._isFlutterProject;
    }

    public getPubspecConfig(): PubspecConfig | null {
        if (!this.isFlutterProject()) {
            return null;
        }

        if (this._pubspecConfig === null) {
            this._pubspecConfig = this.loadPubspecConfig();
        }
        return this._pubspecConfig;
    }

    public getWorkspaceRoot(): string | null {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return null;
        }
        return workspaceFolders[0].uri.fsPath;
    }

    public getLibPath(): string | null {
        const workspaceRoot = this.getWorkspaceRoot();
        if (!workspaceRoot) {
            return null;
        }
        
        const libPath = path.join(workspaceRoot, 'lib');
        if (fs.existsSync(libPath)) {
            return libPath;
        }
        return null;
    }

    public getGeneratedPath(): string {
        const config = this.getPubspecConfig();
        const userConfig = vscode.workspace.getConfiguration('flutter-json-bean-factory');
        
        // Priority: pubspec.yaml config > user settings > default
        return config?.generatedPath || 
               userConfig.get<string>('generatedPath') || 
               'generated/json';
    }

    private detectFlutterProject(): boolean {
        const workspaceRoot = this.getWorkspaceRoot();
        if (!workspaceRoot) {
            return false;
        }

        const pubspecPath = path.join(workspaceRoot, 'pubspec.yaml');
        if (!fs.existsSync(pubspecPath)) {
            return false;
        }

        try {
            const pubspecContent = fs.readFileSync(pubspecPath, 'utf8');
            const pubspec = yaml.parse(pubspecContent);
            
            // Check if it's a Flutter project
            return !!(pubspec.dependencies?.flutter || pubspec.dev_dependencies?.flutter);
        } catch (error) {
            console.error('Error reading pubspec.yaml:', error);
            return false;
        }
    }

    private loadPubspecConfig(): PubspecConfig | null {
        const workspaceRoot = this.getWorkspaceRoot();
        if (!workspaceRoot) {
            return null;
        }

        const pubspecPath = path.join(workspaceRoot, 'pubspec.yaml');
        try {
            const pubspecContent = fs.readFileSync(pubspecPath, 'utf8');
            const pubspec = yaml.parse(pubspecContent);
            
            return {
                name: pubspec.name || 'flutter_app',
                isFlutterModule: !!(pubspec.dependencies?.flutter || pubspec.dev_dependencies?.flutter),
                generatedPath: pubspec.flutter_json?.generated_path
            };
        } catch (error) {
            console.error('Error loading pubspec config:', error);
            return null;
        }
    }

    public refresh(): void {
        this._isFlutterProject = null;
        this._pubspecConfig = null;
    }
}
