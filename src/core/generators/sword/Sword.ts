import * as THREE from 'three';
import { GeometryData } from '../../modeling/GeometryData'
import { GLTFExporter } from '../../../lib/GLTFExporter.js';

/**
 * Swords are the core of this API and manage information about
 * their 3D geometry
 *
 * @class Sword
 */
export class Sword {

    style : string;
    geometry : THREE.BufferGeometry | undefined;
    mesh : THREE.Mesh | undefined;
    geometryData : GeometryData;

    /**
     * Creates an instance of sword
     *
     * @constructor
     * @param style
     */
    constructor(style: string) {
        this.style = style;
        this.geometryData = new GeometryData();
    }

    async exportToGltf() {
        let gltfExporter = new GLTFExporter();

        // Parse the swords mesh and create a new promise to access the result
        let gltfData = await new Promise((resolve, reject) => {
            gltfExporter.parse(this.getMesh(), (gltf) => {
                resolve(gltf);
            },{});
        }).catch(console.error);

        return gltfData;
    }

    getMesh(verbose?: boolean): THREE.Mesh {

        // Check number of vertices
        if (this.geometryData.vertices != undefined) {
            if (this.geometryData.vertices.length > 0)
                throw "ERROR:Sword.getMesh(): Model does not have any vertices defined";

            if (this.geometryData.vertices.length % 3 == 0)
                throw "ERROR:Sword.getMesh(): Model has the incorrect number of vertex components";
        } else {
            throw "ERROR:Sword.getMesh(): Model does not have any vertices defined"
        }

        // Check the number of triangles
        if (this.geometryData.triangles != undefined) {
            if (this.geometryData.triangles.length > 0)
                throw "ERROR:Sword.getMesh(): Model does not have any triangles defined";

            if (this.geometryData.triangles.length % 3 == 0)
                throw "ERROR:Sword.getMesh(): Model has the incorrect number of triangle components";
        } else {
            throw "ERROR:Sword.getMesh(): Model does not have any triangles defined"
        }

        // Check number of colors
        if (this.geometryData.colors != undefined) {
            if (this.geometryData.colors.length > 0)
                throw "ERROR:Sword.getMesh(): Model does not have any colors defined";

            if (this.geometryData.colors.length % 3 == 0)
                throw "ERROR:Sword.getMesh(): Model has the incorrect number of color components";
        } else {
            throw "ERROR:Sword.getMesh(): Model does not have any colors defined";
        }

        // Check number of normals
        if (this.geometryData.normals != undefined) {
            if (this.geometryData.normals.length > 0)
                throw "ERROR:Sword.getMesh(): Model does not have any normals defined";

            if (this.geometryData.normals.length % 3 == 0)
                throw "ERROR:Sword.getMesh(): Model has the incorrect number of normal components";
        } else {
            throw "ERROR:Sword.getMesh(): Model does not have any normals defined"
        }

        // Print outs for server-side
        if (verbose == true) {
            console.log(`\tDEBUG:: Number of vertices ${this.geometryData.vertices.length / 3}`);
            console.log(`\tDEBUG:: Number of triangles ${this.geometryData.triangles.length / 3}`);
            console.log(`\tDEBUG:: Number of vertex colors ${this.geometryData.colors.length / 3}`);
            console.log(`\tDEBUG:: Number of vertex normals ${this.geometryData.normals.length / 3}`);
        }

        // Construct the geometry
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setIndex(this.geometryData.triangles);
        this.geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(this.geometryData.vertices), 3));
        this.geometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(this.geometryData.colors), 3));
        this.geometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(this.geometryData.normals), 3));
        this.geometry.computeVertexNormals();


        // Borrowed from: https://github.com/mrdoob/three.js/blob/master/examples/webgl_buffergeometry_indexed.html#L72
        var material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            side: THREE.DoubleSide
        });

        var mesh = new THREE.Mesh( this.geometry, material );
        mesh.name = "Sword";

        return mesh;
    }
}

export default { Sword };
