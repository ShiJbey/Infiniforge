export interface SwordTemplate {
    name?: string;
    hands: number;
    baseBladeWidth: number;
    minBladeLength: number;
    maxBladeLength: number;
    minHandleLength: number;
    maxHandleLength: number;
    bladeThickness: number;
}
export declare const LONG_SWORD: SwordTemplate;
export declare const SHORT_SWORD: SwordTemplate;
export declare const GREAT_SWORD: SwordTemplate;
export declare const SWORD_TEMPLATES: any;
export declare function getTemplate(style: string): SwordTemplate | undefined;
export declare function isSupportedTemplate(style: string): boolean;
