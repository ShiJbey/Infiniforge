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
    protected _transform: THREE.Matrix4;
    constructor(crossSectionData?: CrossSectionData);
    getVertices(): THREE.Vector3[];
    getNorm(): THREE.Vector3;
    getTranslation(): THREE.Vector3;
    getVerticesLocal(): THREE.Vector3[];
    setVertexLocal(index: number, pos: THREE.Vector3): void;
    scaleVertex(index: number, scaleFactor: number): void;
    copyTransform(crossSection: CrossSection): void;
    setTranslation(direction: THREE.Vector3): void;
    setNorm(norm: THREE.Vector3): void;
    addVertex(vertex: THREE.Vector3): void;
    static createFromShape(shape: THREE.Shape): CrossSection;
    rotate(quaternion: THREE.Quaternion): void;
    scale(scaleFactor: THREE.Vector2 | number): void;
    translate(direction: THREE.Vector3): void;
    fill(): void;
}
