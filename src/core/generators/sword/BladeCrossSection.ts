/**
 * Cross sections are the starting point for generating
 * blade geometry.
 */
export interface BladeCrossSection {
    name: string
    vertices: number[]      // (x,z) coordinates for vertices
    edgeVertices: number[]  // Indices of vertices are on the cutting edges
    width: number,          // Distance between the vertices on cutting edges
    thickness: number       // Distance between vertices on the axis orthogonal to width
}

export const DIAMOND: BladeCrossSection = {
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
}

export const HALLOW_GROUND: BladeCrossSection = {
    "name":"HallowGround",
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
}

export const HEXAGONAL: BladeCrossSection = {
    "name": "Hexagonal",
        "vertices": [
            -0.1, -0.3,
            0.0, -0.5,
            0.1, -0.3,
            0.1, 0.3,
            0.0, 0.5,
            -0.1, 0.3
        ],
        "edgeVertices": [
            1,
            4
        ],
        "width": 1,
        "thickness": 0.2
}

export const THICKENED_DIAMOND: BladeCrossSection = {
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
}

export const LENTICULAR: BladeCrossSection = {
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
}

export const FULLER: BladeCrossSection = {
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
}

export const DOUBLE_FULLER: BladeCrossSection = {
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
        7
    ],
    "width": 1.0,
    "thickness": 0.3
}

export const BROAD_FULLER: BladeCrossSection = {
    "name": "BroadFuller",
    "vertices": [
        0.0, 0.5,
        0.02, 0.4,
        0.01, 0.0,
        0.02, -0.4,
        0.0, -0.5,
        -0.02, 0.4,
        -0.01, 0.0,
        -0.02, -0.4
    ],
    "edgeVertices": [
        0,
        4
    ],
    "width": 1.0,
    "thickness": 0.04
}

export const  BLADE_CROSS_SECTIONS: any = {
    "diamond": DIAMOND,
    "hallow_ground": HALLOW_GROUND,
    "hexagonal": HEXAGONAL,
    "thickened_diamond": THICKENED_DIAMOND,
    "lenticular": LENTICULAR,
    "fuller": FULLER,
    "doule_fuller": DOUBLE_FULLER,
    "broad_fuller": BROAD_FULLER
}

export function getCrossSection(style: string) {
    if (isSupportedCrossSection(style)) {
        return BLADE_CROSS_SECTIONS[style] as BladeCrossSection;
    }
}

export function isSupportedCrossSection(style: string): boolean {
    return Object.keys(BLADE_CROSS_SECTIONS).indexOf(style) >= 0;
}
