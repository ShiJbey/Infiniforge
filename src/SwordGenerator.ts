/// <reference types="three" />
/// <reference types="seedrandom" />
/// <reference types="three/three-gltfexporter" />

import * as THREE from "three";
import * as seedrandom from "seedrandom";
//import GLTFExporter from 'three-gltf-exporter';
import * as Assert from 'assert';
const GLTFExporter = require('../lib/GLTFExporter');
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
}

/**
 * Given a random number generator and a min and max value,
 * returns a random int that is in the range [min,max)
 */
function getRandomInt(rand : seedrandom.prng, min : number, max : number) : number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(rand() * (max - min)) + min;
}

/**
 * Given the x and y coordinates of two points in 2D space,
 * Returns the slope between the two points
 */
function getSlope(x1 : number,  y1 : number, x2 : number, y2 : number) : number {
    return (y2 - y1) / (x2 - x1);
}

/**
 * Swords are the weapon type that has an associated
 * stye and THREE geometry object
 */
export class Sword {

    public style : string;
    public geometry : THREE.BufferGeometry | undefined;
    public mesh : THREE.Mesh | undefined;
    public geometryData : GeometryData;

    constructor(style: string) {
        this.style = style;
        this.geometryData = new GeometryData();
    }

    export_to_gltf() : Promise<any> {

        // Check number of vertices
        if (this.geometryData.vertices != undefined) {
            Assert.notEqual(this.geometryData.vertices.length, 0, "ERROR:: Model does not have any vertices defined");
            Assert.equal(this.geometryData.vertices.length % 3, 0, "ERROR:: Model has the incorrect number of vertex components");
        } else {
            throw "ERROR:: Model does not have any vertices defined"
        }

        // Check the number of triangles
        if (this.geometryData.triangles != undefined) {
            Assert.notEqual(this.geometryData.triangles.length, "ERROR:: Model does not have any triangles defined");
            Assert.equal(this.geometryData.triangles.length % 3, 0, "ERROR:: Model has the incorrect number of triangle components");
        } else {
            throw "ERROR:: Model does not have any triangles defined"
        }

        // Check number of colors
        if (this.geometryData.colors != undefined) {
            Assert.notEqual(this.geometryData.colors.length, 0, "ERROR:: Model does not have any colors defined");
            Assert.equal(this.geometryData.colors.length % 3, 0, "ERROR:: Model has the incorrect number of color components");
        } else {
            throw "ERROR:: Model does not have any colors defined";
        }

        // Check number of normals
        if (this.geometryData.normals != undefined) {
            Assert.notEqual(this.geometryData.normals.length, 0, "ERROR:: Model does not have any normals defined");
            Assert.equal(this.geometryData.normals.length % 3, 0, "ERROR:: Model has the incorrect number of normal components");
        } else {
            throw "ERROR:: Model does not have any normals defined"
        }

        // Print outs for server-side
        console.log(`\tDEBUG:: Number of vertices ${this.geometryData.vertices.length / 3}`);
        console.log(`\tDEBUG:: Number of triangles ${this.geometryData.triangles.length / 3}`);
        console.log(`\tDEBUG:: Number of vertex colors ${this.geometryData.colors.length / 3}`);
        console.log(`\tDEBUG:: Number of vertex normals ${this.geometryData.normals.length / 3}`);

        // Construct the geometry
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setIndex(this.geometryData.triangles);
        this.geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(this.geometryData.vertices), 3));
        this.geometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(this.geometryData.colors), 3));
        this.geometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(this.geometryData.normals), 3));
        this.geometry.computeVertexNormals();

        // Borrowed from: https://github.com/mrdoob/three.js/blob/master/examples/webgl_buffergeometry_indexed.html#L72
        var material = new THREE.MeshStandardMaterial();
        var mesh = new THREE.Mesh( this.geometry, material );
        mesh.name = "Sword";

        var sword_exporter : any = new GLTFExporter();

        var options = {

        };

        return new Promise ((resolve, reject) => {
            sword_exporter.parse(mesh, (gltf : any) => {
                resolve(gltf);
            },
            options);
        });
    }

}

