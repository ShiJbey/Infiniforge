import { Object3D, AnimationClip } from "three";
export interface GLTFExporterOptions {
    binary?: boolean;
    trs?: boolean;
    onlyVisible?: boolean;
    truncateDrawRange?: boolean;
    embedImages?: boolean;
    animations?: AnimationClip[];
    forceIndices?: boolean;
    forcePowerOfTwoTextures?: boolean;
    includeCustomExtensions?: boolean;
    maxTextureSize?: number;
    verbose?: boolean;
}
export interface GLTFJSON {
    asset: {
        "version": string;
        "generator": string;
    };
    scenes?: GLTFScene[];
    scene?: number;
    nodes?: GLTFNode[];
    extensionsUsed?: string[];
    buffers?: {
        byteLength: number;
        uri: string;
    }[];
    bufferViews?: {
        buffer: number;
        byteOffset: number;
        target: number;
        byteStride: number;
    }[];
    accessors?: {
        bufferView: number;
        componentType: number;
        count: number;
        max: number[];
        min: number[];
        type: string;
    }[];
    materials?: {
        pbrMetallicRoughness?: {
            metallicFactor?: number;
            roughnessFactor?: number;
        };
        doubleSided: boolean;
    }[];
    meshes?: {
        primitives?: {
            mode?: number;
            attributes?: {
                POSITION?: number;
                COLOR_0?: number;
                NORMAL?: number;
            };
            indices: number;
            material: number;
        }[];
    }[];
}
export interface GLTFScene {
    name?: string;
    nodes?: number[];
    extras?: any;
    extensions?: any;
}
export interface GLTFMesh {
}
export interface GLTFNode {
    name?: string;
    rotation?: [number, number, number, number];
    translation?: [number, number, number];
    scale?: [number, number, number];
    matrx?: [
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number
    ];
    mesh?: number;
    children?: number[];
}
export declare class GLTFExporter {
    constructor();
    parse(input: Object3D, onDone: (gltf: object) => void, options: GLTFExporterOptions): void;
}
