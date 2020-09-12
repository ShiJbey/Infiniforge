import * as THREE from 'three';
import { GeometryData } from '../../modeling/GeometryData';
import { BladeCrossSection } from './BladeCrossSection';
import { CrossSection } from '../../modeling/CrossSection';

/**
 * Swords are the core of this API and manage information about
 * their 3D geometry
 */
export class BladeGeometry extends GeometryData{

    private _color?: THREE.Color;
    private _bladeEdgeVertices: number[];
    private _activeEdgeCurve?: THREE.Curve<THREE.Vector2>;

    /**
     * Creates an instance of sword
     *
     * @constructor
     */
    constructor() {
        super();
        this._bladeEdgeVertices = [];
    }

    setEdgeCurve(curve: THREE.Curve<THREE.Vector2>): this {
        this._activeEdgeCurve = curve;
        return this;
    }

    /**
     * Extrudes the active crossection along a given extrusion curve
     * while also modifying the edge vertices to match the given edge curve.
     *
     * @param extrusionCruve
     * @param edgeCurve
     * @param samplingResolution
     * @param height
     */
    extrudeSection(
        extrusionCruve: THREE.Curve<THREE.Vector2>,
        edgeCurve: THREE.Curve<THREE.Vector2>,
        samplingResolution: number,
        height: number,
        taper?: number): this {

        return this;
    }

    /**
     * Samples the active edge curve and sets the edge verts
     * of the active cross section accordingly
     *
     * @param samplePoint Nubmber from [0, 1] used to sample the curve
     */
    modifyEdgeVerts(samplePoint: number): this {
        if (this._activeCrossSection === undefined) {
            throw new Error("BladeGeometry does not have an active cross section");
        }

        if (this._activeEdgeCurve === undefined) {
            throw new Error("BladeGeometry does not have an active edge curve");
        }

        let desiredEdgeWidth = this._activeEdgeCurve.getPoint(samplePoint).x;

        for (let i = 0; i < this._activeCrossSection.getVertices().length; i++) {
            let vert = this._activeCrossSection.getVertices()[i];
            let currentEdgeWidth = Math.sqrt(Math.pow(vert.x, 2) + Math.pow(vert.z, 2));
        }

        return this;
    }

    /**
     * @override
     */
    setCrossSection(crossSection: CrossSection, color?: THREE.Color): this {
        super.setCrossSection(crossSection, color);
        return this;
    }
}
