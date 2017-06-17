/**
 * This script contains code that generates the
 * meshes for the swords using Three JS. Meshes
 * will be exported to JSON just like the old
 * method that used blender.
 */
const THREE = require('three');
var seed = require('seed-random');

/**
 * Given two numbers, this function returns a random in that is
 * in the range [min,max)
 * 
 * @param {number} min 
 * @param {number} max
 * @return {number}
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * This method is used to convert the 2D-array of UV layers
 * and values to a 1D-array delimeted by the value (-1)
 * 
 * This process is necessary because Unity3D currently does
 * not support 2D array importing from JSON
 * 
 * @param {number[][]} uvs
 * @return {number[]}
 */
function convertUVtoSingleArray(uvs) {
    var singleArr = []
    for (var i = 0; i < uvs.length; i++) {
        for (var j = 0; j < uvs[i].length; j++) {
            singleArr.push(uvs[i][j]);
        }
        singleArr.push(-1);
    }
    return singleArr;
}

/**
 * Class representation of a sword with a given style
 * and a generated geometery. The geometry of this weapon
 * is sent back by this application in response to forge
 * requests.
 */
class Sword {

    constructor(style) {
        this.style = style;
        this.geometry = new THREE.Geometry();
    }

    /**
     * Returns the JSON representation of this sword
     * 
     * @return {JSON}
     */
    toJSON() {      
        // Get JSON from the geometry without the metadata
        var geomJSON = this.geometry.toJSON().data;
        
        // Copies the uvs 2D-array and stores it in a new property
        geomJSON.uvLayers = geomJSON.uvs; 
        geomJSON.uvs = convertUVtoSingleArray(geomJSON.uvs);
  
        // Add extra information about the weapon
        geomJSON.weapon_type = "sword";
        geomJSON.weapon_style = this.style;

        return geomJSON;
    }
}

/**
 * Factory class that produces instances of
 * swords using a set of parameters
 */
class SwordGenerator {

    /**
     * The constructor instantiates all the necessary variable for
     * generating a sword. The options object may be left blank or
     * populated with values of properties you wish to change.
     * 
     * @param {string} seedVal
     * @param {string} swordStyle
     * @param {JSON} swordTemplate 
     * @param {JSON} options 
     */
    constructor(seedVal, swordStyle, swordTemplate, options = {}) {
        // Sets all required parameters
        this.seedVal = seedVal;
        this.swordStyle = swordStyle;
        this.swordTemplate = swordTemplate;
        // Sets all optional parameters for generation
        this.maxBaseDivs = ("undefined" === typeof options.maxBaseDivs ||
                "number" != typeof options.maxBaseDivs) ?
                    3 : options.maxBaseDivs;
        this.maxMidDivs = ("undefined" === typeof options.maxMidDivs ||
                "number" != typeof options.maxMidDivs) ?
                    3 : options.maxMidDivs;
        this.maxTipDivs = ("undefined" === typeof options.maxtipDivs ||
                "number" != typeof options.maxTipDivs) ?
                    2 : options.maxTipDivs;
        this.minDivLength = ("undefined" === typeof options.minDivLength ||
                "number" != typeof options.minDivLength) ?
                    0.2 : options.minDivLength;
        this.bladeWidthToleranceRatio = ("undefined" === typeof options.minDivLength ||
                "number" != typeof options.minDivLength) ?
                    1 : options.minDivLength;
        this.bladeThickness = ("undefined" === typeof options.bladeThickness ||
                "number" != typeof options.bladeThickness) ?
                    0.03 : options.bladeThickness;
        this.fullerWidthRatio = ("undefined" === typeof options.fullerWidthRatio ||
                "number" != typeof options.fullerWidthRatio) ?
                    0.33 : options.fullerWidthRatio;
        this.applyFuller = ("undefined" === typeof options.applyFuller ||
                "boolean" != typeof options.applyFuller) ?
                    true : options.applyFuller;
        this.equalBaseDivs = ("undefined" === typeof options.equalBaseDivs ||
                "boolean" != typeof options.equalBaseDivs) ?
                    false : options.equalBaseDivs;
        this.equalMidDivs = ("undefined" === typeof options.equalMidDivs ||
                "boolean" != typeof options.equalMidDivs) ?
                    false : options.equalMidDivs;
        this.equalTipDivs = ("undefined" === typeof options.equalTipDivs ||
                "boolean" != typeof options.equalTipDivs) ?
                    true : options.equalTipDivs;
    }

