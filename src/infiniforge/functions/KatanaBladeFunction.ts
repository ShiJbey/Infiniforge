import * as THREE from "three";

interface BladeParameters {
  /** Template name */
  name: string;
  /** length of the blade (ignores min/maxBladeLengths) */
  bladeLength: number;
  /** starting width of the blade */
  baseBladeWidth: number;
  /** maximum length the handle can be */
  handleLength: number;
  /** thickness of the blade */
  bladeThickness: number;
  /** curve that the blade's spine follows */
  extrusionCurve: THREE.Curve<THREE.Vector2>;
}

export default class KatanaBladeFunction {
  public parameters: BladeParameters;

  edgeSpline = new THREE.SplineCurve([
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0, 1),
  ]);

  private static extrusionCurve = new THREE.QuadraticBezierCurve(
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.0, 0.7),
    new THREE.Vector2(-0.1, 1)
  );

  constructor(parameters: BladeParameters) {
    this.parameters = parameters;

  }
}
