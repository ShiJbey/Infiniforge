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
    randomTip() {
        let randomIndex = utils.getRandomInt(this._prng, 0, Object.keys(BladeGeometery_1.TIP_GEOMETRIES).length - 1);
        return BladeGeometery_1.TIP_GEOMETRIES[randomIndex];
    }
    buildBlade(sword, template, params) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        let color = (_a = params === null || params === void 0 ? void 0 : params.color) !== null && _a !== void 0 ? _a : "rgb(128, 128, 128)";
        let tip = (params === null || params === void 0 ? void 0 : params.tip) ? ((params.tip == "random") ? this.randomTip() : params.tip) : "standard";
        let edgeScaleTolerance = (_b = params === null || params === void 0 ? void 0 : params.edgeScaleTolerance) !== null && _b !== void 0 ? _b : 0.1;
        let randomNumControlPoints = (_c = params === null || params === void 0 ? void 0 : params.randomNumControlPoints) !== null && _c !== void 0 ? _c : false;
        let minSplineControlPoints = (_d = params === null || params === void 0 ? void 0 : params.minSplineControlPoints) !== null && _d !== void 0 ? _d : 2;
        let maxSplineControlPoints = (_e = params === null || params === void 0 ? void 0 : params.maxSplineControlPoints) !== null && _e !== void 0 ? _e : 7;
        let evenSpacedBaseCPs = (_f = params === null || params === void 0 ? void 0 : params.evenSpacedBaseCPs) !== null && _f !== void 0 ? _f : false;
        let evenSpacedMidCPs = (_g = params === null || params === void 0 ? void 0 : params.evenSpacedMidCPs) !== null && _g !== void 0 ? _g : false;
        let evenSpacedTipCPs = (_h = params === null || params === void 0 ? void 0 : params.evenSpacedTipCPs) !== null && _h !== void 0 ? _h : false;
        let baseSplineSamples = (_j = params === null || params === void 0 ? void 0 : params.baseSplineSamples) !== null && _j !== void 0 ? _j : 8;
        let midSplineSamples = (_k = params === null || params === void 0 ? void 0 : params.baseSplineSamples) !== null && _k !== void 0 ? _k : 4;
        let tipSplineSamples = (_l = params === null || params === void 0 ? void 0 : params.baseSplineSamples) !== null && _l !== void 0 ? _l : 4;
        let baseSplineControlPoints = (_m = params === null || params === void 0 ? void 0 : params.baseSplineControlPoints) !== null && _m !== void 0 ? _m : 7;
        let midSplineControlPoints = (_o = params === null || params === void 0 ? void 0 : params.baseSplineControlPoints) !== null && _o !== void 0 ? _o : 5;
        let tipSplineControlPoints = (_p = params === null || params === void 0 ? void 0 : params.baseSplineControlPoints) !== null && _p !== void 0 ? _p : 5;
        let bladeBaseProportion = (_q = params === null || params === void 0 ? void 0 : params.bladeBaseProportion) !== null && _q !== void 0 ? _q : 0.4;
        let bladeMidProportion = (_r = params === null || params === void 0 ? void 0 : params.bladeMidProportion) !== null && _r !== void 0 ? _r : 0.45;
        let crossSection = this.getBladeCrossSection(params === null || params === void 0 ? void 0 : params.crossSection);
        if (bladeBaseProportion + bladeMidProportion > 1.0)
            throw new Error("Blade middle and base section proportions larger than 1.0");
        let bladeLength = utils.getRandomFloat(this._prng, template.minBladeLength, template.maxBladeLength);
        let baseSectionLength = bladeLength * bladeBaseProportion;
        let midSectionLength = bladeLength * bladeMidProportion;
        let tipSectionLength = bladeLength - (baseSectionLength + midSectionLength);
        if (template.name === "katana") {
            crossSection = this.getBladeCrossSection("single_edge");
            tip = "clip";
            edgeScaleTolerance = 0;
            var edgeSpline = new THREE.SplineCurve([
                new THREE.Vector2(0, 0),
                new THREE.Vector2(0, 1)
            ]);
        }
        else {
            let nControlPoints = baseSplineControlPoints;
            if (randomNumControlPoints) {
                nControlPoints = utils.getRandomInt(this._prng, minSplineControlPoints, maxSplineControlPoints);
            }
            var edgeSpline = this.CreateEdgeSpline(nControlPoints, edgeScaleTolerance, evenSpacedBaseCPs);
        }
        let bladeGeometry = new BladeGeometery_1.BladeGeometry(bladeLength, template.extrusionCurve)
            .setBladeCrossSection(new CrossSection_1.CrossSection(crossSection), crossSection.edgeVertices, new THREE.Color(color))
            .scale(new THREE.Vector2(template.bladeThickness / crossSection.thickness, template.baseBladeWidth / crossSection.width))
            .extrudeSection(edgeSpline, baseSplineSamples, baseSectionLength, 0.2)
            .extrudeSection(new THREE.SplineCurve([
            new THREE.Vector2(0, 0),
            new THREE.Vector2(0, 1)
        ]), midSplineSamples, midSectionLength, 0.3)
            .createTip(tip, tipSectionLength);
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
                point.x = 0.0;
            }
            else {
                totalSpaceing += spacing[i];
                point.y = totalSpaceing;
                point.x = utils.getRandomFloat(this._prng, -widthTolerance, widthTolerance);
            }
            splinePoints.push(point);
        }
        return new THREE.SplineCurve(splinePoints);
    }
}
exports.SwordGenerator = SwordGenerator;
//# sourceMappingURL=SwordGenerator.js.map