    /**
     * Given a geometry and a blade width, returns an array
     * of references to all the vertices(THREE.Vector3) that
     * make us the left edge of the blade
     * 
     * @param {THREE.Geometry} geom 
     * @param {number} bladeWidth
     * @return {THREE.Vector3[]}
     */
    getLeftEdgeVerts(geom, bladeWidth) {
        var leftEdge = [];
        for (var i = 0; i < geom.vertices.length; i++) {
            if (geom.vertices[i].x == -bladeWidth / 2) {
                leftEdge.push(geom.vertices[i]);
            }
        }
        return leftEdge;
    }

    /**
     * Given a geometry and a blade width, returns an array
     * of references to all the vertices(THREE.Vector3) that
     * make us the right edge of the blade
     * 
     * @param {THREE.Geometry} geom 
     * @param {number} bladeWidth
     * @return {THREE.Vector3[]}
     */
    getRightEdgeVerts(geom, bladeWidth) {
        var rightEdge = [];
        for (var i = 0; i < geom.vertices.length; i++) {
            if (geom.vertices[i].x == bladeWidth / 2) {
                rightEdge.push(geom.vertices[i]);
            }
        }
        return rightEdge;
    }
    
    /**
     * Given a geometry and a geometry height(optional),
     * returns an array of vertices(THREE.Vector3)
     * correspondining to th vertices at the top of the
     * geometry
     * 
     * @param {THREE.Geometry} geom 
     * @param {number} geomHeight
     * @return {THREE.Vector3[]}
     */
    getTopVerts(geom, geomHeight=-1) {
        var topVerts = [];
        if (geomHeight != -1) {
            // Height has been specified so we can just get those
            // verts and return
            for (var i = 0; i < geom.vertices.length; i++) {
                if (geom.vertices[i].y == geomHeight) {
                    topVerts.push(geom.vertices[i]);
                }
            }
        }
        else {
            // Height is not specified, so we must find the height
            // then return the verts at that height

            var maxHeight = -1;
            var indexOfMax = -1;
            // Find the vertex with the greatest height
            for (var i = 0; i < geom.vertices.length; i++) {
                if (geom.vertices[i].y > maxHeight) {
                    
                    indexOfMax = i;
                    maxHeight = geom.vertices[i].y;
                }
            }
            // Get all vertices at the max height
            for (var i = 0; i < geom.vertices.length; i++) {
                if (geom.vertices[i].y == maxHeight) {
                    topVerts.push(geom.vertices[i]);
                }
            }   
        }
        
        return topVerts;
    }

    /**
     * Assuming that all the blade divs are evenly spaced by 1 in the
     * y-direction. Returns all the vertices at each intermediate
     * height between 0 and bladeLength as a 2D-array organized
     * by div
     * 
     * @param {THREE.Geometry} geom 
     * @param {number} numDivs 
     * @param {number} bladeLength 
     * @return {THREE.Vector3[][]}
     */
    getAllVertsAsDivs(geom, numDivs, bladeLength) {
        // This will be a 2D array of vertex references
        var divVerts = [];
        // Used to calculate what vertices are in what layer
        var divSpacing = bladeLength / numDivs;
        for (var i = 0; i < numDivs; i++) {
            divVerts.push([]);
            for (var j = 0; j < geom.vertices.length; j++) {
                if (geom.vertices[j].z == i) {
                    divVerts[i].push(geom.vertices[j]);
                }
            }
        }
        return divVerts;

    }

