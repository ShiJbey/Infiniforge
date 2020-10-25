"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwordGenerator = void 0;
const THREE = require("three");
const utils = require("../../utilities/utils");
const Generator_1 = require("../Generator");
const SwordTemplate_1 = require("./SwordTemplate");
const BladeCrossSection_1 = require("./BladeCrossSection");
const GeometryData_1 = require("../../modeling/GeometryData");
const CrossSection_1 = require("../../modeling/CrossSection");
const BladeGeometery_1 = require("./BladeGeometery");
class SwordGenerator extends Generator_1.Generator {
    constructor(verbose = false) {
        super(verbose);
    }
    generate(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (params.seed) {
                this.setSeed(params.seed);
            }
            let template = this.getSwordTemplate(params.template);
            let sword = new GeometryData_1.GeometryData();
            this.buildBlade(sword, template, params.bladeParams);
            this.buildGuard(sword, template, params.guardParams);
            this.buildHandle(sword, template, params.handleParams);
            this.buildPommel(sword, template, params.pommelParams);
            if (params.output === "mesh") {
                return sword.toMesh();
            }
            else {
                return yield sword.toGlTF();
            }
        });
    }
    getSwordTemplate(templateName) {
        if (templateName) {
            if (templateName === "random") {
                return this.getRandomTemplate();
            }
            else {
                let template = SwordTemplate_1.getTemplate(templateName);
                if (template) {
                    return template;
                }
                else {
                    throw `Invalid sword template '${templateName}'`;
                }
            }
        }
        return this.getRandomTemplate();
    }
    getBladeCrossSection(crossSectionName) {
        if (crossSectionName) {
            if (crossSectionName === "random") {
                return this.getRandomBladeCrossSection();
            }
            else {
                let crossSection = BladeCrossSection_1.getCrossSection(crossSectionName);
                if (crossSection) {
                    return crossSection;
                }
                else {
                    throw `Invalid blade cross-section '${crossSection}'`;
                }
            }
        }
        return this.getRandomBladeCrossSection();
    }
    getRandomTemplate() {
        let randomIndex = utils.getRandomInt(this._prng, 0, Object.keys(SwordTemplate_1.SWORD_TEMPLATES).length - 1);
        let crossSectionName = Object.keys(SwordTemplate_1.SWORD_TEMPLATES)[randomIndex];
        return SwordTemplate_1.SWORD_TEMPLATES[crossSectionName];
    }
    getRandomBladeCrossSection() {
        let randomIndex = utils.getRandomInt(this._prng, 0, Object.keys(BladeCrossSection_1.BLADE_CROSS_SECTIONS).length - 1);
        let crossSectionName = Object.keys(BladeCrossSection_1.BLADE_CROSS_SECTIONS)[randomIndex];
        return BladeCrossSection_1.BLADE_CROSS_SECTIONS[crossSectionName];
    }
    buildBlade(sword, template, params) {
        var _a, _b, _c, _d;
        const DEFAULT_PARAMS = {
            color: "rgb(127, 127, 127)",
            crossSection: "random",
            bladeBaseProportion: 0.4,
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
            baseSplineSamples: 4,
            midSplineSamples: 4,
            tipSplineSamples: 0,
            edgeScaleTolerance: 0
        };
        params = Object.assign(DEFAULT_PARAMS, params);
        let crossSection = this.getBladeCrossSection(params === null || params === void 0 ? void 0 : params.crossSection);
        let bladeColor = (params === null || params === void 0 ? void 0 : params.color) ? new THREE.Color(params.color) : new THREE.Color("rgb(127, 127, 127)");
        if (!params.bladeBaseProportion)
            throw new Error("No blade base proportion defined");
        if (!params.bladeMidProportion)
            throw new Error("No blade mid proportion defined");
        let bladeLength = utils.getRandomFloat(this._prng, template.minBladeLength, template.maxBladeLength);
        let baseSectionLength = bladeLength * params.bladeBaseProportion;
        let midSectionLength = bladeLength * params.bladeMidProportion;
        let tipSectionLength = bladeLength - (baseSectionLength + midSectionLength);
        var nControlPoints = 0;
        if (params.randomNumControlPoints) {
            nControlPoints = utils.getRandomInt(this._prng, (_a = params.minSplineControlPoints) !== null && _a !== void 0 ? _a : 2, (_b = params.maxSplineControlPoints) !== null && _b !== void 0 ? _b : 10);
        }
        var edgeSpline = this.CreateEdgeSpline(nControlPoints, (_c = params.edgeScaleTolerance) !== null && _c !== void 0 ? _c : .2, params.evenSpacedBaseCPs);
        let bladeGeometry = new BladeGeometery_1.BladeGeometry(bladeLength, template.extrusionCurve);
        bladeGeometry.setBladeCrossSection(new CrossSection_1.CrossSection(crossSection), crossSection.edgeVertices, bladeColor);
        bladeGeometry.scale(new THREE.Vector2(template.bladeThickness / crossSection.thickness, template.baseBladeWidth / crossSection.width));
        bladeGeometry.extrudeSection(edgeSpline, (_d = params.baseSplineSamples) !== null && _d !== void 0 ? _d : 5, baseSectionLength);
        bladeGeometry.extrude(midSectionLength);
        bladeGeometry.scale(0.8);
        bladeGeometry.createTip("clip", tipSectionLength);
        sword.add(bladeGeometry);
    }
    buildGuard(sword, template, params) {
        const DEFAULT_PARAMS = {
            color: "#7f5100",
            thickness: 0.01,
            guardBladeRatio: 1.5
        };
        params = Object.assign(DEFAULT_PARAMS, params);
        var guardGeometry = new THREE.BoxGeometry(template.bladeThickness + 0.04, params.thickness, 0.06 + template.baseBladeWidth);
        var guardGeometryData = new GeometryData_1.GeometryData().fromGeometry(guardGeometry, new THREE.Color(params.color));
        sword.add(guardGeometryData);
    }
    buildHandle(sword, template, params) {
        var _a;
        const DEFAULT_PARAMS = {
            color: "#cc5100",
            radius: 0.015
        };
        params = Object.assign(DEFAULT_PARAMS, params);
        var handleGeometry = new THREE.CylinderGeometry(params.radius, (_a = params.radius) !== null && _a !== void 0 ? _a : 0 * 0.75, template.handleLength, 8);
        handleGeometry.translate(0, -template.handleLength / 2, 0);
        var handleGeometryData = new GeometryData_1.GeometryData().fromGeometry(handleGeometry, new THREE.Color(params.color));
        sword.add(handleGeometryData);
    }
    buildPommel(sword, template, params) {
        const DEFAULT_PARAMS = {
            color: "#e5cc59",
            pommelBladeWidthRatio: 0.50,
        };
        params = Object.assign(DEFAULT_PARAMS, params);
        var pommelRadius = 0.025;
        var geometry = new THREE.SphereGeometry(pommelRadius, 5, 5);
        geometry.translate(0, -template.handleLength, 0);
        var pommelGeometryData = new GeometryData_1.GeometryData().fromGeometry(geometry, new THREE.Color(params.color));
        sword.add(pommelGeometryData);
    }
    CreateEdgeSpline(nPoints, widthTolerance, evenSpacing = true) {
        if (nPoints < 0) {
            throw new Error("Invalid number of points to create spline curve");
        }
        var splinePoints = [
            new THREE.Vector2(0, 0)
        ];
        var spacing = utils.divideValue(1.0, nPoints + 1, evenSpacing, this._prng);
        var totalSpaceing = 0;
        for (let i = 0; i < spacing.length; i++) {
            let point = new THREE.Vector2();
            if (i == spacing.length - 1) {
                point.y = 1.0;
            }
            totalSpaceing += spacing[i];
            point.y = totalSpaceing;
            point.x = utils.getRandomFloat(this._prng, -widthTolerance / 2, widthTolerance);
            splinePoints.push(point);
        }
        return new THREE.SplineCurve(splinePoints);
    }
}
exports.SwordGenerator = SwordGenerator;
//# sourceMappingURL=SwordGenerator.js.map