export interface SwordTemplate {
    style : string;
    baseWidth : number;
    widthMarginRatio : number;
    length : number;
}

export interface GenerationParameters {
    maxBaseDivs : number;
    maxMidDivs : number;
    maxTipDivs : number;
    bladeWidthToleranceRatio : number;
    bladeThickness : number;
    fullerWidthRatio : number;
    equalBaseDivs : boolean;
    equalMidDivs : boolean;
    equalTipDivs : boolean;
    bladeBaseProportion : number;
    bladeMidProportion : number;
    applyFuller : boolean;
}

export const DEFAULT_GEN_PARAMS : GenerationParameters = {
    maxBaseDivs: 3,
    maxMidDivs : 3,
    maxTipDivs : 3,
    bladeWidthToleranceRatio : 0.3,
    bladeThickness : 0.3,
    fullerWidthRatio : 0.5,
    equalBaseDivs : false,
    equalMidDivs : false,
    equalTipDivs : false,
    bladeBaseProportion : 0.5,
    bladeMidProportion : 0.5,
    applyFuller : true
}

/**
 * Factory class that produces instances of
 * swords using a set of parameters
 */
export class SwordGenerator {

    public seed : string;
    public randGenerator : seedrandom.prng;

    constructor(seed : string) {
        // The generator only cares about its own seed value and its random number generator
        this.seed = seed;
        this.randGenerator = (seed != '') ? seedrandom.default(seed) : seedrandom.default();
    }

    /**
     * The factory method of this class that returns a new sword
     * instance with procedurally generated blade geometry
     */
    generateSword(template : SwordTemplate, options : Object) : Sword {
        // Fill in any missing generation parameters with default values
        var genParams : GenerationParameters = Object.assign(options, DEFAULT_GEN_PARAMS);
        // Create a new sword Object
        var sword = new Sword(template.style);
        // Generate the vertices for each level
        this.buildBlade(template, genParams, sword);
        this.buildGuard(template, genParams, sword);
        this.buildHandle(template, genParams, sword);
        this.buildPommel(template, genParams, sword);

        return sword;
    }