    /**
     * Given the geometry of the sword, and some parameters about
     * the geometry of the sword, creates a box-shapped guard and
     * merges it with the swords geometry.
     * 
     * @param {THREE.Geometry} swordGeom 
     * @param {number} bladeWidth 
     * @param {number} bladethickness 
     * @param {number} guardThickness 
     * @param {number} guardBladeRatio 
     */
    addGuard(swordGeom, bladeWidth = 0.3, bladethickness = .3, guardThickness = 1, guardBladeRatio = 4) {
        var guardGeom = new THREE.BoxGeometry( guardBladeRatio * bladeWidth, .2, guardThickness);
        var mat = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
        var guard = new THREE.Mesh(guardGeom, mat);
        guard.updateMatrix();
        swordGeom.merge(guard.geometry, guard.matrix);
    }

    /**
     * Given the geometry of the sword, and some parameters about
     * the geometry of the sword, creates a cylindrical handle and
     * merges it with the swords geometry.
     * 
     * @param {THREE.Geometry} swordGeom 
     * @param {number} handleLength 
     * @param {number} handleWidth 
     * @param {number} numHands 
     */
    addHandle(swordGeom, handleLength = 1.35, handleWidth = 0.1, numHands = 1) {
        var handleGeom = new THREE.CylinderGeometry( handleWidth, handleWidth, handleLength, 8)
        // Moves translates the handle to fall below the guard and blade
        handleGeom.translate(0,-handleLength / 2,0);
        var mat = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
        var handle = new THREE.Mesh(handleGeom, mat);

        handle.updateMatrix();
        swordGeom.merge(handle.geometry, handle.matrix);
    }

    /**
     * Given the geometry of the sword, and some parameters about
     * the geometry of the sword, creates a spherical pommel and
     * merges it with the swords geometry.
     * 
     * @param {THREE.Geometry} swordGeom 
     * @param {number} bladeWidth 
     * @param {number} handleLength 
     * @param {number} pommelBladeWidthRatio 
     */
    addPommel(swordGeom, bladeWidth=0.6, handleLength = 1.35, pommelBladeWidthRatio = 0.50) {
        var pommelWidth = pommelBladeWidthRatio * bladeWidth;
        var pommelGeom = new THREE.SphereGeometry(pommelWidth, 5, 4);
        // Translates the pommel to fall below the handle
        pommelGeom.translate(0,-handleLength,0);
        var mat = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
        var pommel = new THREE.Mesh(pommelGeom, mat);

        pommel.updateMatrix();
        swordGeom.merge(pommel.geometry, pommel.matrix);
    }

    /**
     * Creates a cross section of the blade out of vertices (THREE.Vector3)
     * 
     * @param {number} bladeWidth 
     * @param {number} fullerDepth 
     * @param {number} fullerWidth
     * @return {THREE.Vector3[]}
     */
    createBladeCrossSection(bladeWidth, fullerDepth, fullerWidth) {
        var verts = [];

        // Back side of the cross-section
        verts.push(new THREE.Vector3(-bladeWidth / 2, 0, 0));
        verts.push(new THREE.Vector3(-fullerWidth / 2, 0, -this.bladeThickness / 2));
        if (this.applyFuller) {
            verts.push(new THREE.Vector3(0, 0, (-this.bladeThickness / 2) + fullerDepth));
        }
        else {
            verts.push(new THREE.Vector3(0, 0, (-this.bladeThickness / 2)));
        }
        verts.push(new THREE.Vector3(fullerWidth / 2, 0, -this.bladeThickness / 2));
        verts.push(new THREE.Vector3(bladeWidth / 2, 0, 0));
        // Front side of cross-section
        verts.push(new THREE.Vector3(fullerWidth / 2, 0, this.bladeThickness / 2));
        if (this.applyFuller) {
            verts.push(new THREE.Vector3(0, 0, (this.bladeThickness / 2) - fullerDepth));
        }
        else {
            verts.push(new THREE.Vector3(0, 0, (this.bladeThickness / 2)));
        }
        verts.push(new THREE.Vector3(-fullerWidth / 2, 0, this.bladeThickness / 2));

        return verts;
    }

