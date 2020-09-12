import * as THREE from 'three';
export interface CrossSectionData {
    name?: string;
    vertices: number[];
}
export declare class CrossSection {
    protected _vertices: THREE.Vector3[];
    protected _norm: THREE.Vector3;
    protected _rotation: THREE.Quaternion;
    protected _scale: THREE.Vector3;
    protected _translation: THREE.Vector3;
    constructor(crossSectionData?: CrossSectionData);
    getVertices(): THREE.Vector3[];
    getNorm(): THREE.Vector3;
    addVertex(vertex: THREE.Vector3): void;
    static createFromShape(shape: THREE.Shape): CrossSection;
    rotate(quaternion: THREE.Quaternion): void;
    extrude(direction: THREE.Vector3, crossSection?: any): void;
    scale(scaleFactor: THREE.Vector3): void;
    translate(direction: THREE.Vector3): void;
    fill(): void;
}
