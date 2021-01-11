import * as THREE from 'three';
import _ from 'lodash';
import { CrossSection } from './CrossSection';
import { GLTFExporter } from '../../lib/GLTFExporter';

/** Custom class for organizing/modifying 3D mesh information  */
export default class GeometryData {

    protected _vertices: THREE.Vector3[];

    protected _triangles: THREE.Vector3[];

    protected _colors: THREE.Color[];

    protected _activeColor: THREE.Color;

    protected _activeCrossSection?: CrossSection;

    constructor() {
        this._vertices = [];
        this._triangles = [];
        this._colors = [];
        this._activeColor = new THREE.Color();
    }

    /** Get Colors Array */
    getColors(): THREE.Color[] {
        return this._colors;
    }

    /** Get vertices Array */
    getVertices(): THREE.Vector3[] {
        return this._vertices;
    }

    /** Get Triangles Array */
    getTriangles(): THREE.Vector3[] {
        return this._triangles;
    }

    /** Combine the GeometryData objects */
    add(geometry: GeometryData): this {
        const vertsBeforeMerge: number = this._vertices.length;

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

    /** Get the cross section used during transformations */
    clearActiveCrossSection(): this {
        this._activeCrossSection = undefined;
        return this;
    }

    /** Set the current cross section of the geometry */
    setCrossSection(crossSection: CrossSection, color?: THREE.Color): this {
        if (color) { this.setColor(color); }

        this._activeCrossSection = crossSection;
        this._vertices.push(...crossSection.getVertices());
        for (let i = 0; i < crossSection.getVertices().length; i++) {
            this._colors[i] = this._activeColor.clone();
        }
        return this;
    }

    /** Set the vertex color for active cross section */
    setColor(color: THREE.Color): this {
        this._activeColor = color;
        return this;
    }

    /** Construct GeometryData object from threejs Geometry */
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

        // Add triangle face information
        for (let i = 0; i < geometry.faces.length; i++) {
            const face = geometry.faces[i];
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

    /** Fill the active cross-section */
    fill(): this {
        if (!this._activeCrossSection) {
            throw new Error("GeometryData does not have an active cross section to translate.");
        }

        // Construct a THREE.ShapeGeometry from the
        // points of the active cross-section
        const csShape = new THREE.Shape(this._activeCrossSection.getVerticesLocal());
        const geometry = new THREE.ShapeGeometry(csShape);

        // Create copies of vertices for sharp edges
        const verts = this._activeCrossSection.getVertices();

        const vertIdxs: number[] = _.range(
            this._vertices.length - verts.length,
            this._vertices.length);

        const newCrossSection = new CrossSection();

        // Push vertices into the _vertices array prior to the
        // current cross section
        for (let i = 0; i < verts.length; i++) {
            const v = verts[i].clone();
            newCrossSection.addVertex(v);
            this._vertices.push(v);
            this._colors.push(this._colors[vertIdxs[i]].clone());
        }

        newCrossSection.copyTransform(this._activeCrossSection);
        this._activeCrossSection = newCrossSection;


        // Copy the triangles data to this GeometryData object
        for (let i = 0; i < geometry.faces.length; i++) {
            const face = geometry.faces[i];
            this._triangles.push(new THREE.Vector3(vertIdxs[face.a], vertIdxs[face.b], vertIdxs[face.c]));
        }

        return this
    }

    /** Translate the active cross-section */
    translate(distance: THREE.Vector3 | number): this {
        if (!this._activeCrossSection) {
            throw new Error("GeometryData does not have an active cross section to translate.");
        }

        const translationVector: THREE.Vector3 = new THREE.Vector3();

        if (typeof(distance) === 'number') {
            translationVector.copy(this._activeCrossSection.getNorm().normalize());
            translationVector.multiplyScalar(distance);
        } else {
            translationVector.copy(distance);
        }

        this._activeCrossSection.translate(translationVector);

        return this;
    }

    /** Scale the active cross-section */
    scale(scaleFactor: THREE.Vector2 | number): this {
        if (!this._activeCrossSection) {
            throw new Error("GeometryData does not have an active cross section to scale");
        }
        this._activeCrossSection.scale(scaleFactor);
        return this;
    }

    /** Rotate the active cross-section */
    rotate(quaternion: THREE.Quaternion): this {
        if (!this._activeCrossSection) {
            throw new Error("GeometryData does not have an active cross section to rotate");
        }
        this._activeCrossSection.rotate(quaternion);
        return this;
    }

    /** Extrude the active cross section of a GeometryData object */
    extrude(direction: THREE.Vector3 | number): this {

        // Check that there is a cross section to extrude
        if (!this._activeCrossSection) {
            throw new Error("GeometryData does not have an active cross section to extrude");
        }

        const newCrossSection = new CrossSection();
        let translationVector: THREE.Vector3 = new THREE.Vector3();

        // Check the type of the direction variable
        if (typeof(direction) === 'object') {
            if (direction instanceof THREE.Vector3) {
                translationVector = direction;
            }
        } else if (typeof(direction) === 'number') {
            translationVector.copy(this._activeCrossSection.getNorm());
            translationVector.multiplyScalar(direction);
        }

        const previousVertIdxs: number[] = _.range(
            this._vertices.length - this._activeCrossSection.getVertices().length,
            this._vertices.length);

        const newVertIdxs: number[] = _.range(
            this._vertices.length,
            this._vertices.length + this._activeCrossSection.getVertices().length);

        // Add new set of vertices to the list
        for (let i = 0; i < previousVertIdxs.length; i++) {
            const vert = new THREE.Vector3();
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
            if (i === previousVertIdxs.length - 1) {
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

    /** Covert to GLTF data */
    toGlTF(verbose=false): Promise<any> {
        const gltfExporter = new GLTFExporter();

        // Parse the swords mesh and create a new promise to access the result
        return new Promise((resolve,) => {
            gltfExporter.parse(this.toMesh(), (gltf: any) => {
                resolve(gltf);
            }, {verbose});
        });
    }

    /** Convert to threejs Mesh */
    toMesh(): THREE.Mesh {
        if (this._vertices.length === 0) {
            throw new Error("Geometry data has no vertices");
        }

        const geometry = new THREE.BufferGeometry();

        const verts: number[] = [];
        for (let i = 0; i < this._vertices.length; i++) {
            verts.push(...this._vertices[i].toArray());
        }

        const tris: number[] = [];
        for (let i = 0; i < this._triangles.length; i++) {
            tris.push(...this._triangles[i].toArray());
        }

        const colors: number[] = [];
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

        const material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh( geometry, material );

        return mesh;
    }
}