    /**
     * Extrudes a geometry by in a given direction n-number of
     * times (Where n = numRepeat) and returns the verts at the
     * top of the geometry
     * 
     * @param {THREE.Geometry} geom 
     * @param {THREE.Vector3} direction 
     * @param {number} numRepeat
     * @return {THREE.Vector3[][]}
     */
    extrudeTopMultiple(geom, direction, numRepeat) {
        var newVerts  = [];
        for (var i = 0; i < numRepeat; i++) {
            newVerts.push(this.extrudeTop(geom,direction));
        }
        return newVerts
    }

    /**
     * Extrudes a geometry, from the top, in a given direction
     * 
     * @param {THREE.Geometry} geom 
     * @param {THREE.Vector3} direction
     * @return {THREE.Vector3[]}
     */
    extrudeTop(geom, direction) {

        var topVerts = this.getTopVerts(geom);

        var extrudedGeom = this.extrudeVerts(topVerts, direction);

        // Now that we have the extrusion info we need to
        // add it to the existing geometry

        // Adds the new verts
        for (var i = 0; i < extrudedGeom.newVerts.length; i++) {
            geom.vertices.push(extrudedGeom.newVerts[i]);
        }

        // Adds new faces using the arrays of vertex references
        for (var i = 0; i < extrudedGeom.facesAsVerts.length; i++) {
            var face = extrudedGeom.facesAsVerts[i];
            geom.faces.push(new THREE.Face3(geom.vertices.indexOf(face[0]),
                                            geom.vertices.indexOf(face[1]),
                                            geom.vertices.indexOf(face[2])));
        }

        return extrudedGeom.newVerts;
    }

    /**
     * Extrudes a set of vertices in a given direction
     * The function retuens an object with an array of
     * vertices representing the new vertices and an array 
     * of faces for the faces that were made.
     * 
     * @param {THREE.Vector3[]} verts
     * @param {THREE.Vector3} direction
     * @return {{}}
     */
    extrudeVerts(verts, direction) {
        // Faces here will be stored as arrays of size 3 with vertex references
        var geom = {"verts":verts, "oldVerts":verts, "newVerts":[], "faces":[], "facesAsVerts": []};
        
        if (verts.length == 0) {
            return geom;
        }
        
        // Loop through vertices and add verts that are translated
        // in the given direction    
        var priorVertCount = verts.length;
        for (var i = 0; i < priorVertCount; i++) {
            var newX = verts[i].x + direction.x;
            var newY = verts[i].y + direction.y;
            var newZ = verts[i].z + direction.z;
            var vert = new THREE.Vector3(newX, newY, newZ)
            geom.verts.push(vert);
            geom.newVerts.push(vert);
        }

        // Now we need to make the new faces
        // New faces will be specified by arrays of 3 vertici references
        var i = 0;
        var j = geom.verts.length / 2;
        // Assuming the verts at the bottom make a shape, we
        // need to give 2 faces or a quad to each side
        while (i < priorVertCount) {
        //for (var side = 0; side < geom.verts.length / 2; side++) {
            // On the last iteration we use 0 instead of i+1 or j+1
            if (i == priorVertCount - 1) {
                // CCW
                // Bottom-left triangle
                // geom.faces.push(new THREE.Face3(i,0,j));
                // Top-right triangle
                // geom.faces.push(new THREE.Face3(j, 0, geom.verts.length / 2));

                // CW
                // Bottom-left triangle
                geom.faces.push(new THREE.Face3(j,0,i));
                // Top-right triangle
                geom.faces.push(new THREE.Face3(geom.verts.length / 2,0,j));

                // CW (vertex arrays)
                // Bottom-left triangle
                geom.facesAsVerts.push([geom.verts[j],geom.verts[0],geom.verts[i]]);
                // Top-right triangle
                geom.facesAsVerts.push([geom.verts[geom.verts.length / 2],geom.verts[0],geom.verts[j]]);
            }
            // Otherwise all other sides are done the same
            else {
                // CCW
                // Bottom-left triangle
                //geom.faces.push(new THREE.Face3(i,i+1,j));
                // Top-right triangle
                //geom.faces.push(new THREE.Face3(j, i+1, j+1));

                // CW
                // Bottom-left triangle
                geom.faces.push(new THREE.Face3(j,i+1,i));
                // Top-right triangle
                geom.faces.push(new THREE.Face3(j+1, i+1, j));

                // CW (vertex arrays)
                // Bottom-left triangle
                geom.facesAsVerts.push([geom.verts[j],geom.verts[i+1],geom.verts[i]]);
                // Top-right triangle
                geom.facesAsVerts.push([geom.verts[j+1], geom.verts[i+1], geom.verts[j]]);
            }
            i++;
            j++;
        }

        return geom;
    }

