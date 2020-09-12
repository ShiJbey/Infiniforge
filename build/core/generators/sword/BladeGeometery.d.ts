import * as THREE from 'three';
import { GeometryData } from '../../modeling/GeometryData';
import { CrossSection } from '../../modeling/CrossSection';
export declare class BladeGeometry extends GeometryData {
    private _color?;
    private _bladeEdgeVertices;
    private _activeEdgeCurve?;
    constructor();
    setEdgeCurve(curve: THREE.Curve<THREE.Vector2>): this;
    extrudeSection(extrusionCruve: THREE.Curve<THREE.Vector2>, edgeCurve: THREE.Curve<THREE.Vector2>, samplingResolution: number, height: number, taper?: number): this;
    modifyEdgeVerts(samplePoint: number): this;
    setCrossSection(crossSection: CrossSection, color?: THREE.Color): this;
}
