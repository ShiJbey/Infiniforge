/**
 * Cross-sectional shape of a GeometryData object.
 * Starting point for generating blade geometry.
 */
export interface BladeCrossSection {
  /** cross section name */
  name: string;
  /** (x,z) coordinates for vertices */
  vertices: number[];
  /** indices of vertices are on the cutting edges */
  edgeVertices: number[];
  /** indices of vertices that should be duplicated for proper normals */
  normEdgeVertices?: number[];
  /** distance between the vertices on cutting edges */
  width: number;
  /** distance between vertices on the axis orthogonal to width */
  thickness: number;
}

const DIAMOND: BladeCrossSection = {
    name: "Diamond",
    vertices: [0.0, 0.5, 0.15, 0.0, 0.0, -0.5, -0.15, 0.0],
    edgeVertices: [0, 2],
    normEdgeVertices: [1, 3],
    width: 1.0,
    thickness: 0.3,
};

const HALLOW_GROUND: BladeCrossSection = {
    name: "HallowGround",
    vertices: [
        0.0, 0.5, 0.03, 0.25, 0.06, 0.1, 0.15, 0.0, 0.06, -0.1, 0.03, -0.25, 0.0,
        -0.5, -0.03, -0.25, -0.06, -0.1, -0.15, 0.0, -0.06, 0.1, -0.03, 0.25,
    ],
    edgeVertices: [0, 6],
    normEdgeVertices: [3, 9],
    width: 1.0,
    thickness: 0.3,
};

const HEXAGONAL: BladeCrossSection = {
    name: "Hexagonal",
    vertices: [0.0, 0.5, 0.1, 0.3, 0.1, -0.3, 0.0, -0.5, -0.1, -0.3, -0.1, 0.3],
    edgeVertices: [0, 3],
    normEdgeVertices: [1, 2, 4, 5],
    width: 1,
    thickness: 0.2,
};

const THICKENED_DIAMOND: BladeCrossSection = {
    name: "ThickenedDiamond",
    vertices: [0.0, 0.5, 0.5, 0.0, 0.0, -0.5, -0.5, 0.0],
    edgeVertices: [0, 2],
    normEdgeVertices: [1, 3],
    width: 1.0,
    thickness: 1.3,
};

const LENTICULAR: BladeCrossSection = {
    name: "Lenticular",
    vertices: [
        0.0, 0.5,

        0.04, 0.4, 0.1, 0.1, 0.15, 0.03, 0.15, -0.03, 0.1, -0.1, 0.04, -0.4,

        0.0, -0.5,

        -0.04, -0.4, -0.1, -0.1, -0.15, -0.03, -0.15, 0.03, -0.1, 0.1, -0.04, 0.4,
    ],
    edgeVertices: [0, 7],
    width: 1.0,
    thickness: 0.3,
};

const FULLER: BladeCrossSection = {
    name: "Fuller",
    vertices: [
        0.0, 0.5,

        0.04, 0.4, 0.1, 0.1, 0.15, 0.04, 0.1, 0.0, 0.15, -0.04, 0.1, -0.1, 0.04,
        -0.4,

        0.0, -0.5,

        -0.04, -0.4, -0.1, -0.1, -0.15, -0.03, -0.1, 0.0, -0.15, 0.03, -0.1, 0.1,
        -0.04, 0.4,
    ],
    edgeVertices: [0, 8],
    normEdgeVertices: [3, 4, 5, 11, 12, 13],
    width: 1.0,
    thickness: 0.3,
};

const DOUBLE_FULLER: BladeCrossSection = {
    name: "DoubleFuller",
    vertices: [
        0.0, 0.5,

        0.04, 0.4, 0.1, 0.1, 0.05, 0.07, 0.15, 0.03, 0.15, -0.03, 0.05, -0.07, 0.1,
        -0.1, 0.04, -0.4,

        0.0, -0.5,

        -0.04, -0.4, -0.1, -0.1, -0.05, -0.07, -0.15, -0.03, -0.15, 0.03, -0.05,
        0.07, -0.1, 0.1, -0.04, 0.4,
    ],
    edgeVertices: [0, 9],
    normEdgeVertices: [2, 3, 4, 5, 6, 7, 11, 12, 13, 15, 16, 17],
    width: 1.0,
    thickness: 0.3,
};

const BROAD_FULLER: BladeCrossSection = {
    name: "BroadFuller",
    vertices: [
        0.0, 0.5,

        0.02, 0.4, 0.01, 0.0, 0.02, -0.4,

        0.0, -0.5,

        -0.02, -0.4, -0.01, 0.0, -0.02, 0.4,
    ],
    edgeVertices: [0, 4],
    normEdgeVertices: [1, 2, 3, 5, 6, 7],
    width: 1.0,
    thickness: 0.04,
};

const SINGLE_EDGE: BladeCrossSection = {
    name: "katana",
    vertices: [0.0, 0.5, 0.01, 0.1, 0.01, -0.5, -0.01, -0.5, -0.01, 0.1],
    edgeVertices: [0],
    normEdgeVertices: [2, 3],
    width: 1,
    thickness: 0.02,
};

/** map of supported blade cross-sections */
export const BLADE_CROSS_SECTIONS: { [name: string]: BladeCrossSection } = {
    diamond: DIAMOND,
    hallow_ground: HALLOW_GROUND,
    hexagonal: HEXAGONAL,
    thickened_diamond: THICKENED_DIAMOND,
    lenticular: LENTICULAR,
    fuller: FULLER,
    double_fuller: DOUBLE_FULLER,
    broad_fuller: BROAD_FULLER,
    single_edge: SINGLE_EDGE,
};