    /**
     * Given a geometry, adds UVs to it.
     * NOTE: this should be fixed to actually set valid UVs
     * 
     * @param {THREE.Geometry} geom 
     */
    addUVs(geom) {
        for (var i = 0; i < geom.faces.length; i++) {
            geom.faceVertexUvs[0].push([
                new THREE.Vector2(0,0),
                new THREE.Vector2(0,0),
                new THREE.Vector2(0,0)
            ]);
        }
    }

    /**
     * Moves all the vertices at the top of the blade to the
     * center, creating a point at the tip
     * 
     * @param {THREE.Geometry} bladeGeom 
     * @param {number} bladeLength 
     */
    createBladeTip(bladeGeom, bladeLength=-1) {
        var top = this.getTopVerts(bladeGeom);
        
        for(var i = 0; i < top.length; i++) {
            top[i].x = 0;
            top[i].y = 0;
        }

        bladeGeom.mergeVertices();
    }

    /**
     * The factory method of this class that returns a new sword
     * instance with procedurally generated blade geometry
     * 
     * @return {Sword}
     */
    generateSword() {   
        // Set the Math.random() to use the seed value
        seed(seedVal, {global: true});

        // Create a new sword geometry
        var sword = new Sword(this.swordStyle);

        this.generateBlade(sword);
        this.addGuard(sword.geometry,this.swordTemplate.baseWidth);
        this.addHandle(sword.geometry);
        this.addPommel(sword.geometry,this.swordTemplate.baseWidth);
        
        // Reset Math.Random()
        seed.resetGlobal();
        
        return sword;
    }

