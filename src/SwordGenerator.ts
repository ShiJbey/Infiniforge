/// <reference types="three" />
/// <reference types="seedrandom" />
const assert = require('assert');
const _ = require('lodash');
import * as THREE from "three";
import { BladeCrossSection, SupportedCrossSections } from "./BladeCrossSections";
import { SwordTemplate } from "./SwordTemplates";
var seedrandom = require("seedrandom");

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

    getVertex(index: number) : number[] {
        if (index >= 0 && index  < this.vertices.length) {
            return [this.vertices[index * 3], this.vertices[(index * 3) + 1], this.vertices[(index * 3) + 2]];
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
 * Given a random number generator and a min and max value,
 * returns a random int that is in the range [min,max)
 */
function getRandomInt(rand : seedrandom.prng, min : number, max : number) : number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(rand() * (max - min)) + min;
}

/**
 * Given a random number generator and a min and max value,
 * returns a random float that is in the range [min,max)
 */
function getRandomFloat(rand : seedrandom.prng, min : number, max : number) : number {
    return rand() * (max - min) + min;
}

/**
 * Given the x and y coordinates of two points in 2D space,
 * Returns the slope between the two points
 */
function getSlope(x1 : number,  y1 : number, x2 : number, y2 : number) : number {
    return (y2 - y1) / (x2 - x1);
}

/**
 * Swords are the core of this API and manage information about
 * their 3D geometry
 */
export class Sword {

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

export interface GenerationParameters {
    maxBaseDivs : number;   // Number of vertices devoted to the base section of the blade
    maxMidDivs : number;    // Number of vertices devoted to the mid section of the blade
    maxTipDivs : number;    // Number of vertices devoted to the tip section of the blade
    minNumDivs : number;    // Minimum number of vertices devoted to any section of the blade
    minDivLength : number;  // Minimum vertical spacing between vertices on the edge of the blade based on
    bladeThickness : number;    // Thickness of the blade from one non-egde side to the other
    fullerWidthRatio : number;  // For cross sections with a fuller, this determines its width with relation to blade width
    equalBaseDivs : boolean;    // When true all vertices in the base section of the blade are spaced evenly
    equalMidDivs : boolean;     // When true all vertices in the mid section of the blade are spaced evenly
    equalTipDivs : boolean;     // When true all vertices in the tip section of the blade are spaced evenly
    bladeBaseProportion : number;   // Portion of the blade [0.1, 0.4] devoted to the base of the blade
    bladeMidProportion : number;    // Portion of the blade [0.1, 0.4] devoted to the middle of the blade
    bladeWidthToleranceRatio : number;  // What is the max pertubation of the edge of the blade from its default width
    // [Deprecated]
    applyFuller: boolean;
}

export const DEFAULT_GEN_PARAMS : GenerationParameters = {
    maxBaseDivs: 10,
    maxMidDivs : 5,
    maxTipDivs : 3,
    minNumDivs : 3,
    minDivLength: 0.01,
    bladeThickness : 0.1,
    fullerWidthRatio : 0.5,
    equalBaseDivs : false,
    equalMidDivs : false,
    equalTipDivs : true,
    bladeBaseProportion : 0.3,
    bladeMidProportion : 0.3,
    bladeWidthToleranceRatio: 0.1,
    // [Deprecated]
    applyFuller: true
}

/**
 * Factory class that produces instances of
 * swords using a set of parameters
 */
export class SwordGenerator {

    public seed : string;
    public randGenerator : seedrandom.prng;
    public verbose: boolean;


    constructor(verbose?: boolean) {
        // The generator only cares about its own seed value and its random number generator
        this.seed = ''
        this.randGenerator = seedrandom();
        if (verbose) {
            this.verbose = verbose;
        } else {
            this.verbose = false
        }
    }

    /**
     * Seeds the random number generator
     * with a new seed
     * @param seed
     */
    seedGenerator(seed?: string) {
        if (seed) {
            this.seed = seed;
        }
        this.randGenerator = (seed == undefined) ? seedrandom(seed) : seedrandom();
    }

    /**
     * Returns a new sword
     * instance with procedurally generated blade geometry
     * @param template
     * @param options
     * @param seed
     *
     * @return
     */
    generateSword(template: SwordTemplate, options: Object, seed: string) : Sword {
        // Reset the random number generator
        this.seedGenerator(seed);

        // Fill in any missing generation parameters with default values
        var genParams : GenerationParameters = Object.assign(options, DEFAULT_GEN_PARAMS);

        // Create a new sword Object
        var sword = new Sword(template.style);

        //Build each of the components of the blade
        this.buildBlade(template, genParams, sword);
        this.buildGuard(template, genParams, sword);
        this.buildHandle(template, genParams, sword);
        this.buildPommel(template, genParams, sword);

        return sword;
    }

    /**
     * Given a sword template, geration parameters, a sword,
     * Procedurally generates a sword blade and adds it to the swords geometry
     * @param template
     * @param genParams
     * @param sword
     * @returns
     */
    buildBlade(template : SwordTemplate, genParams : GenerationParameters, sword : Sword) : Sword {

        // Set the length of the blade
        var bladeLength = getRandomFloat(this.randGenerator, template.minBladeLength, template.maxBladeLength);
        bladeLength = Number.parseFloat(bladeLength.toFixed(2))

        // Determine how many divisions each section has
        var numBaseDivs = getRandomInt(this.randGenerator, genParams.minNumDivs, genParams.maxBaseDivs + 1);
        var numMidDivs = getRandomInt(this.randGenerator, genParams.minNumDivs, genParams.maxMidDivs + 1);
        var numTipDivs = getRandomInt(this.randGenerator, genParams.minNumDivs, genParams.maxTipDivs + 1);
        var totalBladeDivs = numBaseDivs + numMidDivs + numTipDivs;

        if (this.verbose) {
            console.log(`DEBUG:: Number of Base Divisions: ${numBaseDivs}`);
            console.log(`DEBUG:: Number of Mid Divisions: ${numMidDivs}`);
            console.log(`DEBUG:: Number of Tip Divisions: ${numTipDivs}`);
            console.log(`DEBUG:: Total number of Divisions: ${totalBladeDivs}`);
        }

        // Determine how much of the blade length is allocated to each section
        var baseSectionLength = bladeLength * genParams.bladeBaseProportion;
        baseSectionLength = Number.parseFloat(baseSectionLength.toFixed(2));

        var midSectionLength = bladeLength * genParams.bladeMidProportion;
        midSectionLength = Number.parseFloat(midSectionLength.toFixed(2));

        var tipSectionLength = bladeLength - (baseSectionLength + midSectionLength);
        tipSectionLength = Number.parseFloat(tipSectionLength.toFixed(2));

        if (this.verbose) {
            console.log(`DEBUG:: Base section length: ${baseSectionLength}`);
            console.log(`DEBUG:: Mid section length: ${midSectionLength}`);
            console.log(`DEBUG:: Tip section length: ${tipSectionLength}`);
            console.log(`DEBUG:: Total blade length: ${baseSectionLength + midSectionLength + tipSectionLength}`);
            console.log(`DEBUG:: Desired blade length: ${bladeLength}`);
        }

        // Calculate how long equivalent divisions can be depending on the section
        var equalBaseDivLength = baseSectionLength / numBaseDivs;
        var equalMidDivLength = midSectionLength / numMidDivs;
        var equalTipDivLength = tipSectionLength / numTipDivs;

        if (this.verbose) {
            console.log(`DEBUG:: Equal base div length: ${equalBaseDivLength}`);
            console.log(`DEBUG:: Equal Mid div length: ${equalMidDivLength}`);
            console.log(`DEBUG:: Equal Tip div length: ${equalTipDivLength}`);
        }

        // Create the blade cross section
        var result: [GeometryData, number[]];
        var crossSectionTypeIndex: number = getRandomInt(this.randGenerator, 0, Object.keys(SupportedCrossSections).length);
        var crossSectionTemplate: BladeCrossSection = (<any>SupportedCrossSections)[Object.keys(SupportedCrossSections)[crossSectionTypeIndex]];
        if (crossSectionTemplate == undefined) {
            throw new Error("SwordGenerator::buildBlade(): No cross section found.");
        }
        console.log(crossSectionTemplate.name);
        result = SwordGenerator.createBladeCrossSection(template, crossSectionTemplate, genParams);
        sword.geometryData.vertices = sword.geometryData.vertices.concat(result[0].vertices);

        var edgeVertices: number[][] = [];
        for (var i = 0; i < result[1].length; i++) {
            edgeVertices.push([result[1][i]]);
        }

        var topFaceVertIndices: number[] = _.range(0, sword.geometryData.vertices.length / 3);
        console.log(topFaceVertIndices);

        // Extrude blade cross-section to full length with all the divisions present
        for (var i = 0; i < totalBladeDivs; i++) {
            result = SwordGenerator.extrudeFace(sword.geometryData.vertices, topFaceVertIndices,  new THREE.Vector3(0.0, 1.0, 0.0));
            // Update the vertices and triangles in the model
            sword.geometryData.vertices = sword.geometryData.vertices.concat(result[0].vertices)
            sword.geometryData.triangles = sword.geometryData.triangles.concat(result[0].triangles);
            // Save the indices to the vertices at the top of the model
            topFaceVertIndices = result[1];
            // Update the arrays of edge vertex indices
            for (var edge = 0; edge < edgeVertices.length; edge++) {
                edgeVertices[edge].push(result[1][edgeVertices[edge][0]]);
            }
        }

        // var generatedGeometry = SwordGenerator.extrudeTopMultiple(sword.geometryData.vertices, new THREE.Vector3(0.0, 1.0, 0.0), totalBladeDivs);
        // sword.geometryData.vertices = sword.geometryData.vertices.concat(generatedGeometry.vertices);
        // sword.geometryData.triangles = sword.geometryData.triangles.concat(generatedGeometry.triangles);

        // Modify the vertices at each level to be a the desired heights
        var vertIndicesInLayers : number[][]= SwordGenerator.getAllVertsIndicesAsLayers(sword.geometryData.vertices, totalBladeDivs + 1, bladeLength);
        console.log(`Number of layers: ${vertIndicesInLayers.length}`);

        // // Modify the edges to make the blade look unique
        // var leftEdgeVertIndices: number[] = SwordGenerator.getLeftEdgeVertIndices(sword.geometryData.vertices, template.baseBladeWidth);
        // //console.log(`Left Edge Verts: ${leftEdgeVertIndices}`);
        // var rightEdgeVertIndices: number[] = SwordGenerator.getRightEdgeVertIndices(sword.geometryData.vertices, template.baseBladeWidth);
        // //console.log(`Right Edge Verts: ${rightEdgeVertIndices}`);
        // sword.geometryData.vertices = SwordGenerator.modifyEdgeWidth(this, sword.geometryData.vertices, leftEdgeVertIndices, rightEdgeVertIndices,
        //     template.baseBladeWidth, genParams.bladeWidthToleranceRatio, numBaseDivs, numMidDivs, numTipDivs);

        // // Modify the height of the divs so the total height matches the template Sets the base divs
        // if (genParams.equalBaseDivs) {
        //     // Change the y direction of the first n-layers (n = numBaseDivs)
        //     for (var divIndex = 1; divIndex <= numBaseDivs; divIndex++) {
        //         for(var i = 0; i < vertIndicesInLayers[divIndex].length; i++) {
        //             sword.geometryData.vertices[vertIndicesInLayers[divIndex][i] * 3 + 1] = equalBaseDivLength * divIndex;
        //         }
        //     }
        // } else {
        //     // Space left to work with in this div
        //     var spaceLeft = baseSectionLength;

        //     // Loop through each level in the division
        //     // NOTE:: The first layer is skipped since we need the y values at zero
        //     for (var divIndex = 1; divIndex <= numBaseDivs; divIndex++) {

        //         if (divIndex == numBaseDivs) {
        //             // This is the last layer so we set the verts to be at
        //             // the max height of the div
        //             for (var i = 0; i < vertIndicesInLayers[divIndex].length; i++) {
        //                 sword.geometryData.vertices[vertIndicesInLayers[divIndex][i] * 3 + 1] = baseSectionLength;
        //             }

        //         } else {
        //             // randomly determine a height and modify the verts
        //             var minDivLength = equalBaseDivLength * 0.5;
        //             var maxDivLength = spaceLeft - (minDivLength * (numBaseDivs - divIndex));
        //             var divLength =  getRandomFloat(this.randGenerator, minDivLength, maxDivLength);

        //             // Change y value for all verts at this level
        //             for(var i = 0; i < vertIndicesInLayers[divIndex].length; i++) {
        //                 sword.geometryData.vertices[vertIndicesInLayers[divIndex][i] * 3 + 1] = divLength + (baseSectionLength - spaceLeft);
        //             }

        //             spaceLeft = spaceLeft - divLength;
        //         }
        //     }
        // }


        // if (genParams.equalMidDivs) {
        //     for (var divIndex = numBaseDivs + 1; divIndex <= numBaseDivs + numMidDivs; divIndex++) {
        //         for(var i = 0; i < vertIndicesInLayers[divIndex].length; i++) {
        //             sword.geometryData.vertices[vertIndicesInLayers[divIndex][i] * 3 + 1] = (equalMidDivLength * Math.abs(divIndex - (numBaseDivs))) + baseSectionLength;
        //         };
        //     }
        // } else {
        //     // We need to loop through each layer in the base and set the height
        //     // Space left to work with in this div
        //     var spaceLeft = midSectionLength;

        //     // Loop through each level in the division
        //     for (var divIndex = numBaseDivs + 1; divIndex <= numBaseDivs + numMidDivs; divIndex++) {

        //         if (divIndex == (numBaseDivs + numMidDivs)) {
        //             // This is the last layer so we set thhe verts to be at
        //             // the max height of the div
        //             for (var i = 0; i < vertIndicesInLayers[divIndex].length; i++) {
        //                 sword.geometryData.vertices[vertIndicesInLayers[divIndex][i] * 3 + 1] = baseSectionLength + midSectionLength;
        //             }
        //             break;
        //         } else {
        //             // randomly determine a height and modify the verts
        //             var minDivLength = equalMidDivLength * 0.5;
        //             var maxDivLength = spaceLeft - (minDivLength * (numMidDivs - Math.abs(divIndex - (numBaseDivs))));
        //             var divLength =  getRandomFloat(this.randGenerator, minDivLength, maxDivLength);

        //             // Change y value for all verts at this level
        //             for (var i = 0; i < vertIndicesInLayers[divIndex].length; i++) {
        //                 sword.geometryData.vertices[vertIndicesInLayers[divIndex][i] * 3 + 1] = divLength + (midSectionLength - spaceLeft) + baseSectionLength;
        //             }

        //             spaceLeft = spaceLeft - divLength;
        //         }
        //     }
        // }


        // if (genParams.equalTipDivs) {
        //     for (var divIndex = numBaseDivs + numMidDivs + 1; divIndex <= totalBladeDivs; divIndex++) {
        //         for(var i = 0; i < vertIndicesInLayers[divIndex].length; i++) {
        //             sword.geometryData.vertices[vertIndicesInLayers[divIndex][i] * 3 + 1] = (equalTipDivLength * Math.abs(divIndex - (numBaseDivs + numMidDivs))) + baseSectionLength + midSectionLength;
        //         }
        //     }
        // } else {
        //     // We need to loop through each layer in the base and set the height
        //     // Space left to work with in this div
        //     var spaceLeft = tipSectionLength;

        //     // Loop through each level in the division
        //     for (var divIndex = numBaseDivs + numMidDivs + 1; divIndex <= totalBladeDivs; divIndex++) {

        //         if (divIndex == totalBladeDivs) {
        //             // This is the last layer so we set thhe verts to be at
        //             // the max height of the div
        //             for(var i = 0; i < vertIndicesInLayers[divIndex].length; i++) {
        //                 sword.geometryData.vertices[vertIndicesInLayers[divIndex][i] * 3 + 1] = bladeLength;
        //             }
        //         } else {
        //             // randomly determine a height and modify the verts
        //             var minDivLength = equalTipDivLength * 0.5;
        //             var maxDivLength = spaceLeft - (minDivLength * (numTipDivs - Math.abs(divIndex - (numBaseDivs + numMidDivs))));
        //             var divLength =  getRandomFloat(this.randGenerator, minDivLength, maxDivLength);

        //             // Change y value for all verts at this level
        //             for (var i = 0; i < vertIndicesInLayers[divIndex].length; i++) {
        //                 sword.geometryData.vertices[vertIndicesInLayers[divIndex][i] * 3 + 1] = divLength + (tipSectionLength - spaceLeft) + (baseSectionLength + midSectionLength);
        //             }

        //             spaceLeft = spaceLeft - divLength;
        //         }
        //     }
        // }

        // if (this.verbose) {
        //     console.log(`Vertices after height mod:\n${sword.geometryData.toString("vertex")}`);
        // }

        // Place a point at the tip of the blade
        var topFaceVertIndices: number[] = SwordGenerator.getTopVertIndices(sword.geometryData.vertices);
        sword.geometryData.vertices = SwordGenerator.createBladeTip(sword.geometryData.vertices, topFaceVertIndices);

        // Ensure that the height of the blade matches the template
        // for (var i = 0; i < topFaceVertIndices.length; i++) {
        //     assert(sword.geometryData.vertices[topFaceVertIndices[i] * 3 + 1] == bladeLength,
        //         `ERROR:buildBlade(): Blade does not match template expected ${bladeLength} was ${sword.geometryData.vertices[topFaceVertIndices[i] * 3 + 1]}`);
        // }

        // Check number of vertices
        assert(sword.geometryData.vertices.length > 0, "ERROR:buildBlade(): Model does not have any vertices defined");
        assert(sword.geometryData.vertices.length % 3 == 0, "ERROR:buildBlade(): Model has the incorrect number of vertex components");

        // Check the number of triangles
        assert(sword.geometryData.triangles.length > 0, "ERROR:buildBlade(): Model does not have any triangles defined");
        assert(sword.geometryData.triangles.length % 3 == 0, "ERROR:buildBlade(): Model has the incorrect number of triangle components");

        // Add colors for the sword blade
        for (var i = 0; i < (sword.geometryData.vertices.length / 3); i++) {
            sword.geometryData.addColor(0.5, 0.5, 0.5);
        }

        // Check number of colors
        assert(sword.geometryData.colors.length > 0, "ERROR:buildBlade(): Model does not have any colors defined");
        assert(sword.geometryData.colors.length % 3 == 0, "ERROR:buildBlade(): Model has the incorrect number of color components");

        // Add normals for the sword blade
        for (var i = 0; i < (sword.geometryData.vertices.length / 3); i++) {
            sword.geometryData.addNormal(1.0, 0.0, 0.0);
        }

        // Check number of normals
        assert(sword.geometryData.normals.length > 0, "ERROR:buildBlade(): Model does not have any normals defined");
        assert(sword.geometryData.normals.length % 3 == 0, "ERROR:buildBlade(): Model has the incorrect number of normal components");

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
        guardThickness : number = 0.1,
        guardBladeRatio : number = 1.5) : Sword {

        // Create a simple box
        var guardGeometry = new THREE.BoxGeometry(0.3 + template.baseBladeWidth, guardThickness, genParams.bladeThickness + 0.3);

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
            sword.geometryData.addColor(0.5, .32, 0.0);
        }

        var triangles = guardBufferGeometry.getIndex();
        if (triangles != undefined) {
            // Loop through all of the triangles and add the values to the swords geometry
            for (var i = 0; i < triangles.count; i++) {
                sword.geometryData.addTriangle(triangles.getX(i), triangles.getY(i), triangles.getZ(i));
            }
        } else {
            // We need to add index values based on the vertices being added
            assert(vertices.count % 3 == 0, "ERROR:: Verices are not organized into triangles");
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
    buildHandle(template : SwordTemplate, genParams : GenerationParameters, sword: Sword, handleRadius = 0.1, numHands = 1) {
        // Create a simple cylinder
        var handleLength = 0.4 * numHands;
        var handleGeometry = new THREE.CylinderGeometry(genParams.bladeThickness / 2, genParams.bladeThickness / 2, handleLength, 8);

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
            sword.geometryData.addColor(0.8, 0.32, 0.0);
        }

        var triangles = handleBufferGeometry.getIndex();
        if (triangles != undefined) {
            // Loop through all of the triangles and add the values to the swords geometry
            for (var i = 0; i < triangles.count; i++) {
                sword.geometryData.addTriangle(triangles.getX(i), triangles.getY(i), triangles.getZ(i));
            }
        } else {
            // We need to add index values based on the vertices being added
            assert(vertices.count % 3 == 0, "ERROR:: Verices are not organized into triangles");
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
    buildPommel(template : SwordTemplate, genParams : GenerationParameters, sword: Sword, numHands: number = 1, pommelBladeWidthRatio = 0.50) : Sword {
        var pommelRadius = genParams.bladeThickness;
        var pommelGeometry = new THREE.SphereGeometry(pommelRadius, 5, 5);
        var handleLength = 0.4 * numHands;
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
            sword.geometryData.addColor(0.9, 0.8, 0.35);
        }

        var triangles = pommelBufferGeometry.getIndex();
        if (triangles != undefined) {
            // Loop through all of the triangles and add the values to the swords geometry
            for (var i = 0; i < triangles.count; i++) {
                sword.geometryData.addTriangle(triangles.getX(i), triangles.getY(i), triangles.getZ(i));
            }
        } else {
            // We need to add index values based on the vertices being added
            assert(vertices.count % 3 == 0, "ERROR:: Verices are not organized into triangles");
            for (var i = 0; i < vertices.count;) {
                sword.geometryData.addTriangle(priorNumVertices + i, priorNumVertices + i + 1, priorNumVertices + i + 2);
                i += 3;
            }
        }

        return sword;
    }

    /**
     * Imports a predefines cross section style, scales it, and adds its vertices to the geometry
     *
     * @param template SwordTemplate defining sword morphology
     * @param crossSectionTemplate name of a predefined blade cross section
     * @param genParams additional generation parameters
     * @returns The vertices outlining the starting cross section of the blade
     */
    static createBladeCrossSection(template: SwordTemplate, crossSectionTemplate: BladeCrossSection, genParams : GenerationParameters) : [GeometryData, number[]] {
        var geometryData = new GeometryData();

        // Determine how we need to scale the vertices in the x and y axis
        var scaleFactorX = genParams.bladeThickness / crossSectionTemplate.thickness;
        var scaleFactorZ = template.baseBladeWidth / crossSectionTemplate.width;

        // Loop through the (x,z) vertices, scale, and add them to the geometrydata
        for (var i = 0; i < crossSectionTemplate.vertices.length - 1; i+=2) {
            geometryData.addVertex(crossSectionTemplate.vertices[i] * scaleFactorX,
                0.0,
                crossSectionTemplate.vertices[i + 1] * scaleFactorZ);
        }

        // Check number of vertices
        assert(geometryData.vertices.length > 0, "ERROR:: Cross-Section has no vertices defined");
        assert(geometryData.vertices.length % 3 == 0, "ERROR:: Cross-Section has the incorrect number of vertex components");

        return [geometryData, crossSectionTemplate.edgeVertices];
    }

    /**
     * Extrudes a geometry by in a given direction, n-number of
     * times (Where n = numRepeat) and returns the verts at the
     * top of the geometry
     *
     * @param vertices All the vertices in the model
     * @param direction Direction to extrude in
     * @param Number of times to extrude
     * @returns The new vertices and the triangles created during extrusion
     */
    static extrudeTopMultiple(vertices: number[], direction : THREE.Vector3, numRepeat : number) : [GeometryData, number[]] {
        // Make a copy just in case this is the actual array
        vertices = vertices.slice()

        var generatedGeometry = new GeometryData();

        for (var i = 0; i < numRepeat; i++) {
            var result = SwordGenerator.extrudeTop(vertices, direction);
            vertices = vertices.concat(result[0].vertices);
            generatedGeometry.vertices = generatedGeometry.vertices.concat(result[0].vertices);
            generatedGeometry.triangles = generatedGeometry.triangles.concat(result[0].triangles);
        }

        return [generatedGeometry, vertices];
    }

    /**
     * Extrudes a geometry, from the top, in a given direction
     *
     * Note: Assumes that the top is a flat, horizontal face
     *
     * @params All the vertices in the model
     * @params direction to extrude in
     * @returns The new geometry created during extrusion and the indices of generated vertices
     */
    static extrudeTop(vertices: number[], direction : THREE.Vector3) : [GeometryData, number[]] {
        var topVertIndices : number[] = SwordGenerator.getTopVertIndices(vertices);

        var result = SwordGenerator.extrudeFace(vertices, topVertIndices, direction);

        return result;
    }

    /**
     * Extrudes the face of a geometry in a specified direction
     * @param vertices All the vertices in the model
     * @param faceIndices the indices to extrude
     * @param direction direction to extrude in
     * @returns The new vertices and the triangles created during extrusion
     */
    static extrudeFace(vertices: number[], faceIndices: number[],  direction : THREE.Vector3) : [GeometryData, number[]] {

        assert(vertices.length > 0, "ERROR:extrudeFace(): No vertices provided");
        assert(faceIndices.length > 0, "ERROR:extrudeFace(): No vertex indices given to extrude");
        assert(vertices.length % 3 == 0, "ERROR:extrudeFace(): Incorrect number of vertex components");

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
                //generatedGeometry.addTriangle(newVertexIndices[j], faceIndices[0], faceIndices[i]);
                generatedGeometry.addTriangle(faceIndices[i], faceIndices[0], newVertexIndices[j]);

                // Top-right triangle
                //generatedGeometry.addTriangle(newVertexIndices[0], faceIndices[0], newVertexIndices[j]);
                generatedGeometry.addTriangle(newVertexIndices[j], faceIndices[0], newVertexIndices[0]);
            }
            // Otherwise all other sides are done the same
            else {
                // CW
                // Bottom-left triangle
                //generatedGeometry.addTriangle(newVertexIndices[j], faceIndices[i + 1], faceIndices[i]);
                generatedGeometry.addTriangle(faceIndices[i], faceIndices[i + 1], newVertexIndices[j]);

                // Top-right triangle
                //generatedGeometry.addTriangle(newVertexIndices[j + 1], faceIndices[i + 1], newVertexIndices[j]);
                generatedGeometry.addTriangle(newVertexIndices[j], faceIndices[i + 1], newVertexIndices[j + 1]);
            }
            i++;
            j++;
        }

        return [generatedGeometry, newVertexIndices];
    }

    /**
     * Scales the x, z components of the vertices by a scale Factor
     * @param vertices
     * @param faceIndices
     * @param scale
     * @returns vertices with given indices scaled
     */
    static scaleFace(vertices: number[], faceIndices: number[], scale: number): number[] {
        for (var i = 0; i < faceIndices.length; i++) {
            vertices[faceIndices[i] * 3] *= scale;
            vertices[faceIndices[i] * 3 + 2] *= scale;
        }
        return vertices;
    }

    /**
     * Moves face vertices in the given direction.
     * @param vertices
     * @param faceIndices
     * @param direction
     * @returns vertices with given indices translated
     */
    static translateFace(vertices: number[], faceIndices: number[], direction: THREE.Vector3): number[] {
        for (var i = 0; i < faceIndices.length; i++) {
            vertices[faceIndices[i] * 3] += direction.x;
            vertices[faceIndices[i] * 3 + 1] += direction.y;
            vertices[faceIndices[i] * 3 + 2] += direction.z;
        }
        return vertices;
    }

    /**
     * Modifies the vertices on the left and right edges of the sword blade.
     * Given: A sword generator, all the model vertices, the indices to the left and right edge vertices,
     *        the default blade with in the template, width tolerance, and whether to make edges symmetric
     * Returns: All the vertices in the model after being modified
     * ## NOTE: Currently, this only creates symmetrical blades
     */
    static modifyEdgeWidth(swordGenerator : SwordGenerator, vertices : number[], leftEdgeVertIndices : number[],
        rightEdgeVertIndices : number[], templateBladeWidth : number, widthToleranceRatio : number,
        numBaseDivs : number , numMidDivs : number, numTipDivs : number, symmetric=true) : number[] {
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
        var totalDivs = numBaseDivs + numMidDivs + numTipDivs;

        for (var i = 1; i < leftEdgeVertIndices.length; i++) {
            // Randomly generate a width for this section of the blade]
            divisionWidth = templateBladeWidth + (swordGenerator.randGenerator() * (maxBladeWidth - minBladeWidth));
            //divisionWidth = divisionWidth * (leftEdgeVertIndices.length - i) / (leftEdgeVertIndices.length);
            vertices[leftEdgeVertIndices[i] * 3 + 0] = -(divisionWidth / 2);
        }

        for (var i = 1; i < rightEdgeVertIndices.length; i++) {
            if (!symmetric) {
                // Randomly generate a width for this section of the blade
                divisionWidth = templateBladeWidth + (swordGenerator.randGenerator() * (maxBladeWidth - minBladeWidth));
                //divisionWidth = divisionWidth * (leftEdgeVertIndices.length - i) / (leftEdgeVertIndices.length);
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
     * ## Note: Assumes that all the blade divs are evenly spaced by 1.0 in the y-direction
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
     * Gets the indices of the vertices that are the highest in the blade. We assume
     * that these vertices are the top face of the blade
     *
     * Note: Assumes the top is flat and level
     *
     * @params vertices All the vertices in the model
     * @params geomHeight (optionally) The model's height
     * @returns The indices of the vertices that are at the highest layer
     *          in the geometry.
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