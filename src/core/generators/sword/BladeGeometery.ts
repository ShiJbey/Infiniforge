import * as THREE from 'three';
import GeometryData from '../../modeling/GeometryData';
import { CrossSection } from '../../modeling/CrossSection';

/**
 * Swords are the core of this API and manage information about
 * their 3D geometry
 */
export default class BladeGeometry extends GeometryData {

    static TIP_GEOMETRIES = ["standard", "rounded", "square", "clip"];

    private readonly _totalLength: number;

    private _currentLength: number;

    private _color?: THREE.Color;

    private _bladeEdgeVertices: number[];

    private _activeEdgeCurve?: THREE.Curve<THREE.Vector2>;

    private _extrusionCurve?: THREE.Curve<THREE.Vector2>;

    constructor(length: number, extrusionCurve?: THREE.Curve<THREE.Vector2>) {
        super();
        this._totalLength = length;
        this._currentLength = 0;
        this._bladeEdgeVertices = [];
        this._extrusionCurve = extrusionCurve;
    }

    /** Set the edge cureve for extrusion */
    setEdgeCurve(curve: THREE.Curve<THREE.Vector2>): this {
        this._activeEdgeCurve = curve;
        return this;
    }

    /** Extrudes the blade along the extrusion curve */
    extrude(distance: number): this {

        if (!this._activeCrossSection) {
            throw new Error("BladeGeometry does not have an active cross section");
        }

        if (!this._extrusionCurve) {
            super.extrude(distance);
            return this;
        }

        this._currentLength += distance;
        const t = this._currentLength / this._totalLength;

        super.extrude(distance);

        const extrusionPoint2D = this._extrusionCurve.getPoint(t).multiplyScalar(this._totalLength);
        const extrusionPoint3D = new THREE.Vector3(0, extrusionPoint2D.y, extrusionPoint2D.x);
        const crossSectionPos = this._activeCrossSection.getTranslation();
        const toExtrusionPoint = new THREE.Vector3().subVectors(extrusionPoint3D, crossSectionPos);

        this.translate(toExtrusionPoint);

        const extrusionNorm2D = this._extrusionCurve.getTangent(t);
        const extrusionNorm3D = new THREE.Vector3(0, extrusionNorm2D.y, extrusionNorm2D.x);
        const crossSectionNorm = this._activeCrossSection.getNorm().normalize();
        const rotateAngle = new THREE.Quaternion().setFromUnitVectors(crossSectionNorm, extrusionNorm3D);

        this.rotate(rotateAngle);

        return this;
    }

    /**
     * Extrude the active crossection along a given extrusion curve
     * while also modifying the edge vertices to match the given edge curve.
     */
    extrudeSection(
        edgeCurve: THREE.Curve<THREE.Vector2>,
        nSubdivisions: number,
        length: number,
        taper?: number | THREE.Vector2): this {

        this.setEdgeCurve(edgeCurve);

        // distance of each intermediate extrusion along the curve
        const sampleInterval = length / nSubdivisions;
        let taperInterval: number | THREE.Vector2 = 1;

        if (typeof(taper) === 'number') {
            taperInterval = 1 - (taper / nSubdivisions);
        } else if (taper instanceof THREE.Vector2) {
            taperInterval = new THREE.Vector2(1, 1).sub(taper?.divideScalar(nSubdivisions));
        }

        for (let i = 1; i <= nSubdivisions; i++) {
            this.extrude(sampleInterval);
            this.modifyEdgeVerts(sampleInterval * i / length);
            if (taper)
                this.scale(taperInterval);
        }

        return this;
    }

    /** Create tip at the end of the blade */
    createTip(style: string, length: number, nSubdivisions = 5): this {

        if (this._activeCrossSection === undefined) {
            throw new Error("BladeGeometry does not have an active cross section");
        }

        if (style === "standard") {
            this.extrude(length);
            this.scale(0);
            return this;
        }

        if (style === "rounded") {
            const tipCurve = new THREE.QuadraticBezierCurve(
                new THREE.Vector2(1, 0),
                new THREE.Vector2(0.7, 0.2),
                new THREE.Vector2(0, 1)
            );

            let subTotalHeight = 0;
            for (let i = 0; i < nSubdivisions; i++) {
                this.extrude(length / nSubdivisions);
                subTotalHeight += length / nSubdivisions;
                if (i === nSubdivisions - 1) {
                    this.scale(0);
                    continue;
                }

                this.scale(tipCurve.getPoint(subTotalHeight / length).x);
            }

            return this;
        }

        if (style === "square") {
            this.extrude(length);
            this.scale(new THREE.Vector2(0, 1));
            return this;
        }

        if (style === "clip") {
            this.extrude(length);
            this.rotate(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI/3));
            this.scale(new THREE.Vector2(0, 1));
            return this;
        }

        // standard tip
        this.extrude(length);
        this.scale(0);
        return this;
    }

    /**
     * Samples the active edge curve and sets the edge verts
     * of the active cross section accordingly
     *
     * @param samplePoint Number from [0, 1] used to sample the curve
     */
    modifyEdgeVerts(samplePoint: number): this {
        if (this._activeCrossSection === undefined) {
            throw new Error("BladeGeometry does not have an active cross section");
        }

        if (this._activeEdgeCurve === undefined) {
            throw new Error("BladeGeometry does not have an active edge curve");
        }

        const edgeScaleFactor = this._activeEdgeCurve.getPoint(samplePoint).x + 1;

        for (let i = 0; i < this._bladeEdgeVertices.length; i++) {
            this._activeCrossSection.scaleVertex(this._bladeEdgeVertices[i], edgeScaleFactor);
        }

        return this;
    }

    /** Set the cross section for the blade */
    setBladeCrossSection(crossSection: CrossSection, edgeVerts: number[], color?: THREE.Color, normEdges?: number[], duplicateVerts=false): this {
        if (!duplicateVerts) {
            super.setCrossSection(crossSection, color);
            this._bladeEdgeVertices = edgeVerts;
            return this;
        }

        // Array of duplicated vertices
        const dupedVerts: THREE.Vector3[] = [];
        const newEdgeVerts: number[] = [];

        // Loop through vers in original cross-section
        for (let i = 0; i < crossSection.getVertices().length; i++) {
            if (edgeVerts.includes(i)) {
                newEdgeVerts.push(dupedVerts.length);
                newEdgeVerts.push(dupedVerts.length + 1);
                dupedVerts.push(crossSection.getVertices()[i].clone());
            }
            else if (normEdges?.includes(i)) {
                dupedVerts.push(crossSection.getVertices()[i].clone());
            }
            dupedVerts.push(crossSection.getVertices()[i].clone());
        }

        // Convert the duplicated vertices to an array of numbers
        const verts: number[] = []
        for (let i = 0; i < dupedVerts.length; i++) {
            verts.push(dupedVerts[i].x);
            verts.push(dupedVerts[i].z);
        }

        const modifiedCrossSection = new CrossSection({
            vertices: verts
        });

        super.setCrossSection(modifiedCrossSection, color);
        this._bladeEdgeVertices = newEdgeVerts;
        return this;
    }
}
