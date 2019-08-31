/// <reference types="three" />

const assert = require('assert');
import * as THREE from 'three';
import { GeometryData } from './GeometryData'

/**
 * Swords are the core of this API and manage information about
 * their 3D geometry
 */
class Sword {

    style : string;
    geometry : THREE.BufferGeometry | undefined;
    mesh : THREE.Mesh | undefined;
    geometryData : GeometryData;

    constructor(style: string) {
        this.style = style;
        this.geometryData = new GeometryData();
    }

    getMesh(verbose?: boolean): THREE.Mesh {

        // Check number of vertices
        if (this.geometryData.vertices != undefined) {
            assert(this.geometryData.vertices.length > 0, "ERROR:Sword.getMesh(): Model does not have any vertices defined");
            assert(this.geometryData.vertices.length % 3 == 0, "ERROR:Sword.getMesh(): Model has the incorrect number of vertex components");
        } else {
            throw "ERROR:Sword.getMesh(): Model does not have any vertices defined"
        }

        // Check the number of triangles
        if (this.geometryData.triangles != undefined) {
            assert(this.geometryData.triangles.length > 0, "ERROR:Sword.getMesh(): Model does not have any triangles defined");
            assert(this.geometryData.triangles.length % 3 == 0, "ERROR:Sword.getMesh(): Model has the incorrect number of triangle components");
        } else {
            throw "ERROR:Sword.getMesh(): Model does not have any triangles defined"
        }

        // Check number of colors
        if (this.geometryData.colors != undefined) {
            assert(this.geometryData.colors.length > 0, "ERROR:Sword.getMesh(): Model does not have any colors defined");
            assert(this.geometryData.colors.length % 3 == 0, "ERROR:Sword.getMesh(): Model has the incorrect number of color components");
        } else {
            throw "ERROR:Sword.getMesh(): Model does not have any colors defined";
        }

        // Check number of normals
        if (this.geometryData.normals != undefined) {
            assert(this.geometryData.normals.length > 0, "ERROR:Sword.getMesh(): Model does not have any normals defined");
            assert(this.geometryData.normals.length % 3 == 0, "ERROR:Sword.getMesh(): Model has the incorrect number of normal components");
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
            vertexColors: THREE.VertexColors,
            side: THREE.DoubleSide
        });
        var mesh = new THREE.Mesh( this.geometry, material );
        mesh.name = "Sword";

        return mesh;
    }
}

export { Sword };