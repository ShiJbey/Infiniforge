import { SphereGeometry } from "three";
import { GeometryData } from "../modeling/GeometryData";
import { Weapon } from "../Weapon";

export default class SpherePommelFunction {
  /** Ratio of the pommel to the base blade width */
  public bladeWidthRatio = 0.5;
  /** The radius of the pommel */
  public radius = 0.03;

  execute(weapon: Weapon): void {
    // Convert the box to a buffer geometry
    const geometry = GeometryData.fromGeometry(
      new SphereGeometry(this.radius, 5, 5)
    );

    // Add the pommel's geometry data to the sword
    weapon.parts.set("pommel", geometry);
  }
}
