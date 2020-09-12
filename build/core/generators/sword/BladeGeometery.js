"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BladeGeometry = void 0;
const GeometryData_1 = require("../../modeling/GeometryData");
class BladeGeometry extends GeometryData_1.GeometryData {
    constructor() {
        super();
        this._bladeEdgeVertices = [];
    }
    setEdgeCurve(curve) {
        this._activeEdgeCurve = curve;
        return this;
    }
    extrudeSection(extrusionCruve, edgeCurve, samplingResolution, height, taper) {
        return this;
    }
    modifyEdgeVerts(samplePoint) {
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
    setCrossSection(crossSection, color) {
        super.setCrossSection(crossSection, color);
        return this;
    }
}
exports.BladeGeometry = BladeGeometry;
//# sourceMappingURL=BladeGeometery.js.map