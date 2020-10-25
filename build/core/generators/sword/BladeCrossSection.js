"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSupportedCrossSection = exports.getCrossSection = exports.BLADE_CROSS_SECTIONS = exports.SINGLE_EDGE = exports.BROAD_FULLER = exports.DOUBLE_FULLER = exports.FULLER = exports.LENTICULAR = exports.THICKENED_DIAMOND = exports.HEXAGONAL = exports.HALLOW_GROUND = exports.DIAMOND = void 0;
exports.DIAMOND = {
    "name": "Diamond",
    "vertices": [
        0.0, 0.5,
        0.15, 0.0,
        0.0, -0.5,
        -0.15, 0.0
    ],
    "edgeVertices": [
        0,
        2
    ],
    "width": 1.0,
    "thickness": 0.3
};
exports.HALLOW_GROUND = {
    "name": "HallowGround",
    "vertices": [
        0.0, 0.5,
        0.03, 0.25,
        0.06, 0.1,
        0.15, 0.0,
        0.06, -0.1,
        0.03, -0.25,
        0.0, -0.5,
        -0.03, -0.25,
        -0.06, -0.1,
        -0.15, 0.0,
        -0.06, 0.1,
        -0.03, 0.25
    ],
    "edgeVertices": [
        0,
        6
    ],
    "width": 1.0,
    "thickness": 0.3
};
exports.HEXAGONAL = {
    "name": "Hexagonal",
    "vertices": [
        0.0, 0.5,
        0.1, 0.3,
        0.1, -0.3,
        0.0, -0.5,
        -0.1, -0.3,
        -0.1, 0.3,
    ],
    "edgeVertices": [
        0,
        3
    ],
    "width": 1,
    "thickness": 0.2
};
exports.THICKENED_DIAMOND = {
    "name": "ThickenedDiamond",
    "vertices": [
        0.0, 0.5,
        0.5, 0.0,
        0.0, -0.5,
        -0.5, 0.0
    ],
    "edgeVertices": [
        0,
        2
    ],
    "width": 1.0,
    "thickness": 1.3
};
exports.LENTICULAR = {
    "name": "Lenticular",
    "vertices": [
        0.0, 0.5,
        0.04, 0.4,
        0.10, 0.1,
        0.15, 0.03,
        0.15, -0.03,
        0.10, -0.1,
        0.04, -0.4,
        0.0, -0.5,
        -0.04, -0.4,
        -0.10, -0.1,
        -0.15, -0.03,
        -0.15, 0.03,
        -0.10, 0.1,
        -0.04, 0.4
    ],
    "edgeVertices": [
        0,
        7
    ],
    "width": 1.0,
    "thickness": 0.3
};
exports.FULLER = {
    "name": "Fuller",
    "vertices": [
        0.0, 0.5,
        0.04, 0.4,
        0.10, 0.1,
        0.15, 0.04,
        0.10, 0.0,
        0.15, -0.04,
        0.10, -0.1,
        0.04, -0.4,
        0.0, -0.5,
        -0.04, -0.4,
        -0.10, -0.1,
        -0.15, -0.03,
        -0.10, 0.0,
        -0.15, 0.03,
        -0.10, 0.1,
        -0.04, 0.4
    ],
    "edgeVertices": [
        0,
        8
    ],
    "width": 1.0,
    "thickness": 0.3
};
exports.DOUBLE_FULLER = {
    "name": "DoubleFuller",
    "vertices": [
        0.0, 0.5,
        0.04, 0.4,
        0.10, 0.1,
        0.05, 0.07,
        0.15, 0.03,
        0.15, -0.03,
        0.05, -0.07,
        0.10, -0.1,
        0.04, -0.4,
        0.0, -0.5,
        -0.04, -0.4,
        -0.10, -0.1,
        -0.05, -0.07,
        -0.15, -0.03,
        -0.15, 0.03,
        -0.05, 0.07,
        -0.10, 0.1,
        -0.04, 0.4
    ],
    "edgeVertices": [
        0,
        9
    ],
    "width": 1.0,
    "thickness": 0.3
};
exports.BROAD_FULLER = {
    "name": "BroadFuller",
    "vertices": [
        0.0, 0.5,
        0.02, 0.4,
        0.01, 0.0,
        0.02, -0.4,
        0.0, -0.5,
        -0.02, -0.4,
        -0.01, 0.0,
        -0.02, 0.4
    ],
    "edgeVertices": [
        0,
        4
    ],
    "width": 1.0,
    "thickness": 0.04
};
exports.SINGLE_EDGE = {
    "name": "katana",
    "vertices": [
        0.0, 0.5,
        0.01, 0.1,
        0.01, -0.5,
        -0.01, -0.5,
        -0.01, 0.1,
    ],
    "edgeVertices": [
        0
    ],
    "width": 1,
    "thickness": 0.02
};
exports.BLADE_CROSS_SECTIONS = {
    "diamond": exports.DIAMOND,
    "hallow_ground": exports.HALLOW_GROUND,
    "hexagonal": exports.HEXAGONAL,
    "thickened_diamond": exports.THICKENED_DIAMOND,
    "lenticular": exports.LENTICULAR,
    "fuller": exports.FULLER,
    "doule_fuller": exports.DOUBLE_FULLER,
    "broad_fuller": exports.BROAD_FULLER,
    "single_edge": exports.SINGLE_EDGE
};
function getCrossSection(style) {
    if (isSupportedCrossSection(style)) {
        return exports.BLADE_CROSS_SECTIONS[style];
    }
}
exports.getCrossSection = getCrossSection;
function isSupportedCrossSection(style) {
    return Object.keys(exports.BLADE_CROSS_SECTIONS).indexOf(style) >= 0;
}
exports.isSupportedCrossSection = isSupportedCrossSection;
//# sourceMappingURL=BladeCrossSection.js.map