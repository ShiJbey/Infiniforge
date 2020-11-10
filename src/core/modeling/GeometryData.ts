import { CrossSection } from './CrossSection';
import { GLTFExporter } from '../../lib/GLTFExporter';
import * as THREE from 'three';
import * as _ from 'lodash';

/**
 * Organizes and manages vertex information
 */
export class GeometryData {

    // References to vertices within the model
    protected _vertices: THREE.Vector3[];
    protected _triangles: THREE.Vector3[];
    protected _colors: THREE.Color[];

    protected _activeColor: THREE.Color;

    // CrossSection that will be modified by method calls
    protected _activeCrossSection?: CrossSection;

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

    /**
     * Combines the GeometryData objects
     * @param geometry
     */
    add(geometry: GeometryData): this {
        let vertsBeforeMerge: number = this._vertices.length;

        this._vertices.push(...geometry._vertices);
        this._colors.push(...geometry._colors);

        // Offset the values in the triangles array by the
        // number of vertices that already existed in the model
        for (let i = 0; i < geometry._triangles.length; i++) {
            this._triangles.push(new THREE.Vector3(
                geometry._triangles[i].x + vertsBeforeMerge,
                geometry._triangles[i].y + vertsBeforeMerge,
                geometry._triangles[i].z + vertsBeforeMerge,
            ));
        }

        return this;
    }

    clearActiveCrossSection(): this {
        this._activeCrossSection = undefined;
        return this;
    }

    setCrossSection(crossSection: CrossSection, color?: THREE.Color): this {
        if (color) { this.setColor(color); }

        this._activeCrossSection = crossSection;
        this._vertices.push(...crossSection.getVertices());
        for (let i = 0; i < crossSection.getVertices().length; i++) {
            this._colors[i] = this._activeColor.clone();
        }
        return this;
    }

    /**
     * Set the vertex color for active cross section
     *
     * @param color
     */
    setColor(color: THREE.Color): this {
        this._activeColor = color;
        return this;
    }