    /**
     * Procedurally generates a sword blade and adds it to the swords geometry
     * 
     * @param {Sword} sword 
     * @param {number} baseProportion 
     * @param {number} midProportion 
     */
    generateBlade(sword, baseProportion = .25, midProportion = .65) {
        // OPTIONS:
        // 1) Return the vertices contained in the blade.
        // 2) Pass in a geometry, add necessary verts,
        //      then return the vertices at the base of
        //      the blade

        var bladeLength = this.swordTemplate.length;
        
        // Make Cross-section
        var fullerWidth = this.swordTemplate.baseWidth * this.fullerWidthRatio;
        var fullerDepth = this.bladeThickness / 4;
        sword.geometry.vertices =  this.createBladeCrossSection(this.swordTemplate.baseWidth, 
                                                                fullerDepth,
                                                                fullerWidth);

        // Determine how many divisions each section has
        var numBaseDivs = getRandomInt(1, this.maxBaseDivs + 1);
        var numMidDivs = getRandomInt(1, this.maxMidDivs + 1);
        var numTipDivs = Math.floor(Math.random() * this.maxTipDivs) + 1;
        var totalBladeDivs = numBaseDivs + numMidDivs + numTipDivs;

        // Determine how much of the blade length is allocated to each section
        var baseSectionLength = bladeLength * baseProportion;
        var midSectionLength = bladeLength * midProportion;
        var tipSectionLength = bladeLength * (1 - (baseProportion + midProportion));

        // Calculate how long equivalent divisions can be depending on the section
        var equalBaseDivLength = baseSectionLength / numBaseDivs;
        var equalMidDivLength = midSectionLength / numMidDivs;
        var equalTipDivLength = tipSectionLength / numTipDivs;

        // Extrude blade cross-section to full length with all the divisions present
        var newVerts = this.extrudeTopMultiple(sword.geometry,new THREE.Vector3(0, 1, 0), totalBladeDivs);

        

        // Modify the vertices at each level to be a the desired heights
        var allVertLayers = newVerts;
        /*
        console.log(`Num divs: ${totalBladeDivs}`);
        console.log(`Num of layers without first: ${allVertLayers.length}`);
        console.log(`Num verts per layer: ${allVertLayers[0].length}`);
        */
        var baseSpaceLeft = baseSectionLength;
        var midSpaceLeft = midSectionLength;
        var tipSpaceLeft = tipSectionLength;

        for (var divIndex = 0; divIndex < allVertLayers.length; divIndex++) {
            if (divIndex >= 0 && divIndex < numBaseDivs) {
                // Modifying base div
                if (this.equalBaseDivs) {
                    // All divs will be evenly spaces
                    for(var vertIndex = 0; vertIndex < allVertLayers[divIndex].length; vertIndex++) {
                        allVertLayers[divIndex][vertIndex].y = equalBaseDivLength + (equalBaseDivLength * divIndex);
                    }
                }
                else {
                    if (divIndex == numBaseDivs - 1) {
                        for(var vertIndex = 0; vertIndex < allVertLayers[divIndex].length; vertIndex++) {
                            allVertLayers[divIndex][vertIndex].y = baseSectionLength;
                        }
                    } else {
                        // Div heights will be randomly calculated
                        // Max height is the largest length we can have while leaving space for remaining divs
                        var maxDivLength = baseSpaceLeft - (this.minDivLength * (numBaseDivs - divIndex));
                        var divLength = (Math.random() * (this.maxDivLength - this.minDivLength)) + this.minDivLength;
                        // Change y value for all verts at this level
                        for(var vertIndex = 0; vertIndex < allVertLayers[divIndex].length; vertIndex++) {
                            allVertLayers[divIndex][vertIndex].y = divLength + (baseSectionLength - baseSpaceLeft);
                        }
                        baseSpaceLeft = baseSpaceLeft - divLength; 
                    }                   
                }
            }
            else if (divIndex >= numBaseDivs && divIndex < numBaseDivs + numMidDivs) {
                // Modifying a mid div
                if (this.equalMidDivs) {
                    for (var vertIndex = 0; vertIndex < allVertLayers[divIndex].length; vertIndex++) {
                        allVertLayers[divIndex][vertIndex].y = equalMidDivLength + (equalBaseDivLength * divIndex - numBaseDivs) + baseSectionLength;
                    }
                }
                else {
                    if (divIndex == numBaseDivs + numMidDivs - 1) {
                        for (var vertIndex = 0; vertIndex < allVertLayers[divIndex].length; vertIndex++) {
                            allVertLayers[divIndex][vertIndex].y = midSectionLength + baseSectionLength;
                        }
                    }
                    else {
                        var maxDivLength = midSpaceLeft - (this.minDivLength * (numMidDivs - (divIndex - numBaseDivs)));
                        var divLength = (Math.random() * (maxDivLength - this.minDivLength)) + this.minDivLength;
                        for (var vertIndex = 0; vertIndex < allVertLayers[divIndex].length; vertIndex++) {
                            allVertLayers[divIndex][vertIndex].y = divLength + (baseSectionLength + midSectionLength - midSpaceLeft);
                        }
                        midSpaceLeft = midSpaceLeft - divLength;
                    }
                }
            }
            else if (divIndex >= numBaseDivs + numMidDivs) {
                // Modifying a tip div
                if (this.equalTipDivs) {
                    for (var vertIndex = 0; vertIndex < allVertLayers[divIndex].length; vertIndex++) {
                        allVertLayers[divIndex][vertIndex].y = equalTipDivLength + (equalTipDivLength * (divIndex - numBaseDivs + numMidDivs)) + midSectionLength + baseSectionLength;
                    }
                }
                else {
                    if (divIndex == totalBladeDivs - 1) {
                        for (var vertIndex = 0; vertIndex < allVertLayers[divIndex].length; vertIndex++) {
                            allVertLayers[divIndex][vertIndex].y = bladeLength;
                        }
                    }
                    else {
                        var maxDivLength = tipSpaceLeft - (this.minDivLength * (divIndex - numBaseDivs - numMidDivs));
                        var divLength = (Math.random() * (maxDivLength - this.minDivLength)) + this.minDivLength;
                        for (var vertIndex = 0; vertIndex < allVertLayers[divIndex].length; vertIndex++) {
                            allVertLayers[divIndex][vertIndex].y = divLength + (bladeLength - tipSpaceLeft);
                        }
                        tipSpaceLeft = tipSpaceLeft - divLength;
                    }
                }

            }
    
        }

        /*
        // Sets the base divs
        if (this.equalBaseDivs) {
            // Change the y direction of the first n-layers (n = numBaseDivs)
            for (var divIndex = 0; divIndex < numBaseDivs; divIndex++) {
                for(var vertIndex = 0; vertIndex < allVertLayers[divIndex].length; vertIndex++) {
                    allVertLayers[divIndex][vertIndex].y = equalBaseDivLength + (equalBaseDivLength * (divIndex + 1));
                }
            }
        }
        else {
            // We need to loop through each layer in the base and set the height
        
            // Space left to work with in this div
            var spaceLeft = baseSectionLength;
            // Loop through each level in the division
            for (var divIndex = 0; divIndex < numBaseDivs; divIndex++) {
                // Default divLength is the minimum allowed length
                var divLength = this.minDivLength;
                if (divIndex == numBaseDivs - 1) {
                    // This is the last layer so we set thhe verts to be at
                    // the max height of the div
                    for(var vertIndex = 0; vertIndex < allVertLayers[divIndex].length; vertIndex++) {
                        allVertLayers[divIndex][vertIndex].y = baseSectionLength;
                    }
                    break;
                }
                else {
                    // randomly determine a height and modify the verts
                    var maxDivLength = spaceLeft - (this.minDivLength * (numBaseDivs - i));
                    divLength = (Math.random() * maxDivLength);
                    // Change y value for all verts at this level
                    for(var vertIndex = 0; vertIndex < allVertLayers[divIndex].length; vertIndex++) {
                        allVertLayers[divIndex][vertIndex].y = divLength + (baseSectionLength - spaceLeft);
                    }
                    spaceLeft = spaceLeft - divLength;
                }  
            }
        }
        */
        /*
        if (this.equalMidDivs) {
            // Change the y direction of the first n-layers (n = numBaseDivs)
            for (var divIndex = numMidDivs; divIndex < numBaseDivs + numMidDivs; divIndex++) {
                for(var vertIndex = 0; vertIndex < allVertLayers[divIndex].length; vertIndex++) {
                    allVertLayers[divIndex][vertIndex].y = equalMidDivLength + (equalMidDivLength * (divIndex - numMidDivs + 1)) + baseSectionLength;
                }
            }
        }
        else {
             // We need to loop through each layer in the base and set the height
        
            // Space left to work with in this div
            var spaceLeft = midSectionLength;
            // Loop through each level in the division
            for (var divIndex = numMidDivs; divIndex < numBaseDivs + numMidDivs; divIndex++) {
                // Default divLength is the minimum allowed length
                var divLength = this.minDivLength;
                if (divIndex == (numBaseDivs + numMidDivs - 1)) {
                    // This is the last layer so we set thhe verts to be at
                    // the max height of the div
                    for(var vertIndex = 0; vertIndex < allVertLayers[divIndex].length; vertIndex++) {
                        allVertLayers[divIndex][vertIndex].y = baseSectionLength + midSectionLength;
                    }
                    break;
                }
                else {
                    // randomly determine a height and modify the verts
                    var maxDivLength = spaceLeft - (this.minDivLength * (numBaseDivs - divIndex));
                    divLength = (Math.random() * maxDivLength);
                    // Change y value for all verts at this level
                    for (var vertIndex = 0; vertIndex < allVertLayers[divIndex].length; vertIndex++) {
                        allVertLayers[divIndex][vertIndex].y = divLength + (midSectionLength - spaceLeft) + baseSectionLength;
                    }
                    spaceLeft = spaceLeft - divLength;
                }  
            }
        }
        */
        /*
        if (this.equalTipDivs) {
            // Change the y direction of the first n-layers (n = numBaseDivs)
            for (var divIndex = numTipDivs; divIndex < totalBladeDivs; divIndex++) {
                for(var vertIndex = 0; vertIndex < allVertLayers[divIndex].length; vertIndex++) {
                    allVertLayers[divIndex][vertIndex].y = equalTipDivLength + (equalTipDivLength * (divIndex - numTipDivs + 1)) + baseSectionLength + midSectionLength;
                }
            }
        }
        else {
             // We need to loop through each layer in the base and set the height
        
            // Space left to work with in this div
            var spaceLeft = tipSectionLength;
            // Loop through each level in the division
            for (var divIndex = numTipDivs; divIndex < totalBladeDivs; divIndex++) {
                // Default divLength is the minimum allowed length
                var divLength = this.tipDivLength;
                if (divIndex == (numBaseDivs + numMidDivs - 1)) {
                    // This is the last layer so we set thhe verts to be at
                    // the max height of the div
                    for(var vertIndex = 0; vertIndex < allVertLayers[divIndex].length; vertIndex++) {
                        allVertLayers[divIndex][vertIndex].y = bladeLength;
                    }
                    break;
                }
                else {
                    // randomly determine a height and modify the verts
                    var maxDivLength = spaceLeft - (this.minDivLength * (numBaseDivs - divIndex));
                    divLength = (Math.random() * maxDivLength);
                    // Change y value for all verts at this level
                    for (var vertIndex = 0; vertIndex < allVertLayers[divIndex].length; vertIndex++) {
                        allVertLayers[divIndex][vertIndex].y = divLength + (baseSectionLength + midSectionLength);
                    }
                    spaceLeft = spaceLeft - divLength;
                }  
            }
        }
        */



        
        
        var top = newVerts[newVerts.length - 1];

        var L_edgeVerts = this.getLeftEdgeVerts(sword.geometry, this.swordTemplate.baseWidth);
        var R_edgeVerts = this.getRightEdgeVerts(sword.geometry, this.swordTemplate.baseWidth);

        modifyEdgeWidth(L_edgeVerts, R_edgeVerts, this.swordTemplate.baseWidth, this.bladeWidthToleranceRatio);
        
        for(var i = 0; i < top.length; i++) {
            top[i].x = 0;
            top[i].z = 0;
        }

        sword.geometry.mergeVertices();

        this.addUVs(sword.geometry);
    }
}