    /**
     * Procedurally generates a sword blade and adds it to the swords geometry
     *
     */
    buildBlade(template : SwordTemplate, genParams : GenerationParameters, sword : Sword) : Sword {

        // Get the desired blade length
        var bladeLength = template.length;
        var fullerWidth = template.baseWidth * genParams.fullerWidthRatio;
        var fullerDepth = genParams.bladeThickness / 4;

        // Determine how many divisions each section has
        var numBaseDivs = getRandomInt(this.randGenerator, 1, genParams.maxBaseDivs + 1);
        var numMidDivs = getRandomInt(this.randGenerator, 1, genParams.maxMidDivs + 1);
        var numTipDivs = Math.floor(this.randGenerator() * genParams.maxTipDivs) + 1;
        var totalBladeDivs = numBaseDivs + numMidDivs + numTipDivs;

        // Determine how much of the blade length is allocated to each section
        var baseSectionLength = bladeLength * genParams.bladeBaseProportion;
        var midSectionLength = bladeLength * genParams.bladeMidProportion;
        var tipSectionLength = bladeLength * (1 - (genParams.bladeBaseProportion + genParams.bladeMidProportion));

        // Calculate how long equivalent divisions can be depending on the section
        var equalBaseDivLength = baseSectionLength / numBaseDivs;
        var equalMidDivLength = midSectionLength / numMidDivs;
        var equalTipDivLength = tipSectionLength / numTipDivs;

        // Create the blade cross section to start
        var crosssectionGeometry = SwordGenerator.createBladeCrossSection(template.baseWidth, fullerDepth, fullerWidth, genParams);
        sword.geometryData.vertices = sword.geometryData.vertices.concat(crosssectionGeometry.vertices);

        // Extrude blade cross-section to full length with all the divisions present
        var generatedGeometry = SwordGenerator.extrudeTopMultiple(sword.geometryData.vertices, new THREE.Vector3(0.0, bladeLength/totalBladeDivs, 0.0), totalBladeDivs);
        sword.geometryData.vertices = sword.geometryData.vertices.concat(generatedGeometry.vertices);
        sword.geometryData.triangles = sword.geometryData.triangles.concat(generatedGeometry.triangles);

        // Modify the vertices at each level to be a the desired heights
        var vertIndicesInLayers : number[][]= SwordGenerator.getAllVertsIndicesAsLayers(sword.geometryData.vertices, totalBladeDivs, bladeLength);

        var baseSpaceLeft = baseSectionLength;
        var midSpaceLeft = midSectionLength;
        var tipSpaceLeft = tipSectionLength;

        // Modify the edges to make the blade look unique
        var leftEdgeVertIndices: number[] = SwordGenerator.getLeftEdgeVertIndices(sword.geometryData.vertices, template.baseWidth);
        var rightEdgeVertIndices: number[] = SwordGenerator.getRightEdgeVertIndices(sword.geometryData.vertices, template.baseWidth);
        sword.geometryData.vertices = SwordGenerator.modifyEdgeWidth(this, sword.geometryData.vertices, leftEdgeVertIndices, rightEdgeVertIndices, template.baseWidth, genParams.bladeWidthToleranceRatio);

        // Place a point at the tip of the blade
        var topFaceVertIndices: number[] = SwordGenerator.getTopVertIndices(sword.geometryData.vertices);
        sword.geometryData.vertices = SwordGenerator.createBladeTip(sword.geometryData.vertices, topFaceVertIndices);

        // Check number of vertices
        Assert.notEqual(sword.geometryData.vertices.length, 0, "ERROR:: Model does not have any vertices defined");
        Assert.equal(sword.geometryData.vertices.length % 3, 0, "ERROR:: Model has the incorrect number of vertex components");

        // Check the number of triangles
        Assert.notEqual(sword.geometryData.triangles.length, "ERROR:: Model does not have any triangles defined");
        Assert.equal(sword.geometryData.triangles.length % 3, 0, "ERROR:: Model has the incorrect number of triangle components");

        // Add colors for the sword blade
        for (var i = 0; i < (sword.geometryData.vertices.length / 3); i++) {
            sword.geometryData.addColor(200, 200, 200);
        }

        // Check number of colors
        Assert.notEqual(sword.geometryData.colors.length, 0, "ERROR:: Model does not have any colors defined");
        Assert.equal(sword.geometryData.colors.length % 3, 0, "ERROR:: Model has the incorrect number of color components");

        // Add normals for the sword blade
        for (var i = 0; i < (sword.geometryData.vertices.length / 3); i++) {
            sword.geometryData.addNormal(1.0, 0.0, 0.0);
        }

        // Check number of normals
        Assert.notEqual(sword.geometryData.normals.length, 0, "ERROR:: Model does not have any normals defined");
        Assert.equal(sword.geometryData.normals.length % 3, 0, "ERROR:: Model has the incorrect number of normal components");

        return sword;
    }