    fromGeometry(geometry: THREE.Geometry, color?: THREE.Color): this {
        this._vertices = [];
        this._colors = [];
        this._triangles = [];

        // Add vertices and default vertex colors
        for (let i = 0; i < geometry.vertices.length; i++) {
            this._vertices.push(geometry.vertices[i]);
            if (color) {
                this._colors.push(color.clone());
            } else {
                this._colors.push(new THREE.Color());
            }
        }

        // Add triangle face infomation
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

    fill(): this {
        // Check that there is a cross section to extrude
        if (this._activeCrossSection == undefined) {
            throw new Error("GeometryData does not have an active cross section to translate.");
        }

        // Construct a THREE.ShapeGeometry from the
        // points of the active cross-section
        let csShape = new THREE.Shape(this._activeCrossSection.getVerticesLocal());
        let geometry = new THREE.ShapeGeometry(csShape);

        // Create copies of vertices for sharp edges
        let verts = this._activeCrossSection.getVertices();

        let vertIdxs: number[] = _.range(
            this._vertices.length - verts.length,
            this._vertices.length);

        let newCrossSection = new CrossSection();

        // Push vertices into the _vertices array prior to the
        // current cross section
        for (let i = 0; i < verts.length; i++) {
            let v = verts[i].clone();
            newCrossSection.addVertex(v);
            this._vertices.push(v);
            this._colors.push(this._colors[vertIdxs[i]].clone());
        }

        newCrossSection.copyTransform(this._activeCrossSection);
        this._activeCrossSection = newCrossSection;


        // Copy the triangles data to this GeometryData object
        for (let i = 0; i < geometry.faces.length; i++) {
            let face = geometry.faces[i];
            this._triangles.push(new THREE.Vector3(vertIdxs[face.a], vertIdxs[face.b], vertIdxs[face.c]));
        }

        return this
    }

    translate(distance: THREE.Vector3 | number): this {

        // Check that there is a cross section to extrude
        if (this._activeCrossSection == undefined) {
            throw new Error("GeometryData does not have an active cross section to translate.");
        }

        let translationVector: THREE.Vector3 = new THREE.Vector3();

        if (typeof(distance) == 'number') {
            translationVector.copy(this._activeCrossSection.getNorm().normalize());
            translationVector.multiplyScalar(distance);
        } else {
            translationVector.copy(distance);
        }

        this._activeCrossSection.translate(translationVector);

        return this;
    }

    scale(scaleFactor: THREE.Vector2 | number): this {
        // Check that there is a cross section to extrude
        if (this._activeCrossSection == undefined) {
            throw new Error("GeometryData does not have an active cross section to scale");
        }
        this._activeCrossSection.scale(scaleFactor);
        return this;
    }

    rotate(quaternion: THREE.Quaternion): this {
        // Check that there is a cross section to extrude
        if (this._activeCrossSection == undefined) {
            throw new Error("GeometryData does not have an active cross section to rotate");
        }
        this._activeCrossSection.rotate(quaternion);
        return this;
    }

    /**
     * @description Extrudes the active cross section of a GeometryData object
     *
     * @note Quads are defined using clock-wise triangles
     *
     * @param direction
     */
    extrude(direction: THREE.Vector3 | number): this {

        // Check that there is a cross section to extrude
        if (this._activeCrossSection == undefined) {
            throw new Error("GeometryData does not have an active cross section to extrude");
        }

        let newCrossSection = new CrossSection();
        let translationVector: THREE.Vector3 = new THREE.Vector3();

        // Check the type of the direction variable
        if (typeof(direction) == 'object') {
            if (direction instanceof THREE.Vector3) {
                translationVector = direction;
            }
        } else {
            if (typeof(direction) == 'number') {
                translationVector.copy(this._activeCrossSection.getNorm());
                translationVector.multiplyScalar(direction);
            }
        }

        let previousVertIdxs: number[] = _.range(
            this._vertices.length - this._activeCrossSection.getVertices().length,
            this._vertices.length);

        let newVertIdxs: number[] = _.range(
            this._vertices.length,
            this._vertices.length + this._activeCrossSection.getVertices().length);

        // Add new set of vertices to the list
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


        // Create quads
        for (let i = 0; i < previousVertIdxs.length; i++) {
            if (i == previousVertIdxs.length - 1) {
                // Bottom-left triangle
                this._triangles.push(new THREE.Vector3(previousVertIdxs[i], previousVertIdxs[0], newVertIdxs[i]));
                // Top-right triangle
                this._triangles.push(new THREE.Vector3(newVertIdxs[i], previousVertIdxs[0], newVertIdxs[0]));
            } else {
                // Bottom-left triangle
                this._triangles.push(new THREE.Vector3(previousVertIdxs[i], previousVertIdxs[i + 1], newVertIdxs[i]));
                // Top-right triangle
                this._triangles.push(new THREE.Vector3(newVertIdxs[i], previousVertIdxs[i + 1], newVertIdxs[i + 1]));
            }
        }


        return this;
    }

    toGlTF(verbose=false): Promise<any> {
        let gltfExporter = new GLTFExporter();

        // Parse the swords mesh and create a new promise to access the result
        return new Promise((resolve, reject) => {
            gltfExporter.parse(this.toMesh(), (gltf: any) => {
                resolve(gltf);
            }, {verbose: verbose});
        });
    }

    toMesh(): THREE.Mesh {
        if (this._vertices.length === 0) {
            throw new Error("Geometry data has no vertices");
        }

        let geometry = new THREE.BufferGeometry;

        let verts: number[] = [];
        for (let i = 0; i < this._vertices.length; i++) {
            verts.push(...this._vertices[i].toArray());
        }

        let tris: number[] = [];
        for (let i = 0; i < this._triangles.length; i++) {
            tris.push(...this._triangles[i].toArray());
        }

        let colors: number[] = [];
        for (let i = 0; i < this._colors.length; i++) {
            colors.push(...this._colors[i].toArray());
        }

        geometry.setIndex(tris);
        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(new Float32Array(verts), 3));
        geometry.setAttribute(
            'color',
            new THREE.BufferAttribute(new Float32Array(colors), 3));

        geometry.computeVertexNormals();

        let material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            side: THREE.DoubleSide
        });

        let mesh = new THREE.Mesh( geometry, material );

        return mesh;
    }
}
