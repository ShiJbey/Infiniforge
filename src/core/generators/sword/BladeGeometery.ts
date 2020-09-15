import * as THREE from 'three';
import { GeometryData } from '../../modeling/GeometryData';
import { BladeCrossSection } from './BladeCrossSection';
import { CrossSection } from '../../modeling/CrossSection';
import { sample } from 'lodash';

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
        nSubdivisions: number,
        length: number,
        taper?: number): this {

        this.setEdgeCurve(edgeCurve);

        // distance of each intermediate extrusion along the curve
        var sampleInterval = length / nSubdivisions;
        var taperInterval = 1;

        if (taper)
            var taperInterval = 1 - (taper / nSubdivisions);

        for (let i = 1; i <= nSubdivisions; i++) {
            this.extrude(sampleInterval);
            this.modifyEdgeVerts(sampleInterval * i / length);
            if (taper)
                this.scale(taperInterval);
        }

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

        let edgeScaleFactor = this._activeEdgeCurve.getPoint(samplePoint).x + 1;

        for (let i = 0; i < this._bladeEdgeVertices.length; i++) {
            this._activeCrossSection.scaleVertex(this._bladeEdgeVertices[i], edgeScaleFactor);
        }

        return this;
    }

    setBladeCrossSection(crossSection: CrossSection, edgeVerts: number[], color?: THREE.Color): this {
        super.setCrossSection(crossSection, color);
        this._bladeEdgeVertices = edgeVerts;
        return this;
    }
}