    /**
     * Creates a box-shapped guard and merges it with the swords geometry.
     * Given: The geometry of the sword, and some parameters about
     *        the geometry of the sword
     * Returns: The Sword
     */
    buildGuard(template : SwordTemplate, genParams : GenerationParameters,
        sword : Sword,
        bladeWidth : number = 0.3,
        bladethickness : number = 0.3,
        guardThickness : number = 1.0,
        guardBladeRatio : number = 4.0) : Sword {

        // Create a simple box
        var guardGeometry = new THREE.BoxGeometry( guardBladeRatio * bladeWidth, .2, guardThickness);

        // Convert the box to a buffer geometry
        var guardBufferGeometry = new THREE.BufferGeometry().fromGeometry(guardGeometry);

        // Number of vertices in the model prior to appending this geometry
        var priorNumVertices = sword.geometryData.vertices.length / 3;

        // Append the vertices to the swords vertex array and add their indices to the vertex indices array
        var vertices = guardBufferGeometry.getAttribute("position");
        // Loop through all of the position attributes and add the XYZ values to the swords geometry
        for (var i = 0; i < vertices.count; i++) {
            sword.geometryData.addVertex(vertices.getX(i), vertices.getY(i), vertices.getZ(i));
        }

        // Append the vertices to the swords vertex array and add their indices to the vertex indices array
        var normals = guardBufferGeometry.getAttribute("normal");
        // Loop through all of the position attributes and add the XYZ values to the swords geometry
        for (var i = 0; i < vertices.count; i++) {
            sword.geometryData.addNormal(normals.getX(i), normals.getY(i), normals.getZ(i));
        }

        // Add a color for each vertex (Brown)
        for (var i = 0; i < vertices.count; i++) {
            sword.geometryData.addColor(112, 82, 0);
        }

        var triangles = guardBufferGeometry.getIndex();
        if (triangles != undefined) {
            // Loop through all of the triangles and add the values to the swords geometry
            for (var i = 0; i < triangles.count; i++) {
                sword.geometryData.addTriangle(triangles.getX(i), triangles.getY(i), triangles.getZ(i));
            }
        } else {
            // We need to add index values based on the vertices being added
            Assert.equal((vertices.length / 3) % 3, 0, "ERROR:: Verices are not organized into triangles");
            for (var i = 0; i < vertices.count;) {
                sword.geometryData.addTriangle(priorNumVertices + i, priorNumVertices + i + 1, priorNumVertices + i + 2);
                i += 3;
            }
        }


        return sword;
    }

    /**
     * Creates a cylindrical handle and merges it with the swords geometry.
     * Given: the geometry of the sword, and some parameters about
     *        the geometry of the sword
     * Returns: The Sword
     */
    buildHandle(template : SwordTemplate, genParams : GenerationParameters, sword: Sword, handleLength = 1.35, handleWidth = 0.1, numHands = 1) {
        // Create a simple cylinder
        var handleGeometry = new THREE.CylinderGeometry( handleWidth, handleWidth, handleLength, 8);

        // Moves translates the handle to fall below the guard and blade
        handleGeometry.translate(0,-handleLength / 2,0);

        // Convert the box to a buffer geometry
        var handleBufferGeometry = new THREE.BufferGeometry().fromGeometry(handleGeometry);

        // Number of vertices in the model prior to appending this geometry
        var priorNumVertices = sword.geometryData.vertices.length / 3;

        // Append the vertices to the swords vertex array and add their indices to the vertex indices array
        var vertices = handleBufferGeometry.getAttribute("position");
        // Loop through all of the position attributes and add the XYZ values to the swords geometry
        for (var i = 0; i < vertices.count; i++) {
            sword.geometryData.addVertex(vertices.getX(i), vertices.getY(i), vertices.getZ(i));
        }

        // Append the vertices to the swords vertex array and add their indices to the vertex indices array
        var normals = handleBufferGeometry.getAttribute("normal");
        // Loop through all of the position attributes and add the XYZ values to the swords geometry
        for (var i = 0; i < vertices.count; i++) {
            sword.geometryData.addNormal(normals.getX(i), normals.getY(i), normals.getZ(i));
        }

        // Add a color for each vertex (Brown)
        for (var i = 0; i < vertices.count; i++) {
            sword.geometryData.addColor(112, 82, 0);
        }

        var triangles = handleBufferGeometry.getIndex();
        if (triangles != undefined) {
            // Loop through all of the triangles and add the values to the swords geometry
            for (var i = 0; i < triangles.count; i++) {
                sword.geometryData.addTriangle(triangles.getX(i), triangles.getY(i), triangles.getZ(i));
            }
        } else {
            // We need to add index values based on the vertices being added
            Assert.equal((vertices.length / 3) % 3, 0, "ERROR:: Verices are not organized into triangles");
            for (var i = 0; i < vertices.count;) {
                sword.geometryData.addTriangle(priorNumVertices + i, priorNumVertices + i + 1, priorNumVertices + i + 2);
                i += 3;
            }
        }

        return sword;
    }

