import * as THREE from "three";

export default class ClipBladeTipFunction {
  /** The length of the tip */
  public length = 0.06;

  execute(weapon: Weapon): void {
    this.extrude(this.length);
    this.rotate(
      new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(1, 0, 0),
        Math.PI / 3
      )
    );
    this.scale(new THREE.Vector2(0, 1));
  }
}
