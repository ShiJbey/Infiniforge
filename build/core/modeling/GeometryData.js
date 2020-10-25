"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeometryData = void 0;
const CrossSection_1 = require("./CrossSection");
const GLTFExporter_1 = require("../../lib/GLTFExporter");
const THREE = require("three");
const _ = require("lodash");
class GeometryData {
    constructor() {
        this._vertices = [];
        this._triangles = [];
        this._colors = [];
        this._activeColor = new THREE.Color();
    }
    getColors() {
        return this._colors;
    }
    getVertices() {
        return this._vertices;
    }
    getTrianges() {
        return this._triangles;
    }
    add(geometry) {
        let vertsBeforeMerge = this._vertices.length;
        this._vertices.push(...geometry._vertices);
        this._colors.push(...geometry._colors);
        for (let i = 0; i < geometry._triangles.length; i++) {
            this._triangles.push(new THREE.Vector3(geometry._triangles[i].x + vertsBeforeMerge, geometry._triangles[i].y + vertsBeforeMerge, geometry._triangles[i].z + vertsBeforeMerge));
        }
        return this;
    }
    clearActiveCrossSection() {
        this._activeCrossSection = undefined;
        return this;
    }
    setCrossSection(crossSection, color) {
        if (color) {
            this.setColor(color);
        }
        this._activeCrossSection = crossSection;
        this._vertices.push(...crossSection.getVertices());
        for (let i = 0; i < crossSection.getVertices().length; i++) {
            this._colors[i] = this._activeColor.clone();
        }
        return this;
    }
    setColor(color) {
        this._activeColor = color;
        return this;
    }
    fromGeometry(geometry, color) {
        this._vertices = [];
        this._colors = [];
        this._triangles = [];
        for (let i = 0; i < geometry.vertices.length; i++) {
            this._vertices.push(geometry.vertices[i]);
            if (color) {
                this._colors.push(color.clone());
            }
            else {
                this._colors.push(new THREE.Color());
            }
        }
        for (let i = 0; i < geometry.faces.length; i++) {
            let face = geometry.faces[i];
            this._triangles.push(new THREE.Vector3(face.a, face.b, face.c));
            if (color === undefined && face.vertexColors.length === 3) {
                this._colors[face.a] = (face.vertexColors[0].clone());
                this._colors[face.b] = (face.vertexColors[1].clone());
                this._colors[face.c] = (face.vertexColors[2].clone());
            }
        }
        this._activeCrossSection = undefined;
        return this;
    }
    translate(distance) {
        if (this._activeCrossSection == undefined) {
            throw new Error("GeometryData does not have an active cross section to translate.");
        }
        let translationVector = new THREE.Vector3();
        if (typeof (distance) == 'number') {
            translationVector.copy(this._activeCrossSection.getNorm().normalize());
            translationVector.multiplyScalar(distance);
        }
        else {
            translationVector.copy(distance);
        }
        this._activeCrossSection.translate(translationVector);
        return this;
    }
    scale(scaleFactor) {
        if (this._activeCrossSection == undefined) {
            throw new Error("GeometryData does not have an active cross section to scale");
        }
        this._activeCrossSection.scale(scaleFactor);
        return this;
    }
    rotate(quaternion) {
        if (this._activeCrossSection == undefined) {
            throw new Error("GeometryData does not have an active cross section to rotate");
        }
        this._activeCrossSection.rotate(quaternion);
        return this;
    }
    extrude(direction) {
        if (this._activeCrossSection == undefined) {
            throw new Error("GeometryData does not have an active cross section to extrude");
        }
        let newCrossSection = new CrossSection_1.CrossSection();
        let translationVector = new THREE.Vector3();
        if (typeof (direction) == 'object') {
            if (direction instanceof THREE.Vector3) {
                translationVector = direction;
            }
        }
        else {
            if (typeof (direction) == 'number') {
                translationVector.copy(this._activeCrossSection.getNorm());
                translationVector.multiplyScalar(direction);
            }
        }
        let previousVertIdxs = _.range(this._vertices.length - this._activeCrossSection.getVertices().length, this._vertices.length);
        let newVertIdxs = _.range(this._vertices.length, this._vertices.length + this._activeCrossSection.getVertices().length);
        for (let i = 0; i < previousVertIdxs.length; i++) {
            let vert = new THREE.Vector3();
            vert.copy(this._vertices[previousVertIdxs[i]]);
            vert.add(translationVector);
            this._vertices.push(vert);
            newCrossSection.addVertex(vert);
            this._colors.push(this._colors[previousVertIdxs[i]].clone());
        }
        newCrossSection.copyTransform(this._activeCrossSection);
        newCrossSection.setTranslation(newCrossSection.getTranslation().add(translationVector));
        this._activeCrossSection = newCrossSection;
        for (let i = 0; i < previousVertIdxs.length; i++) {
            if (i == previousVertIdxs.length - 1) {
                this._triangles.push(new THREE.Vector3(previousVertIdxs[i], previousVertIdxs[0], newVertIdxs[i]));
                this._triangles.push(new THREE.Vector3(newVertIdxs[i], previousVertIdxs[0], newVertIdxs[0]));
            }
            else {
                this._triangles.push(new THREE.Vector3(previousVertIdxs[i], previousVertIdxs[i + 1], newVertIdxs[i]));
                this._triangles.push(new THREE.Vector3(newVertIdxs[i], previousVertIdxs[i + 1], newVertIdxs[i + 1]));
            }
        }
        return this;
    }
    toGlTF() {
        let gltfExporter = new GLTFExporter_1.GLTFExporter();
        return new Promise((resolve, reject) => {
            gltfExporter.parse(this.toMesh(), (gltf) => {
                resolve(gltf);
            }, {});
        });
    }
    toMesh() {
        if (this._vertices.length === 0) {
            throw new Error("Geometry data has no vertices");
        }
        let geometry = new THREE.BufferGeometry;
        let verts = [];
        for (let i = 0; i < this._vertices.length; i++) {
            verts.push(...this._vertices[i].toArray());
        }
        let tris = [];
        for (let i = 0; i < this._triangles.length; i++) {
            tris.push(...this._triangles[i].toArray());
        }
        let colors = [];
        for (let i = 0; i < this._colors.length; i++) {
            colors.push(...this._colors[i].toArray());
        }
        geometry.setIndex(tris);
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
        geometry.computeVertexNormals();
        let material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            side: THREE.DoubleSide
        });
        let mesh = new THREE.Mesh(geometry, material);
        return mesh;
    }
}
exports.GeometryData = GeometryData;
//# sourceMappingURL=GeometryData.js.map