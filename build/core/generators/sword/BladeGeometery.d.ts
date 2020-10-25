import * as THREE from 'three';
import { GeometryData } from '../../modeling/GeometryData';
import { CrossSection } from '../../modeling/CrossSection';
export declare class BladeGeometry extends GeometryData {
    private readonly _totalLength;
    private _currentLength;
    private _color?;
    private _bladeEdgeVertices;
    private _activeEdgeCurve?;
    private _extrusionCurve?;
    constructor(length: number, extrusionCurve?: THREE.Curve<THREE.Vector2>);
    setEdgeCurve(curve: THREE.Curve<THREE.Vector2>): this;
    extrude(distance: number): this;
    extrudeSection(edgeCurve: THREE.Curve<THREE.Vector2>, nSubdivisions: number, length: number, taper?: number | THREE.Vector2): this;
    createTip(style: string, length: number, nSubdivisions?: number): this;
    modifyEdgeVerts(samplePoint: number): this;
    setBladeCrossSection(crossSection: CrossSection, edgeVerts: number[], color?: THREE.Color): this;
}
