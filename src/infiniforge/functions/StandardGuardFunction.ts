import * as THREE from "three";

export interface GuardParams {
  crossSection?: string;
  thickness?: number;
  guardBladeRatio?: number;
}

export default class StandardGuardFunction {
  private static readonly DEFAULT_PARAMS: GuardParams = {
    thickness: 0.01,
    guardBladeRatio: 1.5,
  };

  private settings: GuardParams;

  constructor(settings: GuardParams) {
    this.settings = settings;
  }

  execute(): void {


    params = Object.assign(DEFAULT_PARAMS, params);

    const guardGeometry = new THREE.BoxGeometry(
      template.bladeThickness + 0.04,
      params.thickness,
      0.06 + template.baseBladeWidth
    );

    const guardGeometryData = new GeometryData().fromGeometry(
      guardGeometry,
      new THREE.Color(params.color)
    );

    sword.add(guardGeometryData);
  }
}
