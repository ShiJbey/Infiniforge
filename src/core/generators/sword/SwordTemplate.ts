import * as THREE from 'three';

/**
 * Template parameters for building
 * swords within the generator
 *
 * @note Units are measured in meters
 */
export interface SwordTemplate {
    name: string;
    bladeLength: number;
    handleLength: number;
    baseBladeWidth: number;
    minBladeLength: number;
    maxBladeLength: number;
    minHandleLength: number;
    maxHandleLength: number;
    bladeThickness: number;
    extrusionCurve: THREE.Curve<THREE.Vector2>
}

export const SHORT_SWORD: SwordTemplate = {
    name: "short_sword",
    bladeLength: 0.40,
    baseBladeWidth: 0.1,
    minBladeLength: 0.5,
    maxBladeLength: 0.5,
    minHandleLength: 0.12,
    maxHandleLength: 0.18,
    handleLength: .15,
    bladeThickness: 0.05,
    extrusionCurve: new THREE.SplineCurve([
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0, 1)
    ])
}

export const LONG_SWORD:  SwordTemplate = {
    name: "long_sword",
    bladeLength: 1.11,
    baseBladeWidth: 0.1,
    minBladeLength: 0.85,
    maxBladeLength: 1.1,
    minHandleLength: 0.16,
    maxHandleLength: 0.28,
    handleLength: .22,
    bladeThickness: 0.05,
    extrusionCurve: new THREE.SplineCurve([
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0, 1)
    ])
}

export const GREAT_SWORD: SwordTemplate = {
    name: "great_sword",
    bladeLength: 1.55,
    baseBladeWidth: 0.064,
    minBladeLength: 1.27,
    maxBladeLength: 1.83,
    minHandleLength: 0.457,
    maxHandleLength: 0.533,
    handleLength: .3,
    bladeThickness: 0.05,
    extrusionCurve: new THREE.SplineCurve([
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0, 1)
    ])
}

export const KATANA: SwordTemplate = {
    name: "katana",
    bladeLength: 1.05,
    baseBladeWidth: 0.1,
    minBladeLength: 1.00,
    maxBladeLength: 1.10,
    handleLength: 0.3,
    minHandleLength: 0.3,
    maxHandleLength: 0.3,
    bladeThickness: 0.05,
    extrusionCurve: new THREE.QuadraticBezierCurve(
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.0, 0.7),
        new THREE.Vector2(-0.1, 1)
    )
}

export const SWORD_TEMPLATES: any = {
    "short": SHORT_SWORD,
    "long": LONG_SWORD,
    "great": GREAT_SWORD,
    "katana": KATANA
}

export function getTemplate(style: string): SwordTemplate | null {
    if (Object.keys(SWORD_TEMPLATES).indexOf(style) >= 0) {
        return SWORD_TEMPLATES[style] as SwordTemplate;
    }
    return null;
}
