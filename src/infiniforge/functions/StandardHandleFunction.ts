import * as THREE from "three";
import { CrossSection } from "../modeling/CrossSection";
import { getRandomFloat } from "../utilities/utils";
import seedrandom from "seedrandom";
import Weapon from "../Weapon";
import GeometryData from "../modeling/GeometryData";

/** Creates a cylindrical sword handle */
export default class StandardHandleFunction {
  /** Random number generator */
  private prng: seedrandom.PRNG = seedrandom();
  /** Seed value for the random number generator */
  public seed = 23;
  /** The minimum length the handle (m) */
  public minLength = 0.12;
  /** The maximum length the handle (m) */
  public maxLength = 0.18;
  /** The radius of the handle (m) */
  public radius = 0.02;
  /** The cross section used */
  public crossSection = "circle";

  execute(weapon: Weapon): void {
    this.prng = seedrandom(this.seed.toString());

    const length = getRandomFloat(this.prng, this.minLength, this.maxLength);

    const handlesCsShape = new THREE.Shape().setFromPoints(
      new THREE.EllipseCurve(
        0,
        0,
        this.radius,
        this.radius * 2,
        0,
        2 * Math.PI, // aStartAngle, aEndAngle
        false, // aClockwise
        0 // aRotation
      ).getPoints(8)
    );

    const handleGeometry = new GeometryData();

    const handleGeometryData = new GeometryData()
      .setCrossSection(
        CrossSection.createFromShape(handlesCsShape),
      )
      .translate(-length);

    handleGeometryData.extrude(new THREE.Vector3(0, length, 0));

    weapon.parts.set("handle", handleGeometry);
  }
}