    /**
     * Creates a spherical pommel and merges it with the swords geometry.
     * Given: the geometry of the sword, and some parameters about
     *        the geometry of the sword
     * Returns: The Sword
     */
    buildPommel(template : SwordTemplate, genParams : GenerationParameters, sword: Sword, bladeWidth=0.6, handleLength = 1.35, pommelBladeWidthRatio = 0.50) : Sword {
        var pommelWidth = pommelBladeWidthRatio * bladeWidth;
        var pommelGeometry = new THREE.SphereGeometry(pommelWidth, 5, 4);
        // Translates the pommel to fall below the handle
        pommelGeometry.translate(0,-handleLength,0);

        // Convert the box to a buffer geometry
        var pommelBufferGeometry = new THREE.BufferGeometry().fromGeometry(pommelGeometry);

        // Number of vertices in the model prior to appending this geometry
        var priorNumVertices = sword.geometryData.vertices.length / 3;

        // Append the vertices to the swords vertex array and add their indices to the vertex indices array
        var vertices = pommelBufferGeometry.getAttribute("position");
        // Loop through all of the position attributes and add the XYZ values to the swords geometry
        for (var i = 0; i < vertices.count; i++) {
            sword.geometryData.addVertex(vertices.getX(i), vertices.getY(i), vertices.getZ(i));
        }

        // Append the vertices to the swords vertex array and add their indices to the vertex indices array
        var normals = pommelBufferGeometry.getAttribute("normal");
        // Loop through all of the position attributes and add the XYZ values to the swords geometry
        for (var i = 0; i < vertices.count; i++) {
            sword.geometryData.addNormal(normals.getX(i), normals.getY(i), normals.getZ(i));
        }

        // Add a color for each vertex (Gold)
        for (var i = 0; i < vertices.count; i++) {
            sword.geometryData.addColor(225, 200, 90);
        }

        var triangles = pommelBufferGeometry.getIndex();
        if (triangles != undefined) {
            // Loop through all of the triangles and add the values to the swords geometry
            for (var i = 0; i < triangles.count; i++) {
                sword.geometryData.addTriangle(triangles.getX(i), triangles.getY(i), triangles.getZ(i));
            }
        } else {
            // We need to add index values based on the vertices being added
            Assert.equal((vertices.length / 3) % 3, 0, "ERROR:: Verices are not organized into triangles");
            for (var i = 0; i < vertices.count;) {
                sword.geometryData.addTriangle(priorNumVertices + i, priorNumVertices + i + 1, priorNumVertices + i + 2);
                i += 3;
            }
        }

        return sword;
    }

