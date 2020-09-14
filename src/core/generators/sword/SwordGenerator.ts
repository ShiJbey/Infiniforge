import * as _ from 'lodash';
import * as THREE from 'three';
import * as utils from '../../utilities/utils';
import { Generator } from '../Generator';
import { SwordTemplate, getTemplate, SWORD_TEMPLATES } from './SwordTemplate';
import { BladeCrossSection, getCrossSection, BLADE_CROSS_SECTIONS } from './BladeCrossSection';
import { BladeParams, HandleParams, GuardParams, PommelParams, SwordGenerationParams } from './SwordGenerationParams';
import { GeometryData } from '../../modeling/GeometryData';
import { CrossSection } from '../../modeling/CrossSection';
import { BladeGeometry } from './BladeGeometery';

export class SwordGenerator extends Generator {

    constructor(verbose = false) {
        super(verbose);
    }

    /**
     * Generates a new sword
     *
     * @param params
     * @return
     */
    async generate(params: SwordGenerationParams): Promise<any> {

        if (params.seed) {
            this.setSeed(params.seed);
        }

        let template = this.getSwordTemplate(params.template);


        let sword = new GeometryData();


        this.buildBlade(sword, template, params.bladeParams);
        this.buildGuard(sword, template, params.guardParams);
        this.buildHandle(sword, template, params.handleParams);
        this.buildPommel(sword, template, params.pommelParams);


        if (params.output === "mesh") {
            return sword.toMesh();
        } else {
            return await sword.toGlTF();
        }
    }

    private getSwordTemplate(templateName?: string): SwordTemplate {

        if (templateName) {
            if (templateName === "random") {
                return this.getRandomTemplate();
            }
            else {
                let template = getTemplate(templateName);
                if (template) {
                    return template;
                }
                else {
                    throw `Invalid sword template '${templateName}'`
                }
            }
        }

        return this.getRandomTemplate();
    }

    private getBladeCrossSection(crossSectionName?: string): BladeCrossSection {
        if (crossSectionName) {
            if (crossSectionName === "random") {
                return this.getRandomBladeCrossSection();
            } else {
                let crossSection = getCrossSection(crossSectionName);
                if (crossSection) {
                    return crossSection;
                } else {
                    throw `Invalid blade cross-section '${crossSection}'`
                }
            }
        }

        return this.getRandomBladeCrossSection();
    }

    private getRandomTemplate(): SwordTemplate {
        let randomIndex = utils.getRandomInt(this._prng, 0, Object.keys(SWORD_TEMPLATES).length - 1);
        let crossSectionName = Object.keys(SWORD_TEMPLATES)[randomIndex];
        return SWORD_TEMPLATES[crossSectionName];
    }

    private getRandomBladeCrossSection(): BladeCrossSection {
        let randomIndex = utils.getRandomInt(this._prng, 0, Object.keys(BLADE_CROSS_SECTIONS).length - 1);
        let crossSectionName = Object.keys(BLADE_CROSS_SECTIONS)[randomIndex];
        return BLADE_CROSS_SECTIONS[crossSectionName];
    }

    /**
     * Generates geometry data for the blade of the sword
     *
     * @param sword
     * @param params
     */
    private buildBlade(sword: GeometryData, template: SwordTemplate, params?: BladeParams) {

        const DEFAULT_PARAMS: BladeParams = {
            color: "rgb(127, 127, 127)",
            crossSection: "random",
            bladeBaseProportion: 0.3,
            bladeMidProportion: 0.5,
            baseSplineControlPoints: 3,
            evenSpacedBaseCPs: true,
            midSplineControlPoints: 5,
            evenSpacedMidCPs: true,
            tipSplineControlPoints: 2,
            evenSpacedTipCPs: true,
            randomNumControlPoints: true,
            minSplineControlPoints: 2,
            maxSplineControlPoints: 7,
            baseSplineSampleRes: 0.4,
            midSplineSampleRes: 0.4,
            tipSplineSampleRes: 0.4,
            edgeScaleTolerance: 0.5
        }

        params = Object.assign(params ?? {}, DEFAULT_PARAMS);

        let bladeGeometry = new BladeGeometry();

        let crossSection = this.getBladeCrossSection(params?.crossSection);

        let bladeColor = (params?.color) ? new THREE.Color(params.color): new THREE.Color("rgb(127, 127, 127)");

        /////////////////////////////////////////////////////////////////
        //                    BLADE SECTION LENGTHS                    //
        /////////////////////////////////////////////////////////////////

        if (!params.bladeBaseProportion)
            throw new Error("No blade base proportion defined");

        if (!params.bladeMidProportion)
            throw new Error("No blade mid proportion defined");

        let bladeLength = utils.setPrecision(
            utils.getRandomFloat(
                this._prng,
                template.minBladeLength,
                template.maxBladeLength),
            2);

        let baseSectionLength =
            utils.setPrecision(bladeLength * params.bladeBaseProportion, 2);

        let midSectionLength =
            utils.setPrecision(bladeLength * params.bladeMidProportion, 2);

        let tipSectionLength: number =
            utils.setPrecision(bladeLength - (baseSectionLength + midSectionLength), 2);

        if (this._verbose) {
            console.log(
                `DEBUG:: Base section length: ${baseSectionLength},`,
                `Mid section length: ${midSectionLength},`,
                `Total blade length: ${baseSectionLength + midSectionLength + tipSectionLength},`,
                `Desired blade length: ${bladeLength}`
            );
        }

        /////////////////////////////////////////////////////////////////
        //                        BUILD SECTIONS                       //
        /////////////////////////////////////////////////////////////////

        bladeGeometry.setBladeCrossSection(new CrossSection(crossSection), crossSection.edgeVertices, bladeColor)

        bladeGeometry.scale(new THREE.Vector2(
            template.bladeThickness / crossSection.thickness,
            template.baseBladeWidth / crossSection.width))

        bladeGeometry.rotate(new THREE.Quaternion()
            .setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 8))

