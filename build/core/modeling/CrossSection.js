"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossSection = void 0;
const THREE = require("three");
const Y_AXIS = new THREE.Vector3(0, 1, 0);
class CrossSection {
    constructor(crossSectionData) {
        this._vertices = [];
        this._norm = Y_AXIS;
        this._rotation = new THREE.Quaternion();
        this._scale = new THREE.Vector3(1, 1, 1);
        this._translation = new THREE.Vector3(0, 0, 0);
        if (crossSectionData !== undefined) {
            if (crossSectionData.vertices.length % 2 !== 0) {
                throw new Error("Invalid number of vertex components in cross section");
            }
            for (let i = 0; i < crossSectionData.vertices.length - 1; i += 2) {
                this.addVertex(new THREE.Vector3(crossSectionData.vertices[i], 0, crossSectionData.vertices[i + 1]));
            }
        }
    }
    getVertices() {
        return this._vertices;
    }
    getNorm() {
        return this._norm;
    }
    addVertex(vertex) {
        this._vertices.push(vertex);
    }
    static createFromShape(shape) {
        let crossSection = new CrossSection();
        let geometry = new THREE.ShapeGeometry(shape);
        for (let i = 0; i < geometry.vertices.length; i++) {
            crossSection._vertices.push(geometry.vertices[i]);
        }
        return crossSection;
    }
    rotate(quaternion) {
        this._norm.applyQuaternion(quaternion);
        for (let i = 0; i < this._vertices.length; i++) {
            this._vertices[i].applyQuaternion(quaternion);
        }
    }
    extrude(direction, crossSection) {
    }
    scale(scaleFactor) {
        for (let i = 0; i < this._vertices.length; i++) {
            this._vertices[i].multiply(scaleFactor);
        }
    }
    translate(direction) {
        for (let i = 0; i < this._vertices.length; i++) {
            this._vertices[i].add(direction);
        }
    }
    fill() {
    }
}
exports.CrossSection = CrossSection;
//# sourceMappingURL=CrossSection.js.map