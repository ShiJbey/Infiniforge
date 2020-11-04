import { CrossSection } from './CrossSection';
import * as THREE from 'three';
export declare class GeometryData {
    protected _vertices: THREE.Vector3[];
    protected _triangles: THREE.Vector3[];
    protected _colors: THREE.Color[];
    protected _activeColor: THREE.Color;
    protected _activeCrossSection?: CrossSection;
    constructor();
    getColors(): THREE.Color[];
    getVertices(): THREE.Vector3[];
    getTrianges(): THREE.Vector3[];
    add(geometry: GeometryData): this;
    clearActiveCrossSection(): this;
    setCrossSection(crossSection: CrossSection, color?: THREE.Color): this;
    setColor(color: THREE.Color): this;
    fromGeometry(geometry: THREE.Geometry, color?: THREE.Color): this;
    fill(): this;
    translate(distance: THREE.Vector3 | number): this;
    scale(scaleFactor: THREE.Vector2 | number): this;
    rotate(quaternion: THREE.Quaternion): this;
    extrude(direction: THREE.Vector3 | number): this;
    toGlTF(): Promise<any>;
    toMesh(): THREE.Mesh;
}
