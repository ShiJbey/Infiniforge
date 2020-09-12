"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSupportedTemplate = exports.getTemplate = exports.SWORD_TEMPLATES = exports.GREAT_SWORD = exports.SHORT_SWORD = exports.LONG_SWORD = void 0;
exports.LONG_SWORD = {
    "baseBladeWidth": 0.2,
    "minBladeLength": 0.85,
    "maxBladeLength": 1.1,
    "minHandleLength": 0.16,
    "maxHandleLength": 0.28,
    "hands": 2,
    "bladeThickness": 0.01
};
exports.SHORT_SWORD = {
    "baseBladeWidth": 0.2,
    "minBladeLength": 0.5,
    "maxBladeLength": 0.5,
    "minHandleLength": 0.3,
    "maxHandleLength": 0.4,
    "hands": 1,
    "bladeThickness": 0.01
};
exports.GREAT_SWORD = {
    "baseBladeWidth": 0.5,
    "minBladeLength": 1.5,
    "maxBladeLength": 2.0,
    "minHandleLength": 0.5,
    "maxHandleLength": 1.0,
    "hands": 2,
    "bladeThickness": 0.01
};
exports.SWORD_TEMPLATES = {
    "short": exports.SHORT_SWORD,
    "long": exports.LONG_SWORD,
    "great": exports.GREAT_SWORD
};
function getTemplate(style) {
    if (isSupportedTemplate(style)) {
        return exports.SWORD_TEMPLATES[style];
    }
}
exports.getTemplate = getTemplate;
function isSupportedTemplate(style) {
    return Object.keys(exports.SWORD_TEMPLATES).indexOf(style) >= 0;
}
exports.isSupportedTemplate = isSupportedTemplate;
//# sourceMappingURL=SwordTemplate.js.map