    /**
     * Creates a cross section of the blade out of vertices
     * Given: The width of the blade, depth of the fuller, fuller width, and other parameters
     * Returns: The vertices outlineing the starting cross section of the blade
     * ## Note: At the moment all cross sections are created using 8 vertices
     */
    static createBladeCrossSection(bladeWidth : number, fullerDepth : number, fullerWidth : number, genParams : GenerationParameters) : GeometryData {

        var geometryData = new GeometryData();

        // Back side of the cross-section
        geometryData.addVertex(bladeWidth / -2.0, 0.0, 0.0);

        geometryData.addVertex(fullerWidth / -2.0, 0.0, genParams.bladeThickness / 2.0);

        if (genParams.applyFuller) {
            geometryData.addVertex(0.0, 0.0, (genParams.bladeThickness / -2.0) + fullerDepth);
        }
        else {
            geometryData.addVertex(0.0, 0.0, genParams.bladeThickness / -2.0);
        }

        geometryData.addVertex(fullerWidth / 2.0, 0.0, genParams.bladeThickness / -2.0);

        geometryData.addVertex(bladeWidth / 2.0, 0.0, 0.0);

        // Front side of cross-section
        geometryData.addVertex(fullerWidth / 2.0, 0.0, genParams.bladeThickness / 2.0);

        if (genParams.applyFuller) {
            geometryData.addVertex(0.0, 0.0, (genParams.bladeThickness / 2.0) - fullerDepth);
        }
        else {
            geometryData.addVertex(0.0, 0.0, genParams.bladeThickness / 2.0);
        }

        geometryData.addVertex(fullerWidth / -2.0, 0.0, genParams.bladeThickness / 2.0);


        // Check number of vertices
        if (geometryData.vertices != undefined) {
            Assert.notEqual(geometryData.vertices.length, 0, "ERROR:: Cross-Section has no vertices defined");
            Assert.equal(geometryData.vertices.length % 3, 0, "ERROR:: Cross-Section has the incorrect number of vertex components");
        } else {
            throw "ERROR:: No vertices added for cross section";
        }

        return geometryData;
    }

    /**
     * Extrudes a geometry by in a given direction n-number of
     * times (Where n = numRepeat) and returns the verts at the
     * top of the geometry
     * Given: All the vertices in the model, and a direction to extrude in, and a number of times to extrude
     * Returns: The new vertices and the triangles created during extrusion
     */
    static extrudeTopMultiple(vertices: number[], direction : THREE.Vector3, numRepeat : number) : GeometryData {

        var generatedGeometry = new GeometryData();

        for (var i = 0; i < numRepeat; i++) {
            var result : GeometryData = SwordGenerator.extrudeTop(vertices.slice(), direction);
            generatedGeometry.vertices = generatedGeometry.vertices.concat(result.vertices);
            generatedGeometry.triangles = generatedGeometry.vertices.concat(result.triangles);
        }

        return generatedGeometry;
    }

    /**
     * Extrudes a geometry, from the top, in a given direction
     * Given: All the vertices in the model, and a direction to extrude in
     * Returns: The new vertices and the triangles created during extrusion
     * ## Note: Assumes that the top is a flat, horizontal face
     */
    static extrudeTop(vertices: number[], direction : THREE.Vector3) : GeometryData {

        var topVertIndices : number[] = SwordGenerator.getTopVertIndices(vertices);

        var extrudedGeom : GeometryData = SwordGenerator.extrudeFace(vertices, topVertIndices, direction);

        return extrudedGeom;
    }

