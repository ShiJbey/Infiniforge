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
const DIMENSION_PRECISION = 2;
const DEFAULT_BASE_PROPORTION = 0.3;
const DEFAULT_MID_PROPORTION = 0.5;
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
        const DEFAULT_PARAMS = {
            color: "rgb(127, 127, 127)",
        };
        params = Object.assign(params !== null && params !== void 0 ? params : {}, DEFAULT_PARAMS);
        let bladeGeometry = new BladeGeometery_1.BladeGeometry();
        let crossSection = this.getBladeCrossSection(params === null || params === void 0 ? void 0 : params.crossSection);
        let bladeColor = (params === null || params === void 0 ? void 0 : params.color) ? new THREE.Color(params.color) : new THREE.Color("rgb(127, 127, 127)");
        bladeGeometry
            .setCrossSection(new CrossSection_1.CrossSection(crossSection), bladeColor);
        let bladeLength = utils.setPrecision(utils.getRandomFloat(this._prng, template.minBladeLength, template.maxBladeLength), 2);
        let baseSectionLength = (params === null || params === void 0 ? void 0 : params.bladeBaseProportion) ?
            utils.setPrecision(bladeLength * params.bladeBaseProportion, 2) :
            utils.setPrecision(bladeLength * DEFAULT_BASE_PROPORTION, 2);
        let midSectionLength = (params === null || params === void 0 ? void 0 : params.bladeMidProportion) ?
            utils.setPrecision(bladeLength * params.bladeMidProportion, 2) :
            utils.setPrecision(bladeLength * DEFAULT_MID_PROPORTION, 2);
        let tipSectionLength = utils.setPrecision(bladeLength - (baseSectionLength + midSectionLength), 2);
        if (this._verbose) {
            console.log(`DEBUG:: Base section length: ${baseSectionLength},`, `Mid section length: ${midSectionLength},`, `Total blade length: ${baseSectionLength + midSectionLength + tipSectionLength}`, `DEBUG:: Desired blade length: ${bladeLength}`);
        }
        bladeGeometry.extrude(6);
        sword.add(bladeGeometry);
    }
    buildGuard(sword, template, params) {
        const DEFAULT_PARAMS = {
            color: "#7f5100",
            thickness: 0.1,
            guardBladeRatio: 1.5
        };
        params = Object.assign(params !== null && params !== void 0 ? params : {}, DEFAULT_PARAMS);
        var guardGeometry = new THREE.BoxGeometry(template.bladeThickness + 0.1, params.thickness, 0.3 + template.baseBladeWidth);
        var guardGeometryData = new GeometryData_1.GeometryData().fromGeometry(guardGeometry, new THREE.Color(params.color));
        sword.add(guardGeometryData);
    }
    buildHandle(sword, template, params) {
        const DEFAULT_PARAMS = {
            color: "#cc5100",
            radius: 0.1
        };
        params = Object.assign(params !== null && params !== void 0 ? params : {}, DEFAULT_PARAMS);
        var handleLength = 0.4 * template.hands;
        var handleGeometry = new THREE.CylinderGeometry(template.bladeThickness / 2, template.bladeThickness / 2, handleLength, 8);
        handleGeometry.translate(0, -handleLength / 2, 0);
        var handleGeometryData = new GeometryData_1.GeometryData().fromGeometry(handleGeometry, new THREE.Color(params.color));
        sword.add(handleGeometryData);
    }
    buildPommel(sword, template, params) {
        const DEFAULT_PARAMS = {
            color: "#e5cc59",
            pommelBladeWidthRatio: 0.50
        };
        params = Object.assign(params !== null && params !== void 0 ? params : {}, DEFAULT_PARAMS);
        var pommelRadius = template.bladeThickness;
        var geometry = new THREE.SphereGeometry(pommelRadius, 5, 5);
        var handleLength = 0.4 * template.hands;
        geometry.translate(0, -handleLength, 0);
        var pommelGeometryData = new GeometryData_1.GeometryData().fromGeometry(geometry, new THREE.Color(params.color));
        sword.add(pommelGeometryData);
    }
}
exports.SwordGenerator = SwordGenerator;
//# sourceMappingURL=SwordGenerator.js.map