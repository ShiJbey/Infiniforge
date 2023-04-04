import seedrandom from "seedrandom";
import * as THREE from "three";
import Weapon from "../Weapon";
import { getRandomFloat, getRandomInt } from "../utilities/utils";

export default class DoubleEdgedBladeFunction {
  private readonly baseProportion = 0.3;
  private readonly midProportion = 0.5;
  private readonly tipProportion = 0.22;
  private readonly prng = seedrandom();

  public tip = "standard";
  public crossSection = "diamond";
  public minBladeLength = 0.3;
  public maxBladeLength = 0.6;
  public minBladeTipSplinePoints = 2;
  public maxBladeTipSplinePoints = 7;
  public bladeTipSamplingResolution = 0.5;
  public minBladeMidSplinePoints = 4;
  public maxBladeMidSplinePoints = 7;
  public bladeMidSamplingResolution = 0.5;
  public minBladeBaseSplinePoints = 2;
  public maxBladeBaseSplinePoints = 7;
  public bladeBaseSamplingResolution = 0.5;
  public edgeScaleTolerance = 0.1;

  private createEdgeSpline(
    numPoints: number,
    widthTolerance: number
  ): THREE.Curve<THREE.Vector2> {
    const splinePoints: THREE.Vector2[] = [];

    // Add 2 to include the end points
    const totalPoints = numPoints + 2;

    for (let i = 0; i < numPoints + 2; ++i) {
      const point = new THREE.Vector2(
        i * (1.0 / totalPoints),
        getRandomFloat(this.prng, -widthTolerance, widthTolerance)
      );
      splinePoints.push(point);
    }

    splinePoints.push(new THREE.Vector2(0, 0));

    return new THREE.SplineCurve(splinePoints);
  }

  execute(weapon: Weapon): void {
    /// //////////////////////////////////////////////////////////////
    //                    BLADE SECTION LENGTHS                    //
    /// //////////////////////////////////////////////////////////////

    const bladeLength = getRandomFloat(
      this.prng,
      this.minBladeLength,
      this.maxBladeLength
    );

    const baseSectionLength = bladeLength * this.baseProportion;
    const midSectionLength = bladeLength * this.midProportion;
    const tipSectionLength =
      bladeLength - (baseSectionLength + midSectionLength);

    /// //////////////////////////////////////////////////////////////
    //                        BUILD SECTIONS                       //
    /// //////////////////////////////////////////////////////////////

    const nControlPoints = getRandomInt(
      this.prng,
      this.minBladeMidSplinePoints,
      this.maxBladeMidSplinePoints
    );

    const edgeSpline = this.createEdgeSpline(
      nControlPoints,
      this.edgeScaleTolerance
    );

    const bladeGeometry = new BladeGeometry(
      bladeLength,
      template.extrusionCurve
    )
      .setBladeCrossSection(
        new CrossSection(crossSection),
        crossSection.edgeVertices,
        new THREE.Color(color),
        crossSection.normEdgeVertices ?? [],
        true
      )
      // Scale the cross section to fit the template
      .scale(
        new THREE.Vector2(
          this.thickness / crossSection.thickness,
          this.baseBladeWidth / crossSection.width
        )
      )
      // Extrude the base section of the blade
      .extrudeSection(edgeSpline, baseSplineSamples, baseSectionLength, 0.2)
      // Extrude the mid section of the blade
      // .extrude(midSectionLength)
      .extrudeSection(
        new THREE.SplineCurve([
          new THREE.Vector2(0, 0),
          new THREE.Vector2(0, 1),
        ]),
        midSplineSamples,
        midSectionLength,
        0.3
      );
  }
}
