import * as THREE from 'three';
import * as utils from '../../utilities/utils';
import Generator from '../Generator';
import { SwordTemplate, SWORD_TEMPLATES } from './SwordTemplate';
import { BladeCrossSection, BLADE_CROSS_SECTIONS } from './BladeCrossSection';
import { BladeParams, HandleParams, GuardParams, PommelParams, SwordGenerationParams } from './SwordGenerationParams';
import GeometryData from '../../modeling/GeometryData';
import { CrossSection } from '../../modeling/CrossSection';
import BladeGeometry from './BladeGeometry';

export default class SwordGenerator extends Generator {

    constructor(verbose = false) {
        super(verbose);
    }

    /**
     * Generate a new sword
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
            return await sword.toGlTF(this._verbose);
        }
    }

    private getSwordTemplate(templateName?: string): SwordTemplate {

        if (templateName) {
            if (templateName === "random") {
                return this.getRandomTemplate();
            }
            else {
                let template = SWORD_TEMPLATES[templateName];
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
                let crossSection = BLADE_CROSS_SECTIONS[crossSectionName];
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

    private randomTip(): string {
        let randomIndex = utils.getRandomInt(this._prng, 0, Object.keys(BladeGeometry.TIP_GEOMETRIES).length - 1);
        return BladeGeometry.TIP_GEOMETRIES[randomIndex];
    }

    /**
     * Generates geometry data for the blade of the sword
     *
     * @param sword
     * @param params
     */
    private buildBlade(sword: GeometryData, template: SwordTemplate, params?: BladeParams) {

        let color = params?.color ??  "rgb(128, 128, 128)";
        let tip = (params?.tip) ? ((params.tip == "random") ? this.randomTip() : params.tip) : "standard";
        let edgeScaleTolerance = params?.edgeScaleTolerance ?? 0.1;
        let randomNumControlPoints = params?.randomNumControlPoints ?? false;
        let minSplineControlPoints = params?.minSplineControlPoints ?? 2;
        let maxSplineControlPoints = params?.maxSplineControlPoints ?? 7;
        let evenSpacedBaseCPs = params?.evenSpacedBaseCPs ?? false;
        let evenSpacedMidCPs = params?.evenSpacedMidCPs?? false;
        let evenSpacedTipCPs = params?.evenSpacedTipCPs ?? false;
        let baseSplineSamples = params?.baseSplineSamples ?? 8;
        let midSplineSamples = params?.baseSplineSamples ?? 4;
        let tipSplineSamples = params?.baseSplineSamples ?? 4;
        let baseSplineControlPoints = params?.baseSplineControlPoints ?? 7;
        let midSplineControlPoints = params?.baseSplineControlPoints ?? 5;
        let tipSplineControlPoints = params?.baseSplineControlPoints ?? 5;
        let bladeBaseProportion = params?.bladeBaseProportion ?? 0.4;
        let bladeMidProportion = params?.bladeMidProportion ?? 0.45;
        let crossSection = this.getBladeCrossSection(params?.crossSection);

        /////////////////////////////////////////////////////////////////
        //                    BLADE SECTION LENGTHS                    //
        /////////////////////////////////////////////////////////////////

        if (bladeBaseProportion + bladeMidProportion > 1.0)
            throw new Error("Blade middle and base section proportions larger than 1.0");

        let bladeLength = utils.getRandomFloat(this._prng, template.minBladeLength, template.maxBladeLength);

        let baseSectionLength = bladeLength * bladeBaseProportion;

        let midSectionLength = bladeLength * bladeMidProportion;

        let tipSectionLength = bladeLength - (baseSectionLength + midSectionLength);

        /////////////////////////////////////////////////////////////////
        //                        BUILD SECTIONS                       //
        /////////////////////////////////////////////////////////////////

        let edgeSpline: THREE.SplineCurve;

        if (template.name === "katana") {
            crossSection = this.getBladeCrossSection("single_edge");
            tip = "clip";
            edgeScaleTolerance = 0;

            edgeSpline = new THREE.SplineCurve([
                new THREE.Vector2(0, 0),
                new THREE.Vector2(0, 1)
            ]);
        } else {

            let nControlPoints = baseSplineControlPoints;

            if (randomNumControlPoints) {
                nControlPoints = utils.getRandomInt(
                    this._prng,
                    minSplineControlPoints,
                    maxSplineControlPoints)
            }

            edgeSpline = this.CreateEdgeSpline(
                nControlPoints,
                edgeScaleTolerance,
                evenSpacedBaseCPs);
        }

        let bladeGeometry = new BladeGeometry(bladeLength, template.extrusionCurve)
            .setBladeCrossSection(
                new CrossSection(crossSection),
                crossSection.edgeVertices,
                new THREE.Color(color),
                crossSection.normEdgeVertices ?? [],
                true)
            // Scale the cross section to fit the template
            .scale(
                new THREE.Vector2(
                    template.bladeThickness / crossSection.thickness,
                    template.baseBladeWidth / crossSection.width))
            // Extrude the base section of the blade
            .extrudeSection(edgeSpline, baseSplineSamples, baseSectionLength, 0.2)
            // Extrude the mid section of the blade
            // .extrude(midSectionLength)
            .extrudeSection(
                new THREE.SplineCurve([
                    new THREE.Vector2(0, 0),
                    new THREE.Vector2(0, 1)
                ]),
                midSplineSamples,
                midSectionLength,
                0.3)
            // Scale down the cross-section
            // .scale(0.7)
            // Create blade tip
            .createTip(tip, tipSectionLength);

        sword.add(bladeGeometry);
    }

