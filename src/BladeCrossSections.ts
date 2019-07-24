export interface BladeCrossSection {
    vertices: number[]      // (x,z) coordinates for vertices
    edgeVertices: number[]  // Indices of vertices are on the cutting edges
    width: number,          // Distance between the vertices on cutting edges
    thickness: number       // Distance between vertices on the axis orthogonal to width
}

export const CrossSectionNames: string[] = [
    "Diamond",
    "HallowGround",
    "Hexagonal",
    "ThickenedDiamond",
    "Lenticular",
    "Fuller",
    "DoubleFuller",
    "BroadFuller"
];

// These shapes were adapted from
// https://en.wikipedia.org/wiki/Longsword#/media/File:Sword_cross_section.svg
export const SupportedCrossSections = new Map<string, BladeCrossSection>([
    ["Diamond", {
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
    }],
    ["HallowGround", {
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
            -0.15, 0.0
            -0.06, 0.1,
            -0.03, 0.25
        ],
        "edgeVertices": [
            0,
            6,
        ],
        "width": 1.0,
        "thickness": 0.3
    }],
    ["Hexagonal", {
        "vertices": [
            0.0, 0.5,
            0.01, 0.4,
            0.01, -0.4,
            0.0, -0.5,
            -0.01, 0.4,
            -0.01, -0.4,
        ],
        "edgeVertices": [
            0,
            4,
        ],
        "width": 1.0,
        "thickness": 0.02
    }],
    ["ThickenedDiamond", {
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
    }],
    ["Lenticular", {
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
            7,
        ],
        "width": 1.0,
        "thickness": 0.3
    }],
    ["Fuller", {
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
            8,
        ],
        "width": 1.0,
        "thickness": 0.3
    }],
    ["DoubleFuller", {
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
            7,
        ],
        "width": 1.0,
        "thickness": 0.3
    }],
    ["BroadFuller", {
        "vertices": [
            0.0, 0.5,
            0.02, 0.4,
            0.01, 0.0,
            0.02, -0.4,
            0.0, -0.5,
            -0.02, 0.4,
            -0.01, 0.0,
            -0.02, -0.4,
        ],
        "edgeVertices": [
            0,
            4,
        ],
        "width": 1.0,
        "thickness": 0.04
    }]
]);
