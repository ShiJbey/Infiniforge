/// <reference types="three" />
import * as THREE from 'three';

/**
 * Output object used when extruding faces or creating
 * additional geometry
 */
class GeometryData {

    vertices : number[];
    triangles : number[];
    colors : number[];
    normals : number[];

    constructor() {
        this.vertices = [];
        this.triangles = [];
        this.colors = [];
        this.normals = [];
    }

    addVertex(x: number, y: number, z:number) : void {
        this.vertices.push(x);
        this.vertices.push(y);
        this.vertices.push(z);
    }

    addTriangle(x: number, y: number, z:number) : void {
        this.triangles.push(x);
        this.triangles.push(y);
        this.triangles.push(z);
    }

    addColor(x: number, y: number, z:number) : void {
        this.colors.push(x);
        this.colors.push(y);
        this.colors.push(z);
    }

    addNormal(x: number, y: number, z:number) : void {
        this.normals.push(x);
        this.normals.push(y);
        this.normals.push(z);
    }

    getVertex(index: number) : [number, number, number] {
        if (index >= 0 && index  < this.vertices.length / 3.0) {
            return [this.vertices[index * 3], this.vertices[(index * 3) + 1], this.vertices[(index * 3) + 2]];
        } else {
            throw "ERROR:: Vertex index out of bounds";
        }
    }

    setVertexX(index: number, value: number) {
        if (index >= 0 && index  < this.vertices.length / 3.0) {
            this.vertices[index * 3] = value;
        } else {
            throw "ERROR:: Vertex index out of bounds";
        }
    }

    setVertexY(index: number, value: number) {
        if (index >= 0 && index  < this.vertices.length / 3.0) {
            this.vertices[index * 3 + 1] = value;
        } else {
            throw "ERROR:: Vertex index out of bounds";
        }
    }

    setVertexZ(index: number, value: number) {
        if (index >= 0 && index  < this.vertices.length / 3.0) {
            this.vertices[index * 3 + 2] = value;
        } else {
            throw "ERROR:: Vertex index out of bounds";
        }
    }

    toString(property: string) : string {
        property = property.toLocaleLowerCase();
        var property_array : number[] = [];

        if (property == "vertex" || property == "vertices") {
            property_array = this.vertices;
        } else if (property == "triangle" || property == "triangles") {
            property_array = this.triangles;
        } else if (property == "color" || property == "colors") {
            property_array = this.colors;
        } else if (property == "normal" || property == "normals") {
            property_array = this.normals;
        }

        var ret = "";
        var count = 0;
        for (var i = 0; i < property_array.length - 2; /*Increments in loop body*/) {
            ret = ret + ` (${count}) [${property_array[i]}, ${property_array[i + 1]}, ${property_array[i + 2]}]\n`;
            i += 3;
            count++;
        }
        return ret;
    }
}

/**
 * FaceData is used to keep track of the vertices on a face of
 * a geometry as well as the collective normal of that face
 */
class FaceData {

    private _vertices: number[];
    private _normal: THREE.Euler;

    constructor(vertices: number[], normal?: THREE.Euler) {
        this._vertices = vertices;
        this._normal = (normal) ? normal : new THREE.Euler(0, 1, 0);
    }

    get vertices(): number[] {
        return this._vertices;
    }

    set vertices(value: number[]) {
        this._vertices = value;
    }

    get normal(): THREE.Euler {
        return this._normal;
    }

    set normal(value: THREE.Euler) {
        this._normal = value;
    }

}

export { GeometryData, FaceData };