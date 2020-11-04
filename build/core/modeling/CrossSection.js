"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossSection = void 0;
const THREE = require("three");
const Y_AXIS = new THREE.Vector3(0, 1, 0);
class CrossSection {
    constructor(crossSectionData) {
        this._vertices = [];
        this._norm = Y_AXIS.clone();
        this._rotation = new THREE.Quaternion();
        this._scale = new THREE.Vector3(1, 1, 1);
        this._translation = new THREE.Vector3(0, 0, 0);
        this._transform = new THREE.Matrix4().compose(this._translation, this._rotation, this._scale);
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
    getTranslation() {
        return this._translation;
    }
    getVerticesLocal() {
        var M = new THREE.Matrix4().compose(this._translation, this._rotation, this._scale);
        var M_inverse = new THREE.Matrix4().getInverse(M);
        var verts = [];
        for (let i = 0; i < this._vertices.length; i++) {
            let objectVert = this._vertices[i];
            let localVert = objectVert.clone()
                .applyMatrix4(M_inverse);
            verts.push(new THREE.Vector2(localVert.x, localVert.z));
        }
        return verts;
    }
    setVertexLocal(index, pos) {
        if (index < 0 || index > this._vertices.length) {
            throw new Error("Vertex index out of range");
        }
        let M = new THREE.Matrix4().compose(this._translation, this._rotation, this._scale);
        let M_inverse = new THREE.Matrix4().getInverse(M);
        let objectVert = this._vertices[index];
        let localVert = pos;
        localVert.applyMatrix4(M);
        objectVert.copy(localVert);
    }
    scaleVertex(index, scaleFactor) {
        if (index < 0 || index > this._vertices.length) {
            throw new Error("Vertex index out of range");
        }
        let M = new THREE.Matrix4().compose(this._translation, this._rotation, this._scale);
        let M_inverse = new THREE.Matrix4().getInverse(M);
        let objectVert = this._vertices[index];
        let localVert = objectVert.clone().applyMatrix4(M_inverse);
        localVert.multiplyScalar(scaleFactor);
        localVert.applyMatrix4(M);
        objectVert.copy(localVert);
    }
    copyTransform(crossSection) {
        this._norm = crossSection._norm.clone();
        this._rotation = crossSection._rotation.clone();
        this._scale = crossSection._scale.clone();
        this._translation = crossSection._translation.clone();
    }
    setTranslation(direction) {
        this._translation = direction;
    }
    setNorm(norm) {
        this._norm = norm;
    }
    addVertex(vertex) {
        this._vertices.push(vertex);
    }
    static createFromShape(shape) {
        let crossSection = new CrossSection();
        let geometry = new THREE.ShapeGeometry(shape);
        for (let i = 0; i < geometry.vertices.length; i++) {
            crossSection._vertices.push(new THREE.Vector3(geometry.vertices[i].x, 0, geometry.vertices[i].y));
        }
        return crossSection;
    }
    rotate(quaternion) {
        let M = new THREE.Matrix4().compose(this._translation, this._rotation, this._scale);
        let M_inverse = new THREE.Matrix4().getInverse(M);
        this._rotation.multiply(quaternion);
        M = new THREE.Matrix4().compose(this._translation, this._rotation, this._scale);
        for (let i = 0; i < this._vertices.length; i++) {
            let objectVert = this._vertices[i];
            let localVert = objectVert.clone()
                .applyMatrix4(M_inverse);
            localVert
                .applyMatrix4(M);
            objectVert.copy(localVert);
        }
        this._norm.applyQuaternion(quaternion);
    }
    scale(scaleFactor) {
        if (typeof scaleFactor === 'number') {
            scaleFactor = new THREE.Vector2(scaleFactor, scaleFactor);
        }
        let M = new THREE.Matrix4().compose(this._translation, this._rotation, this._scale);
        let M_inverse = new THREE.Matrix4().getInverse(M);
        for (let i = 0; i < this._vertices.length; i++) {
            let objectVert = this._vertices[i];
            let localVert = new THREE.Vector3()
                .copy(objectVert)
                .applyMatrix4(M_inverse);
            localVert.x *= scaleFactor.x;
            localVert.z *= scaleFactor.y;
            localVert.applyMatrix4(M);
            objectVert.copy(localVert);
        }
        this._scale.multiply(new THREE.Vector3(scaleFactor.x, 1, scaleFactor.y));
    }
    translate(direction) {
        for (let i = 0; i < this._vertices.length; i++) {
            this._vertices[i].add(direction);
        }
        this._translation.add(direction);
    }
}
exports.CrossSection = CrossSection;
//# sourceMappingURL=CrossSection.js.map