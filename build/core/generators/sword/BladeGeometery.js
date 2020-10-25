"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BladeGeometry = void 0;
const THREE = require("three");
const GeometryData_1 = require("../../modeling/GeometryData");
class BladeGeometry extends GeometryData_1.GeometryData {
    constructor(length, extrusionCurve) {
        super();
        this._totalLength = length;
        this._currentLength = 0;
        this._bladeEdgeVertices = [];
        this._extrusionCurve = extrusionCurve;
    }
    setEdgeCurve(curve) {
        this._activeEdgeCurve = curve;
        return this;
    }
    extrude(distance) {
        if (this._activeCrossSection === undefined) {
            throw new Error("BladeGeometry does not have an active cross section");
        }
        if (this._extrusionCurve === undefined) {
            super.extrude(distance);
            return this;
        }
        this._currentLength += distance;
        var t = this._currentLength / this._totalLength;
        super.extrude(distance);
        var extrusionPoint2D = this._extrusionCurve.getPoint(t).multiplyScalar(this._totalLength);
        var extrusionPoint3D = new THREE.Vector3(0, extrusionPoint2D.y, extrusionPoint2D.x);
        var crossSectionPos = this._activeCrossSection.getTranslation();
        var toExtrusionPoint = new THREE.Vector3().subVectors(extrusionPoint3D, crossSectionPos);
        this.translate(toExtrusionPoint);
        var extrusionNorm2D = this._extrusionCurve.getTangent(t);
        var extrusionNorm3D = new THREE.Vector3(0, extrusionNorm2D.y, extrusionNorm2D.x);
        var crossSectionNorm = this._activeCrossSection.getNorm().normalize();
        var rotateAngle = new THREE.Quaternion().setFromUnitVectors(crossSectionNorm, extrusionNorm3D);
        this.rotate(rotateAngle);
        return this;
    }
    extrudeSection(edgeCurve, nSubdivisions, length, taper) {
        this.setEdgeCurve(edgeCurve);
        var sampleInterval = length / nSubdivisions;
        var taperInterval = 1;
        if (typeof (taper) === 'number') {
            taperInterval = 1 - (taper / nSubdivisions);
        }
        else if (taper instanceof THREE.Vector2) {
            taperInterval = new THREE.Vector2(1, 1).sub(taper === null || taper === void 0 ? void 0 : taper.divideScalar(nSubdivisions));
        }
        for (let i = 1; i <= nSubdivisions; i++) {
            this.extrude(sampleInterval);
            this.modifyEdgeVerts(sampleInterval * i / length);
            if (taper)
                this.scale(taperInterval);
        }
        return this;
    }
    createTip(style, length, nSubdivisions = 5) {
        if (this._activeCrossSection === undefined) {
            throw new Error("BladeGeometry does not have an active cross section");
        }
        if (style === "standard") {
            this.extrude(length);
            this.scale(0);
        }
        else if (style === "rounded") {
            var tipCurve = new THREE.QuadraticBezierCurve(new THREE.Vector2(1, 0), new THREE.Vector2(0.7, 0.2), new THREE.Vector2(0, 1));
            var subTotalHeight = 0;
            for (let i = 0; i < nSubdivisions; i++) {
                this.extrude(length / nSubdivisions);
                subTotalHeight += length / nSubdivisions;
                if (i == nSubdivisions - 1) {
                    this.scale(0);
                    continue;
                }
                this.scale(tipCurve.getPoint(subTotalHeight / length).x);
            }
        }
        else if (style === "square") {
            this.extrude(length);
            this.scale(new THREE.Vector2(0, 1));
        }
        else if (style === "clip") {
            this.extrude(length);
            this.rotate(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 3));
            this.scale(new THREE.Vector2(0, 1));
        }
        return this;
    }
    modifyEdgeVerts(samplePoint) {
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
    setBladeCrossSection(crossSection, edgeVerts, color) {
        super.setCrossSection(crossSection, color);
        this._bladeEdgeVertices = edgeVerts;
        return this;
    }
}
exports.BladeGeometry = BladeGeometry;
//# sourceMappingURL=BladeGeometery.js.map