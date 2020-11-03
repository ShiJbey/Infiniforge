"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTemplate = exports.SWORD_TEMPLATES = exports.KATANA = exports.GREAT_SWORD = exports.LONG_SWORD = exports.SHORT_SWORD = void 0;
const THREE = require("three");
exports.SHORT_SWORD = {
    name: "short_sword",
    bladeLength: 0.40,
    baseBladeWidth: 0.1,
    minBladeLength: 0.5,
    maxBladeLength: 0.5,
    minHandleLength: 0.12,
    maxHandleLength: 0.18,
    handleLength: .15,
    bladeThickness: 0.05,
    extrusionCurve: new THREE.SplineCurve([
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0, 1)
    ])
};
exports.LONG_SWORD = {
    name: "long_sword",
    bladeLength: 1.11,
    baseBladeWidth: 0.1,
    minBladeLength: 0.85,
    maxBladeLength: 1.1,
    minHandleLength: 0.16,
    maxHandleLength: 0.28,
    handleLength: .22,
    bladeThickness: 0.05,
    extrusionCurve: new THREE.SplineCurve([
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0, 1)
    ])
};
exports.GREAT_SWORD = {
    name: "great_sword",
    bladeLength: 1.55,
    baseBladeWidth: 0.064,
    minBladeLength: 1.27,
    maxBladeLength: 1.83,
    minHandleLength: 0.457,
    maxHandleLength: 0.533,
    handleLength: .3,
    bladeThickness: 0.05,
    extrusionCurve: new THREE.SplineCurve([
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0, 1)
    ])
};
exports.KATANA = {
    name: "katana",
    bladeLength: 1.05,
    baseBladeWidth: 0.1,
    minBladeLength: 1.00,
    maxBladeLength: 1.10,
    handleLength: 0.3,
    minHandleLength: 0.3,
    maxHandleLength: 0.3,
    bladeThickness: 0.05,
    extrusionCurve: new THREE.QuadraticBezierCurve(new THREE.Vector2(0, 0), new THREE.Vector2(0.0, 0.7), new THREE.Vector2(-0.1, 1))
};
exports.SWORD_TEMPLATES = {
    "short": exports.SHORT_SWORD,
    "long": exports.LONG_SWORD,
    "great": exports.GREAT_SWORD,
    "katana": exports.KATANA
};
function getTemplate(style) {
    if (Object.keys(exports.SWORD_TEMPLATES).indexOf(style) >= 0) {
        return exports.SWORD_TEMPLATES[style];
    }
    return null;
}
exports.getTemplate = getTemplate;
//# sourceMappingURL=SwordTemplate.js.map