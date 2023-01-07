import * as THREE from "three";

/**
 * Template parameters for building
 * swords within the generator
 *
 * @note Units are measured in meters
 */
export interface SwordTemplate {
  /** Template name */
  name: string;
  /** length of the blade (ignores min/maxBladeLengths) */
  bladeLength: number;
  /** length of the handle (ignores min/maxHandleLengths) */
  handleLength: number;
  /** starting width of the blade */
  baseBladeWidth: number;
  /** minimum length the blade can be */
  minBladeLength: number;
  /** maximum length the blade can be */
  maxBladeLength: number;
  /** minimum length the handle can be */
  minHandleLength: number;
  /** maximum length the handle can be */
  maxHandleLength: number;
  /** thickness of the blade */
  bladeThickness: number;
  /** curve that the blade's spine follows */
  extrusionCurve: THREE.Curve<THREE.Vector2>;
}

const SHORT_SWORD: SwordTemplate = {
    name: "short_sword",
    bladeLength: 0.4,
    baseBladeWidth: 0.1,
    minBladeLength: 0.5,
    maxBladeLength: 0.5,
    minHandleLength: 0.12,
    maxHandleLength: 0.18,
    handleLength: 0.15,
    bladeThickness: 0.05,
    extrusionCurve: new THREE.SplineCurve([
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0, 1),
    ]),
};

const LONG_SWORD: SwordTemplate = {
    name: "long_sword",
    bladeLength: 1.11,
    baseBladeWidth: 0.1,
    minBladeLength: 0.85,
    maxBladeLength: 1.1,
    minHandleLength: 0.16,
    maxHandleLength: 0.28,
    handleLength: 0.22,
    bladeThickness: 0.05,
    extrusionCurve: new THREE.SplineCurve([
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0, 1),
    ]),
};

const GREAT_SWORD: SwordTemplate = {
    name: "great_sword",
    bladeLength: 1.55,
    baseBladeWidth: 0.064,
    minBladeLength: 1.27,
    maxBladeLength: 1.83,
    minHandleLength: 0.457,
    maxHandleLength: 0.533,
    handleLength: 0.3,
    bladeThickness: 0.05,
    extrusionCurve: new THREE.SplineCurve([
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0, 1),
    ]),
};

const KATANA: SwordTemplate = {
    name: "katana",
    bladeLength: 1.05,
    baseBladeWidth: 0.1,
    minBladeLength: 1.0,
    maxBladeLength: 1.1,
    handleLength: 0.3,
    minHandleLength: 0.3,
    maxHandleLength: 0.3,
    bladeThickness: 0.05,
    extrusionCurve: new THREE.QuadraticBezierCurve(
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.0, 0.7),
        new THREE.Vector2(-0.1, 1)
    ),
};

export const SWORD_TEMPLATES: { [name: string]: SwordTemplate } = {
    short: SHORT_SWORD,
    long: LONG_SWORD,
    great: GREAT_SWORD,
    katana: KATANA,
};