    /**
     * Creates a box-shaped guard and merges it with the swords geometry.
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

        params = Object.assign(DEFAULT_PARAMS, params);

        const guardGeometry = new THREE.BoxGeometry(template.bladeThickness + 0.04, params.thickness, 0.06 + template.baseBladeWidth);

        const guardGeometryData = new GeometryData().fromGeometry(guardGeometry, new THREE.Color(params.color));

        sword.add(guardGeometryData);
    }

    /**
     * Creates a cylindrical handle and merges it with the swords geometry.
     *
     * @param sword
     * @param params
     */
    private buildHandle(sword: GeometryData, template: SwordTemplate, params?: HandleParams) {

        const color = params?.color ?? "#cc5100";
        const radius = params?.radius ?? 0.015;

        const handlesCsShape = new THREE.Shape()
            .setFromPoints(new THREE.EllipseCurve(
                0, 0,
                radius, radius * 2,
                0,  2 * Math.PI,  // aStartAngle, aEndAngle
                false,            // aClockwise
                0                // aRotation
            ).getPoints(8));

        const handleGeometryData = new GeometryData()
            .setCrossSection(CrossSection.createFromShape(handlesCsShape), new THREE.Color(color))
            .translate(-template.handleLength)

            if (template.name !== "katana") {
               handleGeometryData.scale(1.0/2.0);
            }

            handleGeometryData
                .extrude(new THREE.Vector3(0,template.handleLength,0));

            if (template.name !== "katana") {
               handleGeometryData.scale(2);
            }




        sword.add(handleGeometryData);
    }

    /**
     * Creates a spherical pommel and merges it with the swords geometry.
     *
     * @param sword
     * @param params
     */
    private buildPommel(sword: GeometryData, template: SwordTemplate, params?: PommelParams) {

        const color = params?.color ?? "#e5cc59";
        const pommelBladeWidthRatio = params?.pommelBladeWidthRatio ?? 0.50;
        const pommelRadius = 0.03;


        const geometry = new THREE.SphereGeometry(pommelRadius, 5, 5);

        // Translates the pommel to fall below the handle
        geometry.translate(0, -template.handleLength, 0);

        // Convert the box to a buffer geometry
        const pommelGeometryData = new GeometryData().fromGeometry(geometry, new THREE.Color(color));

        if (template.name === "katana") {
            let pommelCsShape = new THREE.Shape()
                .setFromPoints(new THREE.EllipseCurve(
                    0, 0,
                    0.016, 0.016 * 2,
                    0,  2 * Math.PI,  // aStartAngle, aEndAngle
	                false,            // aClockwise
	                0                 // aRotation
                ).getPoints(8));

            const pommelGeometryData = new GeometryData()
                .setCrossSection(CrossSection.createFromShape(pommelCsShape), new THREE.Color(color))
                .translate(-template.handleLength)
                .fill()
                .extrude(new THREE.Vector3(0,0.03,0));
        }

        // Add the pommel's geometry data to the sword
        sword.add(pommelGeometryData);
    }

    /**
     * Creates a SplineCurve for edge geometry
     *
     * @param nPoints Number of points in the curve not including ends
     */
    private CreateEdgeSpline(nPoints: number, widthTolerance: number, evenSpacing = true): THREE.SplineCurve {

        if (nPoints < 0) {
            throw new Error("Invalid number of points to create spline curve");
        }

        // Spline points are defined on the interval [0,1]
        // and are defined along the positive y-axis.
        // The  x-values of the points along the curve represent
        // the width of the blade's edge when measured from
        // the center of the cross-section

        const splinePoints: THREE.Vector2[] = [
            new THREE.Vector2(0, 0)
        ];

        // Spacings are the vertical distance between control points on the spline curve
        const spacing = utils.divideValue(1.0, nPoints + 1, evenSpacing, this._prng);

        let totalSpacing = 0;

        for (let i = 0; i < spacing.length; i++) {
            // Space the point vertically
            let point = new THREE.Vector2();
            if (i == spacing.length - 1) {
                point.y = 1.0;
                point.x = 0.0;
            } else {
                totalSpacing += spacing[i];
                point.y = totalSpacing;
                point.x = utils.getRandomFloat(this._prng, -widthTolerance, widthTolerance);
            }
            splinePoints.push(point);
        }

        return new THREE.SplineCurve(splinePoints);
    }
}
