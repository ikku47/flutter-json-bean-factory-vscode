export interface FlutterJsonConfig {
    generatedPath: string;
    modelSuffix: string;
    enableNullSafety: boolean;
    generateCopyWith: boolean;
}

export interface PubspecConfig {
    name: string;
    isFlutterModule: boolean;
    generatedPath?: string;
}

export interface ClassDefinition {
    name: string;
    fields: { [key: string]: TypeDefinition };
    imports: string[];
}

export interface TypeDefinition {
    type: string;
    isNullable: boolean;
    isArray: boolean;
    arrayDepth: number;
    genericType?: string;
    isCustomClass: boolean;
    originalJsonKey?: string;
}

export interface CollectInfo {
    className: string;
    jsonString: string;
    modelSuffix: string;
    enableNullSafety: boolean;
    generateCopyWith: boolean;
}

export interface JsonInputResult {
    className: string;
    jsonString: string;
    cancelled: boolean;
}

export interface GeneratedFile {
    path: string;
    content: string;
    type: 'entity' | 'helper' | 'base';
}