    /**
     * Extrudes the face of a geometry in a specified direction
     * Given: All the vertices in the model, the indices to extrude, and the direction to extrude in
     * Returns: The new vertices and the triangles created during extrusion
     */
    static extrudeFace(vertices: number[], faceIndices : number[],  direction : THREE.Vector3) : GeometryData {

        Assert.notEqual(vertices.length, 0, "ERROR:: No vertices provided");
        Assert.notEqual(faceIndices.length, 0, "ERROR:: No vertex indices given to extrude");
        Assert.equal(vertices.length % 3, 0, "ERROR:: Incorrect number of vertex components");


        var generatedGeometry = new GeometryData();

        var priorVertCount = vertices.length / 3;
        var newVertexIndices: number[] = [];

        for (var i = 0; i < faceIndices.length; i++) {
            var oldVertexX = vertices[faceIndices[i] * 3];
            var oldVertexY = vertices[faceIndices[i] * 3 + 1];
            var oldVertexZ = vertices[faceIndices[i] * 3 + 2];

            var newVertexX = oldVertexX + direction.x;
            var newVertexY = oldVertexY + direction.y;
            var newVertexZ = oldVertexZ + direction.z;

            generatedGeometry.addVertex(newVertexX, newVertexY, newVertexZ);

            newVertexIndices.push(priorVertCount + i);
        }

        // Create new faces for the 3D mesh
        var i = 0;              // Index into the array of vertex indices on the extruded face
        var j = 0;              // Index into the array of indices for the new vertices created

        while (i < faceIndices.length) {
            // On the last iteration we use 0 instead of i+1 or j+1
            if (i == faceIndices.length - 1) {
                // CW
                // Bottom-left triangle
                generatedGeometry.addTriangle(newVertexIndices[j], faceIndices[0], faceIndices[i]);

                // Top-right triangle
                generatedGeometry.addTriangle(newVertexIndices[0], faceIndices[0], newVertexIndices[j]);
            }
            // Otherwise all other sides are done the same
            else {
                // CW
                // Bottom-left triangle
                generatedGeometry.addTriangle(newVertexIndices[j], faceIndices[i + 1], faceIndices[i]);

                // Top-right triangle
                generatedGeometry.addTriangle(newVertexIndices[j + 1], faceIndices[i + 1], newVertexIndices[j]);
            }
            i++;
            j++;
        }

        return generatedGeometry;
    }

    /**
     * Modifies the vertices on the left and right edges of the sword blade.
     * Given: A sword generator, all the model vertices, the indices to the left and right edge vertices,
     *        the default blade with in the template, width tolerance, and whether to make edges symmetric
     * Returns: All the vertices in the model after being modified
     * ## NOTE: Currently, this only creates symmetrical blades
     */
    static modifyEdgeWidth(swordGenerator : SwordGenerator, vertices : number[], leftEdgeVertIndices : number[], rightEdgeVertIndices : number[], templateBladeWidth : number, widthToleranceRatio : number, symmetric=true) : number[] {
        // Rules:
        // The x-value of the vertices needs to be within
        // the tolerance ration with respect to templateBladeWidth / 2
        // Example: If the blade template has a width of .6 meters and
        //          the tolerance ratio is .1, then the x-values of the
        //          BladeEdgeVertices may not exceed
        //          .3 meters +/- .06 meters
        var minBladeWidth = templateBladeWidth - (widthToleranceRatio * templateBladeWidth);
        var maxBladeWidth = templateBladeWidth + (widthToleranceRatio * templateBladeWidth);
        var divisionWidth = templateBladeWidth;

        for (var i = 0; i < leftEdgeVertIndices.length; i++) {
            // Randomly generate a width for this section of the blade
            divisionWidth = templateBladeWidth + (swordGenerator.randGenerator() * (maxBladeWidth - minBladeWidth));
            vertices[leftEdgeVertIndices[i] * 3 + 0] = -(divisionWidth / 2);
        }

        for (var i = 0; i < rightEdgeVertIndices.length; i++) {
            if (!symmetric) {
                // Randomly generate a width for this section of the blade
                divisionWidth = templateBladeWidth + (swordGenerator.randGenerator() * (maxBladeWidth - minBladeWidth));
                vertices[rightEdgeVertIndices[i] * 3 + 0] = (divisionWidth / 2);
            }
            else if (i < leftEdgeVertIndices.length) {
                vertices[rightEdgeVertIndices[i] * 3 + 0] = -(vertices[leftEdgeVertIndices[i] * 3]);
            }
        }

        return vertices;
    }

    /**
     * Moves all the vertices at the top of the blade to the center, creating a point at the tip.
     * Given: all the vertices in the model and the indices of the vertices at the top
     * Returns: Ahe all the vertices
     */
    static createBladeTip(vertices : number[], topVertIndices : number[]) : number[] {

        for(var i = 0; i < topVertIndices.length; i++) {
            vertices[topVertIndices[i] * 3 + 0] = 0;
            vertices[topVertIndices[i] * 3 + 2] = 0;
        }

        return vertices;
    }

