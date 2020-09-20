import * as THREE from 'three';
import { Vector2 } from 'three';

/**
 * Template parameters for building
 * swords within the generator.
 *
 * @note Units are measured in meters
 */
export interface SwordTemplate {
    name?: string;
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
    baseBladeWidth: 0.1,
    minBladeLength: 0.5,
    maxBladeLength: 0.5,
    minHandleLength: 0.12,
    maxHandleLength: 0.18,
    handleLength: .15,
    bladeThickness: 0.05,
    extrusionCurve: new THREE.SplineCurve([
        new Vector2(0, 0),
        new Vector2(0, 1)
    ])
}

export const LONG_SWORD:  SwordTemplate = {
    baseBladeWidth: 0.1,
    minBladeLength: 0.85,
    maxBladeLength: 1.1,
    minHandleLength: 0.16,
    maxHandleLength: 0.28,
    handleLength: .22,
    bladeThickness: 0.05,
    extrusionCurve: new THREE.SplineCurve([
        new Vector2(0, 0),
        new Vector2(0, 1)
    ])
}

export const GREAT_SWORD: SwordTemplate = {
    baseBladeWidth: 0.5,
    minBladeLength: 0.9,
    maxBladeLength: 1.1,
    minHandleLength: 0.3,
    maxHandleLength: 0.5,
    handleLength: .3,
    bladeThickness: 0.05,
    extrusionCurve: new THREE.SplineCurve([
        new Vector2(0, 0),
        new Vector2(0, 1)
    ])
}

export const KATANA: SwordTemplate = {
    baseBladeWidth: 0.1,
    minBladeLength: 0.8,
    maxBladeLength: 0.8,
    handleLength: 0.22,
    minHandleLength: 0.22,
    maxHandleLength: 0.22,
    bladeThickness: 0.05,
    extrusionCurve: new THREE.QuadraticBezierCurve(
        new Vector2(0, 0),
        new Vector2(0.02, 0.8),
        new Vector2(-0.15, 1)
    )
}

export const SWORD_TEMPLATES: any = {
    "short": SHORT_SWORD,
    "long": LONG_SWORD,
    "great": GREAT_SWORD,
    "katana": KATANA
}

export function getTemplate(style: string) {
    if (isSupportedTemplate(style)) {
        return SWORD_TEMPLATES[style] as SwordTemplate;
    }
}

export function isSupportedTemplate(style: string) {
    return Object.keys(SWORD_TEMPLATES).indexOf(style) >= 0;
}
