import * as THREE from 'three';
import { Vector3 } from 'three';

const Y_AXIS = new THREE.Vector3(0, 1, 0);

/**
 * Cross section data store the vertices
 * that can be used to create a CrossSection object
 */
export interface CrossSectionData {
    /**
     * Name of the cross section
     */
    name?: string;

    /**
     * (x,z) coordinates for vertices
     */
    vertices: number[];
}

/**
 * @class
 *
 * Cross sections are at the core of the modeling
 * procedure.
 */
export class CrossSection {

    protected _vertices: THREE.Vector3[];
    protected _norm: THREE.Vector3;
    protected _rotation: THREE.Quaternion;
    protected _scale: THREE.Vector3;
    protected _translation: THREE.Vector3;
    protected _transform: THREE.Matrix4;

    constructor(crossSectionData?: CrossSectionData) {
        this._vertices = [];
        this._norm = Y_AXIS.clone();
        this._rotation = new THREE.Quaternion();
        this._scale = new THREE.Vector3(1, 1, 1);
        this._translation = new THREE.Vector3(0, 0, 0);
        this._transform = new THREE.Matrix4().compose(this._translation, this._rotation, this._scale);


        if (crossSectionData !== undefined) {
            // Check the number of vertices
            if (crossSectionData.vertices.length % 2 !== 0) {
                throw new Error("Invalid number of vertex components in cross section");
            }
            // Add the vertices to the CrossSection
            for (let i = 0; i < crossSectionData.vertices.length - 1; i+= 2) {
                this.addVertex(new THREE.Vector3(
                    crossSectionData.vertices[i],
                    0,
                    crossSectionData.vertices[i + 1]));
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
        var verts: THREE.Vector3[] = [];

        for (let i = 0; i < this._vertices.length; i++) {

            // Get the position of the vertex in object space
            let objectVert = this._vertices[i];

            // Get position of the vert relative to the cross-section
            let localVert = objectVert.clone()
                .applyMatrix4(M_inverse);

            verts.push(localVert)
        }


        return verts;
    }

    setVertexLocal(index: number, pos: Vector3) {
        if (index < 0 || index > this._vertices.length) {
            throw new Error("Vertex index out of range");
        }

        // Calculate the transform matrix and its inverse
        let M = new THREE.Matrix4().compose(this._translation, this._rotation, this._scale);
        let M_inverse = new THREE.Matrix4().getInverse(M);

        // Get the vertex to modify
        let objectVert = this._vertices[index];

        // Get position of the vert relative to the cross-section
        let localVert = pos;

        localVert.applyMatrix4(M);

        objectVert.copy(localVert);
    }

    scaleVertex(index:number, scaleFactor: number) {
        if (index < 0 || index > this._vertices.length) {
            throw new Error("Vertex index out of range");
        }

        // Calculate the transform matrix and its inverse
        let M = new THREE.Matrix4().compose(this._translation, this._rotation, this._scale);
        let M_inverse = new THREE.Matrix4().getInverse(M);

        // Get the vertex to modify
        let objectVert = this._vertices[index];

        // Get position of the vert relative to the cross-section
        let localVert = objectVert.clone().applyMatrix4(M_inverse);

        // Scale the vertex
        localVert.multiplyScalar(scaleFactor);

        // Change the local vertex to object coordinates
        localVert.applyMatrix4(M);

        // Update the vertex coordinates
        objectVert.copy(localVert);

    }

    copyTransform(crossSection: CrossSection) {
        this._norm = crossSection._norm.clone();
        this._rotation = crossSection._rotation.clone();
        this._scale = crossSection._scale.clone();
        this._translation = crossSection._translation.clone();
    }

    setTranslation(direction: THREE.Vector3) {
        this._translation = direction;
    }

    setNorm(norm: THREE.Vector3) {
        this._norm = norm;
    }

    addVertex(vertex: THREE.Vector3) {
        this._vertices.push(vertex);
    }

    /**
     *
     * @param shape
     */
    static createFromShape(shape: THREE.Shape) {
        let crossSection = new CrossSection();

        // Create geometry from shape
        let geometry = new THREE.ShapeGeometry(shape);

        // Loop though the shape vertices and add
        // them to the new cross section
        for (let i = 0; i < geometry.vertices.length; i++) {
            crossSection._vertices.push(geometry.vertices[i]);
        }

        return crossSection;
    }

    rotate(quaternion: THREE.Quaternion) {

        // Calculate the transform matrix and its inverse
        let M = new THREE.Matrix4().compose(this._translation, this._rotation, this._scale);
        let M_inverse = new THREE.Matrix4().getInverse(M);

        this._rotation.multiply(quaternion);
        M = new THREE.Matrix4().compose(this._translation, this._rotation, this._scale);

        for (let i = 0; i < this._vertices.length; i++) {

            // Get the position of the vertex in object space
            let objectVert = this._vertices[i];

            // Get position of the vert relative to the cross-section
            let localVert = objectVert.clone()
                .applyMatrix4(M_inverse);



            // Apply the rotation then redo the transformation back
            // to object-space coordinates
            localVert
                .applyMatrix4(M);

            // Update the vertex coordinates
            objectVert.copy(localVert);
        }

        this._norm.applyQuaternion(quaternion);
    }

    /**
     * @param scaleFactor
     */
    scale(scaleFactor: THREE.Vector2 | number) {


        if (typeof scaleFactor === 'number') {
            scaleFactor = new THREE.Vector2(scaleFactor, scaleFactor);
        }

        // Calculate the transform matrix and its inverse
        let M = new THREE.Matrix4().compose(this._translation, this._rotation, this._scale);
        let M_inverse = new THREE.Matrix4().getInverse(M);

        for (let i = 0; i < this._vertices.length; i++) {
            // Get the position of the vertex in object space
            let objectVert = this._vertices[i];

            // Get position of the vert relative to the cross-section
            let localVert = new THREE.Vector3()
                .copy(objectVert)
                .applyMatrix4(M_inverse);

            // Scale up the x and z components
            localVert.x *= scaleFactor.x;
            localVert.z *= scaleFactor.y;

            // Convert the local vert back to object space
            localVert.applyMatrix4(M);

            // Set the positions of the objectVert
            objectVert.copy(localVert);
        }

        // Update the scale vector
        this._scale.multiply(new THREE.Vector3(scaleFactor.x, 1, scaleFactor.y));
    }

    /**
     * Moves face vertices in the given direction.
     *
     * @param direction
     */
    translate(direction: THREE.Vector3) {
        for (let i = 0; i < this._vertices.length; i++) {
            this._vertices[i].add(direction);
        }

        this._translation.add(direction);
    }

    /**
     * Fills the Cross section, making it a solid shape
     */
    public fill() {

    }
}
