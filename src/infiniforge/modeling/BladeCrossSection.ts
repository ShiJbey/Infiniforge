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
