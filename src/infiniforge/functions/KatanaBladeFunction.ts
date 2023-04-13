import { Curve, Vector2, QuadraticBezierCurve, SplineCurve } from "three";

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
  extrusionCurve: Curve<Vector2>;
}

export default class KatanaBladeFunction {
  public parameters: BladeParameters;

  edgeSpline = new SplineCurve([new Vector2(0, 0), new Vector2(0, 1)]);

  private static extrusionCurve = new QuadraticBezierCurve(
    new Vector2(0, 0),
    new Vector2(0.0, 0.7),
    new Vector2(-0.1, 1)
  );

  constructor(parameters: BladeParameters) {
    this.parameters = parameters;
  }
}
