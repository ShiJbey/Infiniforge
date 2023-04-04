import * as THREE from "three";
import Weapon from "../Weapon";

export default class KatanaHandleFunction {
  /** The minimum length of the handle */
  public minLength = 0.25;
  /** The maximum length of the handle */
  public maxLength = 0.3;
  /** The radius of the handle */
  public radius = 0.015;

  execute(weapon: Weapon): void {
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

    const handleGeometryData = new GeometryData()
      .setCrossSection(
        CrossSection.createFromShape(handlesCsShape),
      )
      .translate(-template.handleLength);

    handleGeometryData.scale(1.0 / 2.0);

    handleGeometryData.extrude(new THREE.Vector3(0, template.handleLength, 0));

    handleGeometryData.scale(2);

    weapon.parts.set("handle", handleGeometryData);
  }
}