/**
 * Returns the slope between two points
 * 
 * @param {number} x1 
 * @param {number} y1 
 * @param {number} x2 
 * @param {number} y2 
 */
function getSlope(x1, y1, x2, y2) {
    return (y2 - y1) / (x2 - x1);
}


/**
 * Modifies the vertices on the left and right edges
 * of the sword blade.
 * NOTE: Currently, this only creates symmetrical blades
 * 
 * @param {THREE.Vector3[]} leftBladeEdgeVerts 
 * @param {THREE.Vector3[]} rightBladeEdgeVerts 
 * @param {number} templateBladeWidth 
 * @param {number} widthToleranceRatio 
 */
function modifyEdgeWidth(leftBladeEdgeVerts,
                            rightBladeEdgeVerts,
                            templateBladeWidth,
                            widthToleranceRatio) {
    // Rules:
    // The x-value of the vertices needs to be within
    // the tolerance ration with respect to templateBladeWidth / 2
    // Example: If the blade template has a width of .6 meters and
    //          the tolerance ratio is .1, then the x-values of the
    //          BladeEdgeVertices may not exceed
    //          .3 meters +/- .06 meters

    minBladeWidth = templateBladeWidth - (widthToleranceRatio * templateBladeWidth);
    maxBladeWidth = templateBladeWidth + (widthToleranceRatio * templateBladeWidth);
    
    divisionWidth = templateBladeWidth;
    for (var i = 0; i < leftBladeEdgeVerts.length; i++) {
        // Randomly generate a width for this section of the blade
        divisionWidth = templateBladeWidth + (Math.random() * (maxBladeWidth - minBladeWidth));
        // Sets the values for the vertices
        leftBladeEdgeVerts[i].x = -(divisionWidth / 2);
        rightBladeEdgeVerts[i].x = divisionWidth / 2;
    }
}

module.exports = { Sword : Sword, SwordGenerator: SwordGenerator };
