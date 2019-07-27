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

import * as SupportedCrossSections from './json/cross-sections.json';

export {SupportedCrossSections as SupportedCrossSections};