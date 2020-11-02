import * as THREE from 'three';
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
    extrusionCurve: THREE.Curve<THREE.Vector2>;
}
export declare const SHORT_SWORD: SwordTemplate;
export declare const LONG_SWORD: SwordTemplate;
export declare const GREAT_SWORD: SwordTemplate;
export declare const KATANA: SwordTemplate;
export declare const SWORD_TEMPLATES: any;
export declare function getTemplate(style: string): SwordTemplate | null;
