import GeometryData from "./modeling/GeometryData";

/**
 * A collection of 3D geometry information for constructing the final weapon mesh
 */
export default class Weapon {
  /** Maps each part of the weapon to a string identifier */
  public parts: Map<string, GeometryData>;

  constructor() {
    this.parts = new Map<string, GeometryData>();
  }
}