    /**
     * Given: all the vertices in the model, the number of subdivision in the blade, and the blade length
     * Returns: a 2D array of the vertex indices, where each row is one layer containing vertices all at the same height
     * ## Note: Assumes that all the blade divs are evenly spaced by 1 in the y-direction
     */
    static getAllVertsIndicesAsLayers(vertices : number[], numDivs : number, bladeLength: number) : number[][] {
        var vertexIndices = [];
        var numVertices = 0;

        // Double check that we have the proper number of vertices
        if (vertices.length % 3 == 0) {
            numVertices = vertices.length  / 3;
        }
        else {
            throw "Incorrect number of vertex values"
        }

        // Check the y-value of each of the vertices
        for (var i = 0; i < numDivs; i++) {
            var verticesInLayer = [];

            for (var j = 0; j < numVertices; j++) {
                if (vertices[j * 3 + 1] == i) {
                    verticesInLayer.push(j);
                }
            }

            vertexIndices.push(verticesInLayer);
        }

        return vertexIndices;
    }

    /**
     * Given: all the vertices in the model and (optionally) the model's height
     * Returns: the indices of the vertices that are at the highest layer
     *          in the geometry.
     * ## Note: Assumes the top is flat and level
     */
    static getTopVertIndices(vertices : number[], geomHeight? : number) : number[] {
        var topVertIndices = [];
        var numVertices = 0;

        // Double check that we have the proper number of vertices
        if (vertices.length % 3 == 0) {
            numVertices = vertices.length  / 3;
        }
        else {
            throw "Incorrect number of vertex values"
        }

        if (geomHeight != undefined) {

            // Height has been specified so we can just get those
            // verts and return
            for (var i = 0; i < numVertices; i++) {
                if (vertices[i * 3 + 1] == geomHeight) {
                    topVertIndices.push(i);
                }
            }
        }
        else {
            // Height is not specified, so we must find the height
            // then return the verts at that height

            var maxHeight = -1;
            var indexOfMax = -1;
            // Find the vertex with the greatest height
            for (var i = 0; i < numVertices; i++) {
                if (vertices[i * 3 + 1] > maxHeight) {
                    indexOfMax = i;
                    maxHeight = vertices[i * 3 + 1];
                }
            }
            // Get all vertices at the max height
            for (var i = 0; i < numVertices; i++) {
                if (vertices[i * 3 + 1] == maxHeight) {
                    topVertIndices.push(i);
                }
            }
        }

        return topVertIndices;
    }

    /**
     * Given: all the vertices in the model and the blade's width
     * Returns: the indices of the vertices located on the
     *          left edge of the blade
     */
    static getLeftEdgeVertIndices(vertices : number[], bladeWidth : number) : number[] {
        var leftEdgeIndices = [];
        var numVertices = 0;

        // Double check that we have the proper number of vertices
        if (vertices.length % 3 == 0) {
            numVertices = vertices.length  / 3;
        }
        else {
            throw "Incorrect number of vertex values"
        }

        for (var i = 0; i < numVertices; i++) {
            if (vertices[i * 3] == -bladeWidth / 2) {
                leftEdgeIndices.push(i);
            }
        }
        return leftEdgeIndices;
    }

    /**
     * Given: all the vertices in the model and the blade's width
     * Returns: the indices of the vertices located on the
     *          right edge of the blade
     */
    static getRightEdgeVertIndices(vertices : number[], bladeWidth : number) : number[] {
        var rightEdgeIndices = [];
        var numVertices = 0;

        // Double check that we have the proper number of vertices
        if (vertices.length % 3 == 0) {
            numVertices = vertices.length  / 3;
        }
        else {
            throw "Incorrect number of vertex values"
        }

        for (var i = 0; i < numVertices; i++) {
            if (vertices[i * 3] == bladeWidth / 2) {
                rightEdgeIndices.push(i);
            }
        }
        return rightEdgeIndices;
    }

}

