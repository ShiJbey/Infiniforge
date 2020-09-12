import * as THREE from 'three';

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

    constructor(crossSectionData?: CrossSectionData) {
        this._vertices = [];
        this._norm = Y_AXIS;
        this._rotation = new THREE.Quaternion();
        this._scale = new THREE.Vector3(1, 1, 1);
        this._translation = new THREE.Vector3(0, 0, 0);


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
        this._norm.applyQuaternion(quaternion);
        for (let i = 0; i < this._vertices.length; i++) {
            this._vertices[i].applyQuaternion(quaternion);
        }
    }

    /**
     * @note crossSection is not yet supported
     *
     * @param {THREE.Vector3} direction
     * @param {any} crossSection
     */
    extrude(direction: THREE.Vector3, crossSection?: any) {

    }

    /**
     * @param scaleFactor
     */
    scale(scaleFactor: THREE.Vector3) {
        for (let i = 0; i < this._vertices.length; i++) {
            this._vertices[i].multiply(scaleFactor);
        }
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
    }

    /**
     * Fills the Cross section, making it a solid shape
     */
    public fill() {
        // Pick a vertex

        // Connect it to all the others that it can see
    }
}
