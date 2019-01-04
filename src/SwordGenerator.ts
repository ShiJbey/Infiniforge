/// <reference types="three" />
/// <reference types="seedrandom" />

import * as THREE from "three";
import * as seedrandom from "seedrandom";
import { BinaryData } from "fs";

/**
 * Output object used when extruding faces
 */
interface VerticesAndTriangles {
    vertices : number[];
    triangles : number[];
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
    public geometry : THREE.BufferGeometry;
    public triangles : number[];
    public vertices : number[];
    public colors : number[];
    public normals : number[];

    constructor(style: string) {
        this.style = style;
        this.geometry = new THREE.BufferGeometry();
        this.triangles = [];
        this.vertices = [];
        this.colors = [];
        this.normals = [];
    }

    export_to_gltf() {
        var options = {

        };

        this.geometry.setIndex(this.triangles);
        this.geometry.addAttribute('position', new THREE.BufferAttribute(this.vertices, 3));
        this.geometry.addAttribute('color', new THREE.BufferAttribute(this.colors, 3));
        this.geometry.addAttribute('normal', new THREE.BufferAttribute(this.normals, 3));

        // Borrowed from: https://github.com/mrdoob/three.js/blob/master/examples/webgl_buffergeometry_indexed.html#L72
        var material = new THREE.MeshPhongMaterial({
            specular: 0x111111, shininess: 250,
            side: THREE.DoubleSide, vertexColors: THREE.VertexColors
        });

        var mesh = new THREE.Mesh( this.geometry, material );

        var exporter = new THREE.GLTFExporter();

        return exporter.parse(mesh, (gltf) => {
            return gltf;
        }, options);
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
    generateSword(template : SwordTemplate, genParams : GenerationParameters) : Sword {
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
        sword.vertices.concat(SwordGenerator.createBladeCrossSection(template.baseWidth, fullerDepth, fullerWidth, genParams));

        // Extrude blade cross-section to full length with all the divisions present
        var generatedGeometry : VerticesAndTriangles = SwordGenerator.extrudeTopMultiple(sword.vertices, new THREE.Vector3(0.0, bladeLength/totalBladeDivs, 0.0), totalBladeDivs);
        // Add the vertices and triangles to the sword
        sword.vertices.concat(generatedGeometry.vertices);
        sword.triangles.concat(generatedGeometry.triangles);

        // Modify the vertices at each level to be a the desired heights
        var vertIndicesInLayers : number[][]= SwordGenerator.getAllVertsIndicesAsLayers(sword.vertices, totalBladeDivs, bladeLength);

        var baseSpaceLeft = baseSectionLength;
        var midSpaceLeft = midSectionLength;
        var tipSpaceLeft = tipSectionLength;

        // Modify the edges to make the blade look unique
        var leftEdgeVertIndices: number[] = SwordGenerator.getLeftEdgeVertIndices(sword.vertices, template.baseWidth);
        var rightEdgeVertIndices: number[] = SwordGenerator.getRightEdgeVertIndices(sword.vertices, template.baseWidth);
        sword.vertices = SwordGenerator.modifyEdgeWidth(this, sword.vertices, leftEdgeVertIndices, rightEdgeVertIndices, template.baseWidth, genParams.bladeWidthToleranceRatio);

        // Place a point at the tip of the blade
        var topFaceVertIndices: number[] = SwordGenerator.getTopVertIndices(sword.vertices);
        sword.vertices = SwordGenerator.createBladeTip(sword.vertices, topFaceVertIndices);


        var numVertices = 0;

        // Double check that we have the proper number of vertices
        if (sword.vertices.length % 3 == 0) {
            numVertices = sword.vertices.length  / 3;
        }
        else {
            throw "Incorrect number of vertex values"
        }

        // Modify the colors of the blade geometry
        for (var i = 0; i < numVertices; i++) {
            sword.colors.push(200);
            sword.colors.push(200);
            sword.colors.push(200);
        }

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

        // Append the vertices to the swords vertex array and add their indices to the vertex indices array
        var vertices = guardBufferGeometry.getAttribute("position");
        // Loop through all of the position attributes and add the XYZ values to the swords geometry
        for (var i = 0; i < vertices.count; i++) {
            sword.vertices.push(vertices.getX(i));
            sword.vertices.push(vertices.getY(i));
            sword.vertices.push(vertices.getZ(i));
        }

        // Append the vertices to the swords vertex array and add their indices to the vertex indices array
        var vertices = guardBufferGeometry.getAttribute("");
        // Loop through all of the position attributes and add the XYZ values to the swords geometry
        for (var i = 0; i < vertices.count; i++) {
            sword.vertices.push(vertices.getX(i));
            sword.vertices.push(vertices.getY(i));
            sword.vertices.push(vertices.getZ(i));
        }

        // Add a color for each vertex (Brown)
        for (var i = 0; i < vertices.count; i++) {
            sword.colors.push(112);
            sword.colors.push(82);
            sword.colors.push(0);
        }

        var triangles = guardBufferGeometry.getIndex();
        // Loop through all of the triangles and add the values to the swords geometry
        for (var i = 0; i < triangles.count; i++) {
            sword.vertices.push(vertices.getX(i));
            sword.vertices.push(vertices.getY(i));
            sword.vertices.push(vertices.getZ(i));
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

        // Append the vertices to the swords vertex array and add their indices to the vertex indices array
        var vertices = handleBufferGeometry.getAttribute("position");
        // Loop through all of the position attributes and add the XYZ values to the swords geometry
        for (var i = 0; i < vertices.count; i++) {
            sword.vertices.push(vertices.getX(i));
            sword.vertices.push(vertices.getY(i));
            sword.vertices.push(vertices.getZ(i));
        }

        // Append the vertices to the swords vertex array and add their indices to the vertex indices array
        var vertices = handleBufferGeometry.getAttribute("");
        // Loop through all of the position attributes and add the XYZ values to the swords geometry
        for (var i = 0; i < vertices.count; i++) {
            sword.vertices.push(vertices.getX(i));
            sword.vertices.push(vertices.getY(i));
            sword.vertices.push(vertices.getZ(i));
        }

        // Add a color for each vertex (Brown)
        for (var i = 0; i < vertices.count; i++) {
            sword.colors.push(112);
            sword.colors.push(82);
            sword.colors.push(0);
        }

        var triangles = handleBufferGeometry.getIndex();
        // Loop through all of the triangles and add the values to the swords geometry
        for (var i = 0; i < triangles.count; i++) {
            sword.vertices.push(vertices.getX(i));
            sword.vertices.push(vertices.getY(i));
            sword.vertices.push(vertices.getZ(i));
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

        // Append the vertices to the swords vertex array and add their indices to the vertex indices array
        var vertices = pommelBufferGeometry.getAttribute("position");
        // Loop through all of the position attributes and add the XYZ values to the swords geometry
        for (var i = 0; i < vertices.count; i++) {
            sword.vertices.push(vertices.getX(i));
            sword.vertices.push(vertices.getY(i));
            sword.vertices.push(vertices.getZ(i));
        }

        // Append the vertices to the swords vertex array and add their indices to the vertex indices array
        var vertices = pommelBufferGeometry.getAttribute("");
        // Loop through all of the position attributes and add the XYZ values to the swords geometry
        for (var i = 0; i < vertices.count; i++) {
            sword.vertices.push(vertices.getX(i));
            sword.vertices.push(vertices.getY(i));
            sword.vertices.push(vertices.getZ(i));
        }

        // Add a color for each vertex (Gold)
        for (var i = 0; i < vertices.count; i++) {
            sword.colors.push(225);
            sword.colors.push(200);
            sword.colors.push(90);
        }

        var triangles = pommelBufferGeometry.getIndex();
        // Loop through all of the triangles and add the values to the swords geometry
        for (var i = 0; i < triangles.count; i++) {
            sword.vertices.push(vertices.getX(i));
            sword.vertices.push(vertices.getY(i));
            sword.vertices.push(vertices.getZ(i));
        }

        return sword;
    }

    /**
     * Creates a cross section of the blade out of vertices
     * Given: The width of the blade, depth of the fuller, fuller width, and other parameters
     * Returns: The vertices outlineing the starting cross section of the blade
     * ## Note: At the moment all cross sections are created using 8 vertices
     */
    static createBladeCrossSection(bladeWidth : number, fullerDepth : number, fullerWidth : number, genParams : GenerationParameters) : number[] {
        var vertices = [];

        // Back side of the cross-section
        vertices.push(bladeWidth / -2.0);
        vertices.push(0.0);
        vertices.push(0.0);

        vertices.push(fullerWidth / -2.0);
        vertices.push(0.0);
        vertices.push(genParams.bladeThickness / 2.0);

        if (genParams.applyFuller) {
            vertices.push(0.0);
            vertices.push(0.0);
            vertices.push((genParams.bladeThickness / -2.0) + fullerDepth);
        }
        else {
            vertices.push(0.0);
            vertices.push(0.0);
            vertices.push(genParams.bladeThickness / -2.0);
        }

        vertices.push(fullerWidth / 2.0);
        vertices.push(0.0);
        vertices.push(genParams.bladeThickness / -2.0);

        vertices.push(bladeWidth / 2.0);
        vertices.push(0.0);
        vertices.push(0.0);

        // Front side of cross-section
        vertices.push(fullerWidth / 2.0);
        vertices.push(0.0);
        vertices.push(genParams.bladeThickness / 2.0);

        if (genParams.applyFuller) {
            vertices.push(0.0);
            vertices.push(0.0);
            vertices.push((genParams.bladeThickness / 2.0) - fullerDepth);
        }
        else {
            vertices.push(0.0);
            vertices.push(0.0);
            vertices.push(genParams.bladeThickness / 2.0);
        }

        vertices.push(fullerWidth / -2.0);
        vertices.push(0.0);
        vertices.push(genParams.bladeThickness / 2.0);

        return vertices;
    }

    /**
     * Extrudes a geometry by in a given direction n-number of
     * times (Where n = numRepeat) and returns the verts at the
     * top of the geometry
     * Given: All the vertices in the model, and a direction to extrude in, and a number of times to extrude
     * Returns: The new vertices and the triangles created during extrusion
     */
    static extrudeTopMultiple(vertices: number[], direction : THREE.Vector3, numRepeat : number) : VerticesAndTriangles {

        var generatedGeometry : VerticesAndTriangles;
        var bufferedVertices = vertices.slice();
        var bufferedTriangles : number[] = [];

        for (var i = 0; i < numRepeat; i++) {
            generatedGeometry = SwordGenerator.extrudeTop(bufferedVertices, direction);
            bufferedVertices.concat(generatedGeometry.vertices);
            bufferedTriangles.concat(generatedGeometry.triangles);
        }

        return { vertices: bufferedVertices, triangles: bufferedTriangles };
    }

    /**
     * Extrudes a geometry, from the top, in a given direction
     * Given: All the vertices in the model, and a direction to extrude in
     * Returns: The new vertices and the triangles created during extrusion
     * ## Note: Assumes that the top is a flat, horizontal face
     */
    static extrudeTop(vertices: number[], direction : THREE.Vector3) : VerticesAndTriangles {

        var topVertIndices : number[] = SwordGenerator.getTopVertIndices(vertices);

        var extrudedGeom : VerticesAndTriangles = SwordGenerator.extrudeFace(vertices, topVertIndices, direction);

        return extrudedGeom;
    }

    /**
     * Extrudes the face of a geometry in a specified direction
     * Given: All the vertices in the model, the indices to extrude, and the direction to extrude in
     * Returns: The new vertices and the triangles created during extrusion
     */
    static extrudeFace(vertices: number[], faceIndices : number[],  direction : THREE.Vector3) : VerticesAndTriangles {

        if (faceIndices.length == 0) {
            throw "No vertices given to extrude";
        }

        // Create the new vertices
        var numVertices = 0;

        // Double check that we have the proper number of vertices
        if (vertices.length % 3 == 0) {
            numVertices = vertices.length  / 3;
        }
        else {
            throw "Incorrect number of vertex values"
        }

        var priorVertCount = numVertices;
        var newVertexIndices: number[] = [];
        var newVertices : number[] = [];

        for (var i = 0; i < faceIndices.length; i++) {
            var oldVertexX = vertices[faceIndices[i] * 3];
            var oldVertexY = vertices[faceIndices[i] * 3 + 1];
            var oldVertexZ = vertices[faceIndices[i] * 3 + 2];

            var newVertexX = oldVertexX + direction.x;
            var newVertexY = oldVertexY + direction.y;
            var newVertexZ = oldVertexZ + direction.z;

            newVertices.push(newVertexX);
            newVertices.push(newVertexY);
            newVertices.push(newVertexZ);

            newVertexIndices.push(priorVertCount + i);
        }

        // Create new faces for the 3D mesh
        var i = 0;              // Index into the array of vertex indices on the extruded face
        var j = 0;              // Index into the array of indices for the new vertices created
        var newTriangles : number[] = [];  // Array of triangles created during extrusion

        while (i < faceIndices.length) {
            // On the last iteration we use 0 instead of i+1 or j+1
            if (i == faceIndices.length - 1) {
                // CW
                // Bottom-left triangle
                newTriangles.push(newVertexIndices[j]);
                newTriangles.push(faceIndices[0]);
                newTriangles.push(faceIndices[i]);

                // Top-right triangle
                newTriangles.push(newVertexIndices[0]);
                newTriangles.push(faceIndices[0]);
                newTriangles.push(newVertexIndices[j]);
            }
            // Otherwise all other sides are done the same
            else {
                // CW
                // Bottom-left triangle
                newTriangles.push(newVertexIndices[j]);
                newTriangles.push(faceIndices[i + 1]);
                newTriangles.push(faceIndices[i]);

                // Top-right triangle
                newTriangles.push(newVertexIndices[j + 1]);
                newTriangles.push(faceIndices[i + 1]);
                newTriangles.push(newVertexIndices[j]);
            }
            i++;
            j++;
        }

        return { vertices: newVertices, triangles: newTriangles };
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