        bladeGeometry.extrude(baseSectionLength)

        bladeGeometry.rotate(new THREE.Quaternion()
            .setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 8))



        // bladeGeometry.translate(new THREE.Vector3(0, 1, 0.3))
        bladeGeometry.scale(0.75)



        bladeGeometry.extrude(midSectionLength)
        bladeGeometry.rotate(new THREE.Quaternion()
            .setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 8))
        // // bladeGeometry.translate(new THREE.Vector3(0, 0, 0.3))
        bladeGeometry.scale(0.75)

        // bladeGeometry.rotate(new THREE.Quaternion()
        //     .setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 8));
        bladeGeometry.extrude(tipSectionLength)
        bladeGeometry.scale(new THREE.Vector2(0, 1));


        sword.add(bladeGeometry);
    }

    /**
     * Creates a box-shapped guard and merges it with the swords geometry.
     *
     * @param sword
     * @param params
     */
    private buildGuard(sword: GeometryData, template: SwordTemplate, params?: GuardParams) {

        const DEFAULT_PARAMS: GuardParams = {
            color: "#7f5100",
            thickness:  0.01,
            guardBladeRatio: 1.5
        }

        params = Object.assign(params ?? {}, DEFAULT_PARAMS);

        var guardGeometry = new THREE.BoxGeometry(template.bladeThickness + 0.04, params.thickness, 0.06 + template.baseBladeWidth);

        var guardGeometryData = new GeometryData().fromGeometry(guardGeometry, new THREE.Color(params.color));

        sword.add(guardGeometryData);
    }

    /**
     * Creates a cylindrical handle and merges it with the swords geometry.
     *
     * @param sword
     * @param params
     */
    private buildHandle(sword: GeometryData, template: SwordTemplate, params?: HandleParams) {

        const DEFAULT_PARAMS: HandleParams = {
            color: "#cc5100",
            radius: 0.015
        }

        params = Object.assign(params ?? {}, DEFAULT_PARAMS);

        // Create a simple cylinder
        var handleLength = 0.2;

        var handleGeometry = new THREE.CylinderGeometry(
            params.radius,
            params.radius ?? 0 * 0.75,
            handleLength,
            8);

        // Moves translates the handle to fall below the guard and blade
        handleGeometry.translate(0,-handleLength / 2, 0);

        // Convert the box to a buffer geometry
        var handleGeometryData = new GeometryData().fromGeometry(handleGeometry, new THREE.Color(params.color));

        sword.add(handleGeometryData);
    }

    /**
     * Creates a spherical pommel and merges it with the swords geometry.
     *
     * @param sword
     * @param params
     */
    private buildPommel(sword: GeometryData, template: SwordTemplate, params?: PommelParams) {

        const DEFAULT_PARAMS: PommelParams = {
            color: "#e5cc59",
            pommelBladeWidthRatio: 0.50,
        }

        params = Object.assign(params ?? {}, DEFAULT_PARAMS);

        var pommelRadius = 0.025;
        var geometry = new THREE.SphereGeometry(pommelRadius, 5, 5);
        var handleLength = 0.2;

        // Translates the pommel to fall below the handle
        geometry.translate(0, -handleLength, 0);

        // Convert the box to a buffer geometry
        var pommelGeometryData = new GeometryData().fromGeometry(geometry, new THREE.Color(params.color));

        // Add the pommel's geometry data to the sword
        sword.add(pommelGeometryData);
    }

    // static ConfigureSplinePointSpacing(edgeSplines: THREE.SplineCurve[], edgePositions: THREE.Vector2[], cPIndices: number[], equalSpacing: boolean,
    //     sectionHeight: number, heightOffset: number, prng : seedrandom.prng, params: SwordGenerationParams) {

    //     var nCPs = cPIndices.length;
    //     var equalCPSpacing = utils.setPrecision(sectionHeight / nCPs, 3);

    //     if (equalSpacing == true) {
    //         // Loop through each layer of edge control points
    //         for (var j = 0; j < cPIndices.length; j++) {
    //             var layerIndex = cPIndices[j];
    //             for (var i = 0; i < edgeSplines.length; i++) {
    //                 edgeSplines[i].points[layerIndex].x = (Math.abs(edgePositions[i].x) > Math.abs(edgePositions[i].y)) ?
    //                     utils.setPrecision(edgePositions[i].x, 2) : utils.setPrecision(edgePositions[i].y, 2);

    //                 edgeSplines[i].points[layerIndex].y = utils.setPrecision(((j+1)*equalCPSpacing) + heightOffset, 2);
    //             }
    //         }
    //     }



    //     else {
    //         // We keep track of how much height is left in this sections
    //         var spaceLeft = sectionHeight;

    //         // Loop through all the layers
    //         for (var j = 0; j < cPIndices.length; j++) {

    //             var layerIndex = cPIndices[j];

    //             if (j == cPIndices.length - 1) {
    //                 // Change the y value of all the vertices in this layer
    //                 for (var i = 0; i < edgeSplines.length; i++) {
    //                     edgeSplines[i].points[layerIndex].x = (Math.abs(edgePositions[i].x) > Math.abs(edgePositions[i].y)) ?
    //                         edgePositions[i].x : edgePositions[i].y;
    //                     edgeSplines[i].points[layerIndex].y = ((j+1)*equalCPSpacing) + heightOffset;
    //                 }
    //             }

    //             else {
    //                 // randomly determine a height and modify the verts
    //                 var minSpacing = params.minCPSpacing * equalCPSpacing;
    //                 var maxSpacing = params.maxCPSpacing * equalCPSpacing;
    //                 var randHeight =  utils.getRandomFloat(prng, minSpacing, maxSpacing);
    //                 var heightCap = spaceLeft - (minSpacing * (nCPs - layerIndex));
    //                 var cPSpace = Math.min(randHeight, heightCap);

    //                 for (var i = 0; i < edgeSplines.length; i++) {
    //                     edgeSplines[i].points[layerIndex].x = (Math.abs(edgePositions[i].x) > Math.abs(edgePositions[i].y)) ?
    //                         edgePositions[i].x : edgePositions[i].y;
    //                     edgeSplines[i].points[layerIndex].y = ((j+1)*equalCPSpacing) + heightOffset;
    //                 }

    //                 spaceLeft -= cPSpace;
    //             }
    //         }
    //     }
    // }

    // /**
    //  * @deprecated
    //  * @param vertices
    //  * @param bladeLayers
    //  * @param layerIndices
    //  * @param equalDivs
    //  * @param sectionHeight
    //  * @param heightOffset
    //  * @param prng
    //  */
    // static configureSectionHeight(vertices: number[], bladeLayers: CrossSection[], layerIndices: number[], equalDivs: boolean,
    //     sectionHeight: number, heightOffset: number, prng : seedrandom.prng, params: SwordGenerationParams) {

    //     var nSamplePoints = 10;

    //     var equalDivHeight: number = sectionHeight / nSamplePoints;
    //     equalDivHeight = Number.parseFloat(equalDivHeight.toFixed(3));


    //     // Sets the y property of each vertex in the cross section
    //     // to the height of tha cross section
    //     if (equalDivs) {
    //         for (var j = 0; j < layerIndices.length; j++) {
    //             var layerIndex = layerIndices[j];
    //             var layer = bladeLayers[layerIndex];
    //             for (var i = 0; i < layer.getVertices().length; i++) {
    //                 vertices[layer.getVertices()[i] * 3 + 1] = ((j+1)*equalDivHeight) + heightOffset;
    //             }
    //         };
    //     }


    //     else {
    //         // We keep track of how much height is left in this sections
    //         var spaceLeft = sectionHeight;
    //         var totalHeightOfDivs = 0.0;

    //         // Loop through all the layers
    //         for (var j = 0; j < layerIndices.length; j++) {
    //             var layerIndex = layerIndices[j];
    //             var layer = bladeLayers[layerIndex];

    //             if (j == layerIndices.length - 1) {
    //                 // Change the y value of all the vertices in this layer
    //                 for (var vertexIndex = 0; vertexIndex < layer.vertices.length; vertexIndex++) {
    //                     vertices[layer.vertices[vertexIndex] * 3 + 1] = sectionHeight + heightOffset;
    //                 }
    //                 break;
    //             }

    //             else {
    //                 // randomly determine a height and modify the verts
    //                 var minDivHeight = equalDivHeight * 0.5;
    //                 var maxDivHeight = equalDivHeight;
    //                 var randHeight =  utils.getRandomFloat(prng, minDivHeight, maxDivHeight);
    //                 var heightCap = spaceLeft - (minDivHeight * (nSamplePoints - layerIndex));
    //                 var divHeight = Math.min(randHeight, heightCap);


    //                 // Change the y value of all the vertices in this layer
    //                 for (var vertexIndex = 0; vertexIndex < layer.vertices.length; vertexIndex++) {
    //                     vertices[layer.vertices[vertexIndex] * 3 + 1] = divHeight + (totalHeightOfDivs) + heightOffset;
    //                 }

    //                 totalHeightOfDivs += divHeight;
    //                 spaceLeft -= divHeight;
    //             }
    //         }
    //     }

    //     return vertices;
    // }